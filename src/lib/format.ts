/**
 * Svensk formatering. All datumvisning i appen går genom de här
 * funktionerna så att formatet är detsamma överallt.
 */

const TZ = "Europe/Stockholm";

const dateFmt = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TZ,
});

const shortDateFmt = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "short",
  timeZone: TZ,
});

const timeFmt = new Intl.DateTimeFormat("sv-SE", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

const monthFmt = new Intl.DateTimeFormat("sv-SE", {
  month: "short",
  timeZone: TZ,
});

const dayFmt = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  timeZone: TZ,
});

const weekdayFmt = new Intl.DateTimeFormat("sv-SE", {
  weekday: "long",
  timeZone: TZ,
});

export const formatDate = (d: Date) => dateFmt.format(d);
export const formatShortDate = (d: Date) => shortDateFmt.format(d);
export const formatTime = (d: Date) => timeFmt.format(d);
export const formatWeekday = (d: Date) => weekdayFmt.format(d);
export const formatDayNumber = (d: Date) => dayFmt.format(d);
/** "MAJ" – används i datumblocken i uppdragslistan. */
export const formatMonthShort = (d: Date) =>
  monthFmt.format(d).replace(".", "").toUpperCase();

export function formatDateTime(d: Date) {
  return `${formatDate(d)} ${formatTime(d)}`;
}

/** "09:00 – 11:15", eller bara starttiden om sluttid saknas. */
export function formatTimeRange(start: Date, end?: Date | null) {
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start);
}

/** Ålder i hela år. */
export function ageInYears(birthDate: Date, now = new Date()) {
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

/** Skillnad i hela dagar; negativt om datumet har passerat. */
export function daysUntil(date: Date, now = new Date()) {
  const ms = date.getTime() - now.getTime();
  return Math.ceil(ms / 86_400_000);
}

/** "Idag 10:15", "Igår 16:45", "3 dagar sedan", annars datum. */
export function formatRelative(date: Date, now = new Date()) {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(date)) / 86_400_000,
  );

  if (diffDays === 0) return `Idag ${formatTime(date)}`;
  if (diffDays === 1) return `Igår ${formatTime(date)}`;
  if (diffDays > 1 && diffDays < 7) return `${diffDays} dagar sedan`;
  if (diffDays === -1) return `Imorgon ${formatTime(date)}`;
  if (diffDays < -1 && diffDays > -7) return `Om ${Math.abs(diffDays)} dagar`;
  return formatDate(date);
}

/** Timmar med en decimal, t.ex. "96,5 h". */
export function formatHours(minutes: number) {
  const hours = minutes / 60;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded.toLocaleString("sv-SE")} h`;
}

export function durationMinutes(start: Date, end?: Date | null) {
  if (!end) return 0;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
}

/** Initialer för platshållaravatarer, t.ex. "Erik Andersson" → "EA". */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
