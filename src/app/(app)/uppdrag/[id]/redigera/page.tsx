import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireCapability, unreadNotificationCount } from "@/lib/auth";
import { regionScope, seesAllRegions } from "@/lib/authz";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatKoordinater, toLocalInput } from "@/lib/format";

import { MissionForm } from "../../nytt/mission-form";

export const metadata: Metadata = { title: "Rätta uppdraget" };

/**
 * Rättar ett uppdrag som redan finns. Samma formulär som när det lades
 * upp – annars skulle de två vyerna glida isär, och fält som mötesplats
 * och koordinater bara gå att sätta en enda gång.
 */
export default async function EditMissionPage({
  params,
}: PageProps<"/uppdrag/[id]/redigera">) {
  const { id } = await params;
  const user = await requireCapability("mission:create");
  const installningar = await getSettings();
  const unread = await unreadNotificationCount(user.id);

  // Samma avgränsning som updateMission: utanför regionen finns uppdraget
  // inte, och svaret är 404 i stället för ett nekande som avslöjar id:t.
  const mission = await db.mission.findFirst({
    where: { id, ...regionScope(user) },
  });
  if (!mission) notFound();

  const [regions, customers, disciplines] = await Promise.all([
    db.region.findMany({
      where: seesAllRegions(user)
        ? {}
        : { id: user.regionId ?? "__ingen_region__" },
      orderBy: { sortOrder: "asc" },
    }),
    db.customer.findMany({ orderBy: { name: "asc" } }),
    db.searchDiscipline.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  // Klockslagen visas i svensk tid, precis som de skrevs in.
  const start = toLocalInput(mission.startAt);

  return (
    <AppShell
      title="Rätta uppdraget"
      backHref={`/uppdrag/${mission.id}`}
      unread={unread}
      role={user.role}
    >
      <p className="mb-4 text-sm text-fg-muted">
        {mission.reference} · uppdragsnumret följer med och går inte att
        ändra.
      </p>

      <MissionForm
        missionId={mission.id}
        regions={regions.map((r) => ({ id: r.id, label: r.name }))}
        customers={customers.map((c) => ({ id: c.id, label: c.name }))}
        disciplines={disciplines.map((d) => ({ id: d.id, label: d.name }))}
        missionTypes={installningar.missionTypes}
        defaults={{
          date: start.slice(0, 10),
          startTime: start.slice(11),
          endTime: mission.endAt ? toLocalInput(mission.endAt).slice(11) : "",
          regionId: mission.regionId,
          title: mission.title,
          missionType: mission.missionType,
          disciplineId: mission.disciplineId ?? "",
          customerId: mission.customerId ?? "",
          contactName: mission.contactName ?? "",
          contactPhone: mission.contactPhone ?? "",
          address: mission.address ?? "",
          locality: mission.locality,
          meetingPoint: mission.meetingPoint ?? "",
          parkingInfo: mission.parkingInfo ?? "",
          missionArea: mission.missionArea ?? "",
          equipment: mission.equipment ?? "",
          koordinater: formatKoordinater(mission.latitude, mission.longitude),
          specialInstructions: mission.specialInstructions ?? "",
        }}
      />
    </AppShell>
  );
}
