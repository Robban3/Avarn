import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Avatar,
  Badge,
  Chip,
  DetailList,
  DetailRow,
  LinkCard,
  SectionHeader,
  StatRow,
  StatTile,
} from "@/components/ui";
import { CertificateIcon, CheckCircleIcon } from "@/components/icons";
import { CERT_ICON_CLASSES } from "@/components/cert-styles";
import { requireCapability, unreadNotificationCount } from "@/lib/auth";
import { teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import {
  ageInYears,
  daysUntil,
  durationMinutes,
  formatShortDate,
} from "@/lib/format";
import { SESSION_STATUS_LABELS } from "@/lib/domain";
import { certStatus } from "@/lib/certifications";
import { startOfMonth } from "@/lib/stats";
import { FollowUpForm } from "./follow-up-form";
import { closeFollowUp } from "../../actions";

export const metadata: Metadata = { title: "Ekipage" };

export default async function InstructorTeamPage({
  params,
}: PageProps<"/instruktor/ekipage/[teamId]">) {
  const { teamId } = await params;
  const user = await requireCapability("instructor:view");
  const unread = await unreadNotificationCount(user.id);

  const team = await db.team.findFirst({
    where: { id: teamId, ...teamScope(user) },
    include: {
      dog: {
        include: { disciplines: { include: { discipline: true } } },
      },
      handler: { include: { handlerProfile: true } },
      region: true,
      certifications: { include: { type: true }, orderBy: { expiresAt: "asc" } },
      trainingSessions: {
        orderBy: { startAt: "desc" },
        take: 10,
        include: { _count: { select: { comments: true } } },
      },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { mission: true },
      },
      trainingPlans: {
        where: { status: "ACTIVE" },
        include: { exercises: true },
      },
      followUps: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!team) notFound();

  const since = startOfMonth();
  const monthSessions = team.trainingSessions.filter((s) => s.startAt >= since);
  const monthHours = Math.round(
    monthSessions.reduce(
      (sum, s) => sum + durationMinutes(s.startAt, s.endAt),
      0,
    ) / 60,
  );

  // Utveckling: träffprocent över de senaste passen jämfört med dessförinnan.
  const recent = team.trainingSessions.slice(0, 5);
  const earlier = team.trainingSessions.slice(5, 10);
  const rate = (list: typeof recent) => {
    const hides = list.reduce((s, x) => s + x.hideCount, 0);
    const found = list.reduce((s, x) => s + x.foundCount, 0);
    return hides === 0 ? null : Math.round((found / hides) * 100);
  };
  const recentRate = rate(recent);
  const earlierRate = rate(earlier);
  const trend =
    recentRate !== null && earlierRate !== null ? recentRate - earlierRate : null;

  const openFollowUps = team.followUps.filter((f) => f.status === "OPEN");

  return (
    <AppShell
      title={`${team.dog.name} & ${team.handler.name}`}
      backHref="/instruktor"
      unread={unread}
      role={user.role}
    >
      <section className="card mb-4 flex items-start gap-4 p-4">
        <Avatar name={team.dog.name} photoUrl={team.dog.photoUrl} size={64} />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold leading-tight">
            {team.dog.name}
          </h2>
          <p className="text-sm text-fg-muted">
            {team.dog.breed} · {ageInYears(team.dog.birthDate)} år
          </p>
          <p className="mt-1 text-sm text-brand">{team.handler.name}</p>
          <p className="text-xs text-fg-dim">
            {team.region.name}
            {team.handler.handlerProfile?.baseLocation
              ? ` · ${team.handler.handlerProfile.baseLocation}`
              : ""}
          </p>
        </div>
      </section>

      <StatRow>
        <StatTile value={monthSessions.length} label="Pass denna månad" />
        <StatTile value={monthHours} label="Träningstimmar" />
        <StatTile
          value={recentRate === null ? "—" : `${recentRate}%`}
          label="Träffar senaste passen"
        />
      </StatRow>

      {trend !== null ? (
        <p className="mt-2.5 text-center text-xs text-fg-muted">
          {trend > 0
            ? `Utvecklingen pekar uppåt, ${trend} procentenheter bättre än föregående period.`
            : trend < 0
              ? `Träffsäkerheten har sjunkit ${Math.abs(trend)} procentenheter mot föregående period.`
              : "Träffsäkerheten ligger stabilt mot föregående period."}
        </p>
      ) : null}

      {team.dog.disciplines.length > 0 ? (
        <section className="mt-5">
          <SectionHeader title="Sökinriktningar" />
          <div className="card flex flex-wrap gap-2 p-4">
            {team.dog.disciplines.map((d) => (
              <Chip key={d.id}>{d.discipline.name}</Chip>
            ))}
          </div>
        </section>
      ) : null}

      {/* Brister att åtgärda */}
      {team.certifications.length > 0 ? (
        <section className="mt-5">
          <SectionHeader title="Behörigheter" href="/certifikat" />
          <div className="card divide-y divide-line-soft">
            {team.certifications.map((cert) => {
              const status = certStatus(cert.expiresAt);
              const days = daysUntil(cert.expiresAt);
              return (
                <div key={cert.id} className="flex items-center gap-3 px-4 py-3">
                  <CertificateIcon
                    className={`h-5 w-5 shrink-0 ${CERT_ICON_CLASSES[status]}`}
                  />
                  <p className="min-w-0 flex-1 truncate text-sm">
                    {cert.type.name}
                  </p>
                  <Badge
                    tone={
                      status === "EXPIRED"
                        ? "danger"
                        : status === "EXPIRING"
                          ? "warn"
                          : "ok"
                    }
                  >
                    {days < 0 ? "Utgånget" : `${days} d`}
                  </Badge>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Träningsplan */}
      {team.trainingPlans.length > 0 ? (
        <section className="mt-5">
          <SectionHeader title="Aktiv träningsplan" href="/traning/plan" />
          {team.trainingPlans.map((plan) => (
            <div key={plan.id} className="card p-4">
              <p className="text-sm font-semibold">{plan.title}</p>
              <p className="mt-1 text-xs text-fg-muted">
                {plan.exercises.filter((e) => e.status === "COMPLETED").length} av{" "}
                {plan.exercises.length} övningar genomförda
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {/* Träningshistorik */}
      <section className="mt-5">
        <SectionHeader title="Träningshistorik" />
        {team.trainingSessions.length === 0 ? (
          <p className="card px-4 py-4 text-sm text-fg-muted">
            Inga registrerade pass.
          </p>
        ) : (
          <div className="space-y-2.5">
            {team.trainingSessions.map((session) => (
              <LinkCard key={session.id} href={`/traning/${session.id}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-fg-muted">
                      {formatShortDate(session.startAt)}
                    </p>
                    <p className="truncate text-sm font-semibold">
                      {session.trainingArea} – {session.environment}
                    </p>
                    <p className="text-xs text-brand">
                      {session.foundCount}/{session.hideCount} markeringar
                    </p>
                  </div>
                  <Badge
                    tone={
                      session.status === "APPROVED"
                        ? "ok"
                        : session.status === "SUBMITTED"
                          ? "brand"
                          : "neutral"
                    }
                  >
                    {SESSION_STATUS_LABELS[session.status] ?? session.status}
                  </Badge>
                </div>
              </LinkCard>
            ))}
          </div>
        )}
      </section>

      {/* Uppdrag */}
      {team.reports.length > 0 ? (
        <section className="mt-5">
          <SectionHeader title="Genomförda uppdrag" href="/rapporter" />
          <DetailList>
            {team.reports.map((report) => (
              <DetailRow key={report.id} label={report.mission.title}>
                <Link href={`/rapporter/${report.id}`} className="text-brand">
                  {report.mission.reference}
                </Link>
              </DetailRow>
            ))}
          </DetailList>
        </section>
      ) : null}

      {/* Uppföljningar */}
      <section className="mt-5">
        <SectionHeader title="Uppföljningar" />
        {openFollowUps.length > 0 ? (
          <div className="card mb-3 divide-y divide-line-soft">
            {openFollowUps.map((f) => (
              <div key={f.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{f.title}</p>
                    {f.message ? (
                      <p className="mt-0.5 text-sm text-fg-muted">{f.message}</p>
                    ) : null}
                    {f.dueDate ? (
                      <p className="mt-1 text-xs text-fg-dim">
                        Senast {formatShortDate(f.dueDate)}
                      </p>
                    ) : null}
                  </div>
                  <form action={closeFollowUp}>
                    <input type="hidden" name="followUpId" value={f.id} />
                    <button
                      type="submit"
                      className="btn btn-ghost px-2 py-1 text-xs"
                      aria-label="Markera som avklarad"
                    >
                      <CheckCircleIcon className="h-[18px] w-[18px]" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <FollowUpForm teamId={team.id} />
      </section>
    </AppShell>
  );
}
