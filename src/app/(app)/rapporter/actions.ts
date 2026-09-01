"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertCan, canEditReport, teamScope } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { notify, notifyMany } from "@/lib/notify";
import { isAllowedType, storeUpload } from "@/lib/media";

/** Server actions för operativa rapporter. */

const indicationSchema = z.object({
  location: z.string().trim().max(300).optional(),
  description: z.string().trim().max(1000).optional(),
  outcome: z.enum(["FIND", "NO_FIND", "FALSE_INDICATION"]).default("FIND"),
  handedOverTo: z.string().trim().max(200).optional(),
});

const reportSchema = z.object({
  missionId: z.string().min(1, "Välj uppdrag"),
  teamId: z.string().min(1, "Välj ekipage"),
  areasSearched: z.string().trim().max(4000).optional(),
  findings: z.string().trim().max(4000).optional(),
  deviations: z.string().trim().max(4000).optional(),
  actions: z.string().trim().max(4000).optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  submit: z.string().optional(),
});

export type ReportFormState = { error?: string };

/** Plockar ut markeringarna, som skickas som indication-0-location osv. */
function parseIndications(formData: FormData) {
  const rows: z.infer<typeof indicationSchema>[] = [];
  for (let i = 0; i < 20; i += 1) {
    const location = formData.get(`indication-${i}-location`);
    const description = formData.get(`indication-${i}-description`);
    const outcome = formData.get(`indication-${i}-outcome`);
    const handedOverTo = formData.get(`indication-${i}-handedOverTo`);
    if (location === null && description === null) continue;
    if (!String(location ?? "").trim() && !String(description ?? "").trim()) continue;

    const parsed = indicationSchema.safeParse({
      location: location ? String(location) : undefined,
      description: description ? String(description) : undefined,
      outcome: outcome ? String(outcome) : "FIND",
      handedOverTo: handedOverTo ? String(handedOverTo) : undefined,
    });
    if (parsed.success) rows.push(parsed.data);
  }
  return rows;
}

/**
 * Uppdaterar en befintlig rapport. Den som skrivit rapporten äger den fram
 * till godkännande; därefter är den låst och rättelser sker i en kommentar.
 */
export async function updateReport(
  _prev: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const user = await requireUser();
  assertCan(user, "report:create");

  const reportId = String(formData.get("reportId") ?? "");
  const existing = await db.operationalReport.findFirst({
    where: { id: reportId, team: teamScope(user) },
    select: { id: true, authorId: true, status: true, missionId: true },
  });
  if (!existing) return { error: "Rapporten ligger utanför din behörighet." };
  if (!canEditReport(user, existing)) {
    return {
      error:
        existing.status === "APPROVED"
          ? "Rapporten är godkänd och kan inte längre ändras."
          : "Bara den som skrivit rapporten kan ändra den.",
    };
  }

  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  const assignment = await db.missionAssignment.findFirst({
    where: {
      missionId: data.missionId,
      teamId: data.teamId,
      team: teamScope(user),
    },
    include: { mission: true },
  });
  if (!assignment) {
    return { error: "Ekipaget är inte tilldelat det här uppdraget." };
  }

  const startedAt = data.startedAt ? new Date(data.startedAt) : null;
  const endedAt = data.endedAt ? new Date(data.endedAt) : null;
  if (startedAt && endedAt && endedAt <= startedAt) {
    return { error: "Sluttiden måste vara efter starttiden." };
  }

  const status = data.submit === "utkast" ? "DRAFT" : "SUBMITTED";
  const indications = parseIndications(formData);

  await db.operationalReport.update({
    where: { id: existing.id },
    data: {
      missionId: data.missionId,
      teamId: data.teamId,
      areasSearched: data.areasSearched || null,
      findings: data.findings || null,
      deviations: data.deviations || null,
      actions: data.actions || null,
      startedAt,
      endedAt,
      status,
      submittedAt: status === "SUBMITTED" ? new Date() : null,
      // En rättelse efter begärd komplettering ska granskas på nytt.
      approvedById: null,
      approvedAt: null,
    },
  });

  // Markeringarna skrivs om i sin helhet – de har ingen egen identitet i
  // formuläret utöver sin ordning.
  await db.indication.deleteMany({ where: { reportId: existing.id } });
  await db.indication.createMany({
    data: indications.map((row, i) => ({
      reportId: existing.id,
      location: row.location || null,
      description: row.description || null,
      outcome: row.outcome,
      handedOverTo: row.handedOverTo || null,
      sortOrder: i + 1,
    })),
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "OperationalReport",
    entityId: existing.id,
    detail: status === "SUBMITTED" ? "Rättad och inskickad" : "Utkast sparat",
  });

  if (status === "SUBMITTED") {
    await notify({
      userId: assignment.assignedById,
      type: "COMMENT",
      title: `Rapport för ${assignment.mission.reference}`,
      body: `${user.name} har skickat in en operativ rapport.`,
      url: `/rapporter/${existing.id}`,
    });
    await db.missionAssignment.update({
      where: { id: assignment.id },
      data: { status: "COMPLETED" },
    });
  }

  revalidatePath(`/rapporter/${existing.id}`);
  revalidatePath("/rapporter");
  revalidatePath(`/uppdrag/${data.missionId}`);
  revalidatePath("/hem");
  redirect(`/rapporter/${existing.id}`);
}

/** Skickar in ett utkast utan att gå via formuläret. */
export async function submitReport(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "report:create");

  const reportId = String(formData.get("reportId") ?? "");
  const report = await db.operationalReport.findFirst({
    where: { id: reportId, team: teamScope(user) },
    include: { mission: true },
  });
  if (!report) throw new Error("Rapporten ligger utanför din behörighet.");
  if (!canEditReport(user, report)) {
    throw new Error("Rapporten kan inte längre ändras.");
  }

  await db.operationalReport.update({
    where: { id: report.id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      approvedById: null,
      approvedAt: null,
    },
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "OperationalReport",
    entityId: report.id,
    detail: "Inskickad",
  });

  const assignment = await db.missionAssignment.findFirst({
    where: { missionId: report.missionId, teamId: report.teamId },
  });
  if (assignment) {
    await notify({
      userId: assignment.assignedById,
      type: "COMMENT",
      title: `Rapport för ${report.mission.reference}`,
      body: `${user.name} har skickat in en operativ rapport.`,
      url: `/rapporter/${report.id}`,
    });
    await db.missionAssignment.update({
      where: { id: assignment.id },
      data: { status: "COMPLETED" },
    });
  }

  revalidatePath(`/rapporter/${report.id}`);
  revalidatePath("/rapporter");
  revalidatePath(`/uppdrag/${report.missionId}`);
  revalidatePath("/hem");
}

export async function createReport(
  _prev: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const user = await requireUser();
  assertCan(user, "report:create");

  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  // Rapporten måste höra till ett ekipage inom behörigheten och till ett
  // uppdrag som ekipaget faktiskt är tilldelat.
  const assignment = await db.missionAssignment.findFirst({
    where: {
      missionId: data.missionId,
      teamId: data.teamId,
      team: teamScope(user),
    },
    include: { mission: true },
  });
  if (!assignment) {
    return { error: "Ekipaget är inte tilldelat det här uppdraget." };
  }

  const startedAt = data.startedAt ? new Date(data.startedAt) : null;
  const endedAt = data.endedAt ? new Date(data.endedAt) : null;
  if (startedAt && endedAt && endedAt <= startedAt) {
    return { error: "Sluttiden måste vara efter starttiden." };
  }

  const status = data.submit === "utkast" ? "DRAFT" : "SUBMITTED";
  const indications = parseIndications(formData);

  const report = await db.operationalReport.create({
    data: {
      missionId: data.missionId,
      teamId: data.teamId,
      authorId: user.id,
      areasSearched: data.areasSearched || null,
      findings: data.findings || null,
      deviations: data.deviations || null,
      actions: data.actions || null,
      startedAt,
      endedAt,
      status,
      submittedAt: status === "SUBMITTED" ? new Date() : null,
      indications: {
        create: indications.map((row, i) => ({
          location: row.location || null,
          description: row.description || null,
          outcome: row.outcome,
          handedOverTo: row.handedOverTo || null,
          sortOrder: i + 1,
        })),
      },
    },
  });

  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "OperationalReport",
    entityId: report.id,
    detail: assignment.mission.reference,
  });

  if (status === "SUBMITTED") {
    // Den som lade upp uppdraget är den som ska granska rapporten.
    await notify({
      userId: assignment.assignedById,
      type: "COMMENT",
      title: `Ny rapport för ${assignment.mission.reference}`,
      body: `${user.name} har skickat in en operativ rapport.`,
      url: `/rapporter/${report.id}`,
    });
    await db.missionAssignment.update({
      where: { id: assignment.id },
      data: { status: "COMPLETED" },
    });
  }

  revalidatePath("/rapporter");
  revalidatePath(`/uppdrag/${data.missionId}`);
  redirect(`/rapporter/${report.id}`);
}

/** Chefens godkännande av en inskickad rapport. */
export async function approveReport(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "report:approve");

  const reportId = String(formData.get("reportId") ?? "");
  const report = await db.operationalReport.findFirst({
    where: { id: reportId, team: teamScope(user) },
    include: { mission: true },
  });
  if (!report) throw new Error("Rapporten ligger utanför din behörighet.");
  // Bara en inskickad rapport kan godkännas – ett utkast är inte färdigt.
  if (report.status !== "SUBMITTED") {
    throw new Error("Rapporten är inte inskickad för granskning.");
  }

  await db.operationalReport.update({
    where: { id: report.id },
    data: { status: "APPROVED", approvedById: user.id, approvedAt: new Date() },
  });

  await db.mission.update({
    where: { id: report.missionId },
    data: { status: "COMPLETED" },
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "OperationalReport",
    entityId: report.id,
    detail: "Godkänd",
  });

  await notify({
    userId: report.authorId,
    type: "COMMENT",
    title: "Rapport godkänd",
    body: `${user.name} har godkänt rapporten för ${report.mission.reference}.`,
    url: `/rapporter/${report.id}`,
  });

  revalidatePath(`/rapporter/${report.id}`);
  revalidatePath("/rapporter");
}

/** Begär komplettering i stället för att godkänna. */
export async function requestReportChanges(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "report:approve");

  const reportId = String(formData.get("reportId") ?? "");
  const report = await db.operationalReport.findFirst({
    where: { id: reportId, team: teamScope(user) },
    include: { mission: true },
  });
  if (!report) throw new Error("Rapporten ligger utanför din behörighet.");

  await db.operationalReport.update({
    where: { id: report.id },
    data: { status: "CHANGES_REQUESTED", approvedById: null, approvedAt: null },
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "OperationalReport",
    entityId: report.id,
    detail: "Komplettering begärd",
  });

  await notify({
    userId: report.authorId,
    type: "COMMENT",
    title: "Rapporten behöver kompletteras",
    body: `${user.name} har bett om komplettering av ${report.mission.reference}.`,
    url: `/rapporter/${report.id}`,
  });

  revalidatePath(`/rapporter/${report.id}`);
  revalidatePath("/rapporter");
}

/** Kommentar på en rapport. */
export async function addReportComment(formData: FormData) {
  const user = await requireUser();
  const reportId = String(formData.get("reportId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const report = await db.operationalReport.findFirst({
    where: { id: reportId, team: teamScope(user) },
  });
  if (!report) throw new Error("Rapporten ligger utanför din behörighet.");

  await db.comment.create({
    data: { authorId: user.id, reportId: report.id, body },
  });

  await notifyMany([report.authorId].filter((id) => id !== user.id), {
    type: "COMMENT",
    title: `${user.name} kommenterade en rapport`,
    body: body.slice(0, 140),
    url: `/rapporter/${report.id}`,
  });

  revalidatePath(`/rapporter/${report.id}`);
}

/** Bild till en rapport. */
export async function uploadReportMedia(formData: FormData) {
  const user = await requireUser();
  const reportId = String(formData.get("reportId") ?? "");
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  const report = await db.operationalReport.findFirst({
    where: { id: reportId, team: teamScope(user) },
    select: { id: true, authorId: true, status: true },
  });
  if (!report) throw new Error("Rapporten ligger utanför din behörighet.");
  if (!canEditReport(user, report)) {
    throw new Error("Rapporten är godkänd och kan inte längre ändras.");
  }

  for (const file of files) {
    if (file.size === 0 || !isAllowedType(file.type)) continue;
    const stored = await storeUpload(file);
    await db.mediaAsset.create({
      data: { ...stored, uploadedById: user.id, reportId: report.id },
    });
  }

  revalidatePath(`/rapporter/${report.id}`);
}
