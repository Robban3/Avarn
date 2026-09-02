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

/**
 * Samma datum om `months` månader.
 *
 * Date.setMonth spiller över: 31 januari plus en månad blir 3 mars,
 * eftersom februari saknar den 31:a. Ett certifikat utfärdat den sista i
 * månaden fick då ett utgångsdatum några dagar in i nästa månad. Här
 * klipps dagen till månadens sista i stället.
 */
export function addMonths(date: Date, months: number) {
  const resultat = new Date(date);
  const dag = resultat.getUTCDate();
  resultat.setUTCDate(1);
  resultat.setUTCMonth(resultat.getUTCMonth() + months);
  const sistaIManaden = new Date(
    Date.UTC(resultat.getUTCFullYear(), resultat.getUTCMonth() + 1, 0),
  ).getUTCDate();
  resultat.setUTCDate(Math.min(dag, sistaIManaden));
  return resultat;
}

/**
 * Gäller intyget den som håller i pennan?
 *
 * Behörigheten "cert:manage" är skriven för instruktör och uppåt, men en
 * instruktör eller regionalt ansvarig kan också själv vara förare i ett
 * ekipage. Ingen utfärdar ett formellt intyg åt sig själv.
 *
 * `ekipagetsForare` är föraren i det ekipage eller den hund intyget gäller,
 * och null när mottagaren är en person.
 */
export function egetIntyg(
  userId: string,
  subject: { kind: string; id: string },
  ekipagetsForare: string | null,
) {
  if (subject.kind === "user") return subject.id === userId;
  if (subject.kind === "team" || subject.kind === "dog") {
    return ekipagetsForare === userId;
  }
  return false;
}
