"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertCan, teamScope } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { isAllowedType, removeUpload, storeUpload } from "@/lib/media";

/** Ändrar en befintlig hund. Hunden nås alltid via ett ekipage i behörigheten. */

const editSchema = z.object({
  dogId: z.string().min(1),
  name: z.string().trim().min(1, "Ange hundens namn"),
  breed: z.string().trim().min(1, "Ange ras"),
  birthDate: z.string().min(1, "Ange födelsedatum"),
  sex: z.string().optional(),
  chipNumber: z.string().trim().max(40).optional(),
  status: z.enum(["ACTIVE", "RESTING", "RETIRED"]),
  notes: z.string().trim().max(2000).optional(),
  disciplineIds: z.string().optional(),
});

export type EditDogState = { error?: string; ok?: string };

/** Hunden, om användaren får ändra den. Annars null. */
async function editableDog(
  user: Awaited<ReturnType<typeof requireUser>>,
  dogId: string,
) {
  const team = await db.team.findFirst({
    where: { dogId, ...teamScope(user) },
    select: { dogId: true },
  });
  return team?.dogId ?? null;
}

export async function updateDog(
  _prev: EditDogState,
  formData: FormData,
): Promise<EditDogState> {
  const user = await requireUser();
  assertCan(user, "dog:create");

  const parsed = editSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  const dogId = await editableDog(user, data.dogId);
  if (!dogId) return { error: "Hunden ligger utanför din behörighet." };

  const birthDate = new Date(data.birthDate);
  if (Number.isNaN(birthDate.getTime())) {
    return { error: "Ogiltigt födelsedatum." };
  }
  if (birthDate > new Date()) {
    return { error: "Födelsedatumet kan inte ligga i framtiden." };
  }

  const wanted = new Set(
    (data.disciplineIds ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  );
  const existing = await db.dogDiscipline.findMany({
    where: { dogId },
    select: { id: true, disciplineId: true },
  });
  const have = new Set(existing.map((d) => d.disciplineId));

  await db.$transaction([
    db.dog.update({
      where: { id: dogId },
      data: {
        name: data.name,
        breed: data.breed,
        birthDate,
        sex: data.sex || null,
        chipNumber: data.chipNumber || null,
        status: data.status,
        notes: data.notes || null,
      },
    }),
    // Inriktningar som tagits bort
    db.dogDiscipline.deleteMany({
      where: {
        id: {
          in: existing.filter((d) => !wanted.has(d.disciplineId)).map((d) => d.id),
        },
      },
    }),
    // Inriktningar som tillkommit
    db.dogDiscipline.createMany({
      data: [...wanted]
        .filter((id) => !have.has(id))
        .map((disciplineId) => ({ dogId, disciplineId, level: "GRUND" })),
    }),
  ]);

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Dog",
    entityId: dogId,
    detail: `${data.name} (${data.status})`,
  });

  revalidatePath(`/hundar/${dogId}`);
  revalidatePath("/hundar");
  revalidatePath("/hem");
  redirect(`/hundar/${dogId}`);
}

/**
 * Laddar upp ett foto på hunden. Bilden sparas i samma privata lagring som
 * övriga bilagor och nås via /api/media/[id], aldrig via en öppen adress.
 */
export async function uploadDogPhoto(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "dog:create");

  const dogId = await editableDog(user, String(formData.get("dogId") ?? ""));
  if (!dogId) throw new Error("Hunden ligger utanför din behörighet.");

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return;
  if (!isAllowedType(file.type) || !file.type.startsWith("image/")) {
    throw new Error("Bilden måste vara i JPEG-, PNG- eller WebP-format.");
  }

  const dog = await db.dog.findUnique({
    where: { id: dogId },
    select: { photoUrl: true },
  });

  const stored = await storeUpload(file);
  const asset = await db.mediaAsset.create({
    data: { ...stored, uploadedById: user.id, dogId },
  });

  await db.dog.update({
    where: { id: dogId },
    data: { photoUrl: `/api/media/${asset.id}` },
  });

  // Den gamla bilden städas bort så att lagringen inte växer i onödan.
  const previousId = dog?.photoUrl?.replace("/api/media/", "");
  if (previousId && previousId !== asset.id) {
    const old = await db.mediaAsset.findFirst({
      where: { id: previousId, dogId },
      select: { id: true, storedName: true },
    });
    if (old) {
      await removeUpload(old.storedName);
      await db.mediaAsset.delete({ where: { id: old.id } });
    }
  }

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Dog",
    entityId: dogId,
    detail: "Bytte foto",
  });

  revalidatePath(`/hundar/${dogId}`);
  revalidatePath("/hundar");
  revalidatePath("/hem");
}
