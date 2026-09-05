/**
 * Uppdragets dokument, hämtade till telefonen i förväg.
 *
 * Servicearbetaren cachar `/api/media/*` när en fil väl hämtats, men den
 * hämtar ingenting av sig själv. Utan det här modulen betydde
 * "Tillgänglig offline" bara att föraren råkat öppna just den filen medan
 * hen hade täckning – och underlaget från uppdragsgivaren är det man
 * behöver i en bagagehall utan täckning, inte i bilen på väg dit.
 *
 * Filerna läggs i samma cache som servicearbetaren använder, så att de
 * lämnas ut därifrån när nätet är borta och töms tillsammans med resten
 * vid sessionsgränsen.
 */

/** Måste vara samma namn som CACHE i public/sw.js. */
const CACHE = "avarn-v1";
const HANDELSE = "avarn:dokumentcache";

/** Adresser som ligger i cachen. */
const cachade = new Set<string>();
/** Adresser vi redan läst av, så att avläsningen görs en gång per adress. */
const provade = new Set<string>();

/** Antal filer som hämtas just nu. */
let hamtar = 0;
/**
 * Räknare som ändras vid varje förändring.
 *
 * useSyncExternalStore jämför ögonblicksbilder med === och skulle rita om
 * i en oändlig slinga om varje avläsning gav ett nytt objekt. Ett tal
 * ändras bara när något faktiskt hänt, och komponenten läser sedan av
 * `arCachad` och `hamtarNu` som vanliga funktioner.
 */
let version = 0;

function meddela() {
  version += 1;
  window.dispatchEvent(new Event(HANDELSE));
}

const harCacheApi = () => typeof caches !== "undefined";

/** Ligger adressen redan i cachen? */
async function finnsICachen(url: string) {
  if (!harCacheApi()) return false;
  try {
    return Boolean(await caches.match(url));
  } catch {
    // Cache API saknas i osäkra sammanhang; då är svaret "vet inte",
    // vilket visas som ingen status alls.
    return false;
  }
}

function markera(url: string) {
  if (cachade.has(url)) return;
  cachade.add(url);
  meddela();
}

/** Läser av en adress en gång och kommer ihåg svaret. */
export function prova(url: string) {
  if (provade.has(url) || cachade.has(url)) return;
  provade.add(url);
  void finnsICachen(url).then((ja) => {
    if (ja) markera(url);
  });
}

/** En hämtning i taget, av samma skäl som synken i Offline.tsx. */
let pagar = false;

/**
 * Hämtar hem de dokument som inte redan ligger i telefonen.
 *
 * En fil i taget och inte alla på en gång: föraren har ofta en svag
 * uppkoppling, och sex parallella hämtningar gör varje enskild långsammare
 * utan att någon blir klar tidigare. Sekventiellt kommer dessutom den
 * första filen fram medan de andra är på väg, vilket är det som räknas om
 * täckningen tar slut mitt i.
 *
 * Misslyckas en hämtning görs inget väsen av det – nästa gång fliken
 * öppnas prövas den igen.
 */
export async function forhamta(urler: string[]) {
  if (pagar || !harCacheApi() || !navigator.onLine) return;

  const saknade = urler.filter((url) => !cachade.has(url));
  if (saknade.length === 0) return;

  pagar = true;
  try {
    const cache = await caches.open(CACHE);
    for (const url of saknade) {
      if (await cache.match(url)) {
        markera(url);
        continue;
      }

      hamtar += 1;
      meddela();
      try {
        // same-origin: utlämningen kräver sessionskakan, och utan den
        // svarar /api/media med 401 som vi inte vill cacha.
        const svar = await fetch(url, { credentials: "same-origin" });
        if (svar.ok) {
          await cache.put(url, svar.clone());
          cachade.add(url);
        }
      } catch {
        // Ingen täckning, eller filen borta. Inget att göra åt här.
      } finally {
        hamtar -= 1;
        meddela();
      }
    }
  } catch {
    // Går cachen inte att öppna fungerar appen ändå, bara utan
    // förhämtning.
  } finally {
    pagar = false;
  }
}

/* ------------------------------------------- Ögonblicksbild för React */

export function prenumereraCache(vid: () => void) {
  window.addEventListener(HANDELSE, vid);
  return () => window.removeEventListener(HANDELSE, vid);
}

export const cacheversion = () => version;
/** Servern känner inte telefonens cache. */
export const serverCacheversion = () => 0;

export const arCachad = (url: string) => cachade.has(url);
export const hamtarNu = () => hamtar;
