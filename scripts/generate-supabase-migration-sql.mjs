/**
 * Genererar en fil per migrering under prisma/supabase/, avsedd att klistras
 * in i Supabase SQL Editor på en databas som redan är uppsatt.
 *
 * prisma/supabase-setup.sql bygger databasen från grunden och går bara att
 * köra på en tom databas. De här filerna är motsatsen: de applicerar en
 * enskild migrering på en befintlig databas.
 *
 * Varje fil lindas in i ett DO-block som hoppar över migreringen om den redan
 * är bokförd, så att den är ofarlig att köra om. Bokföringsraden skrivs med
 * samma kontrollsumma som Prisma räknat fram, så att ett senare
 * prisma migrate deploy blir en tom operation.
 *
 * Körs så här, mot en lokal databas där migreringarna är applicerade:
 *   node scripts/generate-supabase-migration-sql.mjs "postgresql://..."
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// .env läses in, så att kommandot fungerar som dokumentationen påstår.
// Utan det gick "npm run db:sql" inte igenom utan att adressen skrevs på
// kommandoraden – och det är just därför filen hann glida fyra
// migreringar efter schemat innan någon märkte det.
dotenv.config({ path: path.join(process.cwd(), ".env"), quiet: true });

const url = process.argv[2] ?? process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error("Ange anslutningen som argument eller i DIRECT_URL.");
  process.exit(1);
}

const MIGRATIONS_DIR = path.join("prisma", "migrations");
const OUT_DIR = path.join("prisma", "supabase");

/** Kontrollsummorna som Prisma räknat fram, hämtade ur den lokala databasen. */
function checksums() {
  const rows = execFileSync(
    "psql",
    [url, "-tAF", "\t", "-c", "select migration_name, checksum from _prisma_migrations"],
    { encoding: "utf8" },
  );
  return new Map(
    rows
      .split("\n")
      .filter(Boolean)
      .map((line) => line.split("\t"))
      .map(([name, checksum]) => [name, checksum]),
  );
}

const sums = checksums();
mkdirSync(OUT_DIR, { recursive: true });

/** Blocken samlas för att också kunna skrivas som en enda fil. */
const block = [];

const names = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

for (const name of names) {
  const checksum = sums.get(name);
  if (!checksum) {
    console.warn(`Hoppar över ${name}: inte applicerad i den lokala databasen.`);
    continue;
  }

  const sql = readFileSync(
    path.join(MIGRATIONS_DIR, name, "migration.sql"),
    "utf8",
  ).trim();

  /**
   * Supabase publicerar public-schemat genom PostgREST med en publik
   * anon-nyckel. En ny tabell utan radskydd blir därför läsbar utifrån.
   * Helfilen supabase-setup.sql får skyddet med sig eftersom den dumpas
   * ur en databas där det redan är påslaget – migreringsfilerna måste
   * lägga till det själva, annars glider en ny tabell igenom.
   */
  const nyaTabeller = [
    ...sql.matchAll(/CREATE TABLE\s+"([^"]+)"/gi),
  ].map((m) => m[1]);

  const rls = nyaTabeller.length
    ? "\n" +
      nyaTabeller
        .map(
          (t) =>
            `    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.\n` +
            `    ALTER TABLE public."${t}" ENABLE ROW LEVEL SECURITY;`,
        )
        .join("\n") +
      "\n"
    : "";

  // Satserna får dubbel indentering inuti DO-blocket, för läsbarhet.
  const body = sql
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join("\n");

  const doBlock = `DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public._prisma_migrations
    WHERE migration_name = '${name}'
  ) THEN
    RAISE NOTICE 'Migreringen ${name} är redan applicerad – hoppar över.';
  ELSE

${body}
${rls}
    INSERT INTO public._prisma_migrations (
      id, checksum, finished_at, migration_name,
      logs, rolled_back_at, started_at, applied_steps_count
    ) VALUES (
      gen_random_uuid()::text,
      '${checksum}',
      now(),
      '${name}',
      NULL,
      NULL,
      now(),
      1
    );

    RAISE NOTICE 'Migreringen ${name} är applicerad.';
  END IF;
END
$migration$;
`;

  const rubrik = `--
-- Migrering: ${name}
--
-- Klistra in i Supabase: SQL Editor > New query > Run.
-- Avsedd för en databas som REDAN har tabellerna. Är databasen tom, kör
-- prisma/supabase-setup.sql i stället.
--
-- Filen kan köras om utan risk: har migreringen redan applicerats händer
-- ingenting.
--
-- Genererad av scripts/generate-supabase-migration-sql.mjs.
--

`;

  writeFileSync(path.join(OUT_DIR, `${name}.sql`), rubrik + doBlock, "utf8");
  console.log(`Skrev ${OUT_DIR}/${name}.sql`);
  block.push({ name, doBlock });
}

/**
 * Alla migreringar i en enda fil.
 *
 * En databas som ligger efter behöver körningarna i ordning, och att veta
 * vilka som saknas kräver att man först tar reda på var den står. Eftersom
 * varje block hoppar över sig självt när det redan är bokfört behövs inte
 * den kunskapen: filen kan köras på vilken uppsatt databas som helst och
 * gör bara det som återstår.
 *
 * Ligger utanför prisma/supabase/, där en fil per migrering är hela
 * innehållet och vaktas av src/lib/migreringar.test.ts.
 */
const samlad = `--
-- Alla migreringar, i ordning.
--
-- Klistra in i Supabase: SQL Editor > New query > Run.
-- Avsedd för en databas som REDAN har tabellerna men ligger efter. Varje
-- migrering hoppar över sig själv om den redan är körd, så filen kan
-- köras på en databas i vilket läge som helst och gör bara det som
-- återstår. Är databasen tom, kör prisma/supabase-setup.sql i stället.
--
-- Utskriften under Results säger vad som hände, en rad per migrering.
--
-- Genererad av scripts/generate-supabase-migration-sql.mjs.
--

${block.map(({ name, doBlock }) => `-- ${name}\n${doBlock}`).join("\n\n")}
`;

const samladVag = path.join("prisma", "supabase-migreringar.sql");
writeFileSync(samladVag, samlad, "utf8");
console.log(`Skrev ${samladVag} (${block.length} migreringar)`);
