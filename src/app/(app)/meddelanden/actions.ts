"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

/** Notifieringar tillhör alltid den inloggade – ingen kan läsa andras. */

export async function markAsRead(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("notificationId") ?? "");

  await db.notification.updateMany({
    where: { id, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/meddelanden");
}

export async function markAllAsRead() {
  const user = await requireUser();

  await db.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/meddelanden");
  revalidatePath("/hem");
}
