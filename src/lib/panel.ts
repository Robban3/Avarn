import "server-only";
import { db } from "./db";
import { teamScope, seesAllRegions } from "./authz";
import type { SessionUser } from "./session";
import { durationMinutes } from "./format";
import { startOfMonth, startOfPreviousMonth } from "./stats";
import { getSettings } from "./settings";
import {
  DISCIPLINE_CERT,
  PERIODER,
  TEAM_REQUIRED_CERTS,
  type PeriodKey,
} from "./domain";

/**
 * Underlaget till adminpanelens översikt. Ligger samlat här så att sidan
 * blir en ren vy, och så att varje fråga går genom samma avgränsning som
 * resten av appen – panelen ser inget som rollen inte får se.
 */

export function periodFran(key: PeriodKey) {
  const from = new Date();
  from.setDate(from.getDate() - PERIODER[key].days);
  return from;
}

/** Aktiva hundar inom behörigheten, denna månad och förra. */
export async function dogCount(user: SessionUser) {
  const teams = await db.team.findMany({
    where: { ...teamScope(user), status: "ACTIVE" },
    select: { dogId: true, dog: { select: { status: true, createdAt: true } } },
  });
  const aktiva = teams.filter((t) => t.dog.status === "ACTIVE");
  const forra = aktiva.filter((t) => t.dog.createdAt < startOfMonth()).length;
  return { count: aktiva.length, change: aktiva.length - forra };
}

/**
 * Uppdrag i perioden fördelade på sökinriktning. Fler än fem inriktningar
 * skulle göra ringen oläsbar, så svansen summeras till "Övrigt".
 */
export async function missionsByDiscipline(user: SessionUser, from: Date) {
  const scope = teamScope(user);
  const teamIds = (
    await db.team.findMany({ where: scope, select: { id: true } })
  ).map((t) => t.id);

  const missions = await db.mission.findMany({
    where: seesAllRegions(user)
      ? { startAt: { gte: from } }
      : {
          startAt: { gte: from },
          assignments: { some: { teamId: { in: teamIds } } },
        },
    include: { discipline: true },
  });

  const per = new Map<string, number>();
  for (const m of missions) {
    const namn = m.discipline?.name ?? "Ospecificerat";
    per.set(namn, (per.get(namn) ?? 0) + 1);
  }

  const sorterat = [...per.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  if (sorterat.length <= 5) return sorterat;
  const topp = sorterat.slice(0, 4);
  const ovrigt = sorterat.slice(4).reduce((s, x) => s + x.value, 0);
  return [...topp, { label: "Övrigt", value: ovrigt }];
}

/** Senaste uppdragen med tilldelat ekipage – tabellen i översikten. */
export async function latestMissions(user: SessionUser, take = 5) {
  const scope = teamScope(user);
  const teamIds = (
    await db.team.findMany({ where: scope, select: { id: true } })
  ).map((t) => t.id);

  return db.mission.findMany({
    where: seesAllRegions(user)
      ? {}
      : { assignments: { some: { teamId: { in: teamIds } } } },
    include: {
      assignments: { include: { team: { include: { dog: true, handler: true } } } },
      region: true,
    },
    orderBy: { startAt: "desc" },
    take,
  });
}

/**
 * Ekipagen med det administratören behöver se i en rad: förare, hund,
 * sökinriktningar, region, status, senaste aktivitet och certifikatläge.
 */
export async function teamRows(
  user: SessionUser,
  filter: { regionId?: string; disciplineId?: string; q?: string } = {},
  take = 50,
) {
  const teams = await db.team.findMany({
    where: {
      ...teamScope(user),
      ...(filter.regionId ? { regionId: filter.regionId } : {}),
      ...(filter.disciplineId
        ? { dog: { disciplines: { some: { disciplineId: filter.disciplineId } } } }
        : {}),
      ...(filter.q
        ? {
            OR: [
              { dog: { name: { contains: filter.q, mode: "insensitive" } } },
              { handler: { name: { contains: filter.q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      handler: true,
      region: true,
      dog: {
        include: { disciplines: { include: { discipline: true } } },
      },
      certifications: { include: { type: true } },
      trainingSessions: {
        orderBy: { startAt: "desc" },
        take: 1,
        select: { startAt: true },
      },
    },
    orderBy: [{ status: "asc" }, { dog: { name: "asc" } }],
    take,
  });

  return teams.map((team) => ({
    team,
    senast: team.trainingSessions[0]?.startAt ?? null,
  }));
}

/** Träningstimmar per ekipage i perioden – underlag för uppföljning. */
export async function trainingByTeam(user: SessionUser, from: Date) {
  const teams = await db.team.findMany({
    where: teamScope(user),
    include: {
      dog: true,
      handler: true,
      trainingSessions: {
        where: { startAt: { gte: from } },
        select: {
          startAt: true,
          endAt: true,
          hideCount: true,
          foundCount: true,
        },
      },
    },
    orderBy: { dog: { name: "asc" } },
  });

  return teams.map((team) => {
    const minuter = team.trainingSessions.reduce(
      (s, x) => s + durationMinutes(x.startAt, x.endAt),
      0,
    );
    const gommor = team.trainingSessions.reduce((s, x) => s + x.hideCount, 0);
    const funna = team.trainingSessions.reduce((s, x) => s + x.foundCount, 0);
    return {
      team,
      pass: team.trainingSessions.length,
      hours: Math.round(minuter / 60),
      completionRate: gommor === 0 ? null : Math.round((funna / gommor) * 100),
    };
  });
}

/** Jämförelsetal mot föregående månad, formaterat som riktning och text. */
export function change(now: number | null, before: number | null, suffix = "") {
  if (now === null || before === null) return null;
  const diff = now - before;
  if (diff === 0)
    return { text: "oförändrat mot förra månaden", direction: "flat" as const };
  return {
    text: `${Math.abs(diff)}${suffix} från förra månaden`,
    direction: diff > 0 ? ("up" as const) : ("down" as const),
  };
}

export { startOfMonth, startOfPreviousMonth };

/**
 * Varningsvyn för certifikat. Skiljer på fyra lägen, eftersom åtgärden är
 * olika: förnya i tid, förnya nu, komplettera en utbildning som aldrig
 * tagits, och ekipage som inte längre får tas ut på skarpt uppdrag.
 */
export async function certificationOverview(user: SessionUser) {
  const teams = await db.team.findMany({
    where: teamScope(user),
    include: {
      handler: true,
      region: true,
      dog: { include: { disciplines: { include: { discipline: true } } } },
      certifications: { include: { type: true } },
    },
    orderBy: { dog: { name: "asc" } },
  });

  const dogCerts = await db.certification.findMany({
    where: { dogId: { in: teams.map((t) => t.dogId) } },
    include: { type: true, dog: true },
  });
  const handlerCerts = await db.certification.findMany({
    where: { userId: { in: teams.map((t) => t.handlerId) } },
    include: { type: true, user: true },
  });

  const nu = Date.now();
  const { certWarningDays } = await getSettings();
  const grans = nu + certWarningDays * 86_400_000;

  const alla = [
    ...teams.flatMap((t) =>
      t.certifications.map((c) => ({
        cert: c,
        agare: `${t.dog.name} & ${t.handler.name}`,
      })),
    ),
    ...dogCerts.map((c) => ({ cert: c, agare: c.dog?.name ?? "" })),
    ...handlerCerts.map((c) => ({ cert: c, agare: c.user?.name ?? "" })),
  ];

  const utgangna = alla
    .filter((x) => x.cert.expiresAt.getTime() < nu)
    .sort((a, b) => a.cert.expiresAt.getTime() - b.cert.expiresAt.getTime());

  const snart = alla
    .filter(
      (x) =>
        x.cert.expiresAt.getTime() >= nu && x.cert.expiresAt.getTime() <= grans,
    )
    .sort((a, b) => a.cert.expiresAt.getTime() - b.cert.expiresAt.getTime());

  /** Har hunden ett giltigt certifikat av den här typen? */
  const giltigt = (dogId: string, kod: string) =>
    dogCerts.some(
      (c) =>
        c.dogId === dogId &&
        c.type.code === kod &&
        c.expiresAt.getTime() >= nu,
    );

  const saknade = teams.flatMap((t) =>
    t.dog.disciplines
      .map((d) => ({
        kod: DISCIPLINE_CERT[d.discipline.code],
        inriktning: d.discipline.name,
      }))
      .filter((x) => x.kod && !giltigt(t.dogId, x.kod))
      .map((x) => ({ team: t, inriktning: x.inriktning, certKod: x.kod })),
  );

  const ejTillgangliga = teams.filter((t) =>
    TEAM_REQUIRED_CERTS.some(
      (kod) =>
        !t.certifications.some(
          (c) => c.type.code === kod && c.expiresAt.getTime() >= nu,
        ),
    ),
  );

  return { utgangna, snart, saknade, ejTillgangliga, teams, certWarningDays };
}
