"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertCan, teamScope } from "@/lib/authz";
import { notify } from "@/lib/notify";
import { audit } from "@/lib/audit";

/** Instruktörens uppföljningar med ett ekipage. */

const followUpSchema = z.object({
  teamId: z.string().min(1),
  title: z.string().trim().min(1, "Ange vad uppföljningen gäller"),
  message: z.string().trim().max(2000).optional(),
  dueDate: z.string().optional(),
});

export type FollowUpState = { error?: string; ok?: boolean };

export async function createFollowUp(
  _prev: FollowUpState,
  formData: FormData,
): Promise<FollowUpState> {
  const user = await requireUser();
  assertCan(user, "followUp:create");

  const parsed = followUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  const team = await db.team.findFirst({
    where: { id: data.teamId, ...teamScope(user) },
    include: { handler: true, dog: true },
  });
  if (!team) return { error: "Ekipaget ligger utanför din behörighet." };

  await db.followUp.create({
    data: {
      teamId: team.id,
      instructorId: user.id,
      title: data.title,
      message: data.message || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: "OPEN",
    },
  });

  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "FollowUp",
    entityId: team.id,
  });

  await notify({
    userId: team.handlerId,
    type: "FOLLOW_UP",
    title: "Kallelse till uppföljning",
    body: `${user.name}: ${data.title}`,
    url: `/instruktor/ekipage/${team.id}`,
  });

  revalidatePath(`/instruktor/ekipage/${team.id}`);
  revalidatePath("/instruktor");
  return { ok: true };
}

/** Markerar en uppföljning som avklarad. */
export async function closeFollowUp(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "followUp:create");

  const followUpId = String(formData.get("followUpId") ?? "");
  const followUp = await db.followUp.findFirst({
    where: { id: followUpId, team: teamScope(user) },
  });
  if (!followUp) throw new Error("Uppföljningen ligger utanför din behörighet.");

  await db.followUp.update({
    where: { id: followUp.id },
    data: { status: "DONE" },
  });

  revalidatePath(`/instruktor/ekipage/${followUp.teamId}`);
  revalidatePath("/instruktor");
}
