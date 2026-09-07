/**
 * Skapar nyckelparet som notiserna signeras med.
 *
 * VAPID är hur en pushtjänst vet vem som skickar. Den publika nyckeln får
 * telefonen när den prenumererar, och tjänsten släpper sedan bara igenom
 * utskick signerade med den privata.
 *
 * Nycklarna hör till appen och inte till en användare. Byts de ut slutar
 * alla befintliga prenumerationer att fungera och varje telefon får slå
 * på notiser igen – gör det bara om den privata nyckeln läckt.
 *
 *   npm run push:nycklar
 */
import { webcrypto } from "node:crypto";

const { publicKey, privateKey } = await webcrypto.subtle.generateKey(
  { name: "ECDSA", namedCurve: "P-256" },
  true,
  ["sign", "verify"],
);

// Den publika som okomprimerad punkt (65 byte som börjar med 0x04) – det
// enda format pushManager.subscribe tar emot. Den privata som råa 32 byte,
// vilket är d-fältet ur JWK.
const rå = new Uint8Array(await webcrypto.subtle.exportKey("raw", publicKey));
const jwk = await webcrypto.subtle.exportKey("jwk", privateKey);

const base64url = (byte) =>
  Buffer.from(byte).toString("base64url");

console.log(`
Klistra in de här två raderna i .env, och kör sedan  npm run cf:secrets
för att lägga upp dem på Workern.

VAPID_PUBLIC_KEY="${base64url(rå)}"
VAPID_PRIVATE_KEY="${jwk.d}"

Den publika nyckeln är inte hemlig – den skickas till varje telefon som
prenumererar. Den privata är det. Hamnar den på villovägar kan vem som
helst skicka notiser i appens namn.
`);
