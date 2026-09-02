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

/**
 * "2026-08-31T08:00" i svensk tid, som ett datetime-local-fält vill ha det.
 * Servern renderar i UTC, så tidszonen måste anges uttryckligen.
 */
export function toLocalInput(date: Date) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/**
 * "2026-05-24" i svensk tid. Används som nyckel när uppdrag grupperas per
 * dag – jämförelsen blir densamma oavsett serverns egen tidszon.
 */
export const dateKey = (d: Date) => toLocalInput(d).slice(0, 10);

/** Hur långt före eller efter UTC svensk tid låg vid en viss tidpunkt. */
function offsetMs(instant: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const wallAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return wallAsUtc - instant.getTime();
}

/**
 * Motsatsen till toLocalInput: gör om "2026-05-24T08:00" till rätt tidpunkt.
 * Klockslaget läses som svensk tid, precis som det visades i formuläret –
 * annars skulle ett pass flytta sig varje gång det sparades om, eftersom
 * servern kör i UTC.
 */
export function fromLocalInput(value: string) {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(:\d{2})?$/.exec(value.trim());
  if (!match) throw new Error("Ogiltigt datum eller klockslag.");
  const wall = Date.parse(`${match[1]}T${match[2]}${match[3] ?? ":00"}Z`);
  if (Number.isNaN(wall)) throw new Error("Ogiltigt datum eller klockslag.");
  // Två varv räcker för att landa rätt även dygnet då klockan ställs om.
  let instant = wall - offsetMs(new Date(wall));
  instant = wall - offsetMs(new Date(instant));
  return new Date(instant);
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

/**
 * Skillnad i hela kalenderdygn i svensk tid; negativt om datumet passerat.
 *
 * Räknas på dygn och inte på varaktighet: ett certifikat som går ut imorgon
 * är "1 dag kvar" oavsett om klockan är sju eller nio. Math.ceil på rå
 * varaktighet gav dessutom -0 för något som nyss gått ut, och -0 < 0 är
 * falskt – ett utgånget certifikat räknades då som "går snart ut".
 */
export function daysUntil(date: Date, now = new Date()) {
  const dygn = (d: Date) => Date.parse(`${dateKey(d)}T00:00:00Z`);
  return Math.round((dygn(date) - dygn(now)) / 86_400_000);
}

/** "Idag 10:15", "Igår 16:45", "3 dagar sedan", annars datum. */
export function formatRelative(date: Date, now = new Date()) {
  // Dygnsgränsen går vid midnatt svensk tid, inte vid serverns midnatt –
  // annars blir en kommentar skriven 00:30 "Igår" redan samma morgon.
  const diffDays = -daysUntil(date, now);

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

/** Tal i svenskt format, t.ex. 29.5 → "29,5". */
export function formatNumber(value: number, maxDecimals = 1) {
  return value.toLocaleString("sv-SE", { maximumFractionDigits: maxDecimals });
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

/**
 * Början på en månad i svensk tid, förskjutet `offset` månader.
 *
 * new Date(år, månad, 1) ger midnatt i serverns tidszon, alltså 00:00 UTC –
 * men etiketten sätts i svensk tid. Ett pass 1 september 00:30 svensk tid
 * är 31 augusti 22:30 UTC och hamnade då i augustistapeln. Gränsen måste
 * räknas i samma tidszon som etiketten.
 */
export function startOfMonthLocal(date = new Date(), offset = 0) {
  const [ar, manad] = dateKey(date).split("-").map(Number);
  // Räkna om till ett löpande månadsnummer så att årsskiftet sköter sig självt.
  const total = ar * 12 + (manad - 1) + offset;
  const nyttAr = Math.floor(total / 12);
  const nyManad = total - nyttAr * 12 + 1;
  return fromLocalInput(
    `${String(nyttAr).padStart(4, "0")}-${String(nyManad).padStart(2, "0")}-01T00:00`,
  );
}

/**
 * De `count` senaste månaderna som gränser och etiketter.
 *
 * Både gräns och etikett räknas i svensk tid – annars hamnar ett pass
 * strax efter midnatt den första i föregående månads stapel.
 */
export function monthsBack(count: number, from = new Date()) {
  const months: { start: Date; end: Date; label: string }[] = [];
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    month: "short",
    timeZone: TZ,
  });
  for (let i = count - 1; i >= 0; i -= 1) {
    const start = startOfMonthLocal(from, -i);
    const end = startOfMonthLocal(from, -i + 1);
    months.push({ start, end, label: fmt.format(start).replace(".", "") });
  }
  return months;
}
