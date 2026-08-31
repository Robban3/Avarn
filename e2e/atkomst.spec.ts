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
