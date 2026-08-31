import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/ui";
import { PawIcon } from "@/components/icons";
import { requireCapability, unreadNotificationCount } from "@/lib/auth";
import { teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import {
  SEARCH_ENVIRONMENTS,
  TARGET_ODORS,
  TRAINING_AREAS,
} from "@/lib/domain";
import { SessionForm } from "./session-form";

export const metadata: Metadata = { title: "Nytt träningspass" };

/** Dagens datum och en rimlig passtid, i svensk tidszon. */
function defaultDateTime() {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const hour = Number(get("hour"));
  const startHour = String(Math.max(0, hour - 1)).padStart(2, "0");
  return {
    date,
    startTime: `${startHour}:00`,
    endTime: `${String(hour).padStart(2, "0")}:00`,
  };
}

export default async function NewSessionPage() {
  const user = await requireCapability("session:create");
  const unread = await unreadNotificationCount(user.id);

  const [teams, disciplines, exercises] = await Promise.all([
    db.team.findMany({
      where: { ...teamScope(user), status: "ACTIVE" },
      include: { dog: true, handler: true },
      orderBy: { dog: { name: "asc" } },
    }),
    db.searchDiscipline.findMany({ orderBy: { sortOrder: "asc" } }),
    db.plannedExercise.findMany({
      where: { status: "PLANNED", plan: { team: teamScope(user) } },
      include: { plan: { select: { teamId: true } } },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  if (teams.length === 0) {
    return (
      <AppShell
        title="Nytt träningspass"
        backHref="/traning"
        unread={unread}
        role={user.role}
      >
        <EmptyState
          icon={<PawIcon className="h-7 w-7" />}
          title="Inget ekipage att rapportera för"
          description="Du behöver vara kopplad till minst en hund innan du kan föra träningsdagbok."
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Nytt träningspass"
      backHref="/traning"
      unread={unread}
      role={user.role}
    >
      <SessionForm
        teams={teams.map((t) => ({
          id: t.id,
          label: `${t.dog.name} · ${t.handler.name}`,
        }))}
        disciplines={disciplines.map((d) => ({ id: d.id, label: d.name }))}
        trainingAreas={TRAINING_AREAS}
        environments={SEARCH_ENVIRONMENTS}
        targetOdors={TARGET_ODORS}
        plannedExercises={exercises.map((e) => ({
          id: e.id,
          title: e.title,
          teamId: e.plan.teamId,
          targetOdor: e.targetOdor,
          environment: e.environment,
          disciplineId: e.disciplineId,
        }))}
        defaults={defaultDateTime()}
      />
    </AppShell>
  );
}
