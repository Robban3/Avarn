"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCapability } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { NYCKLAR, RUBRIKER, STANDARD, type Settings } from "@/lib/settings";

/**
 * Ändrar en inställning i taget. Bara administratör, och varje ändring
 * loggas – en ändrad varningsgräns påverkar vilka certifikat som flaggas
 * för hela organisationen, så det ska gå att se vem som ändrade vad.
 */

export type SettingsState = { error?: string; ok?: string };

const dagarSchema = z.coerce
  .number()
  .int("Ange ett helt antal dagar.")
  .min(1, "Minst en dag.")
  .max(365, "Högst 365 dagar.");

/** En textruta med ett värde per rad blir en lista, trimmad och avdubblad. */
function listaFranText(text: string) {
  const rader = text
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);
  return [...new Set(rader)];
}

/** Sparar sidorna som visar värdena, så att ändringen syns direkt. */
function uppdateraVyer() {
  for (const sida of [
    "/panel/installningar",
    "/panel/certifikat",
    "/certifikat",
    "/traning/nytt",
    "/traning/plan",
    "/uppdrag/nytt",
    "/hem",
  ]) {
    revalidatePath(sida);
  }
}

export async function updateSetting(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await requireCapability("admin:manage");

  const nyckel = String(formData.get("nyckel") ?? "") as keyof Settings;
  if (!NYCKLAR.includes(nyckel)) {
    return { error: "Okänd inställning." };
  }

  let varde: Settings[keyof Settings];

  if (nyckel === "certWarningDays") {
    const parsed = dagarSchema.safeParse(formData.get("varde"));
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Ogiltigt värde." };
    }
    varde = parsed.data;
  } else {
    const lista = listaFranText(String(formData.get("varde") ?? ""));
    if (lista.length === 0) {
      return { error: "Listan måste innehålla minst ett värde." };
    }
    if (lista.some((v) => v.length > 80)) {
      return { error: "Ett värde får vara högst 80 tecken." };
    }
    varde = lista;
  }

  await db.setting.upsert({
    where: { key: nyckel },
    create: {
      key: nyckel,
      value: JSON.stringify(varde),
      updatedById: user.id,
    },
    update: { value: JSON.stringify(varde), updatedById: user.id },
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Setting",
    entityId: nyckel,
    detail: `${RUBRIKER[nyckel]} ändrad`,
  });

  uppdateraVyer();
  return { ok: `${RUBRIKER[nyckel]} sparad.` };
}

/** Tar bort raden, så att standardvärdet i domain.ts gäller igen. */
export async function resetSetting(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await requireCapability("admin:manage");

  const nyckel = String(formData.get("nyckel") ?? "") as keyof Settings;
  if (!NYCKLAR.includes(nyckel)) {
    return { error: "Okänd inställning." };
  }

  await db.setting.deleteMany({ where: { key: nyckel } });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Setting",
    entityId: nyckel,
    detail: `${RUBRIKER[nyckel]} återställd till standard`,
  });

  uppdateraVyer();
  const standard = STANDARD[nyckel];
  return {
    ok: `${RUBRIKER[nyckel]} återställd till ${
      Array.isArray(standard) ? `${standard.length} värden` : standard
    }.`,
  };
}
