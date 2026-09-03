import { expect, test } from "@playwright/test";
import { KONTON, loggaIn } from "./hjalp";

/**
 * Sökningen över hela systemet.
 *
 * Det viktigaste provet är det sista: sökningen får aldrig visa något
 * användaren inte redan når genom sin egen modul.
 */

test("tomma läget visar snabbfilter och en förklaring", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);
  await page.goto("/sok");

  await expect(page.getByPlaceholder("Sök uppdrag, hund, rapport…")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Snabbfilter" })).toBeVisible();
  for (const etikett of [
    "Uppdrag",
    "Hundar",
    "Ekipage",
    "Träning",
    "Rapporter",
    "Certifikat",
  ]) {
    await expect(
      page.getByRole("main").getByRole("link", { name: etikett, exact: true }),
    ).toBeVisible();
  }

  // Ett enda tecken räcker inte till en sökning.
  await page.goto("/sok?q=n");
  await expect(page.getByRole("heading", { name: "Snabbfilter" })).toBeVisible();
});

test("en sökning grupperas per typ med raderna från respektive modul", async ({
  page,
}) => {
  await loggaIn(page, KONTON.hundforare);
  await page.goto("/sok?q=nova");

  // Hundraden ser ut som på hundlistan: namn, ras, ålder och status.
  const hundar = page.locator("section", { has: page.getByRole("heading", { name: "Hundar" }) });
  await expect(hundar.getByRole("heading", { name: "Nova" })).toBeVisible();
  await expect(hundar.getByText("AKTIV")).toBeVisible();
  await expect(hundar.getByText(/år$/)).toBeVisible();

  // Ekipaget står som förare och hund tillsammans.
  const ekipage = page.locator("section", {
    has: page.getByRole("heading", { name: "Ekipage" }),
  });
  await expect(ekipage.getByText(/Erik Andersson & Nova/)).toBeVisible();
});

test("sökningen hittar ett uppdrag på ort och på uppdragsnummer", async ({
  page,
}) => {
  await loggaIn(page, KONTON.hundforare);

  await page.goto("/sok?q=arlanda");
  const uppdrag = page.locator("section", {
    has: page.getByRole("heading", { name: "Uppdrag" }),
  });
  await expect(uppdrag.getByText("Arlanda").first()).toBeVisible();

  // Uppdragsnumret är det man har i handen när någon ringer.
  await expect(
    uppdrag.locator('a[href^="/uppdrag/"]').first(),
  ).toBeVisible();
});

test("en grupp går att visa i sin helhet och filtret går att ta bort", async ({
  page,
}) => {
  await loggaIn(page, KONTON.hundforare);
  // "sök" finns i varje träningsområde i exempeldatan.
  await page.goto("/sok?q=s%C3%B6k&typ=traning");

  // Filtret syns som en chip med kryss, och räknaren står bredvid.
  const chip = page.locator('a.chip', { hasText: "Träning" });
  await expect(chip).toBeVisible();
  await expect(page.getByText(/\d+ träff(ar)?/)).toBeVisible();

  await chip.click();
  await page.waitForURL(/\/sok\?q=s%C3%B6k$/);
});

test("jokertecken söks bokstavligt och träffar inte allt", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);

  // "%" och "_" är jokertecken i databasens LIKE. Görs de inte
  // bokstavliga träffar "%" varenda post, och "_o_a" hittar Nova.
  await page.goto("/sok?q=%25%25");
  await expect(page.getByText("Inga träffar")).toBeVisible();

  await page.goto("/sok?q=_o_a");
  await expect(page.getByText("Inga träffar")).toBeVisible();

  // Samma sak i rapportlistans egen sökning.
  await page.goto("/rapporter?q=%25%25");
  await expect(page.getByText("Inga träffar")).toBeVisible();
});

test("en sökning utan träffar säger det rakt ut", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);
  await page.goto("/sok?q=zzzfinnsinte");

  await expect(page.getByText("Inga träffar")).toBeVisible();
});

test("den senaste sökningen sparas i telefonen", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);
  await page.goto("/sok?q=nova");

  // Tillbaka till tomma läget: sökningen ligger kvar som en genväg.
  await page.goto("/sok");
  await expect(
    page.getByRole("heading", { name: "Senaste sökningar" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "nova", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Rensa" }).click();
  await expect(
    page.getByRole("heading", { name: "Senaste sökningar" }),
  ).toHaveCount(0);
});

test("sökningen når inte utanför behörigheten", async ({ page }) => {
  // Johan i Väst söker på Erik i Östs hund och ekipage.
  await loggaIn(page, KONTON.hundforareVast);
  await page.goto("/sok?q=nova");
  await expect(page.getByText("Inga träffar")).toBeVisible();

  // Och på ett uppdrag i Öst.
  await page.goto("/sok?q=arlanda");
  const uppdrag = page.locator("section", {
    has: page.getByRole("heading", { name: "Uppdrag" }),
  });
  await expect(uppdrag).toHaveCount(0);

  // Sin egen hund hittar han däremot.
  await page.goto("/sok?q=balder");
  await expect(page.getByRole("heading", { name: "Balder" })).toBeVisible();
});

test("söket nås från startsidan och från Mer", async ({ page }) => {
  await loggaIn(page, KONTON.hundforare);

  await page.goto("/hem");
  await page.getByRole("link", { name: "Sök", exact: true }).click();
  await page.waitForURL(/\/sok$/);

  await page.goto("/mer");
  await page.getByRole("link", { name: "Sök", exact: true }).click();
  await page.waitForURL(/\/sok$/);
});
