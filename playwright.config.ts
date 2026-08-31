import { defineConfig, devices } from "@playwright/test";

/**
 * Rökprov mot en körande utvecklingsserver. Chromium pekas ut explicit
 * eftersom webbläsaren är förinstallerad i miljön.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  reporter: [["list"]],
  use: {
    baseURL: process.env.BAS_URL ?? "http://localhost:3000",
    locale: "sv-SE",
    timezoneId: "Europe/Stockholm",
    launchOptions: { executablePath: "/opt/pw-browsers/chromium" },
  },
  projects: [
    {
      name: "mobil",
      use: { ...devices["Pixel 7"], launchOptions: { executablePath: "/opt/pw-browsers/chromium" } },
    },
  ],
});
