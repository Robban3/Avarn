import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { requireCapability, unreadNotificationCount } from "@/lib/auth";
import { seesAllRegions } from "@/lib/authz";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

import { MissionForm } from "./mission-form";

export const metadata: Metadata = { title: "Nytt uppdrag" };

function defaultDateTime() {
  const iso = new Date();
  iso.setDate(iso.getDate() + 1);
  return {
    date: iso.toISOString().slice(0, 10),
    startTime: "08:00",
    endTime: "12:00",
  };
}

export default async function NewMissionPage() {
  const user = await requireCapability("mission:create");
  const installningar = await getSettings();
  const unread = await unreadNotificationCount(user.id);

  const [regions, customers, disciplines] = await Promise.all([
    // Regionalt ansvarig får bara välja sin egen region.
    db.region.findMany({
      where: seesAllRegions(user)
        ? {}
        : { id: user.regionId ?? "__ingen_region__" },
      orderBy: { sortOrder: "asc" },
    }),
    db.customer.findMany({ orderBy: { name: "asc" } }),
    db.searchDiscipline.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <AppShell
      title="Nytt uppdrag"
      backHref="/uppdrag"
      unread={unread}
      role={user.role}
    >
      <MissionForm
        regions={regions.map((r) => ({ id: r.id, label: r.name }))}
        customers={customers.map((c) => ({ id: c.id, label: c.name }))}
        disciplines={disciplines.map((d) => ({ id: d.id, label: d.name }))}
        missionTypes={installningar.missionTypes}
        defaults={{
          ...defaultDateTime(),
          regionId: user.regionId ?? regions[0]?.id ?? "",
        }}
      />
    </AppShell>
  );
}
