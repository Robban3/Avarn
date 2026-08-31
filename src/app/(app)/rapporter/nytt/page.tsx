import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/ui";
import { BriefcaseIcon } from "@/components/icons";
import { requireCapability, unreadNotificationCount } from "@/lib/auth";
import { teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { ReportForm } from "./report-form";

export const metadata: Metadata = { title: "Ny rapport" };

/** "2026-08-31T08:00" i lokal tid, som datetime-local vill ha det. */
function toLocalInput(date: Date) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export default async function NewReportPage({
  searchParams,
}: PageProps<"/rapporter/nytt">) {
  const user = await requireCapability("report:create");
  const params = await searchParams;
  const missionId = typeof params.uppdrag === "string" ? params.uppdrag : "";
  const unread = await unreadNotificationCount(user.id);

  if (!missionId) {
    // Utan uppdrag visas vilka uppdrag som väntar på rapport.
    const pending = await db.missionAssignment.findMany({
      where: {
        team: teamScope(user),
        status: { in: ["ACCEPTED", "COMPLETED"] },
        mission: { reports: { none: {} } },
      },
      include: { mission: true, team: { include: { dog: true } } },
      orderBy: { mission: { startAt: "desc" } },
    });

    return (
      <AppShell
        title="Ny rapport"
        backHref="/rapporter"
        unread={unread}
        role={user.role}
      >
        {pending.length === 0 ? (
          <EmptyState
            icon={<BriefcaseIcon className="h-7 w-7" />}
            title="Inga uppdrag väntar på rapport"
            description="Rapporten fylls i efter ett genomfört uppdrag."
          />
        ) : (
          <>
            <p className="mb-3 text-sm text-fg-muted">
              Välj vilket uppdrag rapporten gäller.
            </p>
            <div className="space-y-2.5">
              {pending.map((a) => (
                <a
                  key={a.id}
                  href={`/rapporter/nytt?uppdrag=${a.missionId}`}
                  className="card block p-3.5 transition-colors hover:bg-surface-2"
                >
                  <p className="text-xs text-fg-muted">
                    {a.mission.reference} · {a.team.dog.name}
                  </p>
                  <p className="text-[15px] font-semibold">{a.mission.title}</p>
                  <p className="text-xs text-fg-muted">{a.mission.locality}</p>
                </a>
              ))}
            </div>
          </>
        )}
      </AppShell>
    );
  }

  // Endast uppdrag som något av användarens ekipage är tilldelat.
  const assignments = await db.missionAssignment.findMany({
    where: { missionId, team: teamScope(user) },
    include: {
      mission: true,
      team: { include: { dog: true, handler: true } },
    },
  });

  if (assignments.length === 0) notFound();
  const mission = assignments[0].mission;

  return (
    <AppShell
      title="Operativ rapport"
      backHref={`/uppdrag/${mission.id}`}
      unread={unread}
      role={user.role}
    >
      <ReportForm
        mission={{
          id: mission.id,
          reference: mission.reference,
          title: mission.title,
          missionType: mission.missionType,
          locality: mission.locality,
        }}
        teams={assignments.map((a) => ({
          id: a.teamId,
          label: `${a.team.dog.name} · ${a.team.handler.name}`,
        }))}
        defaults={{
          startedAt: toLocalInput(mission.startAt),
          endedAt: toLocalInput(mission.endAt ?? mission.startAt),
        }}
      />
    </AppShell>
  );
}
