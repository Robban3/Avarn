import { expect, test } from "@playwright/test";
import { KONTON, loggaIn } from "./hjalp";

/**
 * Kalendern: månadsvyn som huvudvy, dagens lista, veckovyn och
 * dubbelbokningen som ska synas där månadens prickar döljer den.
 *
 * Proven lägger upp sina egna uppdrag på ett eget datum långt fram, så
 * att sviten går att köra om utan att seed-datan laddas om.
 */

/** Ett datum en bit fram i tiden, unikt för körningen. */
function provdag() {
  const dag = new Date();
  dag.setDate(dag.getDate() + 600 + (Date.now() % 240));
  return dag.toISOString().slice(0, 10);
}

/** Lägger upp ett uppdrag och tilldelar det Eriks ekipage. */
async function laggUppUppdrag(
  page: import("@playwright/test").Page,
  {
    rubrik,
    datum,
    start,
    slut,
  }: { rubrik: string; datum: string; start: string; slut: string },
) {
  await page.goto("/uppdrag/nytt");

  await expect(async () => {
    await page.fill('input[name="title"]', rubrik);
    await expect(page.locator('input[name="title"]')).toHaveValue(rubrik);
  }).toPass({ timeout: 15_000 });

  await page.fill('input[name="missionType"]', "Områdessök");
  await page.fill('input[name="locality"]', "Provorten");
  await page.selectOption('select[name="disciplineId"]', { label: "Narkotika" });
  await page.fill('input[name="date"]', datum);
  await page.fill('input[name="startTime"]', start);
  await page.fill('input[name="endTime"]', slut);

  await page.getByRole("button", { name: "Lägg upp uppdraget" }).click();
  await page.waitForURL(
    (url) =>
      /^\/uppdrag\/[^/]+$/.test(url.pathname) &&
      !url.pathname.endsWith("/nytt"),
  );

  await page
    .getByRole("button", { name: /^Tilldela (Nova|Rex)$/ })
    .first()
    .click();
  await expect(page.getByText("Erbjudet").first()).toBeVisible({
    timeout: 15_000,
  });
}

test("månadsvyn är huvudvyn och visar dagens lista", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);
  await page.goto("/kalender");

  // Månad är den vy man landar i, utan att välja något.
  await expect(
    page.getByRole("link", { name: "Månad", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  // Veckodagsrubrikerna står med måndag först.
  await expect(page.getByText("Uppdrag", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Otillgänglig", { exact: true })).toBeVisible();

  // Dagen som är vald är dagens datum, och rubriken under rutnätet
  // stämmer med den.
  const idag = new Date();
  const rubrik = new Intl.DateTimeFormat("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Stockholm",
  }).format(idag);
  await expect(
    page.getByText(rubrik.charAt(0).toUpperCase() + rubrik.slice(1)),
  ).toBeVisible();
});

test("en dag utan poster visar det tomma läget", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);
  // Ett datum långt fram där ingenting är inplanerat.
  await page.goto("/kalender?dag=2030-06-12&vy=manad");

  await expect(page.getByText("Onsdag 12 juni")).toBeVisible();
  await expect(page.getByText("Inget inplanerat")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Sätt tillgänglighet/ }),
  ).toBeVisible();
});

test("månadspilarna byter månad", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);
  await page.goto("/kalender?dag=2026-09-15&vy=manad");

  await expect(page.getByRole("heading", { name: "September 2026", level: 2 })).toBeVisible();
  await page.getByRole("link", { name: "Nästa månad" }).click();
  await expect(page.getByRole("heading", { name: "Oktober 2026", level: 2 })).toBeVisible();
  await page.getByRole("link", { name: "Föregående månad" }).click();
  await expect(page.getByRole("heading", { name: "September 2026", level: 2 })).toBeVisible();
});

test("veckovyn ritar krockande uppdrag sida vid sida", async ({ page }) => {
  const datum = provdag();
  // Rubrikerna är körningens egna, så att en tidigare körnings uppdrag på
  // samma vecka inte räknas med bland blocken.
  const stampel = Date.now();
  const forsta = `Krock A ${stampel}`;
  const andra = `Krock B ${stampel}`;

  await loggaIn(page, KONTON.regional);
  await laggUppUppdrag(page, {
    rubrik: forsta,
    datum,
    start: "13:00",
    slut: "15:00",
  });
  await laggUppUppdrag(page, {
    rubrik: andra,
    datum,
    start: "13:30",
    slut: "15:30",
  });

  await loggaIn(page, KONTON.hundforare);
  await page.goto(`/kalender?dag=${datum}&vy=vecka`);

  await expect(
    page.getByRole("link", { name: "Vecka", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  // Båda blocken finns, och de är halva kolumnen breda var – det är den
  // dubbelbokning veckovyn finns till för att visa.
  const block = page.locator(
    `a[title^="${forsta}"], a[title^="${andra}"]`,
  );
  await expect(block).toHaveCount(2);

  const bredder = await block.evaluateAll((noder) =>
    noder.map((n) => n.getBoundingClientRect().width),
  );
  const kolumnbredd = await page
    .locator(`a[title^="${forsta}"]`)
    .evaluate((n) => (n.parentElement?.getBoundingClientRect().width ?? 0) / 7);
  for (const bredd of bredder) {
    expect(bredd).toBeLessThan(kolumnbredd * 0.7);
  }

  // Och krocken skrivs ut i klartext under rutnätet.
  await expect(
    page.getByText(`${forsta} och ${andra} krockar 13:30–15:00.`),
  ).toBeVisible();
});

test("veckovyn kan bytas till månad och tillbaka", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);
  await page.goto("/kalender?dag=2026-09-24&vy=manad");

  await page.getByRole("link", { name: "Vecka", exact: true }).click();
  await expect(page.getByRole("heading", { name: /^Vecka 39/, level: 2 })).toBeVisible();

  await page.getByRole("link", { name: "Månad", exact: true }).click();
  await expect(page.getByRole("heading", { name: "September 2026", level: 2 })).toBeVisible();
});

test("kalendern visar bara det egna ekipagets poster", async ({ page }) => {
  const datum = provdag();
  const rubrik = `Kalender Öst ${Date.now()}`;

  await loggaIn(page, KONTON.regional);
  await laggUppUppdrag(page, { rubrik, datum, start: "09:00", slut: "11:00" });

  // Erik i Öst ser uppdraget hans ekipage tilldelats.
  await loggaIn(page, KONTON.hundforare);
  await page.goto(`/kalender?dag=${datum}&vy=manad`);
  await expect(page.getByText(rubrik)).toBeVisible();

  // Johan i Väst ser det inte.
  await loggaIn(page, KONTON.hundforareVast);
  await page.goto(`/kalender?dag=${datum}&vy=manad`);
  await expect(page.getByText(rubrik)).toHaveCount(0);
});

test("ett datum som inte finns faller tillbaka på idag", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);
  await page.goto("/kalender?dag=2026-02-31");

  // Ingen krasch, och rubriken visar innevarande månad.
  const idag = new Date();
  const manad = new Intl.DateTimeFormat("sv-SE", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Stockholm",
  }).format(idag);
  const rubrik = manad.charAt(0).toUpperCase() + manad.slice(1);
  await expect(page.getByRole("heading", { name: rubrik, level: 2 })).toBeVisible();
});

test("kalendern nås från Mer och från startsidan", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);

  await page.goto("/mer");
  await page.getByRole("link", { name: "Kalender" }).click();
  await page.waitForURL(/\/kalender/);

  await page.goto("/hem");
  await page.getByRole("link", { name: /^Idag/ }).click();
  await page.waitForURL(/\/kalender/);
});
