"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertCan } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { ALL_ROLES } from "@/lib/domain";

/** Administration av användare. Endast rollen ADMIN. */

const userSchema = z.object({
  name: z.string().trim().min(1, "Ange namn"),
  email: z.string().trim().toLowerCase().email("Ange en giltig e-postadress"),
  role: z.enum(ALL_ROLES as [string, ...string[]]),
  regionId: z.string().optional(),
  phone: z.string().trim().optional(),
  password: z.string().min(8, "Lösenordet måste vara minst 8 tecken"),
});

export type AdminState = { error?: string; ok?: string };

export async function createUser(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const user = await requireUser();
  assertCan(user, "admin:manage");

  const parsed = userSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) return { error: "E-postadressen används redan." };

  const created = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      regionId: data.regionId || null,
      phone: data.phone || null,
      passwordHash: await bcrypt.hash(data.password, 10),
    },
  });

  if (data.role === "HANDLER") {
    await db.handlerProfile.create({ data: { userId: created.id } });
  }

  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "User",
    entityId: created.id,
    detail: `${data.email} som ${data.role}`,
  });

  revalidatePath("/admin");
  return { ok: `${data.name} har lagts till.` };
}

/** Aktiverar eller stänger av ett konto. Kontot raderas aldrig, av spårbarhetsskäl. */
export async function toggleUserActive(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "admin:manage");

  const userId = String(formData.get("userId") ?? "");
  if (userId === user.id) {
    throw new Error("Du kan inte stänga av ditt eget konto.");
  }

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("Användaren finns inte.");

  await db.user.update({
    where: { id: userId },
    data: { active: !target.active },
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "User",
    entityId: userId,
    detail: target.active ? "Avstängd" : "Aktiverad",
  });

  revalidatePath("/admin");
}

/**
 * Sätter ett nytt tillfälligt lösenord åt en användare som låst ute sig.
 * Lösenordet slumpas och visas en gång för administratören – det lagras
 * aldrig i klartext.
 */
export async function resetPassword(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const user = await requireUser();
  assertCan(user, "admin:manage");

  const userId = String(formData.get("userId") ?? "");
  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  });
  if (!target) return { error: "Användaren finns inte." };

  // Läsbart men slumpat: 18 tecken ur base64 utan lättförväxlade tecken.
  const temporary = randomBytes(18)
    .toString("base64")
    .replace(/[+/=IlO0]/g, "")
    .slice(0, 14);

  await db.user.update({
    where: { id: target.id },
    data: { passwordHash: await bcrypt.hash(temporary, 10) },
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "User",
    entityId: target.id,
    detail: `Återställde lösenord för ${target.name}`,
  });

  revalidatePath("/admin");
  return {
    ok: `Nytt lösenord för ${target.name}: ${temporary} — visas bara en gång.`,
  };
}
