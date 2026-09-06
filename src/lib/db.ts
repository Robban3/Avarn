import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";

/**
 * En delad PrismaClient. I utveckling återanvänds instansen över
 * hot reloads så att inte varje omladdning öppnar nya anslutningar.
 */
const createClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL saknas. Peka den mot din Supabase-databas i .env.",
    );
  }
  varnaOmDirektanslutning(connectionString);
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
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
  prisma?: ReturnType<typeof createClient>;
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
