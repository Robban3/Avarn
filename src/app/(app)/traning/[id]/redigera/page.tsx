import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { requireCapability, unreadNotificationCount } from "@/lib/auth";
import { canEditSession, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { SessionForm } from "../../nytt/session-form";
import { updateSession } from "../../actions";

export const metadata: Metadata = { title: "Rätta träningspass" };

/** Klockslag i svensk tidszon, som time-fältet vill ha det. */
function timeOf(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** Datum i svensk tidszon som YYYY-MM-DD. */
function dateOf(date: Date) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "01";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export default async function EditSessionPage({
  params,
}: PageProps<"/traning/[id]/redigera">) {
  const { id } = await params;
  const user = await requireCapability("session:create");
  const installningar = await getSettings();
  const unread = await unreadNotificationCount(user.id);

  const session = await db.trainingSession.findFirst({
    where: { id, team: teamScope(user) },
    include: { team: { include: { dog: true, handler: true } } },
  });
  if (!session) notFound();

  // Godkända pass är låsta, och bara den som rapporterat får rätta.
  if (!canEditSession(user, session)) {
    redirect(`/traning/${session.id}`);
  }

  const [teams, disciplines] = await Promise.all([
    db.team.findMany({
      where: { ...teamScope(user), status: "ACTIVE" },
      include: { dog: true, handler: true },
      orderBy: { dog: { name: "asc" } },
    }),
    db.searchDiscipline.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <AppShell
      title="Rätta träningspass"
      backHref={`/traning/${session.id}`}
      unread={unread}
      role={user.role}
    >
      <SessionForm
        action={updateSession}
        initial={{
          sessionId: session.id,
          teamId: session.teamId,
          date: dateOf(session.startAt),
          startTime: timeOf(session.startAt),
          endTime: session.endAt ? timeOf(session.endAt) : "",
          location: session.location,
          trainingArea: session.trainingArea,
          environment: session.environment,
          targetOdor: session.targetOdor,
          disciplineId: session.disciplineId ?? "",
          hideCount: session.hideCount,
          foundCount: session.foundCount,
          comment: session.comment ?? "",
        }}
        teams={teams.map((t) => ({
          id: t.id,
          label: `${t.dog.name} · ${t.handler.name}`,
        }))}
        disciplines={disciplines.map((d) => ({ id: d.id, label: d.name }))}
        trainingAreas={installningar.trainingAreas}
        environments={installningar.searchEnvironments}
        targetOdors={installningar.targetOdors}
        plannedExercises={[]}
        defaults={{ date: "", startTime: "", endTime: "" }}
      />
    </AppShell>
  );
}
