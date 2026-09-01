import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Badge,
  DetailList,
  DetailRow,
  DisciplineTag,
  SectionHeader,
} from "@/components/ui";
import {
  AlertIcon,
  CheckCircleIcon,
  ClipboardIcon,
  MapPinIcon,
  PencilIcon,
  ScentIcon,
  ShieldIcon,
} from "@/components/icons";
import { MediaGrid } from "@/components/MediaGrid";
import { CommentThread } from "@/components/CommentThread";
import { CommentForm } from "@/components/CommentForm";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { can, canEditReport, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import {
  formatDate,
  formatTimeRange,
  formatShortDate,
} from "@/lib/format";
import {
  INDICATION_OUTCOME_LABELS,
  REPORT_STATUS_LABELS,
} from "@/lib/domain";
import {
  addReportComment,
  approveReport,
  requestReportChanges,
  submitReport,
  uploadReportMedia,
} from "../actions";

export const metadata: Metadata = { title: "Operativ rapport" };

export default async function ReportPage({
  params,
}: PageProps<"/rapporter/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const unread = await unreadNotificationCount(user.id);

  const report = await db.operationalReport.findFirst({
    where: { id, team: teamScope(user) },
    include: {
      mission: { include: { discipline: true, customer: true, region: true } },
      team: { include: { dog: true, handler: true } },
      author: true,
      approvedBy: true,
      indications: { orderBy: { sortOrder: "asc" } },
      media: { orderBy: { createdAt: "asc" } },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!report) notFound();

  // Rapporter kan innehålla känsliga uppgifter – varje läsning loggas.
  await audit({
    userId: user.id,
    action: "READ",
    entityType: "OperationalReport",
    entityId: report.id,
    detail: report.mission.reference,
  });

  const editable = canEditReport(user, report);
  const canApprove =
    can(user, "report:approve") && report.status === "SUBMITTED";

  return (
    <AppShell
      title="Operativ rapport"
      backHref="/rapporter"
      unread={unread}
      role={user.role}
    >
      <section className="card mb-4 p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-fg-muted">
              {formatDate(report.mission.startAt)}
            </p>
            <p className="text-sm text-fg-muted">
              {report.startedAt
                ? formatTimeRange(report.startedAt, report.endedAt)
                : formatTimeRange(report.mission.startAt, report.mission.endAt)}
            </p>
          </div>
          {report.mission.discipline ? (
            <DisciplineTag label={report.mission.discipline.shortLabel} />
          ) : null}
        </div>
        <h2 className="text-xl font-semibold leading-tight">
          {report.mission.title}
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-fg-muted">
          <MapPinIcon className="h-4 w-4" />
          {report.mission.address ? `${report.mission.address}, ` : ""}
          {report.mission.locality}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Badge
            tone={
              report.status === "APPROVED"
                ? "ok"
                : report.status === "SUBMITTED"
                  ? "brand"
                  : "neutral"
            }
          >
            {REPORT_STATUS_LABELS[report.status] ?? report.status}
          </Badge>
          <span className="text-xs text-fg-dim">
            {report.mission.reference} · {report.team.dog.name}
          </span>
        </div>
      </section>

      <section className="mb-5">
        <DetailList>
          <DetailRow
            icon={<ClipboardIcon className="h-[18px] w-[18px]" />}
            label="Uppdragstyp"
          >
            {report.mission.missionType}
          </DetailRow>
          {report.mission.customer ? (
            <DetailRow label="Kund">{report.mission.customer.name}</DetailRow>
          ) : null}
          <DetailRow
            icon={<MapPinIcon className="h-[18px] w-[18px]" />}
            label="Genomsökt område"
            align="column"
          >
            <p className="whitespace-pre-wrap text-fg-muted">
              {report.areasSearched || "—"}
            </p>
          </DetailRow>
          <DetailRow
            icon={<ScentIcon className="h-[18px] w-[18px]" />}
            label="Markeringar"
          >
            {report.indications.length} st
          </DetailRow>
          <DetailRow
            icon={<CheckCircleIcon className="h-[18px] w-[18px]" />}
            label="Fynd"
            align="column"
          >
            <p className="whitespace-pre-wrap text-fg-muted">
              {report.findings || "Inga fynd"}
            </p>
          </DetailRow>
          <DetailRow
            icon={<AlertIcon className="h-[18px] w-[18px]" />}
            label="Avvikelser"
            align="column"
          >
            <p className="whitespace-pre-wrap text-fg-muted">
              {report.deviations || "Inga"}
            </p>
          </DetailRow>
          <DetailRow
            icon={<ShieldIcon className="h-[18px] w-[18px]" />}
            label="Åtgärder"
            align="column"
          >
            <p className="whitespace-pre-wrap text-fg-muted">
              {report.actions || "—"}
            </p>
          </DetailRow>
        </DetailList>
      </section>

      {report.indications.length > 0 ? (
        <section className="mb-5">
          <SectionHeader title="Markeringar" />
          <div className="card divide-y divide-line-soft">
            {report.indications.map((indication) => (
              <div key={indication.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {indication.location || "Plats ej angiven"}
                    </p>
                    {indication.description ? (
                      <p className="mt-0.5 text-sm text-fg-muted">
                        {indication.description}
                      </p>
                    ) : null}
                    {indication.handedOverTo ? (
                      <p className="mt-1 text-xs text-fg-dim">
                        Överlämnat till {indication.handedOverTo}
                      </p>
                    ) : null}
                  </div>
                  <Badge
                    tone={
                      indication.outcome === "FIND"
                        ? "ok"
                        : indication.outcome === "FALSE_INDICATION"
                          ? "danger"
                          : "neutral"
                    }
                  >
                    {INDICATION_OUTCOME_LABELS[indication.outcome] ??
                      indication.outcome}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mb-5">
        <SectionHeader title="Bilder" />
        <div className="card p-4">
          <MediaGrid
            assets={report.media}
            uploadAction={uploadReportMedia}
            parentField="reportId"
            parentId={report.id}
            canAdd={editable}
          />
        </div>
      </section>

      <section className="mb-5">
        <SectionHeader title="Kommentarer" />
        <CommentThread comments={report.comments} />
        <div className="mt-2.5">
          <CommentForm
            action={addReportComment}
            idField="reportId"
            idValue={report.id}
          />
        </div>
      </section>

      {/* Skribentens egna åtgärder: rätta rapporten, och skicka in ett utkast */}
      {editable ? (
        <section className="mb-3 flex gap-2.5">
          <Link
            href={`/rapporter/${report.id}/redigera`}
            className="btn btn-secondary flex-1"
          >
            <PencilIcon className="h-[18px] w-[18px]" />
            Rätta uppgifterna
          </Link>
          {report.status !== "SUBMITTED" ? (
            <form action={submitReport} className="flex-1">
              <input type="hidden" name="reportId" value={report.id} />
              <button type="submit" className="btn btn-primary w-full">
                Skicka in
              </button>
            </form>
          ) : null}
        </section>
      ) : null}

      {/* Granskning */}
      {canApprove ? (
        <div className="flex gap-2.5">
          <form action={requestReportChanges} className="flex-1">
            <input type="hidden" name="reportId" value={report.id} />
            <button type="submit" className="btn btn-secondary w-full">
              Begär komplettering
            </button>
          </form>
          <form action={approveReport} className="flex-1">
            <input type="hidden" name="reportId" value={report.id} />
            <button type="submit" className="btn btn-primary w-full">
              <CheckCircleIcon className="h-[18px] w-[18px]" />
              Godkänn
            </button>
          </form>
        </div>
      ) : null}

      <p className="mt-4 text-center text-xs text-fg-dim">
        Upprättad av {report.author.name}
        {report.submittedAt ? ` ${formatShortDate(report.submittedAt)}` : ""}
        {report.approvedBy ? ` · Godkänd av ${report.approvedBy.name}` : ""}
      </p>

      <Link
        href={`/uppdrag/${report.missionId}`}
        className="btn btn-secondary mt-4 w-full"
      >
        Till uppdraget
      </Link>
    </AppShell>
  );
}
