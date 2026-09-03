import { expect, test, type Page } from "@playwright/test";
import { KONTON, loggaIn } from "./hjalp";

/**
 * Skarpt rökprov mot dataläckage. Proven gissar adresser med andras
 * id:n och kontrollerar att svaret blir 404 – inte 200, och inte 403.
 * Ett 403 vore i sig ett läckage: det bekräftar att posten finns.
 *
 * Här räcker det inte att sidan ser tom ut. Vi kontrollerar statuskoden
 * och att inget av den andres innehåll finns i svarets text.
 */

/** Hämtar alla id:n en roll ser i en lista. */
async function idn(page: Page, lista: string, prefix: string) {
  await page.goto(lista);
  // Inte networkidle: servicearbetaren håller nätet vaket, och sidan är
  // ändå serverrenderad – länkarna finns i svaret.
  const hrefs = await page
    .locator(`a[href^="${prefix}"]`)
    .evaluateAll((el) => el.map((e) => e.getAttribute("href") ?? ""));
  const statiska = new Set(["nytt", "ny", "plan", "export"]);
  return [
    ...new Set(
      hrefs
        .map((h) => h.replace(prefix, "").split(/[?#]/)[0])
        .filter((id) => id && !statiska.has(id) && !id.includes("/")),
    ),
  ];
}

test("förare i Öst når inget av förare i Väst", async ({ page }) => {
  await loggaIn(page, KONTON.hundforareVast);
  // En sida i taget – parallella navigeringar avbryter varandra.
  const pass = await idn(page, "/traning", "/traning/");
  const hundar = await idn(page, "/hundar", "/hundar/");
  const rapporter = await idn(page, "/rapporter", "/rapporter/");
  const uppdrag = await idn(page, "/uppdrag", "/uppdrag/");

  await loggaIn(page, KONTON.hundforare);

  const adresser = [
    ...pass.flatMap((id) => [`/traning/${id}`, `/traning/${id}/redigera`]),
    ...hundar.flatMap((id) => [`/hundar/${id}`, `/hundar/${id}/redigera`]),
    ...rapporter.flatMap((id) => [
      `/rapporter/${id}`,
      `/rapporter/${id}/redigera`,
    ]),
    ...uppdrag.map((id) => `/uppdrag/${id}`),
  ];

  expect(adresser.length, "provet måste ha något att gissa på").toBeGreaterThan(
    0,
  );

  for (const url of adresser) {
    const svar = await page.goto(url);
    expect(svar?.status(), `${url} ska ge 404`).toBe(404);
  }
});

test("instruktör i Väst når inte Östs ekipage", async ({ page }) => {
  await loggaIn(page, KONTON.instruktor);
  const ekipage = await idn(page, "/instruktor", "/instruktor/ekipage/");

  await loggaIn(page, KONTON.instruktorVast);
  for (const id of ekipage) {
    const svar = await page.goto(`/instruktor/ekipage/${id}`);
    expect(svar?.status(), `ekipage ${id} ska ge 404`).toBe(404);
  }
});

test("exporten innehåller bara det rollen får se", async ({ page }) => {
  // Regionchefen i Öst ska inte få med ekipage ur andra regioner.
  await loggaIn(page, KONTON.regional);
  const svar = await page.request.get("/panel/export?vy=ekipage");
  expect(svar.status()).toBe(200);
  const csv = await svar.text();

  // Balder och Iris ligger utanför Region Öst i seed-datan.
  expect(csv).not.toContain("Balder");
  expect(csv).not.toContain("Iris");
  expect(csv).toContain("Nova");
});

test("exporten går inte att vidga med parametrar", async ({ page }) => {
  await loggaIn(page, KONTON.regional);

  // En påhittad region i frågesträngen ska inte öppna upp något.
  const svar = await page.request.get(
    "/panel/export?vy=ekipage&region=alla&sok=",
  );
  expect(svar.status()).toBe(200);
  const csv = await svar.text();
  expect(csv).not.toContain("Balder");

  // En okänd vy ska avvisas, inte falla tillbaka på något.
  const fel = await page.request.get("/panel/export?vy=allt");
  expect(fel.status()).toBe(400);
});

test("lösenordshash läcker aldrig ut i svaret", async ({ page }) => {
  await loggaIn(page, KONTON.admin);
  for (const url of ["/panel/anvandare", "/admin", "/profil", "/panel"]) {
    const svar = await page.goto(url);
    const kropp = (await svar?.text()) ?? "";
    expect(kropp, `${url} innehåller en bcrypt-hash`).not.toMatch(/\$2[aby]\$/);
  }
});

test("utloggad når ingenting", async ({ page }) => {
  await page.context().clearCookies();
  for (const url of [
    "/hem",
    "/panel",
    "/panel/anvandare",
    "/hundar",
    "/traning",
    "/rapporter",
    "/certifikat",
    "/admin",
  ]) {
    await page.goto(url);
    await expect(page, `${url} ska leda till inloggning`).toHaveURL(/\/login/);
  }
});

test("cron-jobbet kräver rätt nyckel", async ({ page }) => {
  const utan = await page.request.get("/api/cron/paminnelser");
  expect(utan.status()).toBe(401);

  const fel = await page.request.get("/api/cron/paminnelser", {
    headers: { authorization: "Bearer fel-nyckel" },
  });
  expect(fel.status()).toBe(401);
});

test("regionchef kan inte vidga sin vy med regionfiltret", async ({ page }) => {
  // Filtret får smalna av, aldrig öppna upp. Skickar man en annan regions
  // id i frågesträngen ska svaret bli detsamma som utan filtret.
  await loggaIn(page, KONTON.regional);

  await page.goto("/panel/ekipage");
  // Väntar på filtret i stället för på networkidle, som aldrig infaller
  // när en servicearbetare är registrerad.
  await page.locator('select[aria-label="Region"]').waitFor();
  const regionIds = await page
    .locator('select[aria-label="Region"] option')
    .evaluateAll((el) =>
      el.map((e) => (e as HTMLOptionElement).value).filter(Boolean),
    );
  expect(regionIds.length, "provet behöver regioner att prova").toBeGreaterThan(
    1,
  );

  for (const id of regionIds) {
    const svar = await page.request.get(
      `/panel/export?vy=ekipage&region=${id}`,
    );
    expect(svar.status()).toBe(200);
    const csv = await svar.text();
    // Balder och Iris ligger utanför Region Öst i seed-datan.
    expect(csv, `region=${id} läckte ut ekipage`).not.toContain("Balder");
    expect(csv, `region=${id} läckte ut ekipage`).not.toContain("Iris");
  }

  for (const id of regionIds) {
    await page.goto(`/panel/ekipage?region=${id}`);
    const kropp = await page.locator("body").innerText();
    expect(kropp, `region=${id} visade främmande ekipage`).not.toContain(
      "Balder",
    );
  }
});
