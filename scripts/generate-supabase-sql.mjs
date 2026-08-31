/**
 * Genererar prisma/supabase-setup.sql – en enda fil som skapar hela
 * databasen med exempeldata och som kan klistras in i Supabase SQL Editor.
 *
 * Filen dumpas ur en färdigmigrerad och seedad databas i stället för att
 * skrivas för hand, så att den aldrig kan hamna i otakt med schemat.
 *
 * Körs så här, med en lokal Postgres:
 *   DIRECT_URL=postgresql://... npx prisma migrate deploy
 *   DIRECT_URL=postgresql://... npm run seed
 *   node scripts/generate-supabase-sql.mjs "postgresql://..."
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const url = process.argv[2] ?? process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error("Ange anslutningen som argument eller i DIRECT_URL.");
  process.exit(1);
}

const dump = execFileSync(
  "pg_dump",
  [url, "--inserts", "--no-owner", "--no-privileges", "--schema=public", "--encoding=UTF8"],
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);

const body = dump
  .split("\n")
  .filter(
    (line) =>
      // psql-metakommandon fungerar inte i Supabase SQL Editor
      !line.startsWith("\\restrict") &&
      !line.startsWith("\\unrestrict") &&
      // schemat public finns redan i Supabase
      line.trim() !== "CREATE SCHEMA public;" &&
      !line.startsWith("COMMENT ON SCHEMA public") &&
      // versionsrader gör bara diffen brusig
      !line.startsWith("-- Dumped from") &&
      !line.startsWith("-- Dumped by"),
  )
  .join("\n")
  .replace(/--\n-- Name: (public; Type: SCHEMA|SCHEMA public; Type: COMMENT).*?\n--\n\n\n/gs, "")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const tables = [...body.matchAll(/^CREATE TABLE public\.("?\w+"?) \(/gm)]
  .map((m) => m[1])
  .sort();

const header = `--
-- Avarn Hundtjänst – komplett uppsättning av databasen
--
-- Klistra in hela den här filen i Supabase: SQL Editor > New query > Run.
-- Filen skapar samtliga tabeller, lägger in exempeldata och slår på
-- radsäkerhet. Den är avsedd för en tom databas och körs en gång.
--
-- Genererad av scripts/generate-supabase-sql.mjs – ändra inte här, utan i
-- prisma/schema.prisma och prisma/seed.ts, och generera om.
--
-- Inloggning efteråt: erik.andersson@avarn.se / avarn123
-- (samma lösenord för samtliga konton i exempeldatan)
--

`;

const rls = `

--
-- Radsäkerhet
--
-- Supabase publicerar schemat public genom sitt REST-API, och anon-nyckeln
-- är gjord för att ligga öppet i en webbklient. Utan radsäkerhet skulle
-- vem som helst med den nyckeln kunna läsa operativa rapporter och fynd.
--
-- Radsäkerhet slås därför på utan några policyer: anon och authenticated
-- nekas allt. Appen påverkas inte, eftersom den ansluter som rollen
-- postgres som äger tabellerna. Behörigheten mellan roller styrs i appen,
-- i src/lib/authz.ts.
--

${tables.map((t) => `ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY;`).join("\n")}
`;

writeFileSync("prisma/supabase-setup.sql", header + body + rls, "utf8");
console.log(`Skrev prisma/supabase-setup.sql (${tables.length} tabeller).`);
