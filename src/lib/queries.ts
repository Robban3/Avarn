import "server-only";
import { db } from "./db";
import { can, regionScope, teamScope } from "./authz";
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

/** Ekipagen i uppdraget som användaren själv är förare för. */
export function ownAssignments<T extends { team: { handlerId: string } }>(
  user: SessionUser,
  assignments: T[],
) {
  return assignments.filter((a) => a.team.handlerId === user.id);
}
