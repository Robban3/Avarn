import { beforeAll, describe, expect, it } from "vitest";
import { webcrypto } from "node:crypto";

/**
 * VAPID-biljetten.
 *
 * Går den inte att verifiera med den publika nyckeln avvisar pushtjänsten
 * utskicket, och det enda som syns är att notiserna uteblir – inget fel i
 * appen, ingen rad i loggen hos mottagaren. Därför provas signaturen här,
 * mot ett riktigt nyckelpar, i stället för att bara kontrollera att en
 * sträng med tre delar kommer ut.
 */

let vapidToken: (endpoint: string) => Promise<string>;
let publikNyckel: string;

const base64url = (byte: Uint8Array) => Buffer.from(byte).toString("base64url");

function delar(token: string) {
  const [huvud, krav, signatur] = token.split(".");
  return {
    huvud: JSON.parse(Buffer.from(huvud, "base64url").toString()),
    krav: JSON.parse(Buffer.from(krav, "base64url").toString()),
    signatur: new Uint8Array(Buffer.from(signatur, "base64url")),
    bas: `${huvud}.${krav}`,
  };
}

beforeAll(async () => {
  const par = await webcrypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );
  const ra = new Uint8Array(
    await webcrypto.subtle.exportKey("raw", par.publicKey),
  );
  const jwk = await webcrypto.subtle.exportKey("jwk", par.privateKey);

  publikNyckel = base64url(ra);
  process.env.VAPID_PUBLIC_KEY = publikNyckel;
  process.env.VAPID_PRIVATE_KEY = jwk.d as string;
  process.env.VAPID_SUBJECT = "mailto:it@avarn.se";

  ({ vapidToken } = await import("./push"));
});

describe("vapidToken", () => {
  it("signerar med ES256", async () => {
    const { huvud } = delar(
      await vapidToken("https://web.push.apple.com/abc123"),
    );
    expect(huvud).toEqual({ typ: "JWT", alg: "ES256" });
  });

  it("gäller bara mot den tjänst den skrevs för", async () => {
    // aud är pushtjänstens ursprung, inte vårt. En biljett för Apple ska
    // inte gå att skicka vidare till Google.
    const apple = delar(await vapidToken("https://web.push.apple.com/abc"));
    const google = delar(await vapidToken("https://fcm.googleapis.com/x/y"));

    expect(apple.krav.aud).toBe("https://web.push.apple.com");
    expect(google.krav.aud).toBe("https://fcm.googleapis.com");
  });

  it("har en avsändare och en utgång inom ett dygn", async () => {
    const { krav } = delar(await vapidToken("https://example.com/p"));
    const nu = Math.floor(Date.now() / 1000);

    // Apple avvisar utskick utan sub. Taket för exp är ett dygn.
    expect(krav.sub).toBe("mailto:it@avarn.se");
    expect(krav.exp).toBeGreaterThan(nu);
    expect(krav.exp).toBeLessThanOrEqual(nu + 24 * 60 * 60);
  });

  it("går att verifiera med den publika nyckeln", async () => {
    const { bas, signatur } = delar(
      await vapidToken("https://web.push.apple.com/abc"),
    );

    const punkt = Buffer.from(publikNyckel, "base64url");
    const nyckel = await webcrypto.subtle.importKey(
      "jwk",
      {
        kty: "EC",
        crv: "P-256",
        x: base64url(punkt.subarray(1, 33)),
        y: base64url(punkt.subarray(33, 65)),
        ext: true,
      },
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );

    const giltig = await webcrypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      nyckel,
      signatur,
      new TextEncoder().encode(bas),
    );
    expect(giltig, "signaturen ska gå att verifiera").toBe(true);
  });

  it("skriver en ny signatur varje gång", async () => {
    // ECDSA är inte deterministisk. Två identiska biljetter hade betytt
    // att slumpen inte används, vilket läcker den privata nyckeln.
    const a = await vapidToken("https://example.com/p");
    const b = await vapidToken("https://example.com/p");
    expect(delar(a).signatur).not.toEqual(delar(b).signatur);
  });
});
