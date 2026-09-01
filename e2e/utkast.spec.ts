import { expect, test } from "@playwright/test";
import { KONTON, loggaIn } from "./hjalp";

/**
 * Utkastets väg tillbaka. "Spara utkast" är bara meningsfullt om utkastet
 * går att öppna igen, rätta och skicka in – annars är knappen en fälla.
 */

/**
 * Väntar på rapportens egen sida. `/rapporter/nytt` måste räknas bort, annars
 * matchar väntan formuläret vi står på och går vidare för tidigt.
 */
function väntaPåRapport(page: import("@playwright/test").Page) {
  return page.waitForURL(
    (url) =>
      /^\/rapporter\/[^/]+$/.test(url.pathname) &&
      !url.pathname.endsWith("/nytt"),
  );
}

test("träningspass: utkast går att öppna, rätta och skicka in", async ({
  page,
}) => {
  await loggaIn(page, KONTON.hundforare);

  await page.goto("/traning/nytt");
  await page.fill('input[name="location"]', "Utkastplatsen");
  await page.getByRole("button", { name: "Spara utkast" }).click();
  await page.waitForURL(/\/traning\/[^/]+$/);

  await expect(page.getByText("Utkast", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Rätta uppgifterna" }).click();
  await page.waitForURL(/\/redigera$/);

  // Fältet ska komma tillbaka ifyllt – annars skrivs passet över med tomt.
  await expect(page.locator('input[name="location"]')).toHaveValue(
    "Utkastplatsen",
  );

  await page.fill('input[name="location"]', "Rättad plats");
  await page.getByRole("button", { name: "Skicka in", exact: true }).click();
  await page.waitForURL(/\/traning\/[^/]+$/);

  await expect(page.getByText("Rättad plats")).toBeVisible();
  await expect(page.getByText("Inskickad", { exact: true })).toBeVisible();
});

test("rapport: utkast göms inte undan utan går att slutföra", async ({
  page,
}) => {
  await loggaIn(page, KONTON.hundforare);

  // UPP-2451 är accepterat av Novas ekipage och saknar rapport.
  await page.goto("/rapporter/nytt");
  await page.getByRole("link", { name: /UPP-2451/ }).click();
  await page.waitForURL(/uppdrag=/);

  await page.fill('textarea[name="findings"]', "Preliminärt: inga fynd.");
  await page.fill('input[name="indication-0-location"]', "Bagageband 1");
  await page.getByRole("button", { name: "Spara utkast" }).click();
  await väntaPåRapport(page);

  const rapportUrl = page.url();
  await expect(page.getByText("Utkast", { exact: true })).toBeVisible();

  // Det egna utkastet ska inte ha gömt uppdraget – förr försvann det helt.
  await page.goto("/rapporter/nytt");
  await expect(page.getByText("Påbörjade rapporter")).toBeVisible();
  await expect(page.getByRole("link", { name: /UPP-2451/ })).toBeVisible();

  await page.goto(rapportUrl);
  await page.getByRole("link", { name: "Rätta uppgifterna" }).click();
  await page.waitForURL(/\/redigera$/);

  await expect(page.locator('textarea[name="findings"]')).toHaveValue(
    "Preliminärt: inga fynd.",
  );
  await expect(
    page.locator('input[name="indication-0-location"]'),
  ).toHaveValue("Bagageband 1");

  await page.fill('textarea[name="findings"]', "Inga fynd. Söket avslutat.");
  await page.getByRole("button", { name: "Skicka in rapporten" }).click();
  await väntaPåRapport(page);

  await expect(page.getByText("Inga fynd. Söket avslutat.")).toBeVisible();
  await expect(page.getByText("Inskickad", { exact: true })).toBeVisible();
});

test("hundförare når inte en annan förares rapportformulär", async ({
  page,
}) => {
  // Erik i Öst har rapporterna; Johan i Väst ska inte nå deras formulär.
  await loggaIn(page, KONTON.hundforare);
  await page.goto("/rapporter");
  const href = await page
    .locator('a[href^="/rapporter/"]')
    .first()
    .getAttribute("href");
  expect(href).toBeTruthy();

  await loggaIn(page, KONTON.hundforareVast);
  const svar = await page.goto(`${href}/redigera`);
  expect(svar?.status()).toBe(404);
});
