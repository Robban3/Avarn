/**
 * Bygger och driftsätter Cloudflare-varianten.
 *
 * OpenNexts kommandon för att köra och driftsätta bygger inte själva, så
 * varje läge är två steg. Ett skript i stället för "&&" i package.json,
 * eftersom kedjan ska fungera likadant i cmd.exe – och det är där appen
 * utvecklas.
 *
 *   node scripts/cf.mjs build     bygger
 *   node scripts/cf.mjs preview   bygger och kör lokalt i workerd
 *   node scripts/cf.mjs deploy    bygger och driftsätter
 *
 * Skriptet läser också felutskriften, för att kunna översätta ett känt
 * Windows-fel till vad man faktiskt ska göra åt det. Se sagOmSymlank().
 */
import { spawn } from "node:child_process";

const lage = process.argv[2] ?? "build";
if (!["build", "preview", "deploy"].includes(lage)) {
  console.error(`Okänt läge: ${lage}. Välj build, preview eller deploy.`);
  process.exit(1);
}

/**
 * Kör ett OpenNext-kommando och lämnar tillbaka exitkod och felutskrift.
 *
 * Utskriften skrivs vidare löpande, inte i efterhand: ett bygge tar
 * minuter, och ett tyst bygge är sämre än ett obegripligt fel. Den samlas
 * bara upp vid sidan av, för att kunna läsas efteråt.
 */
function kor(kommando) {
  return new Promise((klar) => {
    const barn = spawn("npx", ["opennextjs-cloudflare", kommando], {
      stdio: ["inherit", "inherit", "pipe"],
      shell: process.platform === "win32",
    });

    let felutskrift = "";
    barn.stderr.on("data", (bit) => {
      felutskrift += bit;
      process.stderr.write(bit);
    });

    barn.on("close", (kod) => klar({ kod: kod ?? 1, felutskrift }));
  });
}

/**
 * Windows nekar bygget rätten att skapa symlänkar.
 *
 * OpenNext länkar in varje paket som hålls utanför bygget när den packar
 * serverfunktionen. `avarn-prisma` är ett sådant – det är priset för att
 * Prismas wasm-kompilator ska gå att ladda i en Worker, se next.config.ts.
 * På Linux, som Cloudflares byggmiljö kör, märks det inte. På Windows
 * kräver symlänkar en rättighet som utvecklarläget ger.
 *
 * Felet kommer annars som en stackspårning ur node:fs, sju ramar ner i ett
 * paket man aldrig hört talas om, och ingenting i den pekar på kryssrutan
 * som löser det.
 */
function sagOmSymlank(felutskrift) {
  if (process.platform !== "win32") return false;
  if (!/EPERM/.test(felutskrift) || !/symlink/i.test(felutskrift)) return false;

  console.error(
    [
      "",
      "Bygget fick inte skapa en symlänk, och Windows kräver rättighet för det.",
      "",
      "  Slå på utvecklarläge:",
      "  Inställningar → System → För utvecklare → Utvecklarläge",
      "",
      "  Öppna sedan en ny terminal och kör om kommandot.",
      "",
      "Alternativ: kör terminalen som administratör, eller bygg i WSL.",
      "Cloudflares egen byggmiljö är Linux och berörs inte av det här.",
      "",
    ].join("\n"),
  );
  return true;
}

for (const kommando of lage === "build" ? ["build"] : ["build", lage]) {
  const { kod, felutskrift } = await kor(kommando);
  if (kod !== 0) {
    sagOmSymlank(felutskrift);
    process.exit(kod);
  }
}
