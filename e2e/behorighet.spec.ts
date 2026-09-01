import { expect, test } from "@playwright/test";
import { KONTON, loggaIn } from "./hjalp";

/**
 * Behörighet på de funktioner som lades till efter första versionen.
 * Enhetstesterna täcker rollmodellen; här kontrolleras att den faktiskt är
 * kopplad till sidorna och formulären.
 */

test("hundföraren når inte certifikatformuläret", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);
  await page.goto("/certifikat");

  // Listan syns, men inget sätt att registrera eller förnya.
  await expect(page.getByText("Giltiga", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Registrera certifikat" }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Förnya" })).toHaveCount(0);
});

test("instruktören når certifikatformuläret", async ({ page }) => {
  await loggaIn(page, KONTON.instruktor);
  await page.goto("/certifikat");
  await expect(
    page.getByRole("button", { name: "Registrera certifikat" }),
  ).toBeVisible();
});

test("lösenordsbyte kräver rätt nuvarande lösenord", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);
  await page.goto("/profil");
  await page.getByRole("button", { name: "Byt lösenord" }).click();

  await page.fill("#current", "fel-losenord");
  await page.fill("#next", "EttLangtNyttLosenord2026");
  await page.fill("#repeat", "EttLangtNyttLosenord2026");
  await page.getByRole("button", { name: "Byt lösenord", exact: true }).last().click();

  await expect(page.getByText("Nuvarande lösenord stämmer inte")).toBeVisible();
});

test("hundföraren kan öppna redigering av sin egen hund", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);
  await page.goto("/hundar");

  const href = await page
    .locator('a[href^="/hundar/"]')
    .evaluateAll((els) =>
      els
        .map((e) => e.getAttribute("href") ?? "")
        .find((h) => h !== "/hundar/ny" && !h.endsWith("/redigera")),
    );
  expect(href).toBeTruthy();

  await page.goto(`${href}/redigera`);
  await expect(page.getByRole("button", { name: "Spara ändringar" })).toBeVisible();
});

test("hundföraren når inte en annan förares hundredigering", async ({ page }) => {
  await loggaIn(page, KONTON.hundforareVast);
  await page.goto("/hundar");
  const href = await page
    .locator('a[href^="/hundar/"]')
    .evaluateAll((els) =>
      els
        .map((e) => e.getAttribute("href") ?? "")
        .find((h) => h !== "/hundar/ny" && !h.endsWith("/redigera")),
    );
  expect(href).toBeTruthy();

  await loggaIn(page, KONTON.hundforare);
  const svar = await page.goto(`${href}/redigera`);
  expect(svar?.status()).toBe(404);
});
