/**
 * Kontrollerar databasadresserna i .env.
 *
 * "Can't reach database server" ser likadant ut oavsett om det är fel
 * lösenord, ett pausat projekt, en brandvägg eller att adressen bara har
 * IPv6. Det här skriptet skiljer fallen åt: det säger vad .env pekar på,
 * om värdnamnet går att slå upp, och om det går att öppna en anslutning.
 *
 * Lösenordet maskeras alltid, så att utskriften går att klistra in var
 * som helst. Skriptet ändrar ingenting och kräver ingen databas – det
 * ska gå att köra just när ingenting fungerar.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";
import net from "node:net";
import dotenv from "dotenv";

const envPath = path.join(process.cwd(), ".env");
if (!existsSync(envPath)) {
  console.error("Ingen .env i den här mappen. Kör: npm run setup");
  process.exit(1);
}
dotenv.config({ path: envPath, quiet: true });

/** Supabases direktanslutning: db.<projekt>.supabase.co */
const DIREKT = /^db\.[a-z0-9]+\.supabase\.(co|com)$/i;
const POOLARE = /pooler\.supabase\.com$/i;

/** Vad adressen är för sorts anslutning, och vad det innebär. */
function sortera(host, port) {
  if (DIREKT.test(host)) {
    return { sort: "Supabase direktanslutning", direkt: true };
  }
  if (POOLARE.test(host)) {
    const namn =
      port === 6543
        ? "Supabase transaktionspoolare"
        : port === 5432
          ? "Supabase sessionspoolare"
          : `Supabase poolare (ovanlig port ${port})`;
    return { sort: namn, direkt: false };
  }
  return { sort: "egen Postgres", direkt: false };
}

/**
 * Vilka adressfamiljer värdnamnet ger.
 *
 * dns.lookup och inte dns.resolve: det är lookup anslutningen faktiskt
 * gör, och den läser även hosts-filen. Annars hade localhost sett ut som
 * ett okänt värdnamn. En adress som redan är en IP slås inte upp alls.
 */
async function slaUpp(host) {
  const literal = net.isIP(host);
  if (literal) return { a: literal === 4, aaaa: literal === 6, literal: true };

  try {
    const traffar = await dns.lookup(host, { all: true, verbatim: true });
    return {
      a: traffar.some((t) => t.family === 4),
      aaaa: traffar.some((t) => t.family === 6),
      literal: false,
    };
  } catch {
    return { a: false, aaaa: false, literal: false };
  }
}

/** Öppnar en anslutning och stänger den direkt. Säger inget om lösenord. */
function provaAnslutning(host, port, tidsgrans = 6000) {
  return new Promise((klar) => {
    const uttag = new net.Socket();
    const avsluta = (svar) => {
      uttag.destroy();
      klar(svar);
    };
    uttag.setTimeout(tidsgrans);
    uttag.once("connect", () => avsluta({ ok: true }));
    uttag.once("timeout", () => avsluta({ ok: false, fel: "tidsgränsen gick ut" }));
    uttag.once("error", (e) => avsluta({ ok: false, fel: e.code ?? e.message }));
    uttag.connect(port, host);
  });
}

const RUBRIKER = {
  DATABASE_URL: "DATABASE_URL  (appens anslutning)",
  DIRECT_URL: "DIRECT_URL    (migreringar)",
};

let anmarkningar = 0;

for (const nyckel of ["DATABASE_URL", "DIRECT_URL"]) {
  const rader = [`\n${RUBRIKER[nyckel]}`];
  const varde = process.env[nyckel];

  if (!varde) {
    rader.push("  saknas i .env");
    anmarkningar += 1;
    console.log(rader.join("\n"));
    continue;
  }

  let url;
  try {
    url = new URL(varde);
  } catch {
    rader.push("  går inte att tolka som en adress");
    anmarkningar += 1;
    console.log(rader.join("\n"));
    continue;
  }

  const host = url.hostname;
  const port = Number(url.port) || 5432;
  const { sort, direkt } = sortera(host, port);

  // Lösenordet skrivs aldrig ut, i något läge.
  rader.push(`  värd:       ${host}`);
  rader.push(`  port:       ${port}`);
  rader.push(`  användare:  ${decodeURIComponent(url.username) || "(ingen)"}`);
  rader.push(`  lösenord:   ${url.password ? "satt" : "SAKNAS"}`);
  rader.push(`  sort:       ${sort}`);

  if (!url.password) anmarkningar += 1;

  const { a, aaaa, literal } = await slaUpp(host);
  const adresser = [a ? "IPv4" : null, aaaa ? "IPv6" : null].filter(Boolean);
  rader.push(
    `  ${literal ? "adress:    " : "DNS:       "} ${
      adresser.length > 0 ? adresser.join(" + ") : "ingen adress alls"
    }`,
  );

  if (direkt && !a) {
    rader.push("");
    rader.push("  ⚠ Adressen har bara IPv6.");
    rader.push("    Supabases direktanslutning saknar IPv4 sedan 2024, och de");
    rader.push("    flesta hemma- och kontorsnät är IPv4. Då går anslutningen");
    rader.push("    inte ens att försöka, och Prisma svarar");
    rader.push('    "Can\'t reach database server" fast lösenordet är rätt.');
    rader.push("");
    rader.push("    Byt till poolaren. Supabase → Connect:");
    rader.push("      DATABASE_URL  → Transaction pooler (port 6543)");
    rader.push("      DIRECT_URL    → Session pooler     (port 5432)");
    rader.push("    Användarnamnet är postgres.<projekt> där, inte postgres.");
    anmarkningar += 1;
  } else if (adresser.length === 0) {
    rader.push("");
    rader.push("  ⚠ Värdnamnet går inte att slå upp.");
    rader.push("    Felstavat, eller ett Supabase-projekt som pausats.");
    anmarkningar += 1;
  } else {
    const svar = await provaAnslutning(host, port);
    rader.push(
      svar.ok
        ? "  anslutning: porten svarar"
        : `  anslutning: gick inte fram (${svar.fel})`,
    );
    if (!svar.ok) {
      rader.push("    Brandvägg som stänger porten, eller en pausad databas.");
      anmarkningar += 1;
    }
  }

  console.log(rader.join("\n"));
}

console.log(
  anmarkningar === 0
    ? "\nBåda adresserna ser ut att gå fram."
    : `\n${anmarkningar} sak${anmarkningar === 1 ? "" : "er"} att titta på ovan.`,
);
