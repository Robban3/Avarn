import type { CertStatus } from "@/lib/certifications";

/**
 * Statiska klassnamn per certifikatstatus. Tailwind kan inte se klasser som
 * sätts ihop dynamiskt, så de skrivs ut i klartext här.
 */
export const CERT_ICON_CLASSES: Record<CertStatus, string> = {
  VALID: "text-ok",
  EXPIRING: "text-warn",
  EXPIRED: "text-danger",
};
