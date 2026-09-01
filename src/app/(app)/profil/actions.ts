"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teamScope } from "@/lib/authz";
import { audit } from "@/lib/audit";

/** Lösenordsbyte för det egna kontot. */

const passwordSchema = z
  .object({
    current: z.string().min(1, "Ange ditt nuvarande lösenord"),
    next: z.string().min(12, "Det nya lösenordet måste vara minst 12 tecken"),
    repeat: z.string().min(1, "Upprepa det nya lösenordet"),
  })
  .refine((d) => d.next === d.repeat, {
    message: "De nya lösenorden stämmer inte överens",
    path: ["repeat"],
  })
  .refine((d) => d.next !== d.current, {
    message: "Det nya lösenordet måste skilja sig från det nuvarande",
    path: ["next"],
  });

export type PasswordState = { error?: string; ok?: string };

export async function changePassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const user = await requireUser();

  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    repeat: formData.get("repeat"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }

  const record = await db.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!record) return { error: "Kontot finns inte längre." };

  const ok = await bcrypt.compare(parsed.data.current, record.passwordHash);
  if (!ok) {
    await audit({
      userId: user.id,
      action: "DENIED",
      entityType: "User",
      entityId: user.id,
      detail: "Fel nuvarande lösenord vid byte",
    });
    return { error: "Nuvarande lösenord stämmer inte." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.next, 10) },
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "User",
    entityId: user.id,
    detail: "Bytte lösenord",
  });

  revalidatePath("/profil");
  // Sessionen är signerad med AUTH_SECRET och inte med lösenordet, så
  // användaren förblir inloggad. Andra inloggningar påverkas inte heller.
  return { ok: "Lösenordet är bytt." };
}


/**
 * Tillgänglighet för ett ekipage.
 *
 * Värdet läses av startsidans statuspill (availabilityNow) och väger in i
 * uppdragsförslagen (suggestTeams), så det ska sättas av föraren själv och
 * inte bara finnas i exempeldatan.
 */
const availabilitySchema = z
  .object({
    teamId: z.string().min(1, "Välj ekipage"),
    kind: z.enum(["AVAILABLE", "UNAVAILABLE"]),
    startAt: z.string().min(1, "Ange från och med"),
    endAt: z.string().min(1, "Ange till och med"),
    note: z.string().trim().max(200).optional(),
  })
  .refine((d) => new Date(d.endAt) > new Date(d.startAt), {
    message: "Slutdatum måste ligga efter startdatum",
    path: ["endAt"],
  });

export type AvailabilityState = { error?: string; ok?: string };

export async function setAvailability(
  _prev: AvailabilityState,
  formData: FormData,
): Promise<AvailabilityState> {
  const user = await requireUser();

  const parsed = availabilitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  const team = await db.team.findFirst({
    where: { id: data.teamId, ...teamScope(user) },
    include: { dog: true },
  });
  if (!team) return { error: "Ekipaget ligger utanför din behörighet." };

  // Dagen räknas hel: från midnatt till strax före midnatt.
  const startAt = new Date(`${data.startAt}T00:00:00`);
  const endAt = new Date(`${data.endAt}T23:59:59`);

  await db.teamAvailability.create({
    data: {
      teamId: team.id,
      kind: data.kind,
      startAt,
      endAt,
      note: data.note || (data.kind === "AVAILABLE" ? "Tjänstgöring" : "Frånvaro"),
    },
  });

  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "TeamAvailability",
    entityId: team.id,
    detail: `${data.kind} ${data.startAt}–${data.endAt} för ${team.dog.name}`,
  });

  revalidatePath("/profil");
  revalidatePath("/hem");
  return {
    ok:
      data.kind === "AVAILABLE"
        ? `${team.dog.name} är markerad tillgänglig.`
        : `${team.dog.name} är markerad frånvarande.`,
  };
}

/** Tar bort en period, t.ex. när en inplanerad frånvaro ställts in. */
export async function removeAvailability(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("availabilityId") ?? "");

  const period = await db.teamAvailability.findFirst({
    where: { id, team: teamScope(user) },
    select: { id: true },
  });
  if (!period) throw new Error("Perioden ligger utanför din behörighet.");

  await db.teamAvailability.delete({ where: { id: period.id } });

  revalidatePath("/profil");
  revalidatePath("/hem");
}
