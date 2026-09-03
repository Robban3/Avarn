import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { requireCapability, unreadNotificationCount } from "@/lib/auth";
import { canEditReport, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { toLocalInput } from "@/lib/format";
import { MediaForms, MediaGrid } from "@/components/MediaGrid";
import { ReportHeader } from "@/components/ReportHeader";
import { ReportForm } from "../../nytt/report-form";
import {
  removeReportMedia,
  updateReport,
  uploadReportMedia,
} from "../../actions";

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
      mission: { include: { discipline: true, customer: true } },
      indications: { orderBy: { sortOrder: "asc" } },
      media: { orderBy: { createdAt: "asc" } },
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
      title="Uppdrag – rapport"
      backHref={`/rapporter/${report.id}`}
      unread={unread}
      role={user.role}
      action={
        <button
          type="submit"
          form="rapport-form"
          name="submit"
          value="utkast"
          className="-mr-2 rounded-full px-3 py-2 text-[13px] font-semibold text-brand transition-colors hover:bg-surface-2"
        >
          Spara
        </button>
      }
    >
      <ReportHeader mission={report.mission} status={report.status} />

      <ReportForm
        action={updateReport}
        initial={{
          reportId: report.id,
          teamId: report.teamId,
          startedAt: report.startedAt ? toLocalInput(report.startedAt) : "",
          endedAt: report.endedAt ? toLocalInput(report.endedAt) : "",
          areasSearched: report.areasSearched ?? "",
          areaSize: report.areaSize === null ? "" : String(report.areaSize),
          findings: report.findings ?? "",
          deviations: report.deviations ?? "",
          actions: report.actions ?? "",
          comment: report.comment ?? "",
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
          discipline: report.mission.discipline?.name ?? null,
          customer: report.mission.customer?.name ?? null,
        }}
        teams={assignments.map((a) => ({
          id: a.teamId,
          label: `${a.team.dog.name} · ${a.team.handler.name}`,
        }))}
        defaults={{ startedAt: "", endedAt: "" }}
        genomfortAv={user.name}
        bilder={
          <MediaGrid
            assets={report.media}
            parentId={report.id}
            parentField="reportId"
            canAdd
            uploadFormId="rapport-bilder"
            removeFormId="rapport-bilder-bort"
          />
        }
      />

      {/* Formulären ligger utanför rapportformuläret – ett formulär inuti
          ett annat är ogiltig HTML. Fälten når dem via form-attributet. */}
      <MediaForms
        uploadFormId="rapport-bilder"
        removeFormId="rapport-bilder-bort"
        uploadAction={uploadReportMedia}
        removeAction={removeReportMedia}
        parentField="reportId"
        parentId={report.id}
      />
    </AppShell>
  );
}
