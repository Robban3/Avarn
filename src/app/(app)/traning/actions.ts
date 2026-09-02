"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertCan, canEditSession, teamScope } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { instructorsForTeam, notify, notifyMany } from "@/lib/notify";
import { isAllowedType, storeUpload } from "@/lib/media";
import { fromLocalInput } from "@/lib/format";

/**
 * Server actions för träningsdagboken. Varje action börjar med att
 * kontrollera både rollens behörighet och att ekipaget ligger inom
 * användarens avgränsning.
 */

/** Kastar om ekipaget ligger utanför användarens behörighet. */
async function assertTeamInScope(userId: string, role: string, regionId: string | null, teamId: string) {
  const team = await db.team.findFirst({
    where: { id: teamId, ...teamScope({ id: userId, role: role as never, regionId }) },
    select: { id: true },
  });
  if (!team) {
    throw new Error("Ekipaget ligger utanför din behörighet.");
  }
}

const sessionSchema = z.object({
  teamId: z.string().min(1, "Välj ekipage"),
  date: z.string().min(1, "Ange datum"),
  startTime: z.string().min(1, "Ange starttid"),
  endTime: z.string().optional(),
  location: z.string().trim().min(1, "Ange plats"),
  trainingArea: z.string().trim().min(1, "Ange träningsområde"),
  environment: z.string().trim().min(1, "Ange sökmiljö"),
  targetOdor: z.string().trim().min(1, "Ange måldoft"),
  disciplineId: z.string().optional(),
  hideCount: z.coerce.number().int().min(0).max(99),
  foundCount: z.coerce.number().int().min(0).max(99),
  comment: z.string().trim().max(4000).optional(),
  plannedExerciseId: z.string().optional(),
  submit: z.string().optional(),
});

export type SessionFormState = { error?: string };

function combineDateTime(date: string, time: string) {
  return fromLocalInput(`${date}T${time}`);
}

/**
 * Ett kvällspass kan sluta efter midnatt. Formuläret har bara ett datum, så
 * en sluttid som ligger före starttiden hör till nästa dygn.
 */
function endOfSession(startAt: Date, date: string, time?: string) {
  if (!time) return null;
  const endAt = combineDateTime(date, time);
  if (endAt > startAt) return endAt;
  // Exakt samma klockslag är ett misstag, inte ett dygnslångt pass.
  if (endAt.getTime() === startAt.getTime()) return null;
  return combineDateTime(nextDay(date), time);
}

/** "2026-09-01" → "2026-09-02". */
function nextDay(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Uppdaterar ett befintligt pass. Föraren äger sitt pass fram till
 * godkännande; därefter är det låst och rättelser sker genom en kommentar.
 */
export async function updateSession(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const user = await requireUser();
  assertCan(user, "session:create");

  const sessionId = String(formData.get("sessionId") ?? "");
  const existing = await db.trainingSession.findFirst({
    where: { id: sessionId, team: teamScope(user) },
    select: { id: true, createdById: true, status: true, teamId: true },
  });
  if (!existing) return { error: "Passet ligger utanför din behörighet." };
  if (!canEditSession(user, existing)) {
    return {
      error:
        existing.status === "APPROVED"
          ? "Passet är godkänt och kan inte längre ändras."
          : "Bara den som rapporterat passet kan ändra det.",
    };
  }

  const parsed = sessionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  if (data.foundCount > data.hideCount) {
    return { error: "Antal markeringar kan inte vara fler än antalet gömmor." };
  }

  try {
    await assertTeamInScope(user.id, user.role, user.regionId, data.teamId);
  } catch (error) {
    return { error: (error as Error).message };
  }

  let startAt: Date;
  let endAt: Date | null = null;
  try {
    startAt = combineDateTime(data.date, data.startTime);
    endAt = endOfSession(startAt, data.date, data.endTime);
  } catch (error) {
    return { error: (error as Error).message };
  }

  const status = data.submit === "utkast" ? "DRAFT" : "SUBMITTED";

  await db.trainingSession.update({
    where: { id: existing.id },
    data: {
      teamId: data.teamId,
      startAt,
      endAt,
      location: data.location,
      trainingArea: data.trainingArea,
      environment: data.environment,
      targetOdor: data.targetOdor,
      disciplineId: data.disciplineId || null,
      hideCount: data.hideCount,
      foundCount: data.foundCount,
      comment: data.comment || null,
      status,
      // En rättelse efter begärd komplettering ska granskas på nytt.
      approvedById: null,
      approvedAt: null,
    },
  });

  // Gömmorna speglar antalen och skrivs om när de ändrats.
  await db.hide.deleteMany({ where: { sessionId: existing.id } });
  await db.hide.createMany({
    data: Array.from({ length: data.hideCount }, (_, i) => ({
      sessionId: existing.id,
      label: `Gömma ${i + 1}`,
      outcome: i < data.foundCount ? "FOUND" : "MISSED",
      sortOrder: i + 1,
    })),
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "TrainingSession",
    entityId: existing.id,
    detail: status === "SUBMITTED" ? "Rättat och inskickat" : "Utkast sparat",
  });

  if (status === "SUBMITTED") {
    const instructors = await instructorsForTeam(data.teamId);
    await notifyMany(instructors, {
      type: "COMMENT",
      title: "Träningspass att granska",
      body: `${user.name} har skickat in ${data.trainingArea} – ${data.environment}.`,
      url: `/traning/${existing.id}`,
    });
  }

  revalidatePath(`/traning/${existing.id}`);
  revalidatePath("/traning");
  revalidatePath("/hem");
  redirect(`/traning/${existing.id}`);
}

/** Skickar in ett utkast utan att gå via formuläret. */
export async function submitSession(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "session:create");

  const sessionId = String(formData.get("sessionId") ?? "");
  const session = await db.trainingSession.findFirst({
    where: { id: sessionId, team: teamScope(user) },
    select: {
      id: true,
      createdById: true,
      status: true,
      teamId: true,
      trainingArea: true,
      environment: true,
    },
  });
  if (!session) throw new Error("Passet ligger utanför din behörighet.");
  if (!canEditSession(user, session)) {
    throw new Error("Passet kan inte längre ändras.");
  }

  await db.trainingSession.update({
    where: { id: session.id },
    data: { status: "SUBMITTED", approvedById: null, approvedAt: null },
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "TrainingSession",
    entityId: session.id,
    detail: "Inskickat",
  });

  const instructors = await instructorsForTeam(session.teamId);
  await notifyMany(instructors, {
    type: "COMMENT",
    title: "Träningspass att granska",
    body: `${user.name} har skickat in ${session.trainingArea} – ${session.environment}.`,
    url: `/traning/${session.id}`,
  });

  revalidatePath(`/traning/${session.id}`);
  revalidatePath("/traning");
  revalidatePath("/hem");
}

export async function createSession(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const user = await requireUser();
  assertCan(user, "session:create");

  const parsed = sessionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  if (data.foundCount > data.hideCount) {
    return { error: "Antal markeringar kan inte vara fler än antalet gömmor." };
  }

  try {
    await assertTeamInScope(user.id, user.role, user.regionId, data.teamId);
  } catch (error) {
    return { error: (error as Error).message };
  }

  let startAt: Date;
  let endAt: Date | null = null;
  try {
    startAt = combineDateTime(data.date, data.startTime);
    endAt = endOfSession(startAt, data.date, data.endTime);
  } catch (error) {
    return { error: (error as Error).message };
  }

  const status = data.submit === "utkast" ? "DRAFT" : "SUBMITTED";

  const session = await db.trainingSession.create({
    data: {
      teamId: data.teamId,
      startAt,
      endAt,
      location: data.location,
      trainingArea: data.trainingArea,
      environment: data.environment,
      targetOdor: data.targetOdor,
      disciplineId: data.disciplineId || null,
      hideCount: data.hideCount,
      foundCount: data.foundCount,
      comment: data.comment || null,
      status,
      createdById: user.id,
      plannedExerciseId: data.plannedExerciseId || null,
    },
  });

  // Gömmorna skapas som rader utifrån antalet, så att statistiken har
  // något att räkna på även vid snabb rapportering.
  await db.hide.createMany({
    data: Array.from({ length: data.hideCount }, (_, i) => ({
      sessionId: session.id,
      label: `Gömma ${i + 1}`,
      outcome: i < data.foundCount ? "FOUND" : "MISSED",
      sortOrder: i + 1,
    })),
  });

  if (data.plannedExerciseId) {
    // updateMany med avgränsningen i frågan: ett främmande övnings-id
    // träffar noll rader i stället för att ändra någon annans plan.
    await db.plannedExercise.updateMany({
      where: {
        id: data.plannedExerciseId,
        plan: { team: teamScope(user) },
      },
      data: { status: "COMPLETED" },
    });
  }

  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "TrainingSession",
    entityId: session.id,
  });

  if (status === "SUBMITTED") {
    const instructors = await instructorsForTeam(data.teamId);
    await notifyMany(instructors, {
      type: "COMMENT",
      title: "Nytt träningspass att granska",
      body: `${user.name} har rapporterat ${data.trainingArea} – ${data.environment}.`,
      url: `/traning/${session.id}`,
    });
  }

  revalidatePath("/traning");
  revalidatePath("/hem");
  redirect(`/traning/${session.id}`);
}

/** Instruktörens godkännande av ett inskickat pass. */
export async function approveSession(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "session:approve");

  const sessionId = String(formData.get("sessionId") ?? "");
  const session = await db.trainingSession.findFirst({
    where: { id: sessionId, team: teamScope(user) },
    include: { team: true },
  });
  if (!session) throw new Error("Passet ligger utanför din behörighet.");
  // Bara ett inskickat pass kan godkännas. Utan den här spärren kunde ett
  // utkast godkännas via ett formulärinlägg, och då är föraren utelåst –
  // det finns ingen väg tillbaka från godkänt.
  if (session.status !== "SUBMITTED") {
    throw new Error("Passet är inte inskickat för granskning.");
  }
  // Den som rapporterat granskar inte sitt eget pass. Instruktören har
  // både session:create och session:approve, så rollen räcker inte.
  if (session.createdById === user.id) {
    throw new Error("Du kan inte godkänna ditt eget pass.");
  }

  await db.trainingSession.update({
    where: { id: session.id },
    data: {
      status: "APPROVED",
      approvedById: user.id,
      approvedAt: new Date(),
    },
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "TrainingSession",
    entityId: session.id,
    detail: "Godkänt",
  });

  await notify({
    userId: session.createdById,
    type: "SESSION_APPROVED",
    title: "Träning godkänd",
    body: `${session.trainingArea} – ${session.environment} är godkänt av ${user.name}.`,
    url: `/traning/${session.id}`,
  });

  revalidatePath(`/traning/${session.id}`);
  revalidatePath("/traning");
  revalidatePath("/instruktor");
}

/** Begär komplettering i stället för att godkänna. */
export async function requestChanges(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "session:approve");

  const sessionId = String(formData.get("sessionId") ?? "");
  const session = await db.trainingSession.findFirst({
    where: { id: sessionId, team: teamScope(user) },
  });
  if (!session) throw new Error("Passet ligger utanför din behörighet.");

  await db.trainingSession.update({
    where: { id: session.id },
    data: { status: "CHANGES_REQUESTED", approvedById: null, approvedAt: null },
  });

  await notify({
    userId: session.createdById,
    type: "COMMENT",
    title: "Träningen behöver kompletteras",
    body: `${user.name} har bett om komplettering av ${session.trainingArea}.`,
    url: `/traning/${session.id}`,
  });

  revalidatePath(`/traning/${session.id}`);
  revalidatePath("/traning");
}

/** Kommentar på ett pass – instruktörens återkoppling eller förarens svar. */
export async function addSessionComment(formData: FormData) {
  const user = await requireUser();
  const sessionId = String(formData.get("sessionId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const session = await db.trainingSession.findFirst({
    where: { id: sessionId, team: teamScope(user) },
  });
  if (!session) throw new Error("Passet ligger utanför din behörighet.");

  await db.comment.create({
    data: { authorId: user.id, trainingSessionId: session.id, body },
  });

  // Både förare och instruktörer ska få veta att det kommit en kommentar.
  const instructors = await instructorsForTeam(session.teamId);
  const recipients = [session.createdById, ...instructors].filter(
    (id) => id !== user.id,
  );
  await notifyMany(recipients, {
    type: "COMMENT",
    title: `${user.name} kommenterade en träning`,
    body: body.slice(0, 140),
    url: `/traning/${session.id}`,
  });

  revalidatePath(`/traning/${session.id}`);
}

/** Bild- eller filmbilaga till ett pass. */
export async function uploadSessionMedia(formData: FormData) {
  const user = await requireUser();
  const sessionId = String(formData.get("sessionId") ?? "");
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  const session = await db.trainingSession.findFirst({
    where: { id: sessionId, team: teamScope(user) },
    select: { id: true, createdById: true, status: true },
  });
  if (!session) throw new Error("Passet ligger utanför din behörighet.");
  if (!canEditSession(user, session)) {
    throw new Error("Passet är godkänt och kan inte längre ändras.");
  }

  for (const file of files) {
    if (file.size === 0) continue;
    if (!isAllowedType(file.type)) continue;
    const stored = await storeUpload(file);
    await db.mediaAsset.create({
      data: {
        ...stored,
        uploadedById: user.id,
        trainingSessionId: session.id,
      },
    });
  }

  revalidatePath(`/traning/${session.id}`);
}
