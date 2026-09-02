/**
 * Gör om Sveriges länsgränser till SVG-banor, en per region.
 *
 * Läser data/sverige-lan.geojson (se data/KALLA.md), projicerar med
 * Mercator, slår ihop länen till appens regioner enligt REGION_LAN och
 * förenklar banorna så att de får plats i en modul. Resultatet skrivs till
 * src/lib/sverige-karta.ts, som inte ska redigeras för hand.
 *
 * Kör: npm run map
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Bredden på det ritade rutnätet; höjden följer av Sveriges proportion. */
const BREDD = 1000;

/**
 * Hur hårt banorna förenklas, i enheter av rutnätet ovan. 2.0 tar bort
 * varje krök som ändå inte syns vid 200 px, och halverar filstorleken.
 */
const EPSILON = 2.0;

/** Kortaste ring som får följa med – småöar under den blir bara brus. */
const MINSTA_RING = 4;

const geo = JSON.parse(
  readFileSync(join(rot, "data/sverige-lan.geojson"), "utf8"),
);

// REGION_LAN läses ur domain.ts som text, så att skriptet slipper ett
// byggsteg för TypeScript men ändå har en enda sanning för indelningen.
const domain = readFileSync(join(rot, "src/lib/domain.ts"), "utf8");
const block = domain.slice(
  domain.indexOf("export const REGION_LAN"),
  domain.indexOf("};", domain.indexOf("export const REGION_LAN")) + 2,
);
const REGION_LAN = {};
for (const [, kod, lista] of block.matchAll(
  /(\w+):\s*\[([^\]]*)\]/g,
)) {
  REGION_LAN[kod] = [...lista.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

/** Web Mercator: longituden rakt av, latituden logaritmiskt. */
function mercator(lon, lat) {
  return [lon, (Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * 180) / Math.PI];
}

/** Alla ytterringar i en geometri, oavsett Polygon eller MultiPolygon. */
function ringar(geometri) {
  return geometri.type === "Polygon"
    ? geometri.coordinates
    : geometri.coordinates.flat();
}

// Hela landets utsträckning, så att alla regioner delar samma rutnät.
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (const f of geo.features) {
  for (const ring of ringar(f.geometry)) {
    for (const [lon, lat] of ring) {
      const [x, y] = mercator(lon, lat);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const HOJD = (BREDD * (maxY - minY)) / (maxX - minX);

function projicera([lon, lat]) {
  const [x, y] = mercator(lon, lat);
  return [
    ((x - minX) / (maxX - minX)) * BREDD,
    ((maxY - y) / (maxY - minY)) * HOJD,
  ];
}

/**
 * Douglas–Peucker: behåll de punkter som faktiskt ändrar formen.
 *
 * Iterativ med en egen stack. Rekursionen gick ett steg per behållen punkt
 * och en kustlinje med tiotusentals punkter kan slå i anropsstacken.
 */
function forenkla(punkter, eps) {
  if (punkter.length < 3) return punkter;

  const avstand = (p, a, b) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    const t = Math.max(
      0,
      Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)),
    );
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
  };

  // Markera vilka punkter som ska behållas i stället för att bygga upp
  // delresultat: samma algoritm, men utan djup i anropsstacken.
  const behall = new Array(punkter.length).fill(false);
  behall[0] = true;
  behall[punkter.length - 1] = true;

  const stack = [[0, punkter.length - 1]];
  while (stack.length > 0) {
    const [start, slut] = stack.pop();
    let storst = 0;
    let index = -1;
    for (let i = start + 1; i < slut; i += 1) {
      const d = avstand(punkter[i], punkter[start], punkter[slut]);
      if (d > storst) {
        storst = d;
        index = i;
      }
    }
    if (index !== -1 && storst > eps) {
      behall[index] = true;
      stack.push([start, index], [index, slut]);
    }
  }

  return punkter.filter((_, i) => behall[i]);
}

const lanTillRegion = new Map();
for (const [kod, lan] of Object.entries(REGION_LAN)) {
  for (const namn of lan) lanTillRegion.set(namn, kod);
}

// Kontrollen går åt båda hållen. Bara den ena vägen räckte inte: ett
// stavfel i REGION_LAN gjorde att inget län träffade regionen, som då
// tyst blev tom – och SwedenMap ritar ingenting utan att säga till.
const okanda = geo.features
  .map((f) => f.properties.name)
  .filter((n) => !lanTillRegion.has(n));
if (okanda.length > 0) {
  throw new Error(
    `Län saknar region i REGION_LAN: ${okanda.join(", ")}. ` +
      "Lägg till dem i src/lib/domain.ts och kör om.",
  );
}

const lanIGeodata = new Set(geo.features.map((f) => f.properties.name));
const stavfel = [...lanTillRegion.keys()].filter((n) => !lanIGeodata.has(n));
if (stavfel.length > 0) {
  throw new Error(
    `REGION_LAN nämner län som inte finns i geodatan: ${stavfel.join(", ")}. ` +
      "Rätta stavningen i src/lib/domain.ts och kör om.",
  );
}

const tommaRegioner = Object.keys(REGION_LAN).filter(
  (kod) => (REGION_LAN[kod] ?? []).length === 0,
);
if (tommaRegioner.length > 0) {
  throw new Error(
    `Regioner utan län i REGION_LAN: ${tommaRegioner.join(", ")}.`,
  );
}

const banor = {};
for (const kod of Object.keys(REGION_LAN)) banor[kod] = [];

for (const f of geo.features) {
  const kod = lanTillRegion.get(f.properties.name);
  for (const ring of ringar(f.geometry)) {
    const enkel = forenkla(ring.map(projicera), EPSILON);
    if (enkel.length < MINSTA_RING) continue;
    banor[kod].push(
      `M${enkel.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}Z`,
    );
  }
}

const rader = Object.entries(banor)
  .map(([kod, delar]) => `  ${kod}: "${delar.join("")}",`)
  .join("\n");

const fil = `// Genererad av scripts/generate-sweden-map.mjs – redigera inte för hand.
// Källa: data/sverige-lan.geojson, se data/KALLA.md.
// Länen slås ihop till regioner enligt REGION_LAN i src/lib/domain.ts.

/** Rutnätet banorna är ritade i. */
export const KARTA_VIEWBOX = "0 0 ${BREDD} ${HOJD.toFixed(0)}";

/** En SVG-bana per region, i Mercator-projektion. */
export const REGION_BANOR: Record<string, string> = {
${rader}
};
`;

const utfil = join(rot, "src/lib/sverige-karta.ts");
writeFileSync(utfil, fil);

const storlek = Buffer.byteLength(fil) / 1024;
console.log(`Skrev src/lib/sverige-karta.ts (${storlek.toFixed(1)} kB)`);
console.log(`viewBox: 0 0 ${BREDD} ${HOJD.toFixed(0)}`);
for (const [kod, delar] of Object.entries(banor)) {
  console.log(`  ${kod}: ${delar.length} ringar`);
}
