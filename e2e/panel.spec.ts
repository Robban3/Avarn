import { expect, test } from "@playwright/test";
import { KONTON, loggaIn } from "./hjalp";

/**
 * Adminpanelen är en skrivbordsvy, så proven körs i skrivbordsbredd.
 * Det som betyder något här är vem som släpps in och hur mycket av menyn
 * var och en ser – panelen är gemensam, avgränsningen är rollens.
 */

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
});

test("hundföraren nekas adminpanelen", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);
  for (const url of ["/panel", "/panel/ekipage", "/panel/systemlogg"]) {
    await page.goto(url);
    await expect(page).toHaveURL(/\/nekad/);
  }
});

test("administratören ser hela menyn", async ({ page }) => {
  await loggaIn(page, KONTON.admin);
  await page.goto("/panel");

  await expect(
    page.getByRole("heading", { name: "Översikt", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Aktiva ekipage")).toBeVisible();
  await expect(page.getByText("Uppdrag översikt")).toBeVisible();

  const meny = page.getByRole("link", { name: "Användare & roller" });
  await expect(meny).toBeVisible();
  await expect(page.getByRole("link", { name: "Systemlogg" })).toBeVisible();
});

test("instruktören når panelen men inte administrationen", async ({ page }) => {
  await loggaIn(page, KONTON.instruktor);
  await page.goto("/panel");
  await expect(
    page.getByRole("heading", { name: "Översikt", level: 1 }),
  ).toBeVisible();

  // Menyn ska sakna administrationsposterna …
  await expect(
    page.getByRole("link", { name: "Användare & roller" }),
  ).toHaveCount(0);

  // … och adressen ska inte gå att gissa sig förbi.
  await page.goto("/panel/anvandare");
  await expect(page).toHaveURL(/\/nekad/);
  await page.goto("/panel/systemlogg");
  await expect(page).toHaveURL(/\/nekad/);
});

test("regionalt ansvarig ser regioner men inte användarhantering", async ({
  page,
}) => {
  await loggaIn(page, KONTON.regional);
  await page.goto("/panel");
  await expect(page.getByRole("link", { name: "Regioner" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kunder" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Användare & roller" }),
  ).toHaveCount(0);

  await page.goto("/panel/regioner");
  await expect(
    page.getByRole("heading", { name: "Regioner", level: 1 }),
  ).toBeVisible();
});

test("panelens sidor svarar för administratören", async ({ page }) => {
  await loggaIn(page, KONTON.admin);
  for (const [url, rubrik] of [
    ["/panel/ekipage", "Ekipage"],
    ["/panel/hundar", "Hundar"],
    ["/panel/uppdrag", "Uppdrag"],
    ["/panel/traning", "Träning"],
    ["/panel/rapporter", "Rapporter"],
    ["/panel/certifikat", "Certifikat & behörigheter"],
    ["/panel/meddelanden", "Meddelanden"],
    ["/panel/kalender", "Kalender"],
    ["/panel/anvandare", "Användare & roller"],
    ["/panel/organisation", "Organisation"],
    ["/panel/regioner", "Regioner"],
    ["/panel/kunder", "Kunder"],
    ["/panel/installningar", "Inställningar"],
    ["/panel/systemlogg", "Systemlogg"],
  ]) {
    const svar = await page.goto(url);
    expect(svar?.status(), `${url} ska svara 200`).toBe(200);
    await expect(
      page.getByRole("heading", { name: rubrik, level: 1 }),
    ).toBeVisible();
  }
});

test("exporten ger en CSV inom behörigheten", async ({ page }) => {
  await loggaIn(page, KONTON.admin);
  // page.goto går inte på ett svar som laddas ner – hämta det som en
  // förfrågan i stället, med samma kakor som sidan.
  const svar = await page.request.get("/panel/export?vy=ekipage");
  expect(svar.status()).toBe(200);
  expect(svar.headers()["content-type"]).toContain("text/csv");

  const text = await svar.text();
  expect(text).toContain("Hundförare");
  expect(text).toContain("Nova");
});

test("hundföraren kommer inte åt exporten", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);
  await page.goto("/panel/export?vy=ekipage");
  await expect(page).toHaveURL(/\/nekad/);
});
