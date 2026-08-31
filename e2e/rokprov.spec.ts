import { expect, test } from "@playwright/test";
import { KONTON, loggaIn } from "./hjalp";

/**
 * Rökprov: att varje roll når sina vyer och att appen svarar. Detaljerad
 * behörighetslogik testas i src/lib/authz.test.ts – här kontrolleras att
 * den faktiskt är kopplad till sidorna.
 */

test("utloggad skickas till inloggningssidan", async ({ page }) => {
  await page.goto("/hem");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Hundtjänst" })).toBeVisible();
});

test("fel lösenord avslöjar inte om kontot finns", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', KONTON.hundforare);
  await page.fill('input[name="password"]', "fel-losenord");
  await page.click('button[type="submit"]');
  await expect(
    page.getByText("Fel e-postadress eller lösenord"),
  ).toBeVisible();
});

test("hundföraren når sina egna vyer", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);

  await expect(page.getByText("Erik Andersson")).toBeVisible();

  await page.goto("/hundar");
  await expect(page.getByRole("heading", { name: "Nova" })).toBeVisible();

  await page.goto("/traning");
  await expect(page.getByText("Dagbok", { exact: true })).toBeVisible();

  await page.goto("/uppdrag");
  await expect(page.getByRole("link", { name: "Kommande" })).toBeVisible();

  await page.goto("/certifikat");
  await expect(page.getByText("Giltiga", { exact: true }).first()).toBeVisible();
});

test("hundföraren nekas instruktörs-, lednings- och adminvyer", async ({
  page,
}) => {
  await loggaIn(page, KONTON.hundforare);

  for (const url of ["/instruktor", "/ledning", "/admin"]) {
    await page.goto(url);
    await expect(page).toHaveURL(/\/nekad/);
  }
});

test("instruktören ser sina ekipage men inte statistik eller admin", async ({
  page,
}) => {
  await loggaIn(page, KONTON.instruktor);

  await page.goto("/instruktor");
  await expect(page.getByText("Mina ekipage").first()).toBeVisible();
  await expect(page.getByText("Aktivitet", { exact: true })).toBeVisible();

  await page.goto("/ledning");
  await expect(page).toHaveURL(/\/nekad/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/nekad/);
});

test("regionalt ansvarig når statistik men inte administration", async ({
  page,
}) => {
  await loggaIn(page, KONTON.regional);

  await page.goto("/ledning");
  await expect(
    page.getByText("Aktiva ekipage", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Träningstimmar per månad", { exact: true }),
  ).toBeVisible();

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/nekad/);
});

test("administratören når användarhanteringen", async ({ page }) => {
  await loggaIn(page, KONTON.admin);
  await page.goto("/admin");
  await expect(page.getByText("Revisionslogg", { exact: true })).toBeVisible();
  await expect(page.getByText("erik.andersson@avarn.se")).toBeVisible();
});

test("nationellt ansvarig kan filtrera statistiken på region", async ({
  page,
}) => {
  await loggaIn(page, KONTON.nationell);
  await page.goto("/ledning");
  await expect(page.getByLabel("Region")).toBeVisible();
  await expect(
    page.getByText("Geografisk täckning", { exact: true }),
  ).toBeVisible();
});
