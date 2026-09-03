import "server-only";
import { cache } from "react";
import { db } from "./db";
import {
  CERT_WARNING_DAYS,
  MISSION_CHECKLIST,
  MISSION_TYPES,
  SEARCH_ENVIRONMENTS,
  TARGET_ODORS,
  TRAINING_AREAS,
} from "./domain";

/**
 * Verksamhetens inställningar. Ligger i databasen så att en administratör
 * kan ändra dem utan att någon rör koden; konstanterna i domain.ts är kvar
 * som standardvärden och gäller så länge ingen ändrat något.
 *
 * Driftens värden – databasadress, lagringsnycklar, cron-nyckeln – finns
 * inte här. De sätts vid driftsättning och kan inte ändras av en knapp i
 * en körande process.
 */

export type Settings = {
  certWarningDays: number;
  trainingAreas: string[];
  searchEnvironments: string[];
  targetOdors: string[];
  missionTypes: string[];
  missionChecklist: string[];
};

/** Standardvärdena, som gäller tills något sparats över dem. */
export const STANDARD: Settings = {
  certWarningDays: CERT_WARNING_DAYS,
  trainingAreas: TRAINING_AREAS,
  searchEnvironments: SEARCH_ENVIRONMENTS,
  targetOdors: TARGET_ODORS,
  missionTypes: MISSION_TYPES,
  missionChecklist: MISSION_CHECKLIST,
};

export const NYCKLAR = Object.keys(STANDARD) as (keyof Settings)[];

/** Etiketterna som visas i formuläret. */
export const RUBRIKER: Record<keyof Settings, string> = {
  certWarningDays: "Varning före certifikat går ut",
  trainingAreas: "Träningsområden",
  searchEnvironments: "Sökmiljöer",
  targetOdors: "Måldofter",
  missionTypes: "Uppdragstyper",
  missionChecklist: "Checklista under uppdrag",
};

/**
 * Läser inställningarna. `cache` gör att en sidrendering ställer frågan en
 * gång även om flera komponenter behöver värdena.
 */
export const getSettings = cache(async (): Promise<Settings> => {
  const rader = await db.setting.findMany();
  const sparade = new Map(rader.map((r) => [r.key, r.value]));

  const las = <K extends keyof Settings>(nyckel: K): Settings[K] => {
    const ratt = sparade.get(nyckel);
    if (ratt === undefined) return STANDARD[nyckel];
    try {
      return JSON.parse(ratt) as Settings[K];
    } catch {
      // Trasig rad ska inte släcka appen – standardvärdet duger.
      return STANDARD[nyckel];
    }
  };

  return {
    certWarningDays: las("certWarningDays"),
    trainingAreas: las("trainingAreas"),
    searchEnvironments: las("searchEnvironments"),
    targetOdors: las("targetOdors"),
    missionTypes: las("missionTypes"),
    missionChecklist: las("missionChecklist"),
  };
});

/** Vilka nycklar som avviker från standard, för att kunna visa det. */
export async function andradeNycklar() {
  const rader = await db.setting.findMany({
    select: { key: true, updatedAt: true, updatedBy: { select: { name: true } } },
  });
  return new Map(rader.map((r) => [r.key, r]));
}
