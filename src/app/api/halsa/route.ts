import { db } from "@/lib/db";
import { iWorkers } from "@/lib/kortid";
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
function adressens_sort(): "saknas" | "poolare" | "direktanslutning" | "otolkbar" {
  const adress = process.env.DATABASE_URL;
  if (!adress) return "saknas";
  try {
    const { hostname } = new URL(adress);
    if (/pooler\.supabase\.com$/i.test(hostname)) return "poolare";
    if (/^db\.[a-z0-9]+\.supabase\.(co|com)$/i.test(hostname)) {
      return "direktanslutning";
    }
    return "poolare";
  } catch {
    // Kvarlämnad platshållare, okodat tecken i lösenordet, avhugget @ –
    // allt landar här, och alla tre ger samma otydliga fel i drift.
    return "otolkbar";
  }
}

/** AUTH_SECRET måste finnas och vara minst 16 tecken; se src/lib/session.ts. */
function hemlighetens_skick(): "saknas" | "för kort" | "ok" {
  const hemlighet = process.env.AUTH_SECRET;
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

  return "okänt";
}

export async function GET() {
  const adress = adressens_sort();

  let databasen = "svarar";
  let anvandare: number | null = null;
  const start = Date.now();

  try {
    // En räkning på den minsta tabellen: bevisar både att anslutningen
    // går fram och att det är rätt databas, utan att läsa någons uppgifter.
    anvandare = await db.user.count();
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
      authSecret: hemlighetens_skick(),
      cronKey: process.env.CRON_KEY ? "ok" : "saknas",
      lagring: usesCloudStorage() ? "supabase" : iWorkers ? "ingen" : "disk",
    },
    {
      // Ett cachat svar hade beskrivit ett läge som redan är åtgärdat.
      headers: { "Cache-Control": "no-store" },
    },
  );
}
