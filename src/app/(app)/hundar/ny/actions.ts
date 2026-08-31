"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertCan, seesAllRegions } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { ROLES } from "@/lib/domain";

/** Registrerar en ny hund och kopplar den till ett ekipage. */

const dogSchema = z.object({
  name: z.string().trim().min(1, "Ange hundens namn"),
  breed: z.string().trim().min(1, "Ange ras"),
  birthDate: z.string().min(1, "Ange födelsedatum"),
  sex: z.string().optional(),
  chipNumber: z.string().trim().max(40).optional(),
  handlerId: z.string().optional(),
  disciplineIds: z.string().optional(),
});

export type DogFormState = { error?: string };

export async function createDog(
  _prev: DogFormState,
  formData: FormData,
): Promise<DogFormState> {
  const user = await requireUser();
  assertCan(user, "dog:create");

  const parsed = dogSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  const birthDate = new Date(data.birthDate);
  if (Number.isNaN(birthDate.getTime())) {
    return { error: "Ogiltigt födelsedatum." };
  }
  if (birthDate > new Date()) {
    return { error: "Födelsedatumet kan inte ligga i framtiden." };
  }

  // Hundföraren registrerar alltid åt sig själv. Chefsroller får välja
  // förare, men bara inom sin egen behörighet.
  let handlerId = user.id;
  if (data.handlerId && data.handlerId !== user.id) {
    const allowed = await db.user.findFirst({
      where: {
        id: data.handlerId,
        role: ROLES.HANDLER,
        ...(seesAllRegions(user)
          ? {}
          : { regionId: user.regionId ?? "__ingen_region__" }),
      },
      select: { id: true },
    });
    if (!allowed) {
      return { error: "Hundföraren ligger utanför din behörighet." };
    }
    handlerId = allowed.id;
  }

  const handler = await db.user.findUnique({
    where: { id: handlerId },
    select: { regionId: true },
  });
  const regionId = handler?.regionId ?? user.regionId;
  if (!regionId) {
    return {
      error: "Hundföraren saknar region. Kontakta din regionalt ansvariga.",
    };
  }

  const disciplineIds = (data.disciplineIds ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const dog = await db.dog.create({
    data: {
      name: data.name,
      breed: data.breed,
      birthDate,
      sex: data.sex || null,
      chipNumber: data.chipNumber || null,
      status: "ACTIVE",
      disciplines: {
        create: disciplineIds.map((disciplineId) => ({
          disciplineId,
          level: "GRUND",
        })),
      },
      teams: {
        create: { handlerId, regionId, status: "ACTIVE" },
      },
    },
  });

  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "Dog",
    entityId: dog.id,
    detail: `${data.name} (${data.breed})`,
  });

  revalidatePath("/hundar");
  revalidatePath("/hem");
  redirect(`/hundar/${dog.id}`);
}
