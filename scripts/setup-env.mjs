/**
 * Skapar .env vid första uppsättningen.
 *
 * Finns filen redan görs ingenting, så att en befintlig konfiguration aldrig
 * skrivs över. Hemligheterna slumpas i stället för att kopieras från en mall,
 * och skriptet fungerar likadant i cmd.exe, PowerShell och ett Unix-skal.
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

# Utvecklingsdatabasen. Byt till en postgresql://-adress i drift och ändra
# provider i prisma/schema.prisma samt adaptern i src/lib/db.ts.
DATABASE_URL="file:./dev.db"

# Signerar sessionscookien. Byt vid driftsättning – alla blir utloggade när
# den ändras.
AUTH_SECRET="${secret()}"

# Skyddar /api/cron/paminnelser, som skapar varningar om certifikat.
CRON_KEY="${secret()}"
`;

writeFileSync(envPath, content, { encoding: "utf8" });

console.log("Skapade .env med slumpade hemligheter.");
console.log("  DATABASE_URL  file:./dev.db");
console.log("  AUTH_SECRET   (slumpad)");
console.log("  CRON_KEY      (slumpad)");
