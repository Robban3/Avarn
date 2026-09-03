/**
 * Servicearbetaren: cache av appens resurser och sidor.
 *
 * Den håller inga registreringar. Kön över det som gjorts utan
 * uppkoppling ligger i IndexedDB (src/lib/offlineko.ts) och skickas av
 * sidan själv när uppkopplingen kommer tillbaka. Här handlar det bara om
 * att det ska gå att öppna appen i en bagagehall utan täckning.
 *
 * Cachen töms vid varje sessionsgräns. Inloggningssidan rensar den, och
 * dit kommer man både när man loggar ut och när man loggar in – annars
 * hade nästa användare på samma telefon kunnat öppna föregående
 * användares uppdrag ur cachen.
 */

const CACHE = "avarn-v1";

/**
 * Utvecklingsläge, satt av registreringen.
 *
 * Byggda filer har innehållshash i namnet och kan cachas för alltid. Det
 * gäller inte utvecklingsserverns filer: de byter innehåll på samma
 * adress varje gång något ändras, och en cachad kopia hade då blivit en
 * gammal version av appen som inte går att bli av med.
 */
const UTVECKLING = new URL(self.location.href).searchParams.has("dev");

/** Byggda filer med innehållshash i namnet – ändras aldrig. */
const STATISKT = /^\/_next\/static\//;
/** Bilagor, hämtade genom den behörighetskontrollerade vägen. */
const MEDIA = /^\/api\/media\//;

self.addEventListener("install", () => {
  // Ny version tar över direkt; ingen anledning att låta föraren gå kvar
  // på en gammal med en rättad bugg.
  self.skipWaiting();
});

self.addEventListener("activate", (handelse) => {
  handelse.waitUntil(
    (async () => {
      for (const namn of await caches.keys()) {
        if (namn !== CACHE) await caches.delete(namn);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (handelse) => {
  // Inloggningssidan ber om en tömning vid sessionsgränsen.
  if (handelse.data?.typ === "rensa-cache") {
    handelse.waitUntil(caches.delete(CACHE));
  }
});

self.addEventListener("fetch", (handelse) => {
  const begaran = handelse.request;

  // Bara hämtningar cachas. En registrering får aldrig besvaras ur cache
  // – då hade föraren fått ett kvitto på något som inte hänt.
  if (begaran.method !== "GET") return;

  const url = new URL(begaran.url);
  if (url.origin !== self.location.origin) return;

  if (
    (STATISKT.test(url.pathname) && !UTVECKLING) ||
    MEDIA.test(url.pathname)
  ) {
    handelse.respondWith(cacheForst(begaran));
    return;
  }

  // Inloggningssidan är sessionsgränsen och hör inte hemma i cachen.
  if (begaran.mode === "navigate" && url.pathname !== "/login") {
    handelse.respondWith(natverkForst(begaran));
  }
});

/** Ur cachen om den finns där, annars från nätet – och spara den då. */
async function cacheForst(begaran) {
  const traff = await caches.match(begaran);
  if (traff) return traff;

  const svar = await fetch(begaran);
  if (svar.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(begaran, svar.clone());
  }
  return svar;
}

/**
 * Från nätet när det går, annars ur cachen.
 *
 * Nätet först och inte cachen först: ett uppdrag som ändrats ska visas
 * som det ser ut nu. Cachen är reserven, inte förstahandsvalet.
 */
async function natverkForst(begaran) {
  try {
    const svar = await fetch(begaran);
    if (svar.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(begaran, svar.clone());
    }
    return svar;
  } catch (fel) {
    const traff = await caches.match(begaran);
    if (traff) return traff;
    throw fel;
  }
}
