import { db } from "@/lib/db";
import { iWorkers } from "@/lib/kortid";
import { miljo, miljoantal } from "@/lib/miljo";
import { usesCloudStorage } from "@/lib/storage";

/**
 * Säger vad som saknas när appen inte startar.
 *
 * Fyra helt olika fel ger användaren samma sida: "Något gick fel" med en
 * felkod som bara är Nexts digest, alltså en hash. Utan serverloggen går
 * de inte att skilja åt – och driftloggen ligger hos den som driftsatt,
 * inte hos den som felsöker. Den här rutten svarar på frågan direkt.
 *
 * Den lämnar aldrig ut ett värde, bara ett omdöme: att adressen är en
 * poolare, inte vilken; att lösenordet nekas, inte vilket det var. Prismas
 * felmeddelanden loggas men returneras inte, eftersom de bär med sig både
 * värdnamn och användarnamn.
 *
 * Öppen utan nyckel, av samma skäl som den finns: när CRON_KEY är det som
 * saknas går den inte att skydda med CRON_KEY.
 */

/** Vilken sorts anslutning DATABASE_URL pekar på – räknat ur formen, inte innehållet. */
function adressens_sort():
  | "saknas"
  | "poolare"
  | "direktanslutning"
  | "egen"
  | "otolkbar" {
  const adress = miljo("DATABASE_URL");
  if (!adress) return "saknas";
  try {
    const { hostname } = new URL(adress);
    if (/pooler\.supabase\.com$/i.test(hostname)) return "poolare";
    if (/^db\.[a-z0-9]+\.supabase\.(co|com)$/i.test(hostname)) {
      return "direktanslutning";
    }
    // Egen Postgres, i utveckling eller på en egen server.
    return "egen";
  } catch {
    // Kvarlämnad platshållare, okodat tecken i lösenordet, avhugget @ –
    // allt landar här, och alla tre ger samma otydliga fel i drift.
    return "otolkbar";
  }
}

/** AUTH_SECRET måste finnas och vara minst 16 tecken; se src/lib/session.ts. */
function hemlighetens_skick(): "saknas" | "för kort" | "ok" {
  const hemlighet = miljo("AUTH_SECRET");
  if (!hemlighet) return "saknas";
  return hemlighet.length < 16 ? "för kort" : "ok";
}

/**
 * Vad som gick fel. En kod, aldrig ett meddelande.
 *
 * Prisma svarar med P-koder – men bara när felet nått fram till Prisma.
 * I Workers kommer det ofta från socketen under adaptern i stället, och
 * ligger då nedbäddat under `cause`. Utan den vandringen blir svaret
 * "okänt", vilket är precis det tomma besked rutten finns för att slippa.
 *
 * Bara korta symboler släpps igenom, aldrig fri text: felmeddelandena bär
 * med sig både värdnamn och användarnamn.
 */
function felkod(fel: unknown): string {
  let lager: unknown = fel;

  for (let djup = 0; djup < 5 && lager; djup += 1) {
    if (typeof lager !== "object") break;
    const post = lager as Record<string, unknown>;

    const kod = post.code;
    if (typeof kod === "string" && /^[A-Za-z][A-Za-z0-9_]{1,39}$/.test(kod)) {
      return kod;
    }

    const namn = post.name;
    if (
      typeof namn === "string" &&
      /^[A-Za-z][A-Za-z0-9_]{1,39}$/.test(namn) &&
      namn !== "Error" &&
      namn !== "TypeError"
    ) {
      return namn;
    }

    lager = post.cause;
  }

  return ur_meddelandet(fel);
}

/**
 * Sista utvägen: känn igen felet på vad det säger.
 *
 * Socketfel i workerd bär varken kod eller namn – bara en mening. Den får
 * inte returneras rakt av, eftersom den ofta innehåller värdnamnet. I
 * stället matchas den mot kända formuleringar och svaret blir en symbol
 * ur den här listan, aldrig något som kommer utifrån.
 */
function ur_meddelandet(fel: unknown): string {
  const text =
    fel instanceof Error ? `${fel.message} ${fel.cause ?? ""}` : String(fel);

  const kanda: [RegExp, string][] = [
    [/refused/i, "nekad anslutning"],
    // workerds egen formulering när connect() inte kommer fram.
    [/cannot connect|proxy request failed/i, "nådde inte adressen"],
    [/timed?[ -]?out|ETIMEDOUT/i, "tidsgränsen gick ut"],
    [/getaddrinfo|ENOTFOUND|dns/i, "värdnamnet finns inte"],
    [/authentication|password/i, "nekat lösenord"],
    [/too many/i, "slut på anslutningar"],
    [/ssl|tls|certificate/i, "krypteringen gick inte att sätta upp"],
    [/DATABASE_URL/, "DATABASE_URL saknas"],
    [/AUTH_SECRET/, "AUTH_SECRET saknas"],
  ];

  for (const [monster, symbol] of kanda) {
    if (monster.test(text)) return symbol;
  }
  return "okänt";
}

export async function GET() {
  const adress = adressens_sort();

  let databasen = "svarar";
  let anvandare: number | null = null;
  let migreringar: number | null = null;
  let senaste: string | null = null;
  const start = Date.now();

  try {
    // En räkning på den minsta tabellen: bevisar både att anslutningen
    // går fram och att det är rätt databas, utan att läsa någons uppgifter.
    anvandare = await db.user.count();

    // Vilken schemaversion databasen står på.
    //
    // En databas som ligger efter svarar på allt det här ändå – den har
    // både anslutning och användare. Först när en vy frågar efter en
    // kolumn som saknas faller den, och då som ett ohanterat fel utan
    // spår av att det handlar om migreringar. Namnet räcker för att
    // jämföra med prisma/migrations i repot.
    const rader = await db.$queryRaw<{ migration_name: string }[]>`
      select migration_name
      from "_prisma_migrations"
      where finished_at is not null
      order by finished_at desc
      limit 1
    `;
    const alla = await db.$queryRaw<{ antal: bigint }[]>`
      select count(*) as antal
      from "_prisma_migrations"
      where finished_at is not null
    `;
    migreringar = Number(alla[0]?.antal ?? 0);
    senaste = rader[0]?.migration_name ?? null;
  } catch (fel) {
    databasen = felkod(fel);
    // Hela felet till loggen, för den som har den. Svaret får bara koden.
    console.error("Hälsokontrollen nådde inte databasen:", fel);
  }

  const svarstid = Date.now() - start;

  return Response.json(
    {
      kortid: iWorkers ? "workers" : "node",
      databasadress: adress,
      databasen,
      svarstid,
      anvandare,
      migreringar,
      senaste,
      authSecret: hemlighetens_skick(),
      cronKey: miljo("CRON_KEY") ? "ok" : "saknas",
      // Vilken av de två källorna som är tom säger var felet sitter.
      ...miljoantal(),
      lagring: usesCloudStorage() ? "supabase" : iWorkers ? "ingen" : "disk",
    },
    {
      // Ett cachat svar hade beskrivit ett läge som redan är åtgärdat.
      headers: { "Cache-Control": "no-store" },
    },
  );
}
