/**
 * Skapar .env vid första uppsättningen.
 *
 * Finns filen redan görs ingenting, så att en befintlig konfiguration aldrig
 * skrivs över. Hemligheterna slumpas i stället för att kopieras från en mall,
 * och skriptet fungerar likadant i cmd.exe, PowerShell och ett Unix-skal.
 *
 * Databasadressen kan inte gissas – den måste hämtas från Supabase – så
 * skriptet lämnar den tom och säger till.
 */
import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env");

if (existsSync(envPath)) {
  console.log(".env finns redan – lämnar den orörd.");
  process.exit(0);
}

const secret = () => randomBytes(32).toString("hex");

const content = `# Skapad av "npm run setup". Checka aldrig in den här filen.

# Anslutningen till databasen. Hämtas i Supabase under
# Project Settings > Database > Connection string.
#
#   DATABASE_URL  används av appen. Ta "Transaction pooler" (port 6543).
#   DIRECT_URL    används av migreringar, som inte fungerar via poolaren.
#                 Ta "Direct connection" (port 5432).
#
# Kör en egen Postgres i stället? Sätt båda till samma adress.
DATABASE_URL=""
DIRECT_URL=""

# Signerar sessionscookien. Alla blir utloggade när den ändras.
AUTH_SECRET="${secret()}"

# Skyddar /api/cron/paminnelser, som skapar varningar om certifikat.
CRON_KEY="${secret()}"
`;

writeFileSync(envPath, content, { encoding: "utf8" });

console.log("Skapade .env med slumpade hemligheter.\n");
console.log("Nästa steg: öppna .env och fyll i DATABASE_URL och DIRECT_URL");
console.log("från Supabase (Project Settings > Database > Connection string).");
console.log("Kör sedan:  npm run db:setup");
