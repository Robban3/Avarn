import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Badge,
  DateBlock,
  DisciplineTag,
  EmptyState,
  LinkCard,
} from "@/components/ui";
import { BriefcaseIcon, PlusIcon } from "@/components/icons";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { can, regionScope, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import {
  formatDayNumber,
  formatMonthShort,
  formatTime,
} from "@/lib/format";
import { MISSION_STATUS_LABELS } from "@/lib/domain";
import type { Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Uppdrag" };

const TABS = [
  { value: "kommande", label: "Kommande" },
  { value: "pagaende", label: "Pågående" },
  { value: "historik", label: "Historik" },
];

export default async function MissionsPage({
  searchParams,
}: PageProps<"/uppdrag">) {
  const user = await requireUser();
  const params = await searchParams;
  const tab = typeof params.flik === "string" ? params.flik : "kommande";
  const unread = await unreadNotificationCount(user.id);

  /**
   * Vad man ser beror på rollen: hundföraren ser uppdrag som tilldelats
   * något av hens ekipage, medan ledningen ser allt i sin region.
   */
  const teamIds = (
    await db.team.findMany({ where: teamScope(user), select: { id: true } })
  ).map((t) => t.id);

  const visibility: Prisma.MissionWhereInput = can(user, "mission:assign")
    ? regionScope(user)
    : { assignments: { some: { teamId: { in: teamIds } } } };

  const now = new Date();
  const timeFilter: Prisma.MissionWhereInput =
    tab === "kommande"
      ? { startAt: { gte: now }, status: { notIn: ["COMPLETED", "CANCELLED"] } }
      : tab === "pagaende"
        ? { status: "IN_PROGRESS" }
        : { OR: [{ startAt: { lt: now } }, { status: { in: ["COMPLETED", "CANCELLED"] } }] };

  const missions = await db.mission.findMany({
    where: { AND: [visibility, timeFilter] },
    include: {
      discipline: true,
      region: true,
      assignments: {
        include: { team: { include: { dog: true, handler: true } } },
      },
      _count: { select: { reports: true } },
    },
    orderBy: { startAt: tab === "historik" ? "desc" : "asc" },
    take: 50,
  });

  return (
    <AppShell
      title="Uppdrag"
      unread={unread}
      role={user.role}
      action={
        can(user, "mission:create") ? (
          <Link
            href="/uppdrag/nytt"
            aria-label="Nytt uppdrag"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-brand transition-colors hover:bg-surface-2"
          >
            <PlusIcon className="h-[22px] w-[22px]" />
          </Link>
        ) : undefined
      }
    >
      {/* Kommande / Pågående / Historik */}
      <div className="mb-4 flex border-b border-line">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/uppdrag?flik=${t.value}`}
            className={`flex-1 px-2 pb-2.5 text-center text-[13px] font-semibold uppercase tracking-wide transition-colors ${
              tab === t.value
                ? "border-b-2 border-brand text-brand"
                : "text-fg-dim hover:text-fg-muted"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {missions.length === 0 ? (
        <EmptyState
          icon={<BriefcaseIcon className="h-7 w-7" />}
          title={
            tab === "kommande"
              ? "Inga kommande uppdrag"
              : tab === "pagaende"
                ? "Inga pågående uppdrag"
                : "Inga tidigare uppdrag"
          }
          description={
            can(user, "mission:create")
              ? "Lägg upp ett uppdrag och tilldela ett ekipage."
              : "Uppdrag som tilldelas ditt ekipage visas här."
          }
          action={
            can(user, "mission:create") ? (
              <Link href="/uppdrag/nytt" className="btn btn-primary">
                Nytt uppdrag
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2.5">
          {missions.map((mission) => {
            const offered = mission.assignments.some(
              (a) => a.status === "OFFERED" && teamIds.includes(a.teamId),
            );
            return (
              <LinkCard key={mission.id} href={`/uppdrag/${mission.id}`}>
                <div className="flex items-center gap-3">
                  <DateBlock
                    day={formatDayNumber(mission.startAt)}
                    month={formatMonthShort(mission.startAt)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-fg-muted">
                      {formatTime(mission.startAt)}
                      {can(user, "mission:assign")
                        ? ` · ${mission.reference}`
                        : ""}
                    </p>
                    <p className="truncate text-[15px] font-semibold">
                      {mission.title}
                    </p>
                    <p className="truncate text-xs text-fg-muted">
                      {mission.locality}
                    </p>
                    {offered ? (
                      <p className="mt-1 text-xs font-medium text-warn">
                        Väntar på ditt svar
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {mission.discipline ? (
                      <DisciplineTag label={mission.discipline.shortLabel} />
                    ) : null}
                    {tab !== "kommande" ? (
                      <Badge
                        tone={
                          mission.status === "COMPLETED"
                            ? "ok"
                            : mission.status === "CANCELLED"
                              ? "danger"
                              : "neutral"
                        }
                      >
                        {MISSION_STATUS_LABELS[mission.status] ?? mission.status}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </LinkCard>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
