import "server-only";
import { db } from "./db";
import { can, regionScope, teamScope } from "./authz";
import type { Handelse } from "./kalender";
import type { SessionUser } from "./session";
import { getSettings } from "./settings";

/**
 * Återkommande databasfrågor. Samlade här så att varje vy använder samma
 * behörighetsavgränsning (teamScope) i stället för att formulera egna villkor.
 */

/** Ekipagen användaren får se, med hund och förare. */
export async function visibleTeams(user: SessionUser) {
  return db.team.findMany({
    where: { ...teamScope(user), status: "ACTIVE" },
    include: {
      dog: { include: { disciplines: { include: { discipline: true } } } },
      handler: true,
      region: true,
    },
    orderBy: [{ handler: { name: "asc" } }, { dog: { name: "asc" } }],
  });
}

/** Bara id:n – används när en fråga ska filtreras på ekipage. */
export async function visibleTeamIds(user: SessionUser) {
  const teams = await db.team.findMany({
    where: teamScope(user),
    select: { id: true },
  });
  return teams.map((t) => t.id);
}

/** Certifikat som går ut inom varningsfönstret, eller redan har gått ut. */
export async function expiringCertifications(
  user: SessionUser,
  /** Utelämnas för den inställda varningsgränsen. */
  withinDays?: number,
) {
  const dagar = withinDays ?? (await getSettings()).certWarningDays;
  const scope = teamScope(user);
  const limit = new Date();
  limit.setDate(limit.getDate() + dagar);

  return db.certification.findMany({
    where: {
      expiresAt: { lte: limit },
      // Avgränsningen uttrycks i relationen i stället för genom två
      // hämtade id-listor: samma villkor, en fråga i stället för tre.
      OR: [
        { team: scope },
        { dog: { teams: { some: scope } } },
        { user: { teams: { some: scope } } },
      ],
    },
    include: {
      type: true,
      dog: true,
      user: true,
      team: { include: { dog: true, handler: true } },
    },
    orderBy: { expiresAt: "asc" },
  });
}

/** Kommande uppdrag för de ekipage användaren ser. */
export async function upcomingMissions(user: SessionUser, take = 20) {
  const teamIds = await visibleTeamIds(user);
  return db.mission.findMany({
    where: {
      startAt: { gte: new Date() },
      status: { notIn: ["CANCELLED"] },
      assignments: { some: { teamId: { in: teamIds } } },
    },
    include: {
      discipline: true,
      customer: true,
      assignments: {
        where: { teamId: { in: teamIds } },
        include: { team: { include: { dog: true, handler: true } } },
      },
    },
    orderBy: { startAt: "asc" },
    take,
  });
}

/** Senaste träningspassen för de ekipage användaren ser. */
export async function recentSessions(user: SessionUser, take = 10) {
  return db.trainingSession.findMany({
    where: { team: teamScope(user) },
    include: {
      team: { include: { dog: true, handler: true } },
      discipline: true,
      _count: { select: { comments: true, media: true } },
    },
    orderBy: { startAt: "desc" },
    take,
  });
}

/**
 * Ett uppdrag med allt som uppdragsvyerna behöver, inom behörigheten.
 *
 * Ledningen når uppdrag i sin region; hundföraren bara dem hens ekipage
 * är tilldelade. Frågan bor här och inte i sidan eftersom tre vyer delar
 * den – uppdragssidan, detaljvyn och redigeringssidan – och två kopior av
 * en behörighetsfråga är precis så en läcka uppstår.
 *
 * Returnerar null när uppdraget inte finns eller ligger utanför
 * behörigheten. Anroparen svarar 404 i båda fallen, så att id:n inte går
 * att räkna upp.
 */
export async function missionForUser(user: SessionUser, id: string) {
  const scope = teamScope(user);

  return db.mission.findFirst({
    where: can(user, "mission:assign")
      ? { id, ...regionScope(user) }
      : { id, assignments: { some: { team: scope } } },
    include: {
      customer: true,
      discipline: true,
      region: true,
      createdBy: true,
      assignments: {
        include: {
          team: { include: { dog: true, handler: true, region: true } },
          assignedBy: true,
        },
      },
      reports: {
        include: { team: { include: { dog: true } }, author: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * Allt som ska ritas i kalendern mellan två tidpunkter: uppdrag,
 * träningspass och satt otillgänglighet.
 *
 * Avgränsningen är densamma som i respektive modul. Uppdragen följer
 * `missionForUser`: den som tilldelar uppdrag ser sin regions uppdrag,
 * övriga bara dem deras egna ekipage är tilldelade. Träning och
 * tillgänglighet går alltid genom `teamScope`.
 */
export async function kalenderhandelser(
  user: SessionUser,
  fran: Date,
  till: Date,
) {
  const scope = teamScope(user);

  const [missions, sessions, availability] = await Promise.all([
    db.mission.findMany({
      where: {
        AND: [
          { startAt: { gte: fran, lt: till } },
          { status: { notIn: ["CANCELLED"] } },
          can(user, "mission:assign")
            ? regionScope(user)
            : { assignments: { some: { team: scope } } },
        ],
      },
      include: { discipline: true },
      orderBy: { startAt: "asc" },
    }),
    db.trainingSession.findMany({
      where: { AND: [{ startAt: { gte: fran, lt: till } }, { team: scope }] },
      include: { team: { include: { dog: true } }, discipline: true },
      orderBy: { startAt: "asc" },
    }),
    // Ett tillgänglighetsblock räknas som synligt så snart det överlappar
    // fönstret, inte bara när det börjar i det – annars försvinner en
    // vecka av semester ur alla veckor utom den första.
    db.teamAvailability.findMany({
      where: {
        AND: [{ startAt: { lt: till }, endAt: { gt: fran } }, { team: scope }],
      },
      include: { team: { include: { dog: true } } },
      orderBy: { startAt: "asc" },
    }),
  ]);

  const handelser: Handelse[] = [
    ...missions.map((m) => ({
      id: `uppdrag-${m.id}`,
      slag: "uppdrag" as const,
      rubrik: m.title,
      ort: m.locality,
      start: m.startAt,
      slut: m.endAt,
      tagg: m.discipline?.shortLabel ?? null,
      href: `/uppdrag/${m.id}`,
    })),
    ...sessions.map((s) => ({
      id: `traning-${s.id}`,
      slag: "traning" as const,
      rubrik: `${s.trainingArea} – ${s.team.dog.name}`,
      ort: s.location,
      start: s.startAt,
      slut: s.endAt,
      tagg: "Träning",
      href: `/traning/${s.id}`,
    })),
    ...availability
      .filter((a) => a.kind === "UNAVAILABLE")
      .map((a) => ({
        id: `otillganglig-${a.id}`,
        slag: "otillganglig" as const,
        rubrik: "Otillgänglig",
        ort: a.note ?? a.team.dog.name,
        start: a.startAt,
        slut: a.endAt,
        tagg: null,
        // Tillgängligheten sätts i profilen; blocket leder dit den ändras.
        href: "/profil",
      })),
  ];

  return handelser;
}

/** Ekipagen i uppdraget som användaren själv är förare för. */
export function ownAssignments<T extends { team: { handlerId: string } }>(
  user: SessionUser,
  assignments: T[],
) {
  return assignments.filter((a) => a.team.handlerId === user.id);
}
