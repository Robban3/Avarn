import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Badge,
  DetailList,
  DetailRow,
  DisciplineTag,
  SectionHeader,
  Avatar,
} from "@/components/ui";
import {
  AlertIcon,
  CalendarIcon,
  ClipboardIcon,
  MapPinIcon,
  ScentIcon,
  UserIcon,
} from "@/components/icons";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { can, regionScope, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import {
  formatDate,
  formatTimeRange,
  formatShortDate,
} from "@/lib/format";
import {
  ASSIGNMENT_STATUS_LABELS,
  MISSION_STATUS_LABELS,
  REPORT_STATUS_LABELS,
  reportTone,
} from "@/lib/domain";
import { assignTeam, respondToAssignment, setMissionStatus } from "../actions";
import { suggestTeams } from "@/lib/assignment";

export const metadata: Metadata = { title: "Uppdrag" };

export default async function MissionPage({
  params,
}: PageProps<"/uppdrag/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const unread = await unreadNotificationCount(user.id);

  const teamIds = (
    await db.team.findMany({ where: teamScope(user), select: { id: true } })
  ).map((t) => t.id);

  // Ledningen når uppdrag i sin region; hundföraren bara sina tilldelade.
  const mission = await db.mission.findFirst({
    where: can(user, "mission:assign")
      ? { id, ...regionScope(user) }
      : { id, assignments: { some: { teamId: { in: teamIds } } } },
    include: {
      customer: true,
      discipline: true,
      region: true,
      createdBy: true,
      assignments: {
        include: {
          team: { include: { dog: true, handler: true, region: true } },
          assignedBy: true,
        },
      },
      reports: {
        include: { team: { include: { dog: true } }, author: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!mission) notFound();

  await audit({
    userId: user.id,
    action: "READ",
    entityType: "Mission",
    entityId: mission.id,
  });

  // Egna tilldelningar som väntar på svar
  const myPending = mission.assignments.filter(
    (a) => teamIds.includes(a.teamId) && a.status === "OFFERED",
  );
  const myAccepted = mission.assignments.filter(
    (a) => teamIds.includes(a.teamId) && a.status === "ACCEPTED",
  );
  // Har något av mina ekipage redan en rapport på uppdraget? Då ska knappen
  // leda dit i stället för att bjuda in till en andra rapport.
  const myReport = mission.reports.find((r) => teamIds.includes(r.teamId));

  const canAssign = can(user, "mission:assign");
  const suggestions = canAssign
    ? await suggestTeams(user, mission)
    : [];

  return (
    <AppShell
      title="Uppdrag"
      backHref="/uppdrag"
      unread={unread}
      role={user.role}
    >
      <section className="card mb-4 p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-fg-muted">
              {formatDate(mission.startAt)}
            </p>
            <p className="text-sm text-fg-muted">
              {formatTimeRange(mission.startAt, mission.endAt)}
            </p>
          </div>
          {mission.discipline ? (
            <DisciplineTag label={mission.discipline.shortLabel} />
          ) : null}
        </div>
        <h2 className="text-xl font-semibold leading-tight">{mission.title}</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-fg-muted">
          <MapPinIcon className="h-4 w-4" />
          {mission.address ? `${mission.address}, ` : ""}
          {mission.locality}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Badge
            tone={
              mission.status === "COMPLETED"
                ? "ok"
                : mission.status === "CANCELLED"
                  ? "danger"
                  : mission.status === "IN_PROGRESS"
                    ? "brand"
                    : "neutral"
            }
          >
            {MISSION_STATUS_LABELS[mission.status] ?? mission.status}
          </Badge>
          <span className="text-xs text-fg-dim">{mission.reference}</span>
        </div>
      </section>

      {/* Svar på tilldelning */}
      {myPending.length > 0 ? (
        <section className="card mb-4 border-brand/30 bg-brand/8 p-4">
          <p className="text-sm font-medium">
            Du är tilldelad det här uppdraget. Kan du ta det?
          </p>
          {myPending.map((assignment) => (
            <div key={assignment.id} className="mt-3 flex gap-2.5">
              <form action={respondToAssignment} className="flex-1">
                <input type="hidden" name="assignmentId" value={assignment.id} />
                <input type="hidden" name="answer" value="ACCEPTED" />
                <button type="submit" className="btn btn-primary w-full">
                  Acceptera
                </button>
              </form>
              <form action={respondToAssignment}>
                <input type="hidden" name="assignmentId" value={assignment.id} />
                <input type="hidden" name="answer" value="DECLINED" />
                <button type="submit" className="btn btn-secondary">
                  Avböj
                </button>
              </form>
            </div>
          ))}
        </section>
      ) : null}

      {/* Uppdragsuppgifter */}
      <section className="mb-5">
        <SectionHeader title="Uppdragsuppgifter" />
        <DetailList>
          <DetailRow
            icon={<ClipboardIcon className="h-[18px] w-[18px]" />}
            label="Uppdragstyp"
          >
            {mission.missionType}
          </DetailRow>
          {mission.discipline ? (
            <DetailRow
              icon={<ScentIcon className="h-[18px] w-[18px]" />}
              label="Sökdisciplin"
            >
              {mission.discipline.name}
            </DetailRow>
          ) : null}
          {mission.customer ? (
            <DetailRow
              icon={<UserIcon className="h-[18px] w-[18px]" />}
              label="Kund"
            >
              {mission.customer.name}
            </DetailRow>
          ) : null}
          {mission.contactName ? (
            <DetailRow label="Kontaktperson">{mission.contactName}</DetailRow>
          ) : null}
          {mission.contactPhone ? (
            <DetailRow label="Telefon">
              <a href={`tel:${mission.contactPhone}`} className="text-brand">
                {mission.contactPhone}
              </a>
            </DetailRow>
          ) : null}
          <DetailRow
            icon={<CalendarIcon className="h-[18px] w-[18px]" />}
            label="Region"
          >
            {mission.region.name}
          </DetailRow>
        </DetailList>
      </section>

      {/* Särskilda instruktioner */}
      {mission.specialInstructions ? (
        <section className="mb-5">
          <SectionHeader title="Särskilda instruktioner" />
          <div className="card flex gap-3 border-warn/25 bg-warn/6 p-4">
            <AlertIcon className="h-5 w-5 shrink-0 text-warn" />
            <p className="whitespace-pre-wrap text-sm text-fg">
              {mission.specialInstructions}
            </p>
          </div>
        </section>
      ) : null}

      {/* Tilldelade ekipage */}
      <section className="mb-5">
        <SectionHeader title="Tilldelade ekipage" />
        {mission.assignments.length === 0 ? (
          <p className="card px-4 py-4 text-sm text-fg-muted">
            Inget ekipage tilldelat ännu.
          </p>
        ) : (
          <div className="card divide-y divide-line-soft">
            {mission.assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <Avatar name={assignment.team.dog.name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {assignment.team.dog.name}
                  </p>
                  <p className="truncate text-xs text-fg-muted">
                    {assignment.team.handler.name} ·{" "}
                    {assignment.team.region.name}
                  </p>
                </div>
                <Badge
                  tone={
                    assignment.status === "ACCEPTED"
                      ? "ok"
                      : assignment.status === "DECLINED"
                        ? "danger"
                        : assignment.status === "COMPLETED"
                          ? "neutral"
                          : "warn"
                  }
                >
                  {ASSIGNMENT_STATUS_LABELS[assignment.status] ??
                    assignment.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Förslag på ekipage */}
      {canAssign ? (
        <section className="mb-5">
          <SectionHeader title="Föreslagna ekipage" />
          {suggestions.length === 0 ? (
            <p className="card px-4 py-4 text-sm text-fg-muted">
              Inga tillgängliga ekipage med rätt kompetens i regionen.
            </p>
          ) : (
            <div className="card divide-y divide-line-soft">
              {suggestions.map((s) => (
                <div key={s.team.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar name={s.team.dog.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {s.team.dog.name}
                    </p>
                    <p className="truncate text-xs text-fg-muted">
                      {s.team.handler.name}
                    </p>
                    <p className="truncate text-xs text-fg-dim">
                      {s.reasons.join(" · ")}
                    </p>
                  </div>
                  <form action={assignTeam}>
                    <input type="hidden" name="missionId" value={mission.id} />
                    <input type="hidden" name="teamId" value={s.team.id} />
                    <button type="submit" className="btn btn-secondary px-3 py-2 text-xs">
                      Tilldela
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {/* Rapporter */}
      <section className="mb-5">
        <SectionHeader title="Operativa rapporter" />
        {mission.reports.length === 0 ? (
          <p className="card px-4 py-4 text-sm text-fg-muted">
            Ingen rapport inlämnad ännu.
          </p>
        ) : (
          <div className="space-y-2.5">
            {mission.reports.map((report) => (
              <Link
                key={report.id}
                href={`/rapporter/${report.id}`}
                className="card flex items-center gap-3 p-3.5 transition-colors hover:bg-surface-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    Rapport · {report.team.dog.name}
                  </p>
                  <p className="truncate text-xs text-fg-muted">
                    {report.author.name} · {formatShortDate(report.createdAt)}
                  </p>
                </div>
                <Badge tone={reportTone(report.status)}>
                  {REPORT_STATUS_LABELS[report.status] ?? report.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Åtgärder */}
      {myReport ? (
        myReport.authorId === user.id && myReport.status !== "APPROVED" ? (
          <Link
            href={`/rapporter/${myReport.id}/redigera`}
            className="btn btn-primary w-full"
          >
            Fortsätt på rapporten
          </Link>
        ) : null
      ) : myAccepted.length > 0 ? (
        <Link
          href={`/rapporter/nytt?uppdrag=${mission.id}`}
          className="btn btn-primary w-full"
        >
          Fyll i operativ rapport
        </Link>
      ) : null}

      {canAssign && mission.status !== "COMPLETED" ? (
        <div className="mt-3 flex gap-2.5">
          {mission.status !== "IN_PROGRESS" ? (
            <form action={setMissionStatus} className="flex-1">
              <input type="hidden" name="missionId" value={mission.id} />
              <input type="hidden" name="status" value="IN_PROGRESS" />
              <button type="submit" className="btn btn-secondary w-full">
                Markera pågående
              </button>
            </form>
          ) : null}
          <form action={setMissionStatus} className="flex-1">
            <input type="hidden" name="missionId" value={mission.id} />
            <input type="hidden" name="status" value="COMPLETED" />
            <button type="submit" className="btn btn-secondary w-full">
              Markera avslutat
            </button>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}
