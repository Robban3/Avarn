import { expect, test } from "@playwright/test";
import { KONTON, loggaIn } from "./hjalp";

/**
 * Den operativa vyn: hela slingan från att uppdraget startas till att
 * rapporten öppnas med det som registrerats på plats.
 *
 * Proven bygger sitt eget uppdrag. Ett påbörjat uppdrag går aldrig
 * tillbaka till planerat, så ett prov som startar ett uppdrag ur
 * exempeldatan kan bara köras en gång.
 */

const vantaPaUppdrag = (page: import("@playwright/test").Page) =>
  page.waitForURL(
    (url) =>
      /^\/uppdrag\/[^/]+$/.test(url.pathname) &&
      !url.pathname.endsWith("/nytt"),
  );

/** Lägger upp ett uppdrag, låter Erik acceptera det och startar det. */
async function startatUppdrag(
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
  await page.fill('input[name="koordinater"]', "59.3293, 18.0686");
  await page.fill('input[name="missionArea"]', "Terminal 5, Bagagehall");

  // Eget tidsfönster långt fram, så att ekipagen inte är upptagna av ett
  // uppdrag en tidigare körning lade på samma tid. Varje provfil har sitt
  // eget fönster; delade de ett skulle de göra varandra upptagna.
  const dag = new Date();
  dag.setDate(dag.getDate() + 800 + (Date.now() % 240));
  await page.fill('input[name="date"]', dag.toISOString().slice(0, 10));

  await page.getByRole("button", { name: "Lägg upp uppdraget" }).click();
  await vantaPaUppdrag(page);
  const uppdrag = new URL(page.url()).pathname;

  await page
    .getByRole("button", { name: /^Tilldela (Nova|Rex)$/ })
    .first()
    .click();
  await expect(page.getByText("Erbjudet").first()).toBeVisible();

  await loggaIn(page, KONTON.hundforare);
  await page.goto(uppdrag);
  await page.getByRole("button", { name: "Acceptera" }).click();
  await expect(page.getByText("Accepterat").first()).toBeVisible();

  // Start sker från platsfliken och leder rakt in i den operativa vyn.
  await page.goto(`${uppdrag}/detaljer?flik=plats`);
  await page.getByRole("button", { name: "Starta uppdrag" }).click();
  await page.waitForURL(/\/pagaende$/);

  return uppdrag;
}

test("starten leder rakt in i den operativa vyn", async ({ page }) => {
  await startatUppdrag(page, `Operativ ${Date.now()}`);

  await expect(page.getByText("Pågående").first()).toBeVisible();
  await expect(page.getByText("Områdessök").first()).toBeVisible();
  await expect(page.getByText("Uppdragstid").first()).toBeVisible();
  // Klockan går som en klocka, med samma bredd hela tiden.
  await expect(page.getByText(/^00:00:\d\d$/)).toBeVisible();
  await expect(page.getByText("Beräknad tid")).toBeVisible();
  // Ekipaget som faktiskt är på plats, inte bara uppdraget.
  await expect(page.getByText(/Erik Andersson/).first()).toBeVisible();
  // Uppdragsområdet ritas på kartan i den här vyn, inte som text.
  await expect(page.getByText("Karta och uppdragsområde")).toBeVisible();
  await expect(page.getByRole("img", { name: /^Karta över/ })).toBeVisible();
});

test("en markering registreras med ett tryck", async ({ page }) => {
  await startatUppdrag(page, `Markering ${Date.now()}`);

  const markering = page.getByRole("button", { name: "Registrera markering" });
  const fynd = page.getByRole("button", { name: "Registrera fynd" });

  // Räknaren sitter på knappen, som i underlaget.
  await expect(markering).toContainText("0");
  await markering.click();
  await expect(markering).toContainText("1");

  await fynd.click();
  await expect(fynd).toContainText("1");

  // Ett feltryck ska gå att ta bort igen.
  await page.getByRole("button", { name: /^Visa registrerade/ }).click();
  await page
    .getByRole("button", { name: /^Ta bort Fynd/ })
    .first()
    .click();
  await expect(fynd).toContainText("0");
});

test("en händelse med text hamnar i listan", async ({ page }) => {
  await startatUppdrag(page, `Händelse ${Date.now()}`);

  await page.getByRole("button", { name: "Ny händelse" }).click();
  await page.selectOption('select[name="kind"]', "DEVIATION");
  await page.fill('textarea[name="note"]', "Port 4 gick inte att öppna.");
  await page.getByRole("button", { name: "Registrera", exact: true }).click();

  await page.getByRole("button", { name: /^Visa registrerade/ }).click();
  await expect(page.getByText("Port 4 gick inte att öppna.")).toBeVisible();
  await expect(page.getByText("Avvikelse").first()).toBeVisible();
});

test("genomsökt andel och checklista räknas upp", async ({ page }) => {
  await startatUppdrag(page, `Framdrift ${Date.now()}`);

  // Mätaren själv, inte knapparnas etiketter – båda innehåller "10 %".
  const andel = page.getByRole("progressbar", { name: "Genomsökt område" });
  await expect(andel).toHaveAttribute("aria-valuenow", "0");
  await page
    .getByRole("button", { name: "Öka genomsökt område med tio procent" })
    .click();
  await expect(andel).toHaveAttribute("aria-valuenow", "10");

  // Andelen kan inte gå under noll.
  for (let i = 0; i < 3; i += 1) {
    await page
      .getByRole("button", { name: "Minska genomsökt område med tio procent" })
      .click();
  }
  await expect(andel).toHaveAttribute("aria-valuenow", "0");

  await expect(page.getByText("0 / 6 klara")).toBeVisible();
  await page.getByRole("button", { name: "Säkerhetsgenomgång" }).click();
  await expect(page.getByText("1 / 6 klara")).toBeVisible();
  await page.getByRole("button", { name: "Utrustning kontrollerad" }).click();
  await expect(page.getByText("2 / 6 klara")).toBeVisible();

  // Avbockningen syns också på uppdragets checklistflik.
  const uppdrag = new URL(page.url()).pathname.replace("/pagaende", "");
  await page.goto(`${uppdrag}/detaljer?flik=checklista`);
  await expect(page.getByText("2 av 6 punkter avbockade")).toBeVisible();
});

test("avslut ger en sammanställning och en förifylld rapport", async ({
  page,
}) => {
  const uppdrag = await startatUppdrag(page, `Avslut ${Date.now()}`);

  await page.getByRole("button", { name: "Registrera markering" }).click();
  await page.getByRole("button", { name: "Ny händelse" }).click();
  await page.selectOption('select[name="kind"]', "FIND");
  await page.fill('textarea[name="note"]', "1 paket – Narkotika (Cannabis)");
  await page.getByRole("button", { name: "Registrera", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /^Visa registrerade \(2\)/ }),
  ).toBeVisible();

  // Steg ett: sammanställningen, innan något är avslutat.
  await page.getByRole("button", { name: "Avsluta uppdrag" }).click();
  await expect(page.getByText("Avsluta uppdraget?")).toBeVisible();
  // Sammanställningen räknar upp det som registrerats.
  const ruta = page.locator("div", { hasText: "Avsluta uppdraget?" }).last();
  await expect(ruta.getByText("Markering", { exact: true })).toBeVisible();

  // Steg två: bekräftelsen leder till rapporten.
  await page.getByRole("button", { name: "Avsluta och rapportera" }).click();
  await page.waitForURL(/\/rapporter\/nytt\?uppdrag=/);

  // Det som registrerades på plats ska redan stå i rapporten.
  await expect(page.locator('textarea[name="findings"]')).toHaveValue(
    /1 paket – Narkotika \(Cannabis\)/,
  );
  await expect(page.locator('textarea[name="areasSearched"]')).toHaveValue(
    "Terminal 5, Bagagehall",
  );
  await expect(
    page.locator('input[name="indication-0-description"]'),
  ).toHaveValue(/Registrerad \d\d:\d\d/);

  // Uppdraget är avslutat för förarens del: vyn finns inte kvar att gå
  // tillbaka till.
  await page.goto(`${uppdrag}/pagaende`);
  await expect(page).toHaveURL(new RegExp(`${uppdrag}$`));
});

test("en annan förare når inte den operativa vyn", async ({ page }) => {
  const uppdrag = await startatUppdrag(page, `Behörighet ${Date.now()}`);

  await loggaIn(page, KONTON.hundforareVast);
  const svar = await page.goto(`${uppdrag}/pagaende`);
  expect(svar?.status()).toBe(404);
});

test("instruktören kan inte registrera händelser på förarens uppdrag", async ({
  page,
}) => {
  const uppdrag = await startatUppdrag(page, `Instruktör ${Date.now()}`);

  // Instruktören ser ekipaget, men den operativa vyn är förarens egen.
  await loggaIn(page, KONTON.instruktor);
  const svar = await page.goto(`${uppdrag}/pagaende`);
  expect(svar?.status()).toBe(404);
});
