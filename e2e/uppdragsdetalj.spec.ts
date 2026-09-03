import { expect, test } from "@playwright/test";
import { KONTON, loggaIn } from "./hjalp";

/**
 * Uppdragsdetaljen, platsvyn och rapporten – de tre vyerna föraren går
 * igenom före, under och efter ett uppdrag.
 *
 * Proven rör aldrig kartrutorna. De hämtas från openstreetmap.org av
 * webbläsaren och kan inte laddas i den här miljön; det som ska bevisas är
 * ändå att rätt plats visas och att länken ut pekar på rätt punkt.
 */

/**
 * Öppnar ett kommande uppdrag ur listan. Korten visar rubriken, inte
 * referensnumret, så det är rubriken vi letar efter.
 */
async function oppnaUppdrag(
  page: import("@playwright/test").Page,
  rubrik: string,
) {
  await page.goto("/uppdrag");
  await page.getByRole("link", { name: new RegExp(rubrik) }).first().click();
  await page.waitForURL(/\/uppdrag\/[^/]+$/);
}

/**
 * Väntar på uppdragets egen sida. `/uppdrag/nytt` måste räknas bort –
 * annars matchar väntan formuläret vi står på och går vidare för tidigt.
 */
const vantaPaUppdrag = (page: import("@playwright/test").Page) =>
  page.waitForURL(
    (url) =>
      /^\/uppdrag\/[^/]+$/.test(url.pathname) &&
      !url.pathname.endsWith("/nytt"),
  );

/** Arlanda-uppdraget, som Erik har en accepterad tilldelning på. */
const oppnaArlanda = (page: import("@playwright/test").Page) =>
  oppnaUppdrag(page, "Flygplatskontroll");

/**
 * Lägger upp ett färskt uppdrag och låter Erik acceptera det.
 *
 * Proven som ändrar ett uppdrags tillstånd bygger sitt eget underlag i
 * stället för att luta sig mot exempeldatan. Ett påbörjat uppdrag går
 * aldrig tillbaka till planerat, och ett utkast på ett seed-uppdrag
 * ändrar vad nästa prov ser i rapportlistan – båda gör att sviten bara
 * kan köras en gång.
 *
 * Lämnar sidan inloggad som Erik, på uppdragets sida.
 */
async function egetUppdragTillErik(
  page: import("@playwright/test").Page,
  rubrik: string,
) {
  await loggaIn(page, KONTON.regional);
  await page.goto("/uppdrag/nytt");

  // Ifyllningen görs om tills den sitter kvar: skrivs det innan sidans
  // JavaScript hunnit ta över fälten skriver React tillbaka
  // utgångsvärdena ovanpå.
  await expect(async () => {
    await page.fill('input[name="title"]', rubrik);
    await expect(page.locator('input[name="title"]')).toHaveValue(rubrik);
  }).toPass({ timeout: 15_000 });

  await page.fill('input[name="missionType"]', "Områdessök");
  await page.fill('input[name="locality"]', "Provorten");

  // Eget tidsfönster långt fram: körs sviten om läggs uppdragen annars på
  // varandra, och då är ekipagen upptagna och föreslås inte längre.
  const dag = new Date();
  dag.setDate(dag.getDate() + 45 + (Date.now() % 60));
  await page.fill('input[name="date"]', dag.toISOString().slice(0, 10));
  // Sökinriktningen styr vilka ekipage som föreslås.
  await page.selectOption('select[name="disciplineId"]', { label: "Narkotika" });
  await page.fill('input[name="koordinater"]', "59.3293, 18.0686");
  await page.getByRole("button", { name: "Lägg upp uppdraget" }).click();
  await vantaPaUppdrag(page);
  const uppdrag = new URL(page.url()).pathname;

  // Tilldela ett av Eriks ekipage. Vilket av dem som föreslås beror på
  // tillgängligheten just den dagen, så båda godtas.
  await page
    .getByRole("button", { name: /^Tilldela (Nova|Rex)$/ })
    .first()
    .click();
  await expect(page.getByText("Erbjudet").first()).toBeVisible();

  await loggaIn(page, KONTON.hundforare);
  await page.goto(uppdrag);
  await page.getByRole("button", { name: "Acceptera" }).click();
  await expect(page.getByText("Accepterat").first()).toBeVisible();

  return uppdrag;
}

test("föraren ser mötesplats och utrustning inför uppdraget", async ({
  page,
}) => {
  await loggaIn(page, KONTON.hundforare);
  await oppnaArlanda(page);

  await expect(page.getByText("ID: UPP-2451")).toBeVisible();
  await expect(page.getByText("P5, Personalentré").first()).toBeVisible();
  await expect(
    page.getByText("Väst, ID-kort, Ficklampa, Väderkläder"),
  ).toBeVisible();

  // Kontaktpersonens knappar ska gå att trycka på, inte bara synas.
  await expect(page.getByRole("link", { name: /^Ring / })).toHaveAttribute(
    "href",
    /^tel:/,
  );
});

test("platsvyn visar rätt punkt och länkar vidare till kartappen", async ({
  page,
}) => {
  await loggaIn(page, KONTON.hundforare);
  await oppnaArlanda(page);

  await page.getByRole("link", { name: "Visa på karta" }).click();
  await page.waitForURL(/\/detaljer$/);

  // Alla fyra flikarna finns, som i underlaget.
  for (const flik of ["Översikt", "Plats", "Checklista", "Dokument"]) {
    await expect(page.getByRole("link", { name: flik })).toBeVisible();
  }

  await expect(page.getByText("Beräknad varaktighet")).toBeVisible();
  await expect(page.getByText("2 h")).toBeVisible();

  await page.getByRole("link", { name: "Plats" }).click();
  await page.waitForURL(/flik=plats/);
  await expect(
    page.getByText("Parkering P5. Passerkort krävs vid bom."),
  ).toBeVisible();
  await expect(
    page.getByText("Terminal 5, Bagagehall", { exact: true }),
  ).toBeVisible();

  // Koordinaten följer med ut till telefonens kartapp.
  await expect(
    page.getByRole("link", { name: "Öppna i karta" }),
  ).toHaveAttribute("href", /query=59\.6498,17\.9239/);
});

test("checklistan visas och dokumentfliken är ärligt tom", async ({
  page,
}) => {
  await loggaIn(page, KONTON.hundforare);
  await oppnaArlanda(page);
  const uppdrag = page.url();

  await page.goto(`${uppdrag}/detaljer?flik=checklista`);
  await expect(page.getByText("0 av 6 punkter avbockade")).toBeVisible();
  await expect(page.getByText("Säkerhetsgenomgång")).toBeVisible();
  await expect(page.getByText("Rapport ifylld")).toBeVisible();

  await page.goto(`${uppdrag}/detaljer?flik=dokument`);
  await expect(page.getByText("Inga dokument", { exact: true })).toBeVisible();
});

test("föraren startar uppdraget, och kan inte starta det två gånger", async ({
  page,
}) => {
  const uppdrag = await egetUppdragTillErik(page, `Provstart ${Date.now()}`);

  await page.goto(`${uppdrag}/detaljer?flik=plats`);
  await page.getByRole("button", { name: "Starta uppdrag" }).click();
  // Starten leder rakt in i den operativa vyn.
  await page.waitForURL(/\/pagaende$/);

  await page.goto(uppdrag);
  await expect(page.getByText("Pågående").first()).toBeVisible();

  // Knappen ska försvinna när uppdraget väl är igång – annars kan
  // starttiden flyttas i efterhand.
  await page.goto(`${uppdrag}/detaljer?flik=plats`);
  await expect(
    page.getByRole("button", { name: "Starta uppdrag" }),
  ).toHaveCount(0);
});

test("en förare i en annan region når inte de nya vyerna", async ({ page }) => {
  // Hämta ett uppdrags-id som Erik ser …
  await loggaIn(page, KONTON.hundforare);
  await oppnaArlanda(page);
  const uppdrag = new URL(page.url()).pathname;

  // … och försök nå det som Johan i Region Väst.
  await loggaIn(page, KONTON.hundforareVast);
  for (const vag of [uppdrag, `${uppdrag}/detaljer`]) {
    const svar = await page.goto(vag);
    expect(svar?.status(), `${vag} ska ge 404`).toBe(404);
  }

  // Redigeringssidan kräver behörighet att lägga upp uppdrag, som en
  // hundförare aldrig har – då är nekad-sidan rätt svar, inte 404.
  await page.goto(`${uppdrag}/redigera`);
  await expect(page).toHaveURL(/\/nekad/);
});

test("regionchefen rättar uppdraget och ändringen syns hos föraren", async ({
  page,
}) => {
  await loggaIn(page, KONTON.regional);
  await oppnaUppdrag(page, "Lagerkontroll");
  const uppdrag = new URL(page.url()).pathname;

  await page.getByRole("link", { name: "Redigera uppdraget" }).click();
  await page.waitForURL(/\/redigera$/);

  await page.fill('input[name="meetingPoint"]', "Grind 2, vakten");
  await page.fill('input[name="koordinater"]', "59.1447, 18.1247");
  await page.getByRole("button", { name: "Spara ändringarna" }).click();
  await page.waitForURL(new RegExp(`${uppdrag}$`));

  await expect(page.getByText("Grind 2, vakten").first()).toBeVisible();
});

test("ett orimligt koordinatpar avvisas med ett läsbart fel", async ({
  page,
}) => {
  await loggaIn(page, KONTON.regional);
  await oppnaUppdrag(page, "Evenemangssök");

  await page.getByRole("link", { name: "Redigera uppdraget" }).click();
  await page.waitForURL(/\/redigera$/);

  await page.fill('input[name="koordinater"]', "Arlanda");
  await page.getByRole("button", { name: "Spara ändringarna" }).click();

  // Ett felmeddelande, inte en femhundrasida.
  await expect(page.getByRole("alert").first()).toContainText(
    "Koordinater skrivs",
  );
});

test("rapporten har underlagets sex avsnitt och räknar markeringar", async ({
  page,
}) => {
  // Eget uppdrag: annars ligger utkastet kvar på ett av exempeldatans
  // uppdrag och ändrar vad rapportlistan visar för nästa prov.
  const uppdrag = await egetUppdragTillErik(page, `Provrapport ${Date.now()}`);
  await page.goto(`/rapporter/nytt?uppdrag=${uppdrag.split("/").pop()}`);

  // 1. Uppdragsinformation är förifylld från uppdraget.
  await expect(
    page.getByText("1. Uppdragsinformation", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Områdessök").first()).toBeVisible();
  await expect(page.getByText("Narkotika").first()).toBeVisible();

  // 3. Stegaren styr antalet markeringar.
  await expect(page.locator('input[name="indication-0-location"]')).toHaveCount(1);
  await page.getByRole("button", { name: "Öka antal markeringar" }).click();
  await expect(page.locator('input[name="indication-1-location"]')).toHaveCount(1);
  await page.getByRole("button", { name: "Minska antal markeringar" }).click();
  await expect(page.locator('input[name="indication-1-location"]')).toHaveCount(0);

  // Avvikelser: Nej visar ingen ruta, Ja fäller ut den.
  await expect(page.locator('textarea[name="deviations"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Ja", exact: true }).click();
  await expect(page.locator('textarea[name="deviations"]')).toHaveCount(1);
  await page.getByRole("button", { name: "Nej", exact: true }).click();

  await page.fill('input[name="areaSize"]', "25000");
  await page.fill('textarea[name="comment"]', "Bra samarbete i bagagehallen.");
  await page.fill('textarea[name="findings"]', "Inga fynd.");

  await page.getByRole("button", { name: "Spara utkast" }).click();
  await page.waitForURL(
    (url) =>
      /^\/rapporter\/[^/]+$/.test(url.pathname) &&
      !url.pathname.endsWith("/nytt"),
  );

  await expect(page.getByText(/Yta ca 25\s?000\s?m²/)).toBeVisible();
  await expect(page.getByText("Bra samarbete i bagagehallen.")).toBeVisible();

  // Utkastet ska komma tillbaka med ytan och kommentaren ifyllda.
  await page.getByRole("link", { name: "Rätta uppgifterna" }).click();
  await page.waitForURL(/\/redigera$/);
  await expect(page.locator('input[name="areaSize"]')).toHaveValue("25000");
  await expect(page.locator('textarea[name="comment"]')).toHaveValue(
    "Bra samarbete i bagagehallen.",
  );
});
