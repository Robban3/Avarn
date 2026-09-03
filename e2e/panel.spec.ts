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

/**
 * En inställning är bara en inställning om den slår igenom någon
 * annanstans. Proven nedan ändrar ett värde och kontrollerar effekten på
 * en annan sida, inte att formuläret ser ut att spara.
 */

test("varningsgränsen slår igenom på certifikatsidan", async ({ page }) => {
  await loggaIn(page, KONTON.admin);
  await page.goto("/panel/installningar");

  const falt = page.getByLabel("Varning före certifikat går ut");
  await expect(falt).toHaveValue("60");

  await falt.fill("20");
  await falt.locator("xpath=ancestor::form").getByRole("button", { name: "Spara" }).click();
  await expect(page.getByText("Varning före certifikat går ut sparad.")).toBeVisible();

  await page.goto("/panel/certifikat");
  // Gränsen syns både i underrubriken och i kortets rubrik – båda ska följa
  // med, så leta upp den ena uttryckligen i stället för att matcha brett.
  await expect(
    page.getByRole("heading", { name: /Går ut inom 20 dagar/ }),
  ).toBeVisible();

  // Tillbaka till standard, så att provet inte färgar av sig på nästa.
  await page.goto("/panel/installningar");
  await page
    .getByLabel("Varning före certifikat går ut")
    .locator("xpath=ancestor::div[1]")
    .getByRole("button", { name: "Återställ till standard" })
    .click();
  await expect(page.getByText(/återställd till 60/)).toBeVisible();

  await page.goto("/panel/certifikat");
  await expect(
    page.getByRole("heading", { name: /Går ut inom 60 dagar/ }),
  ).toBeVisible();
});

test("en ny sökmiljö dyker upp i förarens formulär", async ({ page }) => {
  await loggaIn(page, KONTON.admin);
  await page.goto("/panel/installningar");

  // Hela listan skrivs, inte "det som står plus en rad till": ett prov
  // som läser, ändrar och skriver tillbaka blir beroende av vad som råkar
  // stå i rutan, och kan inte köras om.
  //
  // Ifyllningen görs om tills värdet sitter kvar. Skrivs det innan sidans
  // JavaScript hunnit ta över fältet skriver React tillbaka utgångsvärdet
  // ovanpå – det som händer om man är snabbare än sidladdningen.
  const NYA_MILJOER = "Skog\nÖppen mark\nHamnområde";
  const ruta = page.getByLabel("Sökmiljöer");
  await expect(async () => {
    await ruta.fill(NYA_MILJOER);
    await expect(ruta).toHaveValue(NYA_MILJOER);
  }).toPass({ timeout: 15_000 });
  await ruta.locator("xpath=ancestor::form").getByRole("button", { name: "Spara" }).click();
  await expect(page.getByText("Sökmiljöer sparad.")).toBeVisible();

  // Vänta tills sidan visar att värdet avviker från standard – då är
  // skrivningen klar, och provet mäter genomslaget och inte hur snabb
  // maskinen råkar vara.
  await page.reload();
  await expect(
    page.getByLabel("Sökmiljöer").locator("xpath=ancestor::div[1]"),
  ).toContainText("Ändrad av");

  await loggaIn(page, KONTON.hundforare);
  await page.goto("/traning/nytt");
  // Sökmiljön är ett fritextfält med förslag i en datalist, inte en select.
  await expect(
    page.locator('datalist#environments option[value="Hamnområde"]'),
  ).toHaveCount(1);

  await loggaIn(page, KONTON.admin);
  await page.goto("/panel/installningar");
  await page
    .getByLabel("Sökmiljöer")
    .locator("xpath=ancestor::div[1]")
    .getByRole("button", { name: "Återställ till standard" })
    .click();
  await expect(page.getByText(/Sökmiljöer återställd/)).toBeVisible();
});

test("regionchefen når inte inställningarna", async ({ page }) => {
  await loggaIn(page, KONTON.regional);
  await page.goto("/panel/installningar");
  await expect(page).toHaveURL(/\/nekad/);
});

test("kartan ritas ur riktiga länsgränser", async ({ page }) => {
  await loggaIn(page, KONTON.admin);
  await page.goto("/panel/regioner");

  const banor = page.locator('svg[aria-label="Ekipage per region"] path');
  await expect(banor).toHaveCount(5);

  // En trasig generering ger tomma eller stympade banor – det ska fångas
  // här och inte upptäckas med ögat på en skärmbild.
  for (let i = 0; i < 5; i += 1) {
    const d = await banor.nth(i).getAttribute("d");
    expect((d ?? "").length).toBeGreaterThan(500);
  }
});
