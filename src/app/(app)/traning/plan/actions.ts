"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertCan, teamScope } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notify";

/** Server actions för träningsplanering. Endast instruktör och uppåt. */

const planSchema = z.object({
  teamId: z.string().min(1, "Välj ekipage"),
  title: z.string().trim().min(1, "Ange en rubrik"),
  purpose: z.string().trim().max(2000).optional(),
  periodStart: z.string().min(1, "Ange startdatum"),
  periodEnd: z.string().min(1, "Ange slutdatum"),
});

export type PlanFormState = { error?: string; ok?: boolean };

export async function createPlan(
  _prev: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  const user = await requireUser();
  assertCan(user, "plan:manage");

  const parsed = planSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  const team = await db.team.findFirst({
    where: { id: data.teamId, ...teamScope(user) },
    include: { handler: true, dog: true },
  });
  if (!team) return { error: "Ekipaget ligger utanför din behörighet." };

  const start = new Date(data.periodStart);
  const end = new Date(data.periodEnd);
  if (end < start) return { error: "Slutdatum måste vara efter startdatum." };

  const plan = await db.trainingPlan.create({
    data: {
      teamId: team.id,
      instructorId: user.id,
      title: data.title,
      purpose: data.purpose || null,
      periodStart: start,
      periodEnd: end,
      status: "ACTIVE",
    },
  });

  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "TrainingPlan",
    entityId: plan.id,
  });

  await notify({
    userId: team.handlerId,
    type: "TRAINING_PLANNED",
    title: "Ny träningsplan",
    body: `${user.name} har lagt upp planen “${plan.title}” för ${team.dog.name}.`,
    url: "/traning/plan",
  });

  revalidatePath("/traning/plan");
  return { ok: true };
}

const exerciseSchema = z.object({
  planId: z.string().min(1),
  title: z.string().trim().min(1, "Ange en rubrik"),
  instructions: z.string().trim().max(2000).optional(),
  targetOdor: z.string().trim().optional(),
  environment: z.string().trim().optional(),
  dueDate: z.string().optional(),
});

export async function addExercise(
  _prev: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  const user = await requireUser();
  assertCan(user, "plan:manage");

  const parsed = exerciseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  const plan = await db.trainingPlan.findFirst({
    where: { id: data.planId, team: teamScope(user) },
    include: { team: { include: { handler: true, dog: true } }, exercises: true },
  });
  if (!plan) return { error: "Planen ligger utanför din behörighet." };

  await db.plannedExercise.create({
    data: {
      planId: plan.id,
      title: data.title,
      instructions: data.instructions || null,
      targetOdor: data.targetOdor || null,
      environment: data.environment || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      sortOrder: plan.exercises.length + 1,
      status: "PLANNED",
    },
  });

  await notify({
    userId: plan.team.handlerId,
    type: "TRAINING_PLANNED",
    title: "Ny övning att träna",
    body: `${data.title} – ${plan.team.dog.name}`,
    url: "/traning/plan",
  });

  revalidatePath("/traning/plan");
  return { ok: true };
}

/** Markerar en övning som överhoppad eller åter planerad. */
export async function setExerciseStatus(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "plan:manage");

  const exerciseId = String(formData.get("exerciseId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["PLANNED", "COMPLETED", "SKIPPED"].includes(status)) return;

  const exercise = await db.plannedExercise.findFirst({
    where: { id: exerciseId, plan: { team: teamScope(user) } },
  });
  if (!exercise) throw new Error("Övningen ligger utanför din behörighet.");

  await db.plannedExercise.update({
    where: { id: exercise.id },
    data: { status },
  });

  revalidatePath("/traning/plan");
}
