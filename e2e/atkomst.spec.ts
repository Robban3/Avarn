import { expect, test } from "@playwright/test";
import { KONTON, loggaIn } from "./hjalp";

/**
 * De negativa fallen: att en gissad adress inte öppnar någon annans
 * uppgifter. Det här är den kontroll som verkligen betyder något, eftersom
 * uppdrag och rapporter kan innehålla känsliga uppgifter.
 */

/**
 * Hämtar första posten ur en länklista. Statiska undersidor som /nytt och
 * /plan hoppas över – det är en riktig postadress vi vill åt.
 */
const STATISKA = new Set(["nytt", "plan"]);

async function forstaId(
  page: import("@playwright/test").Page,
  lista: string,
  prefix: string,
) {
  await page.goto(lista);
  const hrefs = await page.locator(`a[href^="${prefix}"]`).evaluateAll(
    (element) => element.map((e) => e.getAttribute("href") ?? ""),
  );
  for (const href of hrefs) {
    const id = href.replace(prefix, "").split(/[?#]/)[0];
    if (id && !STATISKA.has(id)) return id;
  }
  return null;
}

test("hundförare når inte en annan förares träningspass", async ({ page }) => {
  // Johan i Väst har egna pass; Erik i Öst ska inte kunna öppna dem.
  await loggaIn(page, KONTON.hundforareVast);
  const id = await forstaId(page, "/traning", "/traning/");
  expect(id).toBeTruthy();

  await loggaIn(page, KONTON.hundforare);
  const svar = await page.goto(`/traning/${id}`);
  expect(svar?.status()).toBe(404);
});

test("hundförare når inte en annan förares hund", async ({ page }) => {
  await loggaIn(page, KONTON.hundforareVast);
  const id = await forstaId(page, "/hundar", "/hundar/");
  expect(id).toBeTruthy();

  await loggaIn(page, KONTON.hundforare);
  const svar = await page.goto(`/hundar/${id}`);
  expect(svar?.status()).toBe(404);
});

test("instruktör når inte ekipage utanför sin tilldelning", async ({ page }) => {
  // Peter har Balder, Iris och Zeb. Anna ska inte nå dem.
  await loggaIn(page, KONTON.instruktorVast);
  const id = await forstaId(
    page,
    "/instruktor",
    "/instruktor/ekipage/",
  );
  expect(id).toBeTruthy();

  await loggaIn(page, KONTON.instruktor);
  const svar = await page.goto(`/instruktor/ekipage/${id}`);
  expect(svar?.status()).toBe(404);
});

test("mediafiler kan inte hämtas utan behörighet", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);
  // Ett påhittat id ska ge samma svar som en fil man inte får se.
  const svar = await page.goto("/api/media/finns-inte");
  expect(svar?.status()).toBe(404);
});

test("cron-jobbet kräver nyckel", async ({ request }) => {
  const utan = await request.post("/api/cron/paminnelser");
  expect(utan.status()).toBe(401);

  const fel = await request.post("/api/cron/paminnelser", {
    headers: { "x-cron-key": "fel-nyckel" },
  });
  expect(fel.status()).toBe(401);
});

test("hälsorutten svarar utan session och läcker ingenting", async ({
  request,
}) => {
  const svar = await request.get("/api/halsa");
  expect(svar.status()).toBe(200);

  const lage = await svar.json();
  expect(lage.databasen).toBe("svarar");
  expect(lage.anvandare).toBeGreaterThan(0);
  expect(lage.authSecret).toBe("ok");

  // Den viktigare halvan: en diagnostikrutt som växer sig pratsam är en
  // läcka. Varken adressen, lösenordet eller hemligheten får finnas i
  // svaret – bara omdömen om dem.
  const kropp = await svar.text();
  for (const hemligt of [
    process.env.DATABASE_URL,
    process.env.AUTH_SECRET,
    process.env.CRON_KEY,
  ]) {
    if (hemligt) expect(kropp).not.toContain(hemligt);
  }
  expect(kropp).not.toContain("postgresql://");
  expect(kropp).not.toContain("supabase.com");
});

test("delningskortet är komplett och når mottagaren utan inloggning", async ({
  request,
}) => {
  // Den som får länken i ett SMS är inte inloggad, och klienten som ritar
  // kortet hämtar sidan och bilden från sin egen sida av nätet. Går något
  // av det inte fram blir kortet en naken rad text – vilket inte syns
  // förrän någon delar länken.
  const sida = await request.get("/login");
  expect(sida.status()).toBe(200);
  const html = await sida.text();

  // Titeln ska vara appens, inte den undersida länken råkade kopieras från.
  expect(html).toContain(
    '<meta property="og:title" content="Avarn Hundtjänst"/>',
  );
  // Bildadressen måste vara absolut; Open Graph tillåter inga relativa.
  const bild = /<meta property="og:image" content="(https?:\/\/[^"]+)"/.exec(
    html,
  );
  expect(bild, "og:image saknas eller är inte absolut").not.toBeNull();
  expect(html).toContain('<meta property="og:image:width" content="1200"/>');

  const svar = await request.get("/og.png");
  expect(svar.status()).toBe(200);
  expect(svar.headers()["content-type"]).toContain("image/png");
});
