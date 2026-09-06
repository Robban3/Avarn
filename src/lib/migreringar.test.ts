import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Vaktar att de genererade SQL-filerna för Supabase inte glider ifrån
 * migreringarna.
 *
 * De genereras ur en färdigmigrerad databas och ska köras om efter varje
 * schemaändring. Glöms det bort säger ingenting till: filerna ser hela ut,
 * de går att köra, och felet visar sig först som en databas där halva
 * appen kraschar. Det hände – `supabase-setup.sql` låg fyra migreringar
 * efter, utan tabellen MissionEvent och utan kolumnerna för
 * uppdragsdetaljer, pågående uppdrag, uppdragsområde och dokument.
 *
 * Provet läser bara filer och behöver ingen databas.
 */

const rot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Katalognamnen i prisma/migrations – sanningen om vilka som finns. */
function migreringar() {
  return readdirSync(path.join(rot, "prisma", "migrations"), {
    withFileTypes: true,
  })
    .filter((post) => post.isDirectory())
    .map((post) => post.name)
    .sort();
}

/** De migreringar helfilen bokför i _prisma_migrations. */
function bokfordaIHelfilen() {
  const sql = readFileSync(path.join(rot, "prisma", "supabase-setup.sql"), "utf8");
  const rader = sql
    .split("\n")
    .filter((rad) => rad.startsWith("INSERT INTO public._prisma_migrations"));
  return rader
    .map((rad) => /'(\d{14}_[a-z0-9_]+)'/.exec(rad)?.[1])
    .filter((namn): namn is string => namn !== undefined)
    .sort();
}

/** En fil per migrering i prisma/supabase. */
function filerPerMigrering() {
  return readdirSync(path.join(rot, "prisma", "supabase"))
    .filter((namn) => namn.endsWith(".sql"))
    .map((namn) => namn.replace(/\.sql$/, ""))
    .sort();
}

describe("de genererade SQL-filerna för Supabase", () => {
  it("bokför exakt de migreringar som finns", () => {
    expect(
      bokfordaIHelfilen(),
      "prisma/supabase-setup.sql är i otakt med prisma/migrations. Kör: npm run db:sql",
    ).toEqual(migreringar());
  });

  it("har en fil per migrering", () => {
    expect(
      filerPerMigrering(),
      "prisma/supabase/ är i otakt med prisma/migrations. Kör: npm run db:sql:migrations",
    ).toEqual(migreringar());
  });

  it("innehåller hela schemat, inte bara det som fanns när filen skrevs", () => {
    const sql = readFileSync(path.join(rot, "prisma", "supabase-setup.sql"), "utf8");
    const modeller = readFileSync(path.join(rot, "prisma", "schema.prisma"), "utf8")
      .split("\n")
      .map((rad) => /^model (\w+) \{/.exec(rad)?.[1])
      .filter((namn): namn is string => namn !== undefined);

    // Varje modell i schemat ska ha en tabell i filen. Fångar en glidning
    // även om någon råkat bokföra migreringarna för hand.
    const saknade = modeller.filter(
      (namn) => !sql.includes(`CREATE TABLE public."${namn}"`),
    );
    expect(
      saknade,
      "tabeller saknas i prisma/supabase-setup.sql. Kör: npm run db:sql",
    ).toEqual([]);
  });
});
