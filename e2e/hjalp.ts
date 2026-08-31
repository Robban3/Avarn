import type { Page } from "@playwright/test";

/** Samma lösenord för alla konton i seed-datan. */
export const LOSENORD = "avarn123";

export const KONTON = {
  hundforare: "erik.andersson@avarn.se",
  hundforareVast: "johan.larsson@avarn.se",
  instruktor: "anna.karlsson@avarn.se",
  instruktorVast: "peter.nyman@avarn.se",
  regional: "karin.dahl@avarn.se",
  nationell: "magnus.oberg@avarn.se",
  admin: "admin@avarn.se",
};

export async function loggaIn(page: Page, epost: string) {
  // Rensar en eventuell tidigare session – annars skickar proxyn oss vidare
  // till /hem i stället för att visa inloggningsformuläret.
  await page.context().clearCookies();
  await page.goto("/login");
  await page.fill('input[name="email"]', epost);
  await page.fill('input[name="password"]', LOSENORD);
  await Promise.all([
    page.waitForURL(/\/(hem|nekad)/),
    page.click('button[type="submit"]'),
  ]);
}
