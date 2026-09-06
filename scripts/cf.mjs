/**
 * Bygger och driftsätter Cloudflare-varianten.
 *
 * Finns för att sätta CF_BUILD=1, som next.config.ts läser för att peka
 * Prisma-klienten mot sin workerd-ingång. Ett skript i stället för
 * "CF_BUILD=1 opennextjs-cloudflare build" direkt i package.json, eftersom
 * den formen inte fungerar i cmd.exe på Windows – och det är där appen
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

const miljo = { ...process.env, CF_BUILD: "1" };
const steg = lage === "build" ? ["build"] : ["build", lage];

for (const kommando of steg) {
  const svar = spawnSync("npx", ["opennextjs-cloudflare", kommando], {
    stdio: "inherit",
    env: miljo,
    shell: process.platform === "win32",
  });
  if (svar.status !== 0) process.exit(svar.status ?? 1);
}
