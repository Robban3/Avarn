import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { requireCapability, unreadNotificationCount } from "@/lib/auth";
import { canEditReport, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { toLocalInput } from "@/lib/format";
import { ReportForm } from "../../nytt/report-form";
import { updateReport } from "../../actions";

export const metadata: Metadata = { title: "Rätta rapport" };

export default async function EditReportPage({
  params,
}: PageProps<"/rapporter/[id]/redigera">) {
  const { id } = await params;
  const user = await requireCapability("report:create");
  const unread = await unreadNotificationCount(user.id);

  const report = await db.operationalReport.findFirst({
    where: { id, team: teamScope(user) },
    include: {
      mission: true,
      indications: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!report) notFound();

  // Godkända rapporter är låsta, och bara den som skrivit får rätta.
  if (!canEditReport(user, report)) {
    redirect(`/rapporter/${report.id}`);
  }

  // Ekipagen som går att välja är de som är tilldelade uppdraget.
  const assignments = await db.missionAssignment.findMany({
    where: { missionId: report.missionId, team: teamScope(user) },
    include: { team: { include: { dog: true, handler: true } } },
  });

  return (
    <AppShell
      title="Rätta rapport"
      backHref={`/rapporter/${report.id}`}
      unread={unread}
      role={user.role}
    >
      <ReportForm
        action={updateReport}
        initial={{
          reportId: report.id,
          teamId: report.teamId,
          startedAt: report.startedAt ? toLocalInput(report.startedAt) : "",
          endedAt: report.endedAt ? toLocalInput(report.endedAt) : "",
          areasSearched: report.areasSearched ?? "",
          findings: report.findings ?? "",
          deviations: report.deviations ?? "",
          actions: report.actions ?? "",
          indications: report.indications.map((i) => ({
            location: i.location ?? "",
            description: i.description ?? "",
            outcome: i.outcome,
            handedOverTo: i.handedOverTo ?? "",
          })),
        }}
        mission={{
          id: report.mission.id,
          reference: report.mission.reference,
          title: report.mission.title,
          missionType: report.mission.missionType,
          locality: report.mission.locality,
        }}
        teams={assignments.map((a) => ({
          id: a.teamId,
          label: `${a.team.dog.name} · ${a.team.handler.name}`,
        }))}
        defaults={{ startedAt: "", endedAt: "" }}
      />
    </AppShell>
  );
}
