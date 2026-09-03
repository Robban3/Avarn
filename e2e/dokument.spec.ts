import { expect, test } from "@playwright/test";
import path from "node:path";
import { KONTON, loggaIn } from "./hjalp";

/**
 * Uppdragets dokumentflik: uppdragsgivarens underlag, förarens egna
 * bilagor och de behörigheter uppdraget kräver.
 *
 * Proven bygger sitt eget uppdrag, så att sviten går att köra om utan att
 * seed-datan laddas om.
 */

const BILD = path.join(process.cwd(), "e2e", "testbild.png");

/** Filraden i listan – kvittot ovanför formuläret bär samma filnamn. */
const fil = (page: import("@playwright/test").Page) =>
  page.getByRole("link", { name: /^testbild\.png/ });

const vantaPaUppdrag = (page: import("@playwright/test").Page) =>
  page.waitForURL(
    (url) =>
      /^\/uppdrag\/[^/]+$/.test(url.pathname) &&
      !url.pathname.endsWith("/nytt"),
  );

/** Lägger upp ett uppdrag, tilldelar Erik och returnerar dess sökväg. */
async function uppdragMedForare(
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

  const dag = new Date();
  dag.setDate(dag.getDate() + 500 + (Date.now() % 240));
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

  return uppdrag;
}

test("fliken är tom tills något läggs upp", async ({ page }) => {
  const uppdrag = await uppdragMedForare(page, `Dok tom ${Date.now()}`);

  await loggaIn(page, KONTON.hundforare);
  await page.goto(`${uppdrag}/detaljer?flik=dokument`);

  await expect(
    page.getByRole("heading", { name: "Från uppdragsgivaren" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Egna bilagor" }),
  ).toBeVisible();
  await expect(page.getByText("Inga dokument ännu")).toBeVisible();

  // Inget dokument är cachat, så ingen rad lovar offline.
  await expect(page.getByText("Tillgänglig offline")).toHaveCount(0);
});

test("regionchefens fil hamnar under uppdragsgivaren och syns hos föraren", async ({
  page,
}) => {
  const uppdrag = await uppdragMedForare(page, `Dok underlag ${Date.now()}`);

  await page.goto(`${uppdrag}/detaljer?flik=dokument`);
  await page
    .getByRole("button", { name: /Lägg upp underlag|Lägg till/ })
    .first()
    .click();
  await page.setInputFiles('input[name="fil"]', BILD);
  await page.getByRole("button", { name: "Lägg till", exact: true }).click();

  await expect(fil(page)).toBeVisible();

  // Föraren ser samma fil, i uppdragsgivarens avsnitt.
  await loggaIn(page, KONTON.hundforare);
  await page.goto(`${uppdrag}/detaljer?flik=dokument`);
  await expect(fil(page)).toBeVisible();

  // Filen lämnas ut, men bara genom den behörighetskontrollerade vägen.
  const href = await fil(page).getAttribute("href");
  expect(href).toMatch(/^\/api\/media\//);
  const svar = await page.request.get(href as string);
  expect(svar.status()).toBe(200);
});

test("förarens fil hamnar under egna bilagor och går att ta bort", async ({
  page,
}) => {
  const uppdrag = await uppdragMedForare(page, `Dok bilaga ${Date.now()}`);

  await loggaIn(page, KONTON.hundforare);
  await page.goto(`${uppdrag}/detaljer?flik=dokument`);

  await page
    .getByRole("button", { name: /Lägg till bilaga|Lägg till/ })
    .first()
    .click();
  await page.setInputFiles('input[name="fil"]', BILD);
  await page.getByRole("button", { name: "Lägg till", exact: true }).click();

  await expect(fil(page)).toBeVisible();
  // Nu är fliken inte längre tom.
  await expect(page.getByText("Inga dokument ännu")).toHaveCount(0);

  await page.getByRole("button", { name: /^Ta bort testbild\.png$/ }).click();
  await expect(fil(page)).toHaveCount(0);
});

test("föraren kan inte ta bort uppdragsgivarens underlag", async ({ page }) => {
  const uppdrag = await uppdragMedForare(page, `Dok skydd ${Date.now()}`);

  await page.goto(`${uppdrag}/detaljer?flik=dokument`);
  await page
    .getByRole("button", { name: /Lägg upp underlag|Lägg till/ })
    .first()
    .click();
  await page.setInputFiles('input[name="fil"]', BILD);
  await page.getByRole("button", { name: "Lägg till", exact: true }).click();
  await expect(fil(page)).toBeVisible();

  await loggaIn(page, KONTON.hundforare);
  await page.goto(`${uppdrag}/detaljer?flik=dokument`);
  await expect(fil(page)).toBeVisible();
  // Ingen papperskorg på en fil föraren inte äger.
  await expect(
    page.getByRole("button", { name: /^Ta bort testbild\.png$/ }),
  ).toHaveCount(0);
});

test("en förare i en annan region når varken fliken eller filen", async ({
  page,
}) => {
  const uppdrag = await uppdragMedForare(page, `Dok behörighet ${Date.now()}`);

  await page.goto(`${uppdrag}/detaljer?flik=dokument`);
  await page
    .getByRole("button", { name: /Lägg upp underlag|Lägg till/ })
    .first()
    .click();
  await page.setInputFiles('input[name="fil"]', BILD);
  await page.getByRole("button", { name: "Lägg till", exact: true }).click();
  await expect(fil(page)).toBeVisible();
  const href = await fil(page).getAttribute("href");

  await loggaIn(page, KONTON.hundforareVast);
  const sidsvar = await page.goto(`${uppdrag}/detaljer?flik=dokument`);
  expect(sidsvar?.status()).toBe(404);

  // Och filen lämnas inte ut bara för att adressen är känd.
  const filsvar = await page.request.get(href as string);
  expect(filsvar.status()).toBe(404);
});

test("behörigheterna uppdraget kräver listas i fliken", async ({ page }) => {
  const uppdrag = await uppdragMedForare(page, `Dok cert ${Date.now()}`);

  await loggaIn(page, KONTON.hundforare);
  await page.goto(`${uppdrag}/detaljer?flik=dokument`);

  await expect(
    page.getByRole("heading", { name: "Behörigheter" }),
  ).toBeVisible();
  await expect(page.getByText(/Giltig till:|Gick ut /).first()).toBeVisible();
});
