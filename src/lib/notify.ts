import "server-only";
import { after } from "next/server";
import { db } from "./db";
import { vackTelefoner } from "./push";

/**
 * Notifieringar skapas genom det här lagret i stället för direkt mot
 * databasen. Det är också här kanalerna ut kopplas in: push till telefonen
 * ligger här, och e-post skulle göra det utan att anropande kod ändras.
 *
 * Utskicket läggs i `after()` och inte i anropet. Ett server action som
 * väntar på Apples servrar innan det svarar gör appen långsam på ett sätt
 * användaren märker, och pushen är inte det som räknas – aviseringen finns
 * redan i databasen när svaret går ut.
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

  after(() => vackTelefoner(entry.userId));
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
