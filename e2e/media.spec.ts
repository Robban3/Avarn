import path from "node:path";
import { expect, test } from "@playwright/test";
import { KONTON, loggaIn } from "./hjalp";

const HAR = path.join(process.cwd(), "e2e");

/**
 * Hela kedjan för bilagor: uppladdning, visning och att filen inte lämnas
 * ut till någon utanför behörigheten.
 */
test("bild kan laddas upp till ett träningspass och visas", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);

  // Ett pass som ännu inte är godkänt går att komplettera med bilder.
  // Länkarna till /nytt och /plan i sidhuvudet hoppas över.
  await page.goto("/traning?status=SUBMITTED");
  const hrefs = await page
    .locator('a[href^="/traning/"]')
    .evaluateAll((element) => element.map((e) => e.getAttribute("href") ?? ""));
  const passUrl = hrefs.find(
    (h) => !h.endsWith("/nytt") && !h.endsWith("/plan"),
  );
  expect(passUrl).toBeTruthy();
  await page.goto(passUrl!);

  await page.setInputFiles(
    'input[type="file"]',
    path.join(HAR, "testbild.png"),
  );

  // Bilden dyker upp som en länk till den skyddade utlämningsvägen.
  const bild = page.locator('a[href^="/api/media/"]').first();
  await expect(bild).toBeVisible({ timeout: 15_000 });

  const href = await bild.getAttribute("href");
  expect(href).toBeTruthy();

  // Ägaren får hämta filen.
  const egen = await page.request.get(href!);
  expect(egen.status()).toBe(200);
  expect(egen.headers()["content-type"]).toContain("image/png");

  // Men inte en förare i en annan region.
  await loggaIn(page, KONTON.hundforareVast);
  const annan = await page.request.get(href!);
  expect(annan.status()).toBe(404);

  // Utloggad släpps inte heller in.
  await page.context().clearCookies();
  const utloggad = await page.request.get(href!);
  expect(utloggad.status()).toBe(401);

});
