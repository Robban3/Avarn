import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getSessionUser, type SessionUser } from "./session";
import { assertCan, can, type Action } from "./authz";
import type { Role } from "./domain";

/**
 * Serverfunktioner som varje skyddad sida och server action börjar med.
 * Middleware stoppar redan utloggade besökare, men sidorna kontrollerar
 * själva också – så att data inte kan nås genom att gissa en adress.
 */

/**
 * Roll, region och kontostatus läses ur databasen, inte ur sessionen.
 *
 * Kakan lever i tolv timmar. Utan den här uppslagningen behöll en avstängd
 * eller nedgraderad användare sina rättigheter tills token gick ut. React
 * cache gör det till en fråga per förfrågan hur många gånger requireUser
 * än anropas under samma rendering.
 */
const farskAnvandare = cache(async (id: string) =>
  db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      regionId: true,
      active: true,
    },
  }),
);

export async function requireUser(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const record = await farskAnvandare(session.id);
  // Utloggningsvägen, inte /login: kakan är fortfarande giltig, och
  // mellanlagret skulle skicka tillbaka besökaren till /hem i en slinga.
  if (!record || !record.active) redirect("/logga-ut");

  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role as Role,
    regionId: record.regionId,
  };
}

/** Kräver inloggning och en viss behörighet; annars visas nekad-sidan. */
export async function requireCapability(action: Action): Promise<SessionUser> {
  const user = await requireUser();
  try {
    assertCan(user, action);
  } catch {
    redirect("/nekad");
  }
  return user;
}

/**
 * Kräver behörighet till adminpanelen. Instruktör, regionalt och nationellt
 * ansvarig samt administratör kommer in – hundföraren har mobilappen och
 * skickas till nekad-sidan.
 */
export async function requirePanelUser(): Promise<SessionUser> {
  const user = await requireUser();
  const slapps =
    can(user, "instructor:view") ||
    can(user, "stats:view") ||
    can(user, "admin:manage");
  if (!slapps) redirect("/nekad");
  return user;
}

/** Färsk användarpost ur databasen, t.ex. för profilsidan. */
export async function currentUserRecord() {
  const user = await requireUser();
  const record = await db.user.findUnique({
    where: { id: user.id },
    include: { region: true, handlerProfile: true },
  });
  if (!record || !record.active) redirect("/logga-ut");
  return record;
}

/** Antal olästa notifieringar – visas som prick i sidhuvudet. */
export async function unreadNotificationCount(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}
