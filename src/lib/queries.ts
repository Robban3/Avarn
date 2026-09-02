import "server-only";
import { db } from "./db";
import { teamScope } from "./authz";
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
  const teamIds = await visibleTeamIds(user);
  const limit = new Date();
  limit.setDate(limit.getDate() + dagar);

  const teams = await db.team.findMany({
    where: { id: { in: teamIds } },
    select: { id: true, handlerId: true, dogId: true },
  });
  const dogIds = teams.map((t) => t.dogId);
  const handlerIds = teams.map((t) => t.handlerId);

  return db.certification.findMany({
    where: {
      expiresAt: { lte: limit },
      OR: [
        { teamId: { in: teamIds } },
        { dogId: { in: dogIds } },
        { userId: { in: handlerIds } },
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
