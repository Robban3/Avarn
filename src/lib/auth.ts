import "server-only";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getSessionUser, type SessionUser } from "./session";
import { assertCan, can, type Action } from "./authz";

/**
 * Serverfunktioner som varje skyddad sida och server action börjar med.
 * Middleware stoppar redan utloggade besökare, men sidorna kontrollerar
 * själva också – så att data inte kan nås genom att gissa en adress.
 */

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
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
  if (!record || !record.active) redirect("/login");
  return record;
}

/** Antal olästa notifieringar – visas som prick i sidhuvudet. */
export async function unreadNotificationCount(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}
