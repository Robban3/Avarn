import "server-only";
import { db } from "./db";
import { seesAllRegions, teamScope } from "./authz";
import type { SessionUser } from "./session";
import { durationMinutes, monthsBack, startOfMonthLocal } from "./format";
import { certStatus } from "./certifications";
import { getSettings } from "./settings";

/**
 * Aggregat för instruktörs- och ledningsvyerna. Vyerna läser siffror, inte
 * rapporttexter – statistik ska inte kunna bli en väg runt behörigheterna.
 */

/**
 * Nyckeltalens tidsfönster: de senaste 30 dagarna, inte kalendermånaden.
 *
 * Med kalendermånad står appen på noll den första i månaden och ser trasig
 * ut i en vecka, fast den räknar rätt. Ett rullande fönster ger alltid
 * siffror och gör dessutom jämförelsen rättvis – två lika långa perioder
 * i stället för "två dagar mot trettioen".
 */
export const FONSTER_DAGAR = 30;

/** Början på det rullande fönstret. */
export function rollingFrom(days = FONSTER_DAGAR, date = new Date()) {
  const from = new Date(date);
  from.setDate(from.getDate() - days);
  return from;
}

/** Början på fönstret dessförinnan, för jämförelsetalet. */
export function previousRollingFrom(days = FONSTER_DAGAR, date = new Date()) {
  return rollingFrom(days * 2, date);
}

export function startOfMonth(date = new Date()) {
  return startOfMonthLocal(date);
}

// Månadsgränserna är ren datumlogik och bor i format.ts, men hör hemma i
// statistikens ordförråd – re-exporteras därför härifrån.
export { monthsBack };

/** Början på föregående månad. */
export function startOfPreviousMonth(date = new Date()) {
  return startOfMonthLocal(date, -1);
}

/**
 * Nyckeltal för de ekipage användaren ser, inom ett tidsspann.
 * `to` utelämnas för "från och med `from` och framåt".
 */
export async function periodStats(
  user: SessionUser,
  from: Date,
  to?: Date,
) {
  const scope = teamScope(user);
  const period = to ? { gte: from, lt: to } : { gte: from };

  const [teamCount, sessions, missionCount, openFollowUps] = await Promise.all([
    db.team.count({ where: { ...scope, status: "ACTIVE" } }),
    db.trainingSession.findMany({
      where: { team: scope, startAt: period },
      select: {
        startAt: true,
        endAt: true,
        hideCount: true,
        foundCount: true,
      },
    }),
    // Uppdrag, inte tilldelningar: ett uppdrag med tre ekipage är ett
    // uppdrag. Räknades tilldelningarna blev nyckeltalet tre gånger för
    // högt för samma insats.
    //
    // Avgränsningen är ordagrant densamma som ringdiagrammets
    // (missionsByDiscipline), så att nyckeltalet och ringen svarar på
    // samma fråga. Den som ser hela landet ser alla uppdrag i perioden;
    // övriga ser dem deras ekipage är på, frånsett de avböjda.
    db.mission.count({
      where: seesAllRegions(user)
        ? { startAt: period }
        : {
            startAt: period,
            assignments: {
              some: { team: scope, status: { not: "DECLINED" } },
            },
          },
    }),
    db.followUp.count({ where: { team: scope, status: "OPEN" } }),
  ]);

  const trainingMinutes = sessions.reduce(
    (sum, s) => sum + durationMinutes(s.startAt, s.endAt),
    0,
  );

  // Genomförandegrad: hur stor andel av gömmorna som markerades.
  const hides = sessions.reduce((sum, s) => sum + s.hideCount, 0);
  const found = sessions.reduce((sum, s) => sum + s.foundCount, 0);

  return {
    teamCount,
    missionCount,
    trainingHours: Math.round(trainingMinutes / 60),
    sessionCount: sessions.length,
    openFollowUps,
    /** null när inga gömmor registrerats – då finns inget att beräkna. */
    completionRate: hides === 0 ? null : Math.round((found / hides) * 100),
  };
}

/** Nyckeltal för innevarande månad. Används av instruktörs- och ledningsvyn. */
export async function overviewStats(user: SessionUser, since = rollingFrom()) {
  return periodStats(user, since);
}

/** Träningstimmar per månad, för stapeldiagrammet i ledningsvyn. */
export async function trainingHoursByMonth(
  user: SessionUser,
  months = 6,
  regionId?: string,
) {
  const buckets = monthsBack(months);
  const sessions = await db.trainingSession.findMany({
    where: {
      // AND, inte spread – annars skriver regionId över avgränsningen.
      team: { AND: [teamScope(user), regionId ? { regionId } : {}] },
      startAt: { gte: buckets[0].start },
    },
    select: { startAt: true, endAt: true },
  });

  return buckets.map((bucket) => {
    const minutes = sessions
      .filter((s) => s.startAt >= bucket.start && s.startAt < bucket.end)
      .reduce((sum, s) => sum + durationMinutes(s.startAt, s.endAt), 0);
    return { label: bucket.label, hours: Math.round(minutes / 60) };
  });
}

/** Antal ekipage per sökinriktning – visar var kapaciteten finns. */
export async function capacityByDiscipline(
  user: SessionUser,
  regionId?: string,
) {
  const teams = await db.team.findMany({
    where: {
      AND: [teamScope(user), regionId ? { regionId } : {}],
      status: "ACTIVE",
    },
    include: {
      dog: { include: { disciplines: { include: { discipline: true } } } },
    },
  });

  const counts = new Map<string, { name: string; count: number }>();
  for (const team of teams) {
    for (const d of team.dog.disciplines) {
      const entry = counts.get(d.disciplineId) ?? {
        name: d.discipline.name,
        count: 0,
      };
      entry.count += 1;
      counts.set(d.disciplineId, entry);
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count);
}

/**
 * Ekipage, uppdrag och träning per region – geografisk täckning.
 * Regionalt ansvarig ser bara sin egen region; uppdragssiffrorna för andra
 * regioner ligger utanför behörigheten även om de bara är summor.
 */
export async function coverageByRegion(user: SessionUser) {
  const scope = teamScope(user);
  const regions = await db.region.findMany({
    where: seesAllRegions(user)
      ? {}
      : { id: user.regionId ?? "__ingen_region__" },
    orderBy: { sortOrder: "asc" },
  });
  const since = rollingFrom();
  const regionIds = regions.map((r) => r.id);

  // Tre frågor över alla regioner på en gång. Tidigare gick det en runda
  // per region, och sidan anropar den här två gånger.
  const [teamsPerRegion, missionsPerRegion, sessions] = await Promise.all([
    db.team.groupBy({
      by: ["regionId"],
      where: { AND: [scope, { regionId: { in: regionIds }, status: "ACTIVE" }] },
      _count: { _all: true },
    }),
    db.mission.groupBy({
      by: ["regionId"],
      where: { regionId: { in: regionIds }, startAt: { gte: since } },
      _count: { _all: true },
    }),
    db.trainingSession.findMany({
      where: {
        AND: [
          { team: { AND: [scope, { status: "ACTIVE" }] } },
          { team: { regionId: { in: regionIds } } },
        ],
        startAt: { gte: since },
      },
      select: { startAt: true, endAt: true, team: { select: { regionId: true } } },
    }),
  ]);

  const antalEkipage = new Map(
    teamsPerRegion.map((r) => [r.regionId, r._count._all]),
  );
  const antalUppdrag = new Map(
    missionsPerRegion.map((r) => [r.regionId, r._count._all]),
  );
  const minuter = new Map<string, number>();
  for (const s of sessions) {
    const id = s.team.regionId;
    minuter.set(id, (minuter.get(id) ?? 0) + durationMinutes(s.startAt, s.endAt));
  }

  return regions.map((region) => ({
    region,
    teams: antalEkipage.get(region.id) ?? 0,
    missions: antalUppdrag.get(region.id) ?? 0,
    trainingHours: Math.round((minuter.get(region.id) ?? 0) / 60),
  }));
}

/** Certifikat som kräver åtgärd, sorterade efter hur bråttom det är. */
export async function certificationAlerts(user: SessionUser, take = 10) {
  const scope = teamScope(user);
  const { certWarningDays } = await getSettings();
  const limit = new Date();
  limit.setDate(limit.getDate() + certWarningDays);

  const certifications = await db.certification.findMany({
    where: {
      expiresAt: { lte: limit },
      // Avgränsningen ligger i relationen i stället för i en id-lista.
      // För administratör blev listan hela beståndet i varje fråga.
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
    take,
  });

  return certifications.map((cert) => ({
    cert,
    status: certStatus(cert.expiresAt, certWarningDays),
  }));
}
