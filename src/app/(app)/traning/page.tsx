import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Badge,
  EmptyState,
  LinkCard,
  PageHeading,
  SectionHeader,
} from "@/components/ui";
import { PlusIcon, TrainingIcon, ClipboardIcon } from "@/components/icons";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { can, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import {
  formatShortDate,
  formatTimeRange,
  durationMinutes,
} from "@/lib/format";
import { SESSION_STATUS_LABELS } from "@/lib/domain";

export const metadata: Metadata = { title: "Träning" };

const STATUS_TONES: Record<string, "ok" | "warn" | "neutral" | "brand"> = {
  APPROVED: "ok",
  SUBMITTED: "brand",
  CHANGES_REQUESTED: "warn",
  DRAFT: "neutral",
};

export default async function TrainingPage({
  searchParams,
}: PageProps<"/traning">) {
  const user = await requireUser();
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "alla";
  const unread = await unreadNotificationCount(user.id);

  const [sessions, plannedCount] = await Promise.all([
    db.trainingSession.findMany({
      where: {
        team: teamScope(user),
        ...(status !== "alla" ? { status } : {}),
      },
      include: {
        team: { include: { dog: true, handler: true } },
        _count: { select: { comments: true, media: true } },
      },
      orderBy: { startAt: "desc" },
      take: 50,
    }),
    db.plannedExercise.count({
      where: { status: "PLANNED", plan: { team: teamScope(user) } },
    }),
  ]);

  const filters = [
    { value: "alla", label: "Alla" },
    { value: "SUBMITTED", label: "Inskickade" },
    { value: "APPROVED", label: "Godkända" },
    { value: "DRAFT", label: "Utkast" },
  ];

  return (
    <AppShell
      branded
      title="Hundar"
      menu={false}
      unread={unread}
      role={user.role}
    >
      <PageHeading
        action={
          can(user, "session:create") ? (
            <Link
              href="/traning/nytt"
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-brand/40 px-3 py-2 text-[13px] font-medium text-brand transition-colors hover:bg-brand/10"
            >
              <PlusIcon className="h-[16px] w-[16px]" />
              Nytt pass
            </Link>
          ) : undefined
        }
      >
        Träningsdagbok
      </PageHeading>

      {/* Dagbok / Plan */}
      <div className="mb-4 flex border-b border-line">
        <span className="border-b-2 border-brand px-4 pb-2.5 text-sm font-semibold text-brand">
          Dagbok
        </span>
        <Link
          href="/traning/plan"
          className="flex items-center gap-2 px-4 pb-2.5 text-sm font-medium text-fg-dim transition-colors hover:text-fg-muted"
        >
          Träningsplan
          {plannedCount > 0 ? (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-surface-3 px-1 text-[10px] font-bold text-fg-muted">
              {plannedCount}
            </span>
          ) : null}
        </Link>
      </div>

      {/* Statusfilter */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value === "alla" ? "/traning" : `/traning?status=${f.value}`}
            className={`chip ${
              status === f.value
                ? "border-brand/40 bg-brand/12 text-brand"
                : ""
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={<TrainingIcon className="h-7 w-7" />}
          title="Inga träningspass"
          description={
            status === "alla"
              ? "Rapportera ditt första pass så byggs dagboken upp här."
              : "Inga pass med den statusen."
          }
          action={
            can(user, "session:create") ? (
              <Link href="/traning/nytt" className="btn btn-primary">
                Nytt träningspass
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <SectionHeader title={`${sessions.length} pass`} />
          <div className="space-y-2.5">
            {sessions.map((session) => {
              const minutes = durationMinutes(session.startAt, session.endAt);
              return (
                <LinkCard key={session.id} href={`/traning/${session.id}`}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <p className="text-xs text-fg-muted">
                      {formatShortDate(session.startAt)} ·{" "}
                      {formatTimeRange(session.startAt, session.endAt)}
                    </p>
                    <Badge tone={STATUS_TONES[session.status] ?? "neutral"}>
                      {SESSION_STATUS_LABELS[session.status] ?? session.status}
                    </Badge>
                  </div>
                  <p className="truncate text-[15px] font-semibold">
                    {session.trainingArea} – {session.environment}
                  </p>
                  <p className="truncate text-xs text-fg-muted">
                    {session.location} · {session.team.dog.name}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs">
                    <span className="text-brand">
                      {session.foundCount}/{session.hideCount} markeringar
                    </span>
                    {minutes > 0 ? (
                      <span className="text-fg-dim">{minutes} min</span>
                    ) : null}
                    {session._count.comments > 0 ? (
                      <span className="text-fg-dim">
                        {session._count.comments} kommentar
                        {session._count.comments === 1 ? "" : "er"}
                      </span>
                    ) : null}
                  </div>
                </LinkCard>
              );
            })}
          </div>
        </>
      )}

      {can(user, "plan:manage") ? (
        <Link href="/traning/plan" className="btn btn-secondary mt-4 w-full">
          <ClipboardIcon className="h-[18px] w-[18px]" />
          Hantera träningsplaner
        </Link>
      ) : null}
    </AppShell>
  );
}
