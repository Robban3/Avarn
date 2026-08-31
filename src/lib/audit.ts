import "server-only";
import { db } from "./db";

/**
 * Spårbarhet. Uppdrag och rapporter kan innehålla känsliga uppgifter, så
 * läsning av dem loggas tillsammans med ändringar och nekad åtkomst.
 * Loggningen får aldrig fälla själva anropet – därför fångas fel här.
 */
export async function audit(entry: {
  userId?: string | null;
  action: "READ" | "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "DENIED";
  entityType: string;
  entityId?: string | null;
  detail?: string | null;
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        detail: entry.detail ?? null,
      },
    });
  } catch (error) {
    console.error("Kunde inte skriva revisionslogg", error);
  }
}
