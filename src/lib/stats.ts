import "server-only";
import { db } from "./db";
import { seesAllRegions, teamScope } from "./authz";
import type { SessionUser } from "./session";
import { durationMinutes } from "./format";
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
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function monthsBack(count: number, from = new Date()) {
  const months: { start: Date; end: Date; label: string }[] = [];
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    month: "short",
    timeZone: "Europe/Stockholm",
  });
  for (let i = count - 1; i >= 0; i -= 1) {
    const start = new Date(from.getFullYear(), from.getMonth() - i, 1);
    const end = new Date(from.getFullYear(), from.getMonth() - i + 1, 1);
    months.push({
      start,
      end,
      label: fmt.format(start).replace(".", ""),
    });
  }
  return months;
}

/** Början på föregående månad. */
export function startOfPreviousMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
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
  const teamIds = (
    await db.team.findMany({ where: scope, select: { id: true } })
  ).map((t) => t.id);

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
    db.missionAssignment.count({
      where: {
        teamId: { in: teamIds },
        status: { in: ["ACCEPTED", "COMPLETED"] },
        mission: { startAt: period },
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

  return Promise.all(
    regions.map(async (region) => {
      const teamIds = (
        await db.team.findMany({
          where: { ...scope, regionId: region.id, status: "ACTIVE" },
          select: { id: true },
        })
      ).map((t) => t.id);

      const [missions, sessions] = await Promise.all([
        db.mission.count({
          where: { regionId: region.id, startAt: { gte: since } },
        }),
        db.trainingSession.findMany({
          where: { teamId: { in: teamIds }, startAt: { gte: since } },
          select: { startAt: true, endAt: true },
        }),
      ]);

      return {
        region,
        teams: teamIds.length,
        missions,
        trainingHours: Math.round(
          sessions.reduce((s, x) => s + durationMinutes(x.startAt, x.endAt), 0) /
            60,
        ),
      };
    }),
  );
}

/** Certifikat som kräver åtgärd, sorterade efter hur bråttom det är. */
export async function certificationAlerts(user: SessionUser, take = 10) {
  const teams = await db.team.findMany({
    where: teamScope(user),
    select: { id: true, dogId: true, handlerId: true },
  });

  const { certWarningDays } = await getSettings();
  const limit = new Date();
  limit.setDate(limit.getDate() + certWarningDays);

  const certifications = await db.certification.findMany({
    where: {
      expiresAt: { lte: limit },
      OR: [
        { teamId: { in: teams.map((t) => t.id) } },
        { dogId: { in: teams.map((t) => t.dogId) } },
        { userId: { in: teams.map((t) => t.handlerId) } },
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
