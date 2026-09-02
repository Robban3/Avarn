"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertCan, regionScope, teamScope } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { fromLocalInput } from "@/lib/format";
import { notify } from "@/lib/notify";

/** Server actions för uppdrag: skapa, tilldela och svara. */

const missionSchema = z.object({
  title: z.string().trim().min(1, "Ange en rubrik"),
  missionType: z.string().trim().min(1, "Ange uppdragstyp"),
  customerId: z.string().optional(),
  contactName: z.string().trim().optional(),
  contactPhone: z.string().trim().optional(),
  date: z.string().min(1, "Ange datum"),
  startTime: z.string().min(1, "Ange starttid"),
  endTime: z.string().optional(),
  address: z.string().trim().optional(),
  locality: z.string().trim().min(1, "Ange ort"),
  regionId: z.string().min(1, "Välj region"),
  disciplineId: z.string().optional(),
  specialInstructions: z.string().trim().max(4000).optional(),
});

export type MissionFormState = { error?: string };

export async function createMission(
  _prev: MissionFormState,
  formData: FormData,
): Promise<MissionFormState> {
  const user = await requireUser();
  assertCan(user, "mission:create");

  const parsed = missionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  // Regionalt ansvarig får bara skapa uppdrag i sin egen region.
  const scope = regionScope(user);
  if (scope.regionId && scope.regionId !== data.regionId) {
    return { error: "Du kan bara lägga upp uppdrag i din egen region." };
  }

  // Klockslagen läses som svensk tid, precis som formuläret visade dem –
  // annars flyttar sig uppdraget en till två timmar varje gång det sparas.
  let startAt: Date;
  let endAt: Date | null = null;
  try {
    startAt = fromLocalInput(`${data.date}T${data.startTime}`);
    endAt = data.endTime
      ? fromLocalInput(`${data.date}T${data.endTime}`)
      : null;
  } catch {
    return { error: "Ogiltigt datum eller klockslag." };
  }
  // Ett nattligt uppdrag slutar efter midnatt, som ett kvällspass.
  if (endAt && endAt <= startAt) {
    endAt = new Date(endAt.getTime() + 24 * 60 * 60 * 1000);
  }

  // Löpnummer som är läsbart i fält och i rapporter.
  const count = await db.mission.count();
  const reference = `UPP-${2500 + count}`;

  const mission = await db.mission.create({
    data: {
      reference,
      title: data.title,
      missionType: data.missionType,
      customerId: data.customerId || null,
      contactName: data.contactName || null,
      contactPhone: data.contactPhone || null,
      startAt,
      endAt,
      address: data.address || null,
      locality: data.locality,
      regionId: data.regionId,
      disciplineId: data.disciplineId || null,
      specialInstructions: data.specialInstructions || null,
      status: "PLANNED",
      createdById: user.id,
    },
  });

  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "Mission",
    entityId: mission.id,
    detail: reference,
  });

  revalidatePath("/uppdrag");
  redirect(`/uppdrag/${mission.id}`);
}

/** Tilldelar ett ekipage. Ekipaget måste ligga inom tilldelarens behörighet. */
export async function assignTeam(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "mission:assign");

  const missionId = String(formData.get("missionId") ?? "");
  const teamId = String(formData.get("teamId") ?? "");

  const [mission, team] = await Promise.all([
    db.mission.findFirst({ where: { id: missionId, ...regionScope(user) } }),
    db.team.findFirst({
      where: { id: teamId, ...teamScope(user) },
      include: { dog: true, handler: true },
    }),
  ]);

  if (!mission) throw new Error("Uppdraget ligger utanför din behörighet.");
  if (!team) throw new Error("Ekipaget ligger utanför din behörighet.");

  await db.missionAssignment.upsert({
    where: { missionId_teamId: { missionId: mission.id, teamId: team.id } },
    create: {
      missionId: mission.id,
      teamId: team.id,
      assignedById: user.id,
      status: "OFFERED",
    },
    update: { status: "OFFERED", respondedAt: null, assignedById: user.id },
  });

  await db.mission.update({
    where: { id: mission.id },
    data: { status: "ASSIGNED" },
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Mission",
    entityId: mission.id,
    detail: `Tilldelat ${team.dog.name} / ${team.handler.name}`,
  });

  await notify({
    userId: team.handlerId,
    type: "MISSION_ASSIGNED",
    title: `Nytt uppdrag: ${mission.title}`,
    body: `${mission.locality} · ${mission.reference}. Svara ja eller nej i uppdragsvyn.`,
    url: `/uppdrag/${mission.id}`,
  });

  revalidatePath(`/uppdrag/${mission.id}`);
  revalidatePath("/uppdrag");
}

/** Hundförarens svar på ett erbjudet uppdrag. */
export async function respondToAssignment(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "mission:respond");

  const assignmentId = String(formData.get("assignmentId") ?? "");
  const answer = String(formData.get("answer") ?? "");
  if (!["ACCEPTED", "DECLINED"].includes(answer)) return;

  const assignment = await db.missionAssignment.findFirst({
    where: { id: assignmentId, team: teamScope(user) },
    include: { mission: true, team: { include: { dog: true } } },
  });
  if (!assignment) throw new Error("Tilldelningen ligger utanför din behörighet.");

  await db.missionAssignment.update({
    where: { id: assignment.id },
    data: { status: answer, respondedAt: new Date() },
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "MissionAssignment",
    entityId: assignment.id,
    detail: answer === "ACCEPTED" ? "Accepterat" : "Avböjt",
  });

  await notify({
    userId: assignment.assignedById,
    type: "MISSION_ASSIGNED",
    title:
      answer === "ACCEPTED"
        ? `${user.name} accepterade ${assignment.mission.reference}`
        : `${user.name} avböjde ${assignment.mission.reference}`,
    body: `${assignment.mission.title} · ${assignment.team.dog.name}`,
    url: `/uppdrag/${assignment.missionId}`,
  });

  revalidatePath(`/uppdrag/${assignment.missionId}`);
  revalidatePath("/uppdrag");
  revalidatePath("/hem");
}

/** Markerar uppdraget som pågående eller avslutat. */
export async function setMissionStatus(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "mission:assign");

  const missionId = String(formData.get("missionId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["PLANNED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) {
    return;
  }

  const mission = await db.mission.findFirst({
    where: { id: missionId, ...regionScope(user) },
  });
  if (!mission) throw new Error("Uppdraget ligger utanför din behörighet.");

  await db.mission.update({ where: { id: mission.id }, data: { status } });
  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Mission",
    entityId: mission.id,
    detail: `Status ${status}`,
  });

  revalidatePath(`/uppdrag/${mission.id}`);
  revalidatePath("/uppdrag");
}
