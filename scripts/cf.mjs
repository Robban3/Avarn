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
 */
import { spawnSync } from "node:child_process";

const lage = process.argv[2] ?? "build";
if (!["build", "preview", "deploy"].includes(lage)) {
  console.error(`Okänt läge: ${lage}. Välj build, preview eller deploy.`);
  process.exit(1);
}

const steg = lage === "build" ? ["build"] : ["build", lage];

for (const kommando of steg) {
  const svar = spawnSync("npx", ["opennextjs-cloudflare", kommando], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (svar.status !== 0) process.exit(svar.status ?? 1);
}
