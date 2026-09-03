import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Badge, EmptyState, SectionHeader } from "@/components/ui";
import { BriefcaseIcon } from "@/components/icons";
import { ReportHeader } from "@/components/ReportHeader";
import { requireCapability, unreadNotificationCount } from "@/lib/auth";
import { teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { toLocalInput } from "@/lib/format";
import { REPORT_STATUS_LABELS, reportTone } from "@/lib/domain";
import { franHandelser } from "@/lib/handelser";
import { createReport } from "../actions";
import { ReportForm } from "./report-form";

export const metadata: Metadata = { title: "Ny rapport" };

export default async function NewReportPage({
  searchParams,
}: PageProps<"/rapporter/nytt">) {
  const user = await requireCapability("report:create");
  const params = await searchParams;
  const missionId = typeof params.uppdrag === "string" ? params.uppdrag : "";
  const unread = await unreadNotificationCount(user.id);

  if (!missionId) {
    // Utan uppdrag visas vilka uppdrag som väntar på rapport. Ett eget
    // utkast får inte gömma uppdraget – då ska det gå att öppna igen.
    const mine = await db.missionAssignment.findMany({
      where: {
        team: teamScope(user),
        status: { in: ["ACCEPTED", "COMPLETED"] },
      },
      include: {
        mission: {
          include: {
            reports: { select: { id: true, teamId: true, status: true } },
          },
        },
        team: { include: { dog: true } },
      },
      orderBy: { mission: { startAt: "desc" } },
    });

    // Prisma kan inte jämföra en nästlad relation med den yttre raden, så
    // uppdelningen på "eget ekipage" görs här.
    const ownReportOf = (a: (typeof mine)[number]) =>
      a.mission.reports.find((r) => r.teamId === a.teamId);

    const pending = mine.filter((a) => !ownReportOf(a));
    const started = mine.flatMap((a) => {
      const report = ownReportOf(a);
      return report && report.status !== "APPROVED"
        ? [{ assignment: a, report }]
        : [];
    });

    return (
      <AppShell
        title="Ny rapport"
        backHref="/rapporter"
        unread={unread}
        role={user.role}
      >
        {pending.length === 0 && started.length === 0 ? (
          <EmptyState
            icon={<BriefcaseIcon className="h-7 w-7" />}
            title="Inga uppdrag väntar på rapport"
            description="Rapporten fylls i efter ett genomfört uppdrag."
          />
        ) : null}

        {started.length > 0 ? (
          <section className="mb-5">
            <SectionHeader title="Påbörjade rapporter" />
            <div className="space-y-2.5">
              {started.map(({ assignment: a, report }) => (
                <Link
                  key={a.id}
                  href={`/rapporter/${report.id}/redigera`}
                  className="card flex items-center gap-3 p-3.5 transition-colors hover:bg-surface-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-fg-muted">
                      {a.mission.reference} · {a.team.dog.name}
                    </p>
                    <p className="truncate text-[15px] font-semibold">
                      {a.mission.title}
                    </p>
                  </div>
                  <Badge tone={reportTone(report.status)}>
                    {REPORT_STATUS_LABELS[report.status] ?? report.status}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {pending.length > 0 ? (
          <section>
            <SectionHeader title="Väntar på rapport" />
            <p className="mb-3 text-sm text-fg-muted">
              Välj vilket uppdrag rapporten gäller.
            </p>
            <div className="space-y-2.5">
              {pending.map((a) => (
                <Link
                  key={a.id}
                  href={`/rapporter/nytt?uppdrag=${a.missionId}`}
                  className="card block p-3.5 transition-colors hover:bg-surface-2"
                >
                  <p className="text-xs text-fg-muted">
                    {a.mission.reference} · {a.team.dog.name}
                  </p>
                  <p className="text-[15px] font-semibold">{a.mission.title}</p>
                  <p className="text-xs text-fg-muted">{a.mission.locality}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </AppShell>
    );
  }

  // Endast uppdrag som något av användarens ekipage är tilldelat.
  const assignments = await db.missionAssignment.findMany({
    where: { missionId, team: teamScope(user) },
    include: {
      mission: { include: { discipline: true, customer: true } },
      team: { include: { dog: true, handler: true } },
      events: { orderBy: { at: "asc" } },
    },
  });

  if (assignments.length === 0) notFound();
  const mission = assignments[0].mission;

  // Tryckte föraren "Starta uppdrag" är det den tiden som gäller, inte
  // uppdragets planerade start. Samma sak i andra änden.
  const egen = assignments.find((a) => a.startedAt) ?? assignments[0];
  const paborjat = egen.startedAt ?? mission.startAt;
  const avslutat = egen.endedAt ?? mission.endAt ?? mission.startAt;

  // Det som registrerades under uppdraget förifyller rapporten. Poängen
  // med snabbregistreringen är att slippa skriva samma sak två gånger:
  // markeringarna blir rader, resten blir text i rätt fält.
  const forifyllt = franHandelser(egen.events);

  return (
    <AppShell
      title="Uppdrag – rapport"
      backHref={`/uppdrag/${mission.id}`}
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
      <ReportHeader mission={mission} status="DRAFT" />

      <ReportForm
        action={createReport}
        mission={{
          id: mission.id,
          reference: mission.reference,
          title: mission.title,
          missionType: mission.missionType,
          locality: mission.locality,
          discipline: mission.discipline?.name ?? null,
          customer: mission.customer?.name ?? null,
        }}
        teams={assignments.map((a) => ({
          id: a.teamId,
          label: `${a.team.dog.name} · ${a.team.handler.name}`,
        }))}
        defaults={{
          startedAt: toLocalInput(paborjat),
          endedAt: toLocalInput(avslutat),
        }}
        initial={
          forifyllt
            ? {
                reportId: "",
                teamId: egen.teamId,
                startedAt: toLocalInput(paborjat),
                endedAt: toLocalInput(avslutat),
                areasSearched: mission.missionArea ?? "",
                areaSize: "",
                findings: forifyllt.findings,
                deviations: forifyllt.deviations,
                actions: "",
                comment: forifyllt.comment,
                indications: forifyllt.indications,
              }
            : undefined
        }
        genomfortAv={user.name}
        bilder={
          <p className="text-sm text-fg-muted">
            Bilder och filmer läggs till när rapporten är sparad en gång.
          </p>
        }
      />
    </AppShell>
  );
}
