import "server-only";
import type { Prisma } from "@/generated/prisma";
import { db } from "./db";
import { can, regionScope, teamScope } from "./authz";
import { bokstavligt } from "./fritext";
import type { SessionUser } from "./session";

/**
 * Sökningen över hela systemet.
 *
 * Varje delfråga bär sin egen behörighetsavgränsning, uttryckt i `AND`
 * tillsammans med sökvillkoret. Sökningen kan därför bara smalna av det
 * användaren redan får se – aldrig bredda det. Ett spritt villkor hade
 * gått att skriva över av sökvillkoret, och just så uppstår en läcka.
 */

export const SOKGRUPPER = [
  { value: "uppdrag", label: "Uppdrag" },
  { value: "hundar", label: "Hundar" },
  { value: "ekipage", label: "Ekipage" },
  { value: "traning", label: "Träning" },
  { value: "rapporter", label: "Rapporter" },
  { value: "certifikat", label: "Certifikat" },
] as const;

export type Sokgrupp = (typeof SOKGRUPPER)[number]["value"];

export const arSokgrupp = (value: unknown): value is Sokgrupp =>
  SOKGRUPPER.some((g) => g.value === value);

/** Hur många träffar en grupp visar innan "Visa alla". */
export const PER_GRUPP = 3;

/** Fritext som ett Prisma-villkor, oberoende av versaler. */
const som = (fritext: string) => ({
  contains: bokstavligt(fritext),
  mode: "insensitive" as const,
});

/**
 * Söker i en grupp, eller i alla.
 *
 * `grupp` utelämnas för översikten – då hämtas PER_GRUPP + 1 rader per
 * grupp, och den extra raden avgör om "Visa alla" ska visas utan att en
 * räknefråga behöver köras för varje grupp.
 */
export async function sok(
  user: SessionUser,
  fritext: string,
  grupp?: Sokgrupp,
) {
  const q = fritext.trim();
  // Ett tecken träffar allt och säger ingenting; sökningen börjar vid två.
  const forKort = q.length < 2;

  const scope = teamScope(user);
  const take = grupp ? 50 : PER_GRUPP + 1;
  const vill = (namn: Sokgrupp) =>
    !forKort && (grupp === undefined || grupp === namn);

  const [uppdrag, hundar, ekipage, traning, rapporter, certifikat] =
    await Promise.all([
      vill("uppdrag")
        ? db.mission.findMany({
            where: {
              AND: [
                uppdragsScope(user),
                {
                  OR: [
                    { title: som(q) },
                    { reference: som(q) },
                    { locality: som(q) },
                    { missionType: som(q) },
                    { missionArea: som(q) },
                    // Hundens och förarens namn hör till uppdraget för
                    // den som söker: "vad har Nova gjort?" är frågan.
                    // Villkoret ligger i sökningens OR, inte i
                    // avgränsningen ovanför, och kan därför bara smalna av.
                    { assignments: { some: { team: { dog: { name: som(q) } } } } },
                    {
                      assignments: {
                        some: { team: { handler: { name: som(q) } } },
                      },
                    },
                  ],
                },
              ],
            },
            include: { discipline: true },
            orderBy: { startAt: "desc" },
            take,
          })
        : [],

      vill("hundar")
        ? db.dog.findMany({
            where: {
              AND: [
                // Hunden nås alltid genom ett ekipage, aldrig direkt.
                { teams: { some: scope } },
                {
                  OR: [
                    { name: som(q) },
                    { breed: som(q) },
                    { chipNumber: som(q) },
                  ],
                },
              ],
            },
            include: {
              teams: {
                where: scope,
                include: { handler: true, region: true },
                take: 1,
              },
            },
            orderBy: { name: "asc" },
            take,
          })
        : [],

      vill("ekipage")
        ? db.team.findMany({
            where: {
              AND: [
                scope,
                {
                  OR: [
                    { handler: { name: som(q) } },
                    { dog: { name: som(q) } },
                    { region: { name: som(q) } },
                  ],
                },
              ],
            },
            include: { dog: true, handler: true, region: true },
            orderBy: [{ handler: { name: "asc" } }],
            take,
          })
        : [],

      vill("traning")
        ? db.trainingSession.findMany({
            where: {
              AND: [
                { team: scope },
                {
                  OR: [
                    { trainingArea: som(q) },
                    { environment: som(q) },
                    { location: som(q) },
                    { targetOdor: som(q) },
                    { team: { dog: { name: som(q) } } },
                  ],
                },
              ],
            },
            include: { team: { include: { dog: true } } },
            orderBy: { startAt: "desc" },
            take,
          })
        : [],

      vill("rapporter")
        ? db.operationalReport.findMany({
            where: {
              AND: [
                { team: scope },
                {
                  OR: [
                    { mission: { title: som(q) } },
                    { mission: { reference: som(q) } },
                    { mission: { locality: som(q) } },
                    { areasSearched: som(q) },
                    { findings: som(q) },
                    { deviations: som(q) },
                    { team: { dog: { name: som(q) } } },
                    { author: { name: som(q) } },
                  ],
                },
              ],
            },
            include: {
              mission: true,
              team: { include: { dog: true } },
              author: true,
            },
            orderBy: { createdAt: "desc" },
            take,
          })
        : [],

      vill("certifikat")
        ? db.certification.findMany({
            where: {
              AND: [
                // Samma avgränsning som certifikatlistan: intyget måste
                // höra till ett ekipage, en hund eller en förare inom
                // behörigheten.
                {
                  OR: [
                    { team: scope },
                    { dog: { teams: { some: scope } } },
                    { user: { teams: { some: scope } } },
                  ],
                },
                {
                  OR: [
                    { type: { name: som(q) } },
                    { issuer: som(q) },
                    { reference: som(q) },
                    { dog: { name: som(q) } },
                    { user: { name: som(q) } },
                  ],
                },
              ],
            },
            include: {
              type: true,
              dog: true,
              user: true,
              team: { include: { dog: true, handler: true } },
            },
            orderBy: { expiresAt: "asc" },
            take,
          })
        : [],
    ]);

  return { uppdrag, hundar, ekipage, traning, rapporter, certifikat };
}

export type Sokresultat = Awaited<ReturnType<typeof sok>>;

/**
 * Uppdragen användaren får se, uttryckt som ett villkor.
 *
 * Samma regel som missionForUser: den som tilldelar uppdrag ser sin
 * regions uppdrag, övriga bara dem deras egna ekipage är tilldelade.
 */
function uppdragsScope(user: SessionUser): Prisma.MissionWhereInput {
  return can(user, "mission:assign")
    ? regionScope(user)
    : { assignments: { some: { team: teamScope(user) } } };
}

/** Totalt antal träffar, för det tomma läget och rubrikerna. */
export function antalTraffar(resultat: Sokresultat) {
  return SOKGRUPPER.reduce(
    (summa, g) => summa + resultat[g.value].length,
    0,
  );
}
