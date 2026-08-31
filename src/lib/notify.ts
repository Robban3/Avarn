import "server-only";
import { db } from "./db";

/**
 * Notifieringar skapas genom det här lagret i stället för direkt mot
 * databasen. Ska e-post eller push läggas till senare är det här den
 * kanalen kopplas in, utan att anropande kod behöver ändras.
 */
export async function notify(entry: {
  userId: string;
  type:
    | "MISSION_ASSIGNED"
    | "COMMENT"
    | "TRAINING_PLANNED"
    | "CERT_EXPIRING"
    | "FOLLOW_UP"
    | "SESSION_APPROVED";
  title: string;
  body?: string;
  url?: string;
}) {
  await db.notification.create({
    data: {
      userId: entry.userId,
      type: entry.type,
      title: entry.title,
      body: entry.body ?? null,
      url: entry.url ?? null,
    },
  });
}

/** Skickar samma notifiering till flera mottagare, utan dubbletter. */
export async function notifyMany(
  userIds: string[],
  entry: Omit<Parameters<typeof notify>[0], "userId">,
) {
  const unique = [...new Set(userIds)];
  await Promise.all(unique.map((userId) => notify({ ...entry, userId })));
}

/** Instruktörerna som är kopplade till ett ekipage. */
export async function instructorsForTeam(teamId: string) {
  const assignments = await db.instructorAssignment.findMany({
    where: { teamId },
    select: { instructorId: true },
  });
  return assignments.map((a) => a.instructorId);
}
