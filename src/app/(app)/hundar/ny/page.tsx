import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { requireCapability, unreadNotificationCount } from "@/lib/auth";
import { can, seesAllRegions } from "@/lib/authz";
import { db } from "@/lib/db";
import { ROLES } from "@/lib/domain";
import { DogForm } from "./dog-form";

export const metadata: Metadata = { title: "Ny hund" };

export default async function NewDogPage() {
  const user = await requireCapability("dog:create");
  const unread = await unreadNotificationCount(user.id);

  const [disciplines, handlers] = await Promise.all([
    db.searchDiscipline.findMany({ orderBy: { sortOrder: "asc" } }),
    // Bara chefsroller får välja förare; hundföraren registrerar åt sig själv.
    can(user, "dog:manage")
      ? db.user.findMany({
          where: {
            role: ROLES.HANDLER,
            active: true,
            ...(seesAllRegions(user)
              ? {}
              : { regionId: user.regionId ?? "__ingen_region__" }),
          },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <AppShell title="Ny hund" backHref="/hundar" unread={unread} role={user.role}>
      <p className="mb-4 text-sm text-fg-muted">
        Hunden kopplas till ett ekipage så snart den registrerats, och kan
        därefter användas i träningsdagboken och tilldelas uppdrag.
      </p>
      <DogForm
        disciplines={disciplines.map((d) => ({ id: d.id, name: d.name }))}
        handlers={handlers}
        ownId={user.id}
      />
    </AppShell>
  );
}
