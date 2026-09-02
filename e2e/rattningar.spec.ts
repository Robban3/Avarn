import { expect, test } from "@playwright/test";
import { KONTON, loggaIn } from "./hjalp";

/**
 * Prov för fel som inte syns i gränssnittet: en notisstorm som byggs upp
 * över dygn, två uppdrag som får samma nummer, och en avstängd användare
 * som ändå är kvar.
 */

const CRON_NYCKEL = process.env.CRON_KEY ?? "utveckling-cron-nyckel";

test("cron-jobbet skapar inga dubbletter vid andra körningen", async ({
  request,
}) => {
  const kor = async () => {
    const svar = await request.post("/api/cron/paminnelser", {
      headers: { "x-cron-key": CRON_NYCKEL },
    });
    expect(svar.ok()).toBe(true);
    return (await svar.json()) as { granskade: number; skapade: number };
  };

  // Första körningen får skapa notiser – hur många beror på exempeldatan.
  const forsta = await kor();
  expect(forsta.granskade).toBeGreaterThan(0);

  // Andra körningen är poängen: avdubbleringen byggde tidigare på texten,
  // och texten innehåller antal dagar kvar. Varje dygn gav nya notiser.
  const andra = await kor();
  expect(andra.skapade).toBe(0);
});

test("två uppdrag i rad får olika referensnummer", async ({ page }) => {
  await loggaIn(page, KONTON.regional);

  const skapa = async (rubrik: string) => {
    await page.goto("/uppdrag/nytt");
    await page.fill('input[name="title"]', rubrik);
    await page.fill('input[name="missionType"]', "Områdessök");
    await page.fill('input[name="locality"]', "Provorten");
    await page.getByRole("button", { name: "Lägg upp uppdraget" }).click();
    await page.waitForURL(/\/uppdrag\/[^/]+$/);
    const referens = await page.getByText(/UPP-\d+/).first().innerText();
    return referens.match(/UPP-\d+/)?.[0];
  };

  // Numret räknades tidigare fram ur antalet uppdrag, vilket gav samma
  // referens två gånger så snart ett uppdrag hade raderats.
  const forsta = await skapa("Provuppdrag ett");
  const andra = await skapa("Provuppdrag två");

  expect(forsta).toBeTruthy();
  expect(andra).toBeTruthy();
  expect(forsta).not.toBe(andra);
});

test("avstängd användare med giltig kaka släpps inte in", async ({
  browser,
}) => {
  const forare = await browser.newContext();
  const administrator = await browser.newContext();

  try {
    const forarsida = await forare.newPage();
    await loggaIn(forarsida, KONTON.hundforareVast);
    await expect(forarsida).toHaveURL(/\/hem/);

    // Kontot stängs av medan föraren har en giltig session. Rollen ligger i
    // en kaka som lever i tolv timmar – utan uppslagning mot databasen
    // hade föraren behållit sina rättigheter till dess.
    const adminsida = await administrator.newPage();
    await loggaIn(adminsida, KONTON.admin);
    await adminsida.goto("/panel/anvandare");
    const rad = adminsida.locator("tr", {
      hasText: KONTON.hundforareVast,
    });
    await rad.getByRole("button", { name: "Stäng av" }).click();
    await expect(rad.getByRole("button", { name: "Aktivera" })).toBeVisible();

    // Nästa sidladdning ska landa på inloggningen, inte på startsidan.
    await forarsida.goto("/hem");
    await expect(forarsida).toHaveURL(/\/login/);

    // Städa upp så att provet går att köra om utan ny seed.
    await rad.getByRole("button", { name: "Aktivera" }).click();
    await expect(rad.getByRole("button", { name: "Stäng av" })).toBeVisible();
  } finally {
    await forare.close();
    await administrator.close();
  }
});
