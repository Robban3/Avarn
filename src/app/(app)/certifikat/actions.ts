"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertCan, teamScope } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { notifyMany } from "@/lib/notify";
import { isAllowedType, storeUpload } from "@/lib/media";
import { formatDate } from "@/lib/format";

/**
 * Registrering och förnyelse av certifikat.
 *
 * Ett certifikat gäller antingen ett ekipage, en hund eller en hundförare.
 * Oavsett vilket måste det höra till ett ekipage inom användarens
 * behörighet – annars kan man inte sätta intyg på någon annans hund.
 */

const certSchema = z.object({
  typeId: z.string().min(1, "Välj certifikattyp"),
  /** "team:<id>", "dog:<id>" eller "user:<id>" */
  subject: z.string().min(1, "Välj vem certifikatet gäller"),
  issuer: z.string().trim().max(200).optional(),
  reference: z.string().trim().max(100).optional(),
  issuedAt: z.string().min(1, "Ange utfärdandedatum"),
  expiresAt: z.string().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type CertFormState = { error?: string; ok?: string };

/**
 * Kontrollerar att mottagaren ligger inom behörigheten och returnerar
 * kopplingen som ska sparas.
 */
async function resolveSubject(
  user: Awaited<ReturnType<typeof requireUser>>,
  subject: string,
) {
  const [kind, id] = subject.split(":");
  if (!id) return null;

  const scope = teamScope(user);

  if (kind === "team") {
    const team = await db.team.findFirst({
      where: { id, ...scope },
      include: { dog: true, handler: true },
    });
    return team
      ? {
          data: { teamId: team.id },
          recipients: [team.handlerId],
          label: `${team.dog.name} · ${team.handler.name}`,
        }
      : null;
  }

  if (kind === "dog") {
    const team = await db.team.findFirst({
      where: { dogId: id, ...scope },
      include: { dog: true },
    });
    return team
      ? {
          data: { dogId: team.dogId },
          recipients: [team.handlerId],
          label: team.dog.name,
        }
      : null;
  }

  if (kind === "user") {
    const team = await db.team.findFirst({
      where: { handlerId: id, ...scope },
      include: { handler: true },
    });
    return team
      ? {
          data: { userId: team.handlerId },
          recipients: [team.handlerId],
          label: team.handler.name,
        }
      : null;
  }

  return null;
}

export async function createCertification(
  _prev: CertFormState,
  formData: FormData,
): Promise<CertFormState> {
  const user = await requireUser();
  assertCan(user, "cert:manage");

  const parsed = certSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  const type = await db.certificationType.findUnique({
    where: { id: data.typeId },
  });
  if (!type) return { error: "Certifikattypen finns inte." };

  const subject = await resolveSubject(user, data.subject);
  if (!subject) {
    return { error: "Mottagaren ligger utanför din behörighet." };
  }

  const issuedAt = new Date(data.issuedAt);
  if (Number.isNaN(issuedAt.getTime())) {
    return { error: "Ogiltigt utfärdandedatum." };
  }

  // Utgångsdatumet räknas fram ur giltighetstiden, men går att skriva över
  // när ett intyg har ett annat datum än standard.
  let expiresAt: Date;
  if (data.expiresAt) {
    expiresAt = new Date(data.expiresAt);
    if (Number.isNaN(expiresAt.getTime())) {
      return { error: "Ogiltigt utgångsdatum." };
    }
  } else {
    expiresAt = new Date(issuedAt);
    expiresAt.setMonth(expiresAt.getMonth() + type.validityMonths);
  }

  if (expiresAt <= issuedAt) {
    return { error: "Utgångsdatumet måste ligga efter utfärdandedatumet." };
  }

  const certification = await db.certification.create({
    data: {
      typeId: type.id,
      ...subject.data,
      issuer: data.issuer || null,
      reference: data.reference || null,
      issuedAt,
      expiresAt,
      notes: data.notes || null,
    },
  });

  // Bifogat intyg, om något laddades upp.
  const file = formData.get("document");
  if (file instanceof File && file.size > 0 && isAllowedType(file.type)) {
    const stored = await storeUpload(file);
    await db.mediaAsset.create({
      data: {
        ...stored,
        uploadedById: user.id,
        certificationId: certification.id,
      },
    });
  }

  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "Certification",
    entityId: certification.id,
    detail: `${type.name} för ${subject.label}`,
  });

  await notifyMany(
    subject.recipients.filter((id) => id !== user.id),
    {
      type: "CERT_EXPIRING",
      title: `Nytt certifikat: ${type.name}`,
      body: `Registrerat av ${user.name}. Giltigt till ${formatDate(expiresAt)}.`,
      url: "/certifikat",
    },
  );

  revalidatePath("/certifikat");
  revalidatePath("/hem");
  return { ok: `${type.name} registrerat för ${subject.label}.` };
}

/**
 * Förnyar ett certifikat: skapar ett nytt av samma typ för samma mottagare,
 * med giltighetstiden räknad från idag. Det gamla ligger kvar som historik.
 */
export async function renewCertification(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "cert:manage");

  const id = String(formData.get("certificationId") ?? "");
  const existing = await db.certification.findUnique({
    where: { id },
    include: { type: true },
  });
  if (!existing) throw new Error("Certifikatet finns inte.");

  // Samma behörighetskontroll som vid registrering.
  const subject = existing.teamId
    ? `team:${existing.teamId}`
    : existing.dogId
      ? `dog:${existing.dogId}`
      : existing.userId
        ? `user:${existing.userId}`
        : "";
  const resolved = await resolveSubject(user, subject);
  if (!resolved) {
    throw new Error("Certifikatet ligger utanför din behörighet.");
  }

  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt);
  expiresAt.setMonth(expiresAt.getMonth() + existing.type.validityMonths);

  const renewed = await db.certification.create({
    data: {
      typeId: existing.typeId,
      teamId: existing.teamId,
      dogId: existing.dogId,
      userId: existing.userId,
      issuer: existing.issuer,
      reference: existing.reference,
      issuedAt,
      expiresAt,
      notes: existing.notes,
    },
  });

  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "Certification",
    entityId: renewed.id,
    detail: `Förnyat ${existing.type.name} för ${resolved.label}`,
  });

  await notifyMany(
    resolved.recipients.filter((rid) => rid !== user.id),
    {
      type: "CERT_EXPIRING",
      title: `${existing.type.name} förnyat`,
      body: `Giltigt till ${formatDate(expiresAt)}.`,
      url: "/certifikat",
    },
  );

  revalidatePath("/certifikat");
  revalidatePath("/hem");
}
