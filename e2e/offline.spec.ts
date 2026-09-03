import { expect, test } from "@playwright/test";
import { KONTON, loggaIn } from "./hjalp";

/**
 * Offline-läget: statusraden, kön i telefonen och synkningen.
 *
 * Det som verkligen ska bevisas är att en markering som görs utan
 * täckning kommer fram sedan. En förare i en bagagehall kan inte gå ut
 * och kontrollera att registreringen tog.
 */

const vantaPaUppdrag = (page: import("@playwright/test").Page) =>
  page.waitForURL(
    (url) =>
      /^\/uppdrag\/[^/]+$/.test(url.pathname) &&
      !url.pathname.endsWith("/nytt"),
  );

/** Lägger upp ett uppdrag, låter Erik acceptera det och startar det. */
async function startatUppdrag(
  page: import("@playwright/test").Page,
  rubrik: string,
) {
  await loggaIn(page, KONTON.regional);
  await page.goto("/uppdrag/nytt");

  await expect(async () => {
    await page.fill('input[name="title"]', rubrik);
    await expect(page.locator('input[name="title"]')).toHaveValue(rubrik);
  }).toPass({ timeout: 15_000 });

  await page.fill('input[name="missionType"]', "Områdessök");
  await page.fill('input[name="locality"]', "Provorten");
  await page.selectOption('select[name="disciplineId"]', { label: "Narkotika" });
  await page.fill('input[name="missionArea"]', "Terminal 5, Bagagehall");

  const dag = new Date();
  dag.setDate(dag.getDate() + 400 + (Date.now() % 240));
  await page.fill('input[name="date"]', dag.toISOString().slice(0, 10));

  await page.getByRole("button", { name: "Lägg upp uppdraget" }).click();
  await vantaPaUppdrag(page);
  const uppdrag = new URL(page.url()).pathname;

  await page
    .getByRole("button", { name: /^Tilldela (Nova|Rex)$/ })
    .first()
    .click();
  await expect(page.getByText("Erbjudet").first()).toBeVisible({
    timeout: 15_000,
  });

  await loggaIn(page, KONTON.hundforare);
  await page.goto(uppdrag);
  await page.getByRole("button", { name: "Acceptera" }).click();
  await expect(page.getByText("Accepterat").first()).toBeVisible();

  await page.goto(`${uppdrag}/detaljer?flik=plats`);
  await page.getByRole("button", { name: "Starta uppdrag" }).click();
  await page.waitForURL(/\/pagaende$/);

  // Servicearbetaren registreras när sidan visats. Först därefter går
  // hämtningarna genom den – och först då hamnar sidan i cachen.
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await vantaPaHydrering(page);

  return uppdrag;
}

const status = (page: import("@playwright/test").Page) =>
  page.getByRole("status").first();

/**
 * Väntar tills sidans kod hunnit ladda.
 *
 * Uppdragsklockan går bara i webbläsaren, så ett klockslag som ändrar
 * sig är beskedet att hydreringen är klar. Kopplas nätet ner innan dess
 * hämtas resten av koden aldrig, och sidan blir stående som servern
 * renderade den – utan statusrad som slår om och utan kö.
 */
async function vantaPaHydrering(page: import("@playwright/test").Page) {
  const klocka = page.getByText(/^00:00:\d\d$/);
  const forst = await klocka.textContent();
  await expect(klocka).not.toHaveText(forst ?? "", { timeout: 20_000 });
}

/** Kopplar ner och väntar tills sidan sett det. */
async function kopplaNer(
  page: import("@playwright/test").Page,
  context: import("@playwright/test").BrowserContext,
) {
  await context.setOffline(true);
  await expect(status(page)).toHaveAttribute("data-lage", "offline", {
    timeout: 20_000,
  });
}

test("statusraden visar online när nätet finns", async ({ page }) => {
  await startatUppdrag(page, `Offline online ${Date.now()}`);

  await expect(status(page)).toHaveAttribute("data-lage", "online");
  await expect(status(page)).toContainText("Online");
});

test("statusraden slår om till offline när nätet försvinner", async ({
  page,
  context,
}) => {
  await startatUppdrag(page, `Offline lage ${Date.now()}`);

  await kopplaNer(page, context);
  await expect(status(page)).toContainText(
    "Offline – registreringar sparas i telefonen",
  );

  await context.setOffline(false);
  await expect(status(page)).toHaveAttribute("data-lage", "online", {
    timeout: 20_000,
  });
});

test("en markering utan täckning sparas i telefonen och kommer fram sedan", async ({
  page,
  context,
}) => {
  const uppdrag = await startatUppdrag(page, `Offline ko ${Date.now()}`);
  const markering = page.getByRole("button", { name: "Registrera markering" });
  await expect(markering).toContainText("0");

  // Ute i hallen, utan täckning.
  await kopplaNer(page, context);

  // Kvittot är statusraden, som ligger klistrad under sidhuvudet och
  // räknar upp för varje tryck.
  await markering.click();
  await expect(status(page)).toContainText("1 registrering sparad i telefonen");

  await markering.click();
  await expect(status(page)).toContainText("2 registreringar");

  // Tillbaka i bilen: kön töms av sig själv.
  await context.setOffline(false);
  await expect(status(page)).toHaveAttribute("data-lage", "klart", {
    timeout: 20_000,
  });
  await expect(status(page)).toContainText("Allt synkroniserat");

  // Och registreringarna finns hos servern, inte bara i telefonen.
  await page.goto(`${uppdrag}/pagaende`);
  await expect(
    page.getByRole("button", { name: "Registrera markering" }),
  ).toContainText("2");
});

test("kön överlever att appen stängs och öppnas igen", async ({
  page,
  context,
}) => {
  const uppdrag = await startatUppdrag(page, `Offline omladdning ${Date.now()}`);

  await kopplaNer(page, context);
  await page.getByRole("button", { name: "Registrera fynd" }).click();
  await expect(status(page)).toContainText("1 registrering");

  // Föraren stänger appen med registreringen kvar i telefonen, och
  // öppnar den igen när täckningen är tillbaka. Kön ligger i IndexedDB
  // och överlever att fliken stängts.
  await page.close();
  await context.setOffline(false);

  const igen = await context.newPage();
  await igen.goto(`${uppdrag}/pagaende`);
  await expect(
    igen.getByRole("button", { name: "Registrera fynd" }),
  ).toContainText("1", { timeout: 20_000 });
});

test("ett dokument som lästs blir tillgängligt offline", async ({ page }) => {
  const uppdrag = await startatUppdrag(page, `Offline dokument ${Date.now()}`);

  await loggaIn(page, KONTON.regional);
  await page.goto(`${uppdrag}/detaljer?flik=dokument`);
  await page
    .getByRole("button", { name: /Lägg upp underlag|Lägg till/ })
    .first()
    .click();
  await page.setInputFiles(
    'input[name="fil"]',
    `${process.cwd()}/e2e/testbild.png`,
  );
  await page.getByRole("button", { name: "Lägg till", exact: true }).click();
  const lank = page.getByRole("link", { name: /^testbild\.png/ });
  await expect(lank).toBeVisible();

  // Innan filen hämtats lovar inget att den finns i telefonen.
  await expect(page.getByText("Tillgänglig offline")).toHaveCount(0);

  // Efter att den lästs ligger den i cachen, och då – och först då –
  // står det att den är tillgänglig offline.
  const href = (await lank.getAttribute("href")) as string;
  await page.evaluate((url) => fetch(url), href);
  await page.reload();
  await expect(page.getByText("Tillgänglig offline")).toBeVisible();
});

test("cachen töms vid sessionsgränsen", async ({ page }) => {
  await startatUppdrag(page, `Offline rensning ${Date.now()}`);

  const url = page.url();
  const cachad = () =>
    page.evaluate(async (u) => Boolean(await caches.match(u)), url);

  expect(await cachad()).toBe(true);

  // Utloggningen är sessionsgränsen: den leder till inloggningssidan,
  // som tömmer cachen. Efter den ska ingen sida ur den förra sessionen
  // gå att öppna ur cachen.
  await page.goto("/mer");
  await page.getByRole("button", { name: "Logga ut" }).click();
  await page.waitForURL(/\/login/);
  await expect(async () => {
    expect(await cachad()).toBe(false);
  }).toPass({ timeout: 10_000 });
});
