import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Badge,
  DetailList,
  DetailRow,
  SectionHeader,
} from "@/components/ui";
import {
  BoxIcon,
  CheckCircleIcon,
  MapPinIcon,
  MessageIcon,
  PencilIcon,
  ScentIcon,
  TreeIcon,
} from "@/components/icons";
import { MediaGrid } from "@/components/MediaGrid";
import { CommentThread } from "@/components/CommentThread";
import { CommentForm } from "@/components/CommentForm";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { can, canEditSession, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import {
  formatDate,
  formatTimeRange,
  durationMinutes,
  formatShortDate,
} from "@/lib/format";
import {
  DIFFICULTY_LABELS,
  HIDE_OUTCOME_LABELS,
  SESSION_STATUS_LABELS,
} from "@/lib/domain";
import {
  addSessionComment,
  approveSession,
  requestChanges,
  submitSession,
  uploadSessionMedia,
} from "../actions";

export const metadata: Metadata = { title: "Träningspass" };

const STATUS_TONES: Record<string, "ok" | "warn" | "neutral" | "brand"> = {
  APPROVED: "ok",
  SUBMITTED: "brand",
  CHANGES_REQUESTED: "warn",
  DRAFT: "neutral",
};

export default async function SessionPage({
  params,
}: PageProps<"/traning/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const unread = await unreadNotificationCount(user.id);

  const session = await db.trainingSession.findFirst({
    where: { id, team: teamScope(user) },
    include: {
      team: { include: { dog: true, handler: true, region: true } },
      discipline: true,
      createdBy: true,
      approvedBy: true,
      hides: { orderBy: { sortOrder: "asc" } },
      media: { orderBy: { createdAt: "asc" } },
      comments: {
        include: { author: true },
        orderBy: { createdAt: "asc" },
      },
      plannedExercise: { include: { plan: true } },
    },
  });

  if (!session) notFound();

  await audit({
    userId: user.id,
    action: "READ",
    entityType: "TrainingSession",
    entityId: session.id,
  });

  const minutes = durationMinutes(session.startAt, session.endAt);
  const editable = canEditSession(user, session);
  const canApprove =
    can(user, "session:approve") && session.status !== "APPROVED";

  return (
    <AppShell
      title="Träningsdagbok"
      backHref="/traning"
      unread={unread}
      role={user.role}
    >
      {/* Rubrikkort */}
      <section className="card mb-4 p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-fg-muted">
              {formatDate(session.startAt)}
            </p>
            <p className="text-sm text-fg-muted">
              {formatTimeRange(session.startAt, session.endAt)}
              {minutes > 0 ? ` · ${minutes} min` : ""}
            </p>
          </div>
          <Badge tone={STATUS_TONES[session.status] ?? "neutral"}>
            {SESSION_STATUS_LABELS[session.status] ?? session.status}
          </Badge>
        </div>
        <h2 className="text-xl font-semibold leading-tight">
          {session.trainingArea} – {session.environment}
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-fg-muted">
          <MapPinIcon className="h-4 w-4" />
          {session.location}
        </p>
        <p className="mt-2 text-sm text-brand">
          {session.team.dog.name} · {session.team.handler.name}
        </p>
      </section>

      {/* Passets innehåll */}
      <section className="mb-5">
        <DetailList>
          <DetailRow
            icon={<TreeIcon className="h-[18px] w-[18px]" />}
            label="Sökmiljö"
          >
            {session.environment}
          </DetailRow>
          <DetailRow
            icon={<ScentIcon className="h-[18px] w-[18px]" />}
            label="Måldoft"
          >
            {session.targetOdor}
          </DetailRow>
          {session.discipline ? (
            <DetailRow
              icon={<ScentIcon className="h-[18px] w-[18px]" />}
              label="Sökinriktning"
            >
              {session.discipline.name}
            </DetailRow>
          ) : null}
          <DetailRow
            icon={<BoxIcon className="h-[18px] w-[18px]" />}
            label="Gömmor"
          >
            {session.hideCount} st
          </DetailRow>
          <DetailRow
            icon={<CheckCircleIcon className="h-[18px] w-[18px]" />}
            label="Resultat"
          >
            <span className="font-medium text-brand">
              {session.foundCount}/{session.hideCount} markeringar
            </span>
          </DetailRow>
          {session.comment ? (
            <DetailRow
              icon={<MessageIcon className="h-[18px] w-[18px]" />}
              label="Kommentar"
              align="column"
            >
              <p className="whitespace-pre-wrap text-fg-muted">
                {session.comment}
              </p>
            </DetailRow>
          ) : null}
        </DetailList>
      </section>

      {/* Planerad övning som passet hör till */}
      {session.plannedExercise ? (
        <section className="mb-5">
          <SectionHeader
            title="Planerad övning"
            href="/traning/plan"
            linkLabel="Till planen"
          />
          <div className="card p-4">
            <p className="text-sm font-semibold">
              {session.plannedExercise.title}
            </p>
            <p className="mt-0.5 text-xs text-fg-muted">
              Ur planen “{session.plannedExercise.plan.title}”
            </p>
            {session.plannedExercise.instructions ? (
              <p className="mt-2 text-sm text-fg-muted">
                {session.plannedExercise.instructions}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Gömmor i detalj */}
      {session.hides.length > 0 ? (
        <section className="mb-5">
          <SectionHeader title="Gömmor" />
          <div className="card divide-y divide-line-soft">
            {session.hides.map((hide) => (
              <div key={hide.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-fg-muted">
                  {hide.sortOrder}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {hide.placement ?? hide.label ?? `Gömma ${hide.sortOrder}`}
                  </p>
                  <p className="text-xs text-fg-dim">
                    {[
                      hide.heightCm ? `${hide.heightCm} cm` : null,
                      hide.difficulty
                        ? DIFFICULTY_LABELS[hide.difficulty]
                        : null,
                      hide.searchSeconds ? `${hide.searchSeconds} s` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <Badge
                  tone={
                    hide.outcome === "FOUND"
                      ? "ok"
                      : hide.outcome === "MISSED"
                        ? "warn"
                        : "danger"
                  }
                >
                  {HIDE_OUTCOME_LABELS[hide.outcome] ?? hide.outcome}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Bilder och filmer */}
      <section className="mb-5">
        <SectionHeader title="Bilder & filmer" />
        <div className="card p-4">
          <MediaGrid
            assets={session.media}
            uploadAction={uploadSessionMedia}
            parentField="sessionId"
            parentId={session.id}
            canAdd={editable}
          />
        </div>
      </section>

      {/* Instruktörskommentarer */}
      <section className="mb-5">
        <SectionHeader title="Instruktörskommentar" />
        <CommentThread comments={session.comments} />
        <div className="mt-2.5">
          <CommentForm
            action={addSessionComment}
            idField="sessionId"
            idValue={session.id}
            placeholder={
              can(user, "session:approve")
                ? "Lämna återkoppling till hundföraren …"
                : "Skriv en kommentar till din instruktör …"
            }
          />
        </div>
      </section>

      {/* Förarens egna åtgärder: rätta passet, och skicka in ett utkast */}
      {editable ? (
        <section className="mb-3 flex gap-2.5">
          <Link
            href={`/traning/${session.id}/redigera`}
            className="btn btn-secondary flex-1"
          >
            <PencilIcon className="h-[18px] w-[18px]" />
            Rätta uppgifterna
          </Link>
          {session.status !== "SUBMITTED" ? (
            <form action={submitSession} className="flex-1">
              <input type="hidden" name="sessionId" value={session.id} />
              <button type="submit" className="btn btn-primary w-full">
                Skicka in
              </button>
            </form>
          ) : null}
        </section>
      ) : null}

      {/* Granskning */}
      {canApprove ? (
        <section className="mb-2 flex gap-2.5">
          <form action={approveSession} className="flex-1">
            <input type="hidden" name="sessionId" value={session.id} />
            <button type="submit" className="btn btn-primary w-full">
              <CheckCircleIcon className="h-[18px] w-[18px]" />
              Godkänn träningen
            </button>
          </form>
          <form action={requestChanges}>
            <input type="hidden" name="sessionId" value={session.id} />
            <button type="submit" className="btn btn-secondary">
              Begär komplettering
            </button>
          </form>
        </section>
      ) : null}

      {session.status === "APPROVED" && session.approvedBy ? (
        <p className="text-center text-xs text-fg-dim">
          Godkänt av {session.approvedBy.name}
          {session.approvedAt ? ` ${formatShortDate(session.approvedAt)}` : ""}
        </p>
      ) : null}
    </AppShell>
  );
}
