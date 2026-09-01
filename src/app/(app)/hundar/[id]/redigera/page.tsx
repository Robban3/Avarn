import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { requireCapability, unreadNotificationCount } from "@/lib/auth";
import { teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { EditDogForm } from "./edit-form";

export const metadata: Metadata = { title: "Redigera hund" };

export default async function EditDogPage({
  params,
}: PageProps<"/hundar/[id]/redigera">) {
  const { id } = await params;
  const user = await requireCapability("dog:create");
  const unread = await unreadNotificationCount(user.id);

  // Hunden hämtas via ett ekipage inom behörigheten, aldrig direkt på id.
  const team = await db.team.findFirst({
    where: { dogId: id, ...teamScope(user) },
    include: { dog: { include: { disciplines: true } } },
  });
  if (!team) notFound();

  const disciplines = await db.searchDiscipline.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const { dog } = team;

  return (
    <AppShell
      title="Redigera hund"
      backHref={`/hundar/${dog.id}`}
      unread={unread}
      role={user.role}
    >
      <EditDogForm
        dog={{
          id: dog.id,
          name: dog.name,
          breed: dog.breed,
          birthDate: dog.birthDate.toISOString().slice(0, 10),
          sex: dog.sex,
          chipNumber: dog.chipNumber,
          status: dog.status,
          notes: dog.notes,
          photoUrl: dog.photoUrl,
          disciplineIds: dog.disciplines.map((d) => d.disciplineId),
        }}
        disciplines={disciplines.map((d) => ({ id: d.id, name: d.name }))}
      />
    </AppShell>
  );
}
