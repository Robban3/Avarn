import { CERT_WARNING_DAYS } from "./domain";
import { daysUntil } from "./format";

/**
 * Ett certifikats giltighet härleds ur utgångsdatumet i stället för att
 * lagras – då kan status aldrig hamna i otakt med datumet.
 */
export type CertStatus = "VALID" | "EXPIRING" | "EXPIRED";

export function certStatus(
  expiresAt: Date,
  warningDays = CERT_WARNING_DAYS,
  now = new Date(),
): CertStatus {
  const days = daysUntil(expiresAt, now);
  if (days < 0) return "EXPIRED";
  if (days <= warningDays) return "EXPIRING";
  return "VALID";
}

export const CERT_STATUS_LABELS: Record<CertStatus, string> = {
  VALID: "Giltigt",
  EXPIRING: "Går snart ut",
  EXPIRED: "Utgånget",
};

export const CERT_STATUS_TONES: Record<CertStatus, "ok" | "warn" | "danger"> = {
  VALID: "ok",
  EXPIRING: "warn",
  EXPIRED: "danger",
};

/** "Giltig till: 2026-05-20" med en tydlig varning när tiden är knapp. */
export function certValidityText(expiresAt: Date, now = new Date()) {
  const days = daysUntil(expiresAt, now);
  const date = expiresAt.toISOString().slice(0, 10);
  if (days < 0) return `Gick ut ${date}`;
  if (days === 0) return `Går ut idag (${date})`;
  if (days <= CERT_WARNING_DAYS) {
    return `Giltig till: ${date} · ${days} ${days === 1 ? "dag" : "dagar"} kvar`;
  }
  return `Giltig till: ${date}`;
}
