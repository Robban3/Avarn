/**
 * Skriver databasadresserna i .env utifrån strängen Supabase visar.
 *
 * Att sätta ihop adresserna för hand är fyra fel som alla ger samma
 * otydliga "Can't reach database server": fel värdnamn, fel port, kvar
 * lämnad platshållare, och lösenordstecken som måste kodas om. Här
 * klistras strängen in som den är och lösenordet skrivs en gång.
 *
 * Skriptet räknar själv ut sessionspoolarens adress: den har samma värd
 * och användare som transaktionspoolaren, bara port 5432 i stället för
 * 6543.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline";

const envPath = path.join(process.cwd(), ".env");
if (!existsSync(envPath)) {
  console.error("Ingen .env i den här mappen. Kör: npm run setup");
  process.exit(1);
}

/**
 * Inmatningen, rad för rad.
 *
 * Raderna samlas i en kö i stället för att hämtas med rl.question().
 * question() måste vara anropad *innan* raden kommer, och det håller inte
 * när inmatningen kommer i ett svep – från en rörledning, eller när någon
 * klistrar in båda svaren på en gång. Då tappas den andra raden och
 * skriptet står och väntar för alltid. Med en kö spelar ordningen ingen
 * roll.
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Utskriften till skärmen går att tysta medan lösenordet matas in, så att
// det inte blir stående i terminalen efteråt.
let tyst = false;
const skrivUt = rl._writeToOutput.bind(rl);
rl._writeToOutput = (s) => skrivUt(tyst ? "" : s);

const inkomna = [];
const vantande = [];
rl.on("line", (rad) => {
  const nasta = vantande.shift();
  if (nasta) nasta(rad);
  else inkomna.push(rad);
});
// Stängs strömmen utan att alla frågor besvarats får de tomma svar, som
// fångas av kontrollerna längre ner.
rl.on("close", () => {
  while (vantande.length > 0) vantande.shift()("");
});

const nastaRad = () =>
  new Promise((klar) => {
    const rad = inkomna.shift();
    if (rad !== undefined) klar(rad);
    else vantande.push(klar);
  });

const fraga = async (text) => {
  process.stdout.write(text);
  return (await nastaRad()).trim();
};

const fragaHemligt = async (text) => {
  process.stdout.write(text);
  tyst = true;
  const svar = await nastaRad();
  tyst = false;
  process.stdout.write("\n");
  return svar;
};

console.log(
  "\nSupabase → Connect → fliken Transaction pooler.\nKopiera hela strängen och klistra in den här.\n",
);

const rastreng = await fraga("Anslutningssträng: ");
if (!rastreng) {
  console.error("Ingenting inklistrat. Avbryter.");
  rl.close();
  process.exit(1);
}

let url;
try {
  url = new URL(rastreng);
} catch {
  console.error("\nDet där gick inte att tolka som en adress.");
  console.error("Den ska börja med postgresql:// och komma från Supabase.");
  rl.close();
  process.exit(1);
}

const anvandare = decodeURIComponent(url.username);
const vard = url.hostname;

if (!/pooler\.supabase\.com$/i.test(vard)) {
  console.error(`\nVärdnamnet är ${vard}.`);
  console.error("Det ska sluta på pooler.supabase.com.");
  console.error(
    'Tog du "Direct connection"? Den har bara IPv6 och fungerar inte här.',
  );
  console.error("Gå tillbaka till Connect och välj Transaction pooler.");
  rl.close();
  process.exit(1);
}

const losenord = await fragaHemligt("Databaslösenord: ");
if (!losenord || losenord.includes("[YOUR-PASSWORD]")) {
  console.error("Inget lösenord angivet. Avbryter.");
  rl.close();
  process.exit(1);
}

// Tecken som @ : / ? # och % betyder något i en adress och måste kodas om.
// Ett lösenord med ett @ i skulle annars klippa adressen mitt itu.
const kodat = encodeURIComponent(losenord);
const bas = `postgresql://${encodeURIComponent(anvandare)}:${kodat}@${vard}`;

const rader = readFileSync(envPath, "utf8").split(/\r?\n/);
const kvar = rader.filter((r) => !/^\s*(DATABASE_URL|DIRECT_URL)\s*=/.test(r));
while (kvar.length > 0 && kvar[kvar.length - 1] === "") kvar.pop();

const nytt = [
  ...kvar,
  "",
  "# Skrivna av npm run env:supabase.",
  "# Båda går genom poolaren: transaktion (6543) för appen, session",
  "# (5432) för migreringar. Direktanslutningen har bara IPv6.",
  `DATABASE_URL="${bas}:6543/postgres"`,
  `DIRECT_URL="${bas}:5432/postgres"`,
  "",
].join("\n");

copyFileSync(envPath, `${envPath}.bak`);
writeFileSync(envPath, nytt, "utf8");

rl.close();

console.log("\nSkrev .env (gamla filen ligger kvar som .env.bak):\n");
console.log(`  DATABASE_URL  ${anvandare}:****@${vard}:6543`);
console.log(`  DIRECT_URL    ${anvandare}:****@${vard}:5432`);

execFileSync(process.execPath, [path.join("scripts", "check-env.mjs")], {
  stdio: "inherit",
});

console.log("\nStarta om dev-servern: Ctrl+C och sedan  npm run dev");
