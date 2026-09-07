/**
 * Lägger in .env-värdena som hemligheter på Cloudflare-workern.
 *
 * Finns för att steget däremellan är det som gått fel gång på gång: en
 * sträng som kopieras ur .env tar med sig citattecknen filformatet kräver,
 * en inklistring i terminalen kapas på mitten, ett blanksteg följer med.
 * Alla tre ger samma otydliga fel i drift, och ingen av dem syns när man
 * tittar på det maskerade värdet.
 *
 * Här passerar värdet aldrig urklipp. Skriptet läser .env och matar
 * wrangler direkt, och skriver ut längden på det som gick in så att en
 * kapad sträng syns på en gång.
 *
 * Innan något laddas upp prövas databasadressen mot databasen. Nekas
 * lösenordet avbryts allt – det hade nekats i Workern också. Kommer
 * anslutningen inte ens fram fortsätter skriptet ändå: många kontorsnät
 * stänger Postgres-portarna, och Workern sitter på ett annat nät.
 *
 *   npm run cf:secrets
 */
import "dotenv/config";
import { spawn } from "node:child_process";
import pg from "pg";

/** De som appen läser i drift. De två sista bara om de är satta. */
const HEMLIGHETER = [
  { namn: "DATABASE_URL", kravs: true },
  { namn: "AUTH_SECRET", kravs: true },
  { namn: "CRON_KEY", kravs: true },
  { namn: "SUPABASE_URL", kravs: false },
  { namn: "SUPABASE_SERVICE_ROLE_KEY", kravs: false },
  { namn: "VAPID_PUBLIC_KEY", kravs: false },
  { namn: "VAPID_PRIVATE_KEY", kravs: false },
  { namn: "VAPID_SUBJECT", kravs: false },
];

/** Visar början och slutet, aldrig mitten. Nog för att känna igen, för lite för att röja. */
function skymt(varde) {
  if (varde.length <= 16) return `${varde.length} tecken`;
  return `${varde.length} tecken  ${varde.slice(0, 8)}…${varde.slice(-6)}`;
}

/**
 * Provar adressen mot databasen.
 *
 * Samma bibliotek som appen använder, så svaret gäller. Felkoderna är
 * postgres egna: 28P01 är fel lösenord, 28000 fel användare.
 */
async function provaAdressen(adress) {
  const klient = new pg.Client({ connectionString: adress });
  try {
    await klient.connect();
    const { rows } = await klient.query("select count(*)::int as antal from \"User\"");
    await klient.end();
    return { text: `svarar, ${rows[0].antal} användare` };
  } catch (fel) {
    await klient.end().catch(() => {});
    if (fel.code === "28P01") return { nekat: true, text: "lösenordet nekas" };
    if (fel.code === "28000") return { nekat: true, text: "användarnamnet nekas" };
    if (fel.code === "42P01") {
      return { text: "svarar, men tabellerna saknas – kör npm run db:deploy" };
    }
    // Tidsgräns, nekad port, okänt värdnamn: nätet, inte uppgifterna.
    return {
      okant: true,
      text: `nådde inte fram härifrån (${fel.code ?? "okänt fel"}) – säger inget om lösenordet`,
    };
  }
}

/** Kör wrangler och matar värdet på stdin, så att det aldrig passerar urklipp. */
function laggUpp(namn, varde) {
  return new Promise((klar) => {
    const barn = spawn("npx", ["wrangler", "secret", "put", namn], {
      stdio: ["pipe", "inherit", "inherit"],
      shell: process.platform === "win32",
    });
    barn.stdin.write(varde);
    barn.stdin.end();
    barn.on("close", (kod) => klar(kod ?? 1));
  });
}

const saknas = HEMLIGHETER.filter((h) => h.kravs && !process.env[h.namn]);
if (saknas.length > 0) {
  console.error(
    `Saknas i .env: ${saknas.map((h) => h.namn).join(", ")}.\n` +
      "Kör npm run setup och npm run env:supabase först.",
  );
  process.exit(1);
}

console.log("\nDet här går upp:\n");
const attLagga = HEMLIGHETER.filter((h) => process.env[h.namn]);
for (const { namn } of attLagga) {
  console.log(`  ${namn.padEnd(26)} ${skymt(process.env[namn])}`);
}

console.log("\nProvar databasadressen …");
const utfall = await provaAdressen(process.env.DATABASE_URL);
const tecken = utfall.nekat ? "✗" : utfall.okant ? "–" : "✓";
console.log(`  ${tecken} ${utfall.text}\n`);

if (utfall.nekat) {
  console.error(
    "Uppgifterna i .env avvisas av databasen, och de avvisas i Workern\n" +
      "också. Rätta dem först: npm run env:supabase låter dig skriva\n" +
      "lösenordet på nytt. Ingenting har laddats upp.",
  );
  process.exit(1);
}

for (const { namn } of attLagga) {
  const kod = await laggUpp(namn, process.env[namn]);
  if (kod !== 0) {
    console.error(`\n${namn} gick inte att lägga upp. Är du inloggad? npx wrangler login`);
    process.exit(kod);
  }
}

console.log(
  "\nKlart. Hemligheterna slår igenom direkt – ingen ny driftsättning behövs.\n" +
    "Kontrollera med  /api/halsa  på Workerns adress.\n",
);
