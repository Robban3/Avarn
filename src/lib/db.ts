import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "avarn-prisma";

/**
 * Anslutningen till databasen.
 *
 * Klienten skapas första gången någon frågar efter den, inte när modulen
 * laddas. I Cloudflare Workers laddas moduler utanför varje förfrågan, och
 * en anslutning som öppnas där hör inte hemma i någon av dem.
 */

/** Sant i Cloudflare Workers. Körtiden anger sig själv i navigator. */
const iWorkers =
  typeof navigator !== "undefined" &&
  navigator.userAgent === "Cloudflare-Workers";

const skapaKlient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL saknas. Peka den mot din Supabase-databas i .env.",
    );
  }
  varnaOmDirektanslutning(connectionString);

  return new PrismaClient({
    adapter: new PrismaPg(
      iWorkers
        ? {
            connectionString,
            // En enda anslutning i taget.
            //
            // Prisma delar upp en fråga med nästlade include i flera
            // SQL-satser. Med en pool som får växa öppnar den fler sockets,
            // och i Workers hänger förfrågan då tills körtiden avbryter den
            // med "your Worker's code had hung". Uppdragslistan och
            // hundlistan föll på just det medan startsidan gick igenom.
            //
            // Serialiserat blir det en socket och inga fler att vänta på.
            // Poolaren framför databasen sköter samtidigheten i stället.
            max: 1,

          }
        : { connectionString },
    ),
  });
};

/**
 * Säger till när DATABASE_URL pekar på Supabases direktanslutning.
 *
 * Den saknar IPv4 sedan 2024, och på ett IPv4-nät går anslutningen inte
 * ens att försöka: Prisma svarar "Can't reach database server" – samma
 * text som vid fel lösenord, pausat projekt och stängd brandvägg. Utan
 * den här raden finns ingenting som pekar ut vilket av fallen det är.
 *
 * Varnar och kastar inte: direktanslutningen fungerar där IPv6 finns,
 * Vercel till exempel, och ett kast hade brutit en driftsättning som
 * gick bra. Bara i utveckling, så att den inte brusar i driftloggen.
 */
function varnaOmDirektanslutning(connectionString: string) {
  if (process.env.NODE_ENV === "production") return;
  try {
    const { hostname } = new URL(connectionString);
    if (!/^db\.[a-z0-9]+\.supabase\.(co|com)$/i.test(hostname)) return;
    console.warn(
      `DATABASE_URL pekar på ${hostname} – Supabases direktanslutning, som bara har IPv6.\n` +
        "Går anslutningen inte fram: ta transaktionspoolaren under Connect i Supabase.\n" +
        "Kör  npm run env:check  för att se vad .env pekar på.",
    );
  } catch {
    // Går adressen inte att tolka faller PrismaPg på det med ett eget,
    // tydligare fel. Inget att tillägga här.
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function hamtaKlient(): PrismaClient {
  // I Workers sparas klienten aldrig.
  //
  // Modulen laddas en gång per isolat och lever över många förfrågningar,
  // men en socket hör till den förfrågan som öppnade den. En sparad klient
  // bär med sig sin anslutning in i nästa förfrågan, där den aldrig svarar
  // – första inloggningen gick igenom, de följande hängde tills körtiden
  // avbröt dem.
  //
  // Priset är en anslutning per fråga i stället för en delad. Poolaren
  // framför databasen är byggd för just det, och Hyperdrive är vägen om
  // det behöver bli billigare.
  if (iWorkers) return skapaKlient();

  // I utveckling återanvänds instansen över hot reloads, så att inte varje
  // omladdning öppnar nya anslutningar.
  const befintlig = globalForPrisma.prisma;
  if (befintlig) return befintlig;

  const ny = skapaKlient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = ny;
  return ny;
}

/**
 * Exporteras som ett värde och inte som en funktion, så att de trettiotal
 * anropsställen som skriver `db.user.findMany(...)` ser likadana ut. Bakom
 * står en proxy som skapar klienten vid första åtkomsten.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_mal, egenskap) {
    const klient = hamtaKlient() as unknown as Record<
      string | symbol,
      unknown
    >;
    const varde = klient[egenskap];
    return typeof varde === "function" ? varde.bind(klient) : varde;
  },
});
