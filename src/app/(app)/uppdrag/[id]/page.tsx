import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Badge,
  DetailList,
  DetailRow,
  SectionHeader,
  Avatar,
} from "@/components/ui";
import {
  AlertIcon,
  CalendarIcon,
  ClipboardIcon,
  ClockIcon,
  MapPinIcon,
  MessageIcon,
  PencilIcon,
  PhoneIcon,
  RouteIcon,
  ScentIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { can, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import {
  formatDayNumber,
  formatMonthShort,
  formatTimeRange,
  formatShortDate,
  formatWeekday,
  listaFranText,
} from "@/lib/format";
import {
  ASSIGNMENT_STATUS_LABELS,
  MISSION_STATUS_LABELS,
  REPORT_STATUS_LABELS,
  assignmentTone,
  missionTone,
  reportTone,
} from "@/lib/domain";
import { missionForUser } from "@/lib/queries";
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
  // Avgränsningen bor i queries.ts eftersom detaljvyn delar den.
  const mission = await missionForUser(user, id);

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

  const utrustning = listaFranText(mission.equipment);
  const detaljer = `/uppdrag/${mission.id}/detaljer`;

  // Ett eget uppdrag som är påbörjat men inte avslutat har en operativ vy
  // att gå tillbaka till.
  const pagaende = myAccepted.some((a) => a.startedAt && !a.endedAt);

  return (
    <AppShell
      title="Uppdrag"
      backHref="/uppdrag"
      unread={unread}
      role={user.role}
      action={
        canAssign ? (
          <Link
            href={`/uppdrag/${mission.id}/redigera`}
            aria-label="Redigera uppdraget"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-2"
          >
            <PencilIcon className="h-[22px] w-[22px]" />
          </Link>
        ) : undefined
      }
    >
      {/* 1. Status, rubrik och uppdragsnummer */}
      <section className="mb-4">
        <div className="mb-2.5 flex items-start justify-between gap-3">
          <Badge tone={missionTone(mission.status)}>
            {MISSION_STATUS_LABELS[mission.status] ?? mission.status}
          </Badge>
          <span className="shrink-0 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[11px] font-medium text-fg-muted">
            ID: {mission.reference}
          </span>
        </div>
        <h2 className="text-[22px] font-bold leading-tight">{mission.title}</h2>
        <p className="mt-1 text-sm text-fg-muted">{mission.locality}</p>
      </section>

      {/* 2. När – med kalendernedladdning så att knappen betyder något */}
      <section className="card mb-4 flex items-stretch">
        <div className="flex flex-1 items-center gap-3 p-4">
          <CalendarIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
          <div className="flex shrink-0 flex-col items-center leading-none">
            <span className="text-[22px] font-bold">
              {formatDayNumber(mission.startAt)}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
              {formatMonthShort(mission.startAt)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm capitalize text-fg-muted">
              {formatWeekday(mission.startAt)}
            </p>
            <p className="truncate text-sm font-semibold">
              {formatTimeRange(mission.startAt, mission.endAt)}
            </p>
          </div>
        </div>
        <a
          href={`/uppdrag/${mission.id}/kalender`}
          className="flex w-[112px] shrink-0 flex-col items-center justify-center gap-1.5 border-l border-line px-2 text-center text-[12px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <CalendarIcon className="h-[18px] w-[18px] text-brand" />
          Lägg till i kalender
        </a>
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

      {/* 3. Allt föraren behöver för att förbereda sig */}
      <DetailList className="mb-4">
        <DetailRow
          icon={<ClipboardIcon className="h-[18px] w-[18px]" />}
          label="Uppdragstyp"
        >
          {mission.missionType}
        </DetailRow>
        {mission.discipline ? (
          <DetailRow
            icon={<ScentIcon className="h-[18px] w-[18px]" />}
            label="Sökinriktning"
          >
            {mission.discipline.shortLabel}
          </DetailRow>
        ) : null}
        {mission.customer ? (
          <DetailRow
            icon={<UsersIcon className="h-[18px] w-[18px]" />}
            label="Kund"
          >
            {mission.customer.name}
          </DetailRow>
        ) : null}
        {mission.contactName || mission.contactPhone ? (
          <DetailRow
            icon={<UserIcon className="h-[18px] w-[18px]" />}
            label="Kontaktperson"
            action={
              mission.contactPhone ? (
                <div className="flex gap-2">
                  <a
                    href={`tel:${mission.contactPhone.replace(/\s/g, "")}`}
                    aria-label={`Ring ${mission.contactName ?? "kontaktpersonen"}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand/40 text-brand transition-colors hover:bg-brand/10"
                  >
                    <PhoneIcon className="h-[18px] w-[18px]" />
                  </a>
                  <a
                    href={`sms:${mission.contactPhone.replace(/\s/g, "")}`}
                    aria-label={`Skicka meddelande till ${mission.contactName ?? "kontaktpersonen"}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand/40 text-brand transition-colors hover:bg-brand/10"
                  >
                    <MessageIcon className="h-[18px] w-[18px]" />
                  </a>
                </div>
              ) : undefined
            }
          >
            <span className="block">{mission.contactName ?? "—"}</span>
            {mission.contactPhone ? (
              <span className="block text-xs text-fg-muted">
                {mission.contactPhone}
              </span>
            ) : null}
          </DetailRow>
        ) : null}
        <DetailRow
          icon={<MapPinIcon className="h-[18px] w-[18px]" />}
          label="Plats"
          href={detaljer}
        >
          <span className="block">{mission.address ?? mission.locality}</span>
          {mission.address ? (
            <span className="block text-xs text-fg-muted">
              {mission.locality}
            </span>
          ) : null}
        </DetailRow>
        {mission.meetingPoint ? (
          <DetailRow
            icon={<RouteIcon className="h-[18px] w-[18px]" />}
            label="Mötesplats"
            href={`${detaljer}?flik=plats`}
          >
            {mission.meetingPoint}
          </DetailRow>
        ) : null}
        {mission.specialInstructions ? (
          <DetailRow
            icon={<AlertIcon className="h-[18px] w-[18px]" />}
            label="Särskilda instruktioner"
            align="column"
          >
            <span className="whitespace-pre-wrap text-fg-muted">
              {mission.specialInstructions}
            </span>
          </DetailRow>
        ) : null}
        {utrustning.length > 0 ? (
          <DetailRow
            icon={<ShieldIcon className="h-[18px] w-[18px]" />}
            label="Utrustning / krav"
          >
            {utrustning.join(", ")}
          </DetailRow>
        ) : null}
      </DetailList>

      {/* 4. Vägen vidare till plats- och kartvyn */}
      <Link href={detaljer} className="btn btn-secondary mb-6 w-full">
        <MapPinIcon className="h-[18px] w-[18px] text-brand" />
        Visa på karta
      </Link>

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
                <Badge tone={assignmentTone(assignment.status)}>
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
                    {/* Namnet i etiketten: annars heter alla knapparna i
                        listan likadant, både för ögat och för uppläsning. */}
                    <button
                      type="submit"
                      aria-label={`Tilldela ${s.team.dog.name}`}
                      className="btn btn-secondary px-3 py-2 text-xs"
                    >
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
      {pagaende ? (
        <Link
          href={`/uppdrag/${mission.id}/pagaende`}
          className="btn btn-primary mb-3 w-full"
        >
          <ClockIcon className="h-[18px] w-[18px]" />
          Öppna pågående uppdrag
        </Link>
      ) : null}

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
