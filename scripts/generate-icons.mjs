/**
 * Rastrerar appikonerna till PNG.
 *
 * SVG räcker för Android och för webbläsarfliken, men iOS läser bara PNG
 * när appen läggs på hemskärmen – utan `apple-touch-icon.png` klipper
 * Safari ut en miniatyr av sidan i stället, och det blir en suddig ruta
 * med sidhuvudet i. Manifestet får också PNG i två storlekar, eftersom
 * inte alla Android-versioner ritar SVG-ikoner.
 *
 * Källan är SVG-filerna; PNG:erna är genererade och ska aldrig rättas för
 * hand. Ändras profilen körs `npm run icons` om.
 *
 * Storlekarna:
 *   apple-touch-icon  180  – iOS hemskärm (och den enda Safari letar efter)
 *   ikon-192          192  – manifestets mindre ikon
 *   ikon-512          512  – manifestets stora, för installationsdialogen
 *   ikon-maskable-512 512  – Androids adaptiva ikon, som beskärs
 *
 * `density: 600` renderar SVG:en i hög upplösning innan den skalas ner, så
 * att de rundade linjerna inte blir taggiga i den minsta storleken.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.join(process.cwd(), "public");

/** Profilens bakgrund, samma värde som --color-bg i globals.css. */
const BAKGRUND = "#0b0e0f";

const IKONER = [
  // iOS rundar hörnen själv och gör det på hela bilden. En ikon som redan
  // är rundad blir därför rundad två gånger, med en mörk sarg utanför
  // rundningen. Därför fylls de genomskinliga hörnen med bakgrundsfärgen:
  // filen blir fyrkantig, och iOS klipper den som sina egna ikoner.
  { fran: "ikon.svg", till: "apple-touch-icon.png", storlek: 180, fyrkantig: true },
  { fran: "ikon.svg", till: "ikon-192.png", storlek: 192 },
  { fran: "ikon.svg", till: "ikon-512.png", storlek: 512 },
  { fran: "ikon-maskable.svg", till: "ikon-maskable-512.png", storlek: 512 },
];

for (const { fran, till, storlek, fyrkantig } of IKONER) {
  const kalla = readFileSync(path.join(publicDir, fran));
  let bild = sharp(kalla, { density: 600 }).resize(storlek, storlek);
  if (fyrkantig) bild = bild.flatten({ background: BAKGRUND });

  const png = await bild.png({ compressionLevel: 9 }).toBuffer();

  writeFileSync(path.join(publicDir, till), png);
  console.log(`Skrev public/${till} (${storlek}×${storlek}, ${png.length} B)`);
}
