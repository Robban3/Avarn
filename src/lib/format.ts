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
 * Formaterarna ligger som modulkonstanter och byggs inte per anrop.
 * `new Intl.DateTimeFormat(...)` är dyrt – den slår upp lokal och tidszon –
 * och de här två är de hetaste i appen: kalenderns veckovy anropar
 * `toLocalInput` för varje händelse och varje dygnsgräns den ritar.
 */
const localInputFmt = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * "2026-08-31T08:00" i svensk tid, som ett datetime-local-fält vill ha det.
 * Servern renderar i UTC, så tidszonen måste anges uttryckligen.
 */
export function toLocalInput(date: Date) {
  const parts = localInputFmt.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/**
 * "2026-05-24" i svensk tid. Används som nyckel när uppdrag grupperas per
 * dag – jämförelsen blir densamma oavsett serverns egen tidszon.
 */
export const dateKey = (d: Date) => toLocalInput(d).slice(0, 10);

/* ------------------------------------------------------- Datum som nyckel */

/**
 * Räkning på kalenderdygn görs på nycklar ("2026-09-24") och inte på
 * tidpunkter. Ett dygn är inte alltid 24 timmar – natten mot sista söndagen
 * i mars är 23 – så "lägg till ett dygn" på en tidpunkt hoppar fel två gånger
 * om året. Nyckeln har ingen klocka och kan räknas i UTC utan att någon
 * omställning stör.
 */
const nyckelSomUtc = (nyckel: string) => Date.parse(`${nyckel}T00:00:00Z`);

/** Datumet `antal` dygn senare, som nyckel. Negativt går bakåt. */
export function addDaysKey(nyckel: string, antal: number) {
  return new Date(nyckelSomUtc(nyckel) + antal * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

/** Veckodagen för en nyckel, med måndag som 0 – som en svensk kalender. */
export function weekdayIndex(nyckel: string) {
  return (new Date(nyckelSomUtc(nyckel)).getUTCDay() + 6) % 7;
}

/** Måndagen i veckan som nyckeln ligger i. */
export function startOfWeekKey(nyckel: string) {
  return addDaysKey(nyckel, -weekdayIndex(nyckel));
}

/**
 * ISO-veckonumret. Veckan hör till det år dess torsdag ligger i, och
 * vecka 1 är den som innehåller årets första torsdag – därför räcker det
 * att räkna hela veckor från nyårsdagen fram till veckans torsdag.
 */
export function isoWeek(nyckel: string) {
  const torsdag = addDaysKey(startOfWeekKey(nyckel), 3);
  const nyarsdag = Date.UTC(Number(torsdag.slice(0, 4)), 0, 1);
  const dygn = (nyckelSomUtc(torsdag) - nyarsdag) / 86_400_000;
  return Math.floor(dygn / 7) + 1;
}

/** Nyckeln som en tidpunkt mitt på dagen – aldrig nära en dygnsgräns. */
const nyckelSomDatum = (nyckel: string) => fromLocalInput(`${nyckel}T12:00`);

const manadArFmt = new Intl.DateTimeFormat("sv-SE", {
  month: "long",
  year: "numeric",
  timeZone: TZ,
});

const dagRubrikFmt = new Intl.DateTimeFormat("sv-SE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: TZ,
});

/** "September 2026" – rubriken över månadsrutnätet. */
export function formatMonthYear(nyckel: string) {
  const text = manadArFmt.format(nyckelSomDatum(nyckel));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "Torsdag 24 september" – rubriken över dagens lista. */
export function formatDayHeading(nyckel: string) {
  const text = dagRubrikFmt.format(nyckelSomDatum(nyckel));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Tidpunkten då dygnet börjar i svensk tid. */
export const startOfDay = (nyckel: string) => fromLocalInput(`${nyckel}T00:00`);

/* -------------------------------------------------------------------------- */

const offsetFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** Hur långt före eller efter UTC svensk tid låg vid en viss tidpunkt. */
function offsetMs(instant: Date) {
  const parts = offsetFmt.formatToParts(instant);
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

/**
 * Läser koordinater skrivna som "59.6498, 17.9239" – formatet man får när
 * man kopierar en punkt ur en karttjänst.
 *
 * Returnerar null för tomt, och kastar för sådant som ser ut som ett
 * försök men inte är en punkt på jorden. Skillnaden är avsiktlig: ett tomt
 * fält betyder "ingen karta", medan skräp ska ge ett felmeddelande.
 */
export function parseKoordinater(value: string) {
  const text = value.trim();
  if (!text) return null;

  const match = /^(-?\d+(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d+(?:[.,]\d+)?)$/.exec(text);
  if (!match) {
    throw new Error('Koordinater skrivs som "59.6498, 17.9239".');
  }

  const lat = Number(match[1].replace(",", "."));
  const lng = Number(match[2].replace(",", "."));
  if (!Number.isFinite(lat) || Math.abs(lat) > 90) {
    throw new Error("Latituden måste ligga mellan -90 och 90.");
  }
  if (!Number.isFinite(lng) || Math.abs(lng) > 180) {
    throw new Error("Longituden måste ligga mellan -180 och 180.");
  }
  return { lat, lng };
}

/** "59.6498, 17.9239" – som fältet vill ha det tillbaka. */
export function formatKoordinater(lat?: number | null, lng?: number | null) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return "";
  }
  return `${lat}, ${lng}`;
}

/**
 * Raderna i ett flerradigt fält, tomma bortsorterade. Används för
 * utrustningslistan på uppdraget, på samma sätt som listorna i
 * inställningarna.
 */
export function listaFranText(text?: string | null) {
  if (!text) return [];
  return text
    .split("\n")
    .map((rad) => rad.trim())
    .filter(Boolean);
}

/** "2 h 30 min", "45 min" – beräknad varaktighet ur start och slut. */
export function formatDuration(minutes: number) {
  if (minutes <= 0) return "–";
  const timmar = Math.floor(minutes / 60);
  const kvar = minutes % 60;
  if (timmar === 0) return `${kvar} min`;
  if (kvar === 0) return `${timmar} h`;
  return `${timmar} h ${kvar} min`;
}

/**
 * Läser flera koordinater, en per rad – uppdragsområdets hörn.
 *
 * Tomt ger en tom lista. Skräp kastar, med raden utpekad, så att den som
 * klistrat in fel ser var det gick fel i stället för att få en karta utan
 * yta och ingen förklaring.
 */
export function parseKoordinatlista(value?: string | null) {
  const rader = listaFranText(value);
  return rader.map((rad, i) => {
    try {
      const punkt = parseKoordinater(rad);
      if (!punkt) throw new Error("Tom rad.");
      return punkt;
    } catch (error) {
      throw new Error(`Rad ${i + 1}: ${(error as Error).message}`);
    }
  });
}

/** "59.6498, 17.9239" per rad, som fältet vill ha det tillbaka. */
export function formatKoordinatlista(
  punkter: { lat: number; lng: number }[],
) {
  return punkter.map((p) => `${p.lat}, ${p.lng}`).join("\n");
}

/**
 * Uppdragstid som klocka: "00:42:18".
 *
 * Skiljer sig från formatDuration, som skriver varaktigheter i löpande
 * text. En klocka som räknar under ett pågående uppdrag ska ha samma
 * bredd hela tiden och gå att läsa i ögonvrån.
 */
export function formatStopwatch(millisekunder: number) {
  const totalt = Math.max(0, Math.floor(millisekunder / 1000));
  const timmar = Math.floor(totalt / 3600);
  const minuter = Math.floor((totalt % 3600) / 60);
  const sekunder = totalt % 60;
  return [timmar, minuter, sekunder]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}
