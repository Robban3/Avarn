import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Badge, EmptyState, SectionHeader } from "@/components/ui";
import { ClipboardIcon, CheckCircleIcon } from "@/components/icons";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { can, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { formatShortDate, daysUntil } from "@/lib/format";
import {
  EXERCISE_STATUS_LABELS,
  PLAN_STATUS_LABELS,
  SEARCH_ENVIRONMENTS,
  TARGET_ODORS,
} from "@/lib/domain";
import { AddExerciseForm, NewPlanForm } from "./plan-forms";

export const metadata: Metadata = { title: "Träningsplan" };

/** Datumsträng (YYYY-MM-DD) för idag respektive om åtta veckor. */
function planDefaults() {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 56);
  return { start: iso(start), end: iso(end) };
}

export default async function TrainingPlanPage() {
  const user = await requireUser();
  const unread = await unreadNotificationCount(user.id);
  const manages = can(user, "plan:manage");

  const [plans, teams, diaryCount] = await Promise.all([
    db.trainingPlan.findMany({
      where: { team: teamScope(user), status: { not: "ARCHIVED" } },
      include: {
        team: { include: { dog: true, handler: true } },
        instructor: true,
        exercises: {
          orderBy: [{ status: "asc" }, { sortOrder: "asc" }],
          include: { session: { select: { id: true } } },
        },
      },
      orderBy: { periodStart: "desc" },
    }),
    manages
      ? db.team.findMany({
          where: { ...teamScope(user), status: "ACTIVE" },
          include: { dog: true, handler: true },
          orderBy: { dog: { name: "asc" } },
        })
      : Promise.resolve([]),
    db.trainingSession.count({ where: { team: teamScope(user) } }),
  ]);

  return (
    <AppShell title="Träningsplan" unread={unread} role={user.role}>
      <div className="mb-4 flex border-b border-line">
        <Link
          href="/traning"
          className="flex items-center gap-2 px-4 pb-2.5 text-sm font-medium text-fg-dim transition-colors hover:text-fg-muted"
        >
          Dagbok
          {diaryCount > 0 ? (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-surface-3 px-1 text-[10px] font-bold text-fg-muted">
              {diaryCount}
            </span>
          ) : null}
        </Link>
        <span className="border-b-2 border-brand px-4 pb-2.5 text-sm font-semibold text-brand">
          Träningsplan
        </span>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          icon={<ClipboardIcon className="h-7 w-7" />}
          title="Ingen träningsplan"
          description={
            manages
              ? "Lägg upp en plan så ser hundföraren vad som ska tränas."
              : "Din instruktör lägger upp planerad träning här."
          }
        />
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const done = plan.exercises.filter(
              (e) => e.status === "COMPLETED",
            ).length;

            return (
              <article key={plan.id} className="card overflow-hidden">
                <div className="p-4">
                  <div className="mb-1.5 flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold leading-tight">
                      {plan.title}
                    </h2>
                    <Badge tone={plan.status === "ACTIVE" ? "brand" : "neutral"}>
                      {PLAN_STATUS_LABELS[plan.status] ?? plan.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-fg-muted">
                    {plan.team.dog.name} · {plan.team.handler.name} ·{" "}
                    {formatShortDate(plan.periodStart)}–
                    {formatShortDate(plan.periodEnd)}
                  </p>
                  {plan.purpose ? (
                    <p className="mt-2 text-sm text-fg-muted">{plan.purpose}</p>
                  ) : null}
                  <p className="mt-2.5 text-xs text-fg-dim">
                    Instruktör: {plan.instructor.name} · {done} av{" "}
                    {plan.exercises.length} övningar genomförda
                  </p>
                </div>

                {plan.exercises.length > 0 ? (
                  <ul className="divide-y divide-line-soft border-t border-line-soft">
                    {plan.exercises.map((exercise) => {
                      const overdue =
                        exercise.status === "PLANNED" &&
                        exercise.dueDate &&
                        daysUntil(exercise.dueDate) < 0;

                      return (
                        <li key={exercise.id} className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                exercise.status === "COMPLETED"
                                  ? "border-ok/40 bg-ok/15 text-ok"
                                  : "border-line bg-surface-2 text-transparent"
                              }`}
                            >
                              <CheckCircleIcon className="h-3.5 w-3.5" />
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">
                                {exercise.title}
                              </p>
                              {exercise.instructions ? (
                                <p className="mt-1 text-sm text-fg-muted">
                                  {exercise.instructions}
                                </p>
                              ) : null}
                              <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-fg-dim">
                                {exercise.environment ? (
                                  <span>{exercise.environment}</span>
                                ) : null}
                                {exercise.targetOdor ? (
                                  <span>{exercise.targetOdor}</span>
                                ) : null}
                                {exercise.dueDate ? (
                                  <span className={overdue ? "text-warn" : ""}>
                                    Senast {formatShortDate(exercise.dueDate)}
                                    {overdue ? " · försenad" : ""}
                                  </span>
                                ) : null}
                              </p>

                              {exercise.status === "PLANNED" &&
                              can(user, "session:create") ? (
                                <Link
                                  href="/traning/nytt"
                                  className="mt-2 inline-block text-xs font-medium text-brand"
                                >
                                  Rapportera passet
                                </Link>
                              ) : null}
                              {exercise.session ? (
                                <Link
                                  href={`/traning/${exercise.session.id}`}
                                  className="mt-2 inline-block text-xs font-medium text-brand"
                                >
                                  Visa genomfört pass
                                </Link>
                              ) : null}
                            </div>

                            <Badge
                              tone={
                                exercise.status === "COMPLETED"
                                  ? "ok"
                                  : exercise.status === "SKIPPED"
                                    ? "neutral"
                                    : "brand"
                              }
                            >
                              {EXERCISE_STATUS_LABELS[exercise.status] ??
                                exercise.status}
                            </Badge>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                {manages ? (
                  <div className="border-t border-line-soft">
                    <AddExerciseForm
                      planId={plan.id}
                      environments={SEARCH_ENVIRONMENTS}
                      targetOdors={TARGET_ODORS}
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {manages && teams.length > 0 ? (
        <div className="mt-4">
          <SectionHeader title="Planering" />
          <NewPlanForm
            teams={teams.map((t) => ({
              id: t.id,
              label: `${t.dog.name} · ${t.handler.name}`,
            }))}
            defaults={planDefaults()}
          />
        </div>
      ) : null}
    </AppShell>
  );
}
