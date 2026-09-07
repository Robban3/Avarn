import "server-only";
import { db } from "./db";
import { miljo } from "./miljo";

/**
 * Utskick av notiser till telefonen.
 *
 * Appen skickar **tomma** meddelanden. Web Push tillåter det: en POST med
 * bara VAPID-huvudet och ingen kropp väcker servicearbetaren, som sedan
 * hämtar aviseringen från appen själv och visar den – se `push`-hanteraren
 * i public/sw.js.
 *
 * Det tar bort hela nyttolastkrypteringen. Ett meddelande med innehåll
 * kräver ECDH mot mottagarens nyckel, HKDF och AES128GCM; utan innehåll
 * återstår en signerad JWT, som WebCrypto klarar direkt både i Node och i
 * workerd. Det gör dessutom att aviseringens text aldrig passerar Apples
 * eller Googles servrar, ens krypterad.
 *
 * Priset är att en utloggad telefon visar en allmän text i stället för
 * rubriken. Det är ett rimligt byte för att slippa krypto vi själva
 * skulle behöva underhålla.
 */

/** Base64url utan utfyllnad – det enda format VAPID och JWT använder. */
function tillBase64url(data: ArrayBuffer | Uint8Array): string {
  const byte = data instanceof Uint8Array ? data : new Uint8Array(data);
  let text = "";
  for (const b of byte) text += String.fromCharCode(b);
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function franBase64url(text: string): Uint8Array {
  const fyllt = text.replace(/-/g, "+").replace(/_/g, "/");
  const rad = atob(fyllt.padEnd(Math.ceil(fyllt.length / 4) * 4, "="));
  const ut = new Uint8Array(rad.length);
  for (let i = 0; i < rad.length; i += 1) ut[i] = rad.charCodeAt(i);
  return ut;
}

/** Nycklarna, eller null när push inte är konfigurerat. */
export function pushNycklar() {
  const publik = miljo("VAPID_PUBLIC_KEY");
  const privat = miljo("VAPID_PRIVATE_KEY");
  if (!publik || !privat) return null;
  return { publik, privat };
}

export function pushArPaslaget() {
  return pushNycklar() !== null;
}

/**
 * Signeringsnyckeln.
 *
 * Den privata nyckeln lagras som råa 32 byte i base64url – det format
 * `npm run push:nycklar` skriver ut. WebCrypto vill ha den som JWK, och
 * behöver då även den publika punkten, som ligger i VAPID_PUBLIC_KEY:
 * en okomprimerad P-256-punkt, 65 byte som börjar med 0x04.
 */
async function signeringsnyckel(): Promise<CryptoKey> {
  const nycklar = pushNycklar();
  if (!nycklar) throw new Error("VAPID-nycklarna saknas.");

  const punkt = franBase64url(nycklar.publik);
  if (punkt.length !== 65 || punkt[0] !== 0x04) {
    throw new Error(
      "VAPID_PUBLIC_KEY ska vara 65 byte i base64url. Kör npm run push:nycklar.",
    );
  }

  return crypto.subtle.importKey(
    "jwk",
    {
      kty: "EC",
      crv: "P-256",
      d: nycklar.privat,
      x: tillBase64url(punkt.slice(1, 33)),
      y: tillBase64url(punkt.slice(33, 65)),
      ext: true,
    },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

/**
 * Biljetten som säger att utskicket kommer från oss.
 *
 * `aud` är pushtjänstens ursprung, inte vårt – token gäller alltså bara
 * mot den tjänst den skrevs för. `sub` måste vara en adress tjänsten kan
 * nå oss på om något går fel; Apple avvisar utskick utan den.
 */
export async function vapidToken(endpoint: string): Promise<string> {
  const { origin } = new URL(endpoint);
  const huvud = { typ: "JWT", alg: "ES256" };
  const krav = {
    aud: origin,
    // Tolv timmar. Taket är ett dygn, och kortare ger mindre att missbruka
    // om en logg skulle läcka.
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: miljo("VAPID_SUBJECT") ?? "mailto:it@avarn.se",
  };

  const text = new TextEncoder();
  const bas =
    `${tillBase64url(text.encode(JSON.stringify(huvud)))}.` +
    `${tillBase64url(text.encode(JSON.stringify(krav)))}`;

  const signatur = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    await signeringsnyckel(),
    text.encode(bas),
  );

  return `${bas}.${tillBase64url(signatur)}`;
}

/**
 * Väcker en telefon.
 *
 * Svarar tjänsten 404 eller 410 är prenumerationen död – appen är
 * avinstallerad, eller notiser avstängda. Raden tas då bort; utan det
 * växer tabellen med adresser som aldrig svarar och varje avisering
 * kostar en förfrågan till ingenting.
 */
async function vackEn(prenumeration: { id: string; endpoint: string }) {
  const nycklar = pushNycklar();
  if (!nycklar) return;

  const svar = await fetch(prenumeration.endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${await vapidToken(prenumeration.endpoint)}, k=${nycklar.publik}`,
      // Utan innehåll finns ingen kropp att beskriva, men tjänsterna
      // kräver att längden anges.
      "Content-Length": "0",
      // Ett dygn. En avisering som är äldre än så är inte längre en notis.
      TTL: "86400",
      Urgency: "normal",
    },
  });

  if (svar.status === 404 || svar.status === 410) {
    await db.pushSubscription.delete({ where: { id: prenumeration.id } });
    return;
  }

  if (!svar.ok) {
    console.error(
      `Push avvisades med ${svar.status} av ${new URL(prenumeration.endpoint).origin}`,
    );
  }
}

/**
 * Väcker alla telefoner en användare har appen på.
 *
 * Kastar aldrig. En avisering som inte kunde skickas ut är fortfarande
 * skapad i databasen och syns nästa gång appen öppnas – att låta ett
 * utskick fälla ett server action hade varit att byta en liten olägenhet
 * mot en stor.
 */
export async function vackTelefoner(userId: string) {
  if (!pushArPaslaget()) return;

  try {
    const prenumerationer = await db.pushSubscription.findMany({
      where: { userId },
      select: { id: true, endpoint: true },
    });

    await Promise.all(
      prenumerationer.map((p) =>
        vackEn(p).catch((fel) => console.error("Push misslyckades:", fel)),
      ),
    );
  } catch (fel) {
    console.error("Push kunde inte skickas:", fel);
  }
}
