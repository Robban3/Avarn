import type { Prisma } from "@/generated/prisma";
import { ROLES, type Role } from "./domain";
import type { SessionUser } from "./session";

/**
 * All åtkomststyrning på ett ställe.
 *
 * Två lager används tillsammans:
 *  1. `can(user, action)` – vad rollen överhuvudtaget får göra.
 *  2. `teamScope(user)` – vilka ekipage användaren får se data om. Varje
 *     lista filtreras genom detta, så att en ny vy inte kan råka visa för
 *     mycket bara för att den glömt ett villkor.
 *
 * Uppdrag och rapporter kan innehålla känsliga uppgifter. Därför är
 * utgångsläget alltid "ingen åtkomst" och varje utökning uttrycks explicit.
 */

export type Action =
  // Ekipage och hundar
  | "team:viewOwn"
  | "team:viewOthers"
  | "dog:manage"
  // Hundföraren får registrera en ny hund åt sig själv, men inte ändra
  // andras. Registreringen skapar hund och ekipage i förarens egen region.
  | "dog:create"
  // Träning
  | "session:create"
  | "session:approve"
  | "plan:manage"
  | "followUp:create"
  // Uppdrag
  | "mission:create"
  | "mission:assign"
  | "mission:respond"
  // Rapporter
  | "report:create"
  | "report:approve"
  | "report:viewAllInScope"
  // Översikt
  | "instructor:view"
  | "stats:view"
  | "admin:manage";

const CAPABILITIES: Record<Role, Action[]> = {
  HANDLER: [
    "team:viewOwn",
    "dog:create",
    "session:create",
    "mission:respond",
    "report:create",
  ],
  INSTRUCTOR: [
    "team:viewOwn",
    "team:viewOthers",
    "session:create",
    "session:approve",
    "plan:manage",
    "followUp:create",
    "instructor:view",
    "report:viewAllInScope",
  ],
  REGIONAL_MANAGER: [
    "team:viewOwn",
    "team:viewOthers",
    "dog:manage",
    "dog:create",
    "session:approve",
    "plan:manage",
    "followUp:create",
    "mission:create",
    "mission:assign",
    "report:approve",
    "report:viewAllInScope",
    "instructor:view",
    "stats:view",
  ],
  NATIONAL_MANAGER: [
    "team:viewOwn",
    "team:viewOthers",
    "dog:manage",
    "dog:create",
    "session:approve",
    "plan:manage",
    "followUp:create",
    "mission:create",
    "mission:assign",
    "report:approve",
    "report:viewAllInScope",
    "instructor:view",
    "stats:view",
  ],
  ADMIN: [
    "team:viewOwn",
    "team:viewOthers",
    "dog:manage",
    "dog:create",
    "session:approve",
    "plan:manage",
    "followUp:create",
    "mission:create",
    "mission:assign",
    "report:approve",
    "report:viewAllInScope",
    "instructor:view",
    "stats:view",
    "admin:manage",
  ],
};

export function can(user: Pick<SessionUser, "role">, action: Action): boolean {
  return CAPABILITIES[user.role]?.includes(action) ?? false;
}

/** Kastar om rollen saknar behörighet. Anropas först i varje server action. */
export function assertCan(
  user: Pick<SessionUser, "role">,
  action: Action,
): void {
  if (!can(user, action)) {
    throw new AccessDeniedError(
      `Rollen ${user.role} saknar behörighet för ${action}.`,
    );
  }
}

export class AccessDeniedError extends Error {
  constructor(message = "Du saknar behörighet till den här uppgiften.") {
    super(message);
    this.name = "AccessDeniedError";
  }
}

/**
 * Prisma-villkor för de ekipage användaren får se.
 *
 * Regionalt ansvarig utan region får medvetet ett villkor som inte matchar
 * något – hellre tom lista än hela landet.
 */
export function teamScope(
  user: Pick<SessionUser, "id" | "role" | "regionId">,
): Prisma.TeamWhereInput {
  switch (user.role) {
    case ROLES.HANDLER:
      return { handlerId: user.id };
    case ROLES.INSTRUCTOR:
      return {
        instructorAssignments: { some: { instructorId: user.id } },
      };
    case ROLES.REGIONAL_MANAGER:
      return { regionId: user.regionId ?? "__ingen_region__" };
    case ROLES.NATIONAL_MANAGER:
    case ROLES.ADMIN:
      return {};
    default:
      // Okänd roll ska aldrig ge åtkomst.
      return { id: "__ingen_atkomst__" };
  }
}

/** Samma avgränsning uttryckt som villkor på en relation som heter `team`. */
export function nestedTeamScope(
  user: Pick<SessionUser, "id" | "role" | "regionId">,
) {
  return { team: teamScope(user) };
}

/** Sant om användaren ser hela landet och inte bara sin region. */
export function seesAllRegions(user: Pick<SessionUser, "role">): boolean {
  return (
    user.role === ROLES.NATIONAL_MANAGER || user.role === ROLES.ADMIN
  );
}

/** Regionfilter för uppdrag och statistik. */
export function regionScope(
  user: Pick<SessionUser, "role" | "regionId">,
): { regionId?: string } {
  if (seesAllRegions(user)) return {};
  return { regionId: user.regionId ?? "__ingen_region__" };
}

/**
 * Får användaren redigera det här träningspasset?
 * Föraren äger sitt eget pass fram till godkännande; instruktör och ledning
 * granskar och godkänner men skriver inte om innehållet.
 */
export function canEditSession(
  user: Pick<SessionUser, "id" | "role">,
  session: { createdById: string; status: string },
): boolean {
  if (session.status === "APPROVED") return false;
  return session.createdById === user.id;
}

/** Får användaren redigera rapporten? Samma princip som för träningspass. */
export function canEditReport(
  user: Pick<SessionUser, "id" | "role">,
  report: { authorId: string; status: string },
): boolean {
  if (report.status === "APPROVED") return false;
  return report.authorId === user.id;
}
