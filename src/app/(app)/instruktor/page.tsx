import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Avatar,
  Badge,
  EmptyState,
  SectionHeader,
  StatRow,
  StatTile,
} from "@/components/ui";
import {
  AlertIcon,
  CertificateIcon,
  ChevronRightIcon,
  UsersIcon,
} from "@/components/icons";
import { CERT_ICON_CLASSES } from "@/components/cert-styles";
import { requireCapability, unreadNotificationCount } from "@/lib/auth";
import { teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { formatRelative, daysUntil } from "@/lib/format";
import { certificationAlerts, overviewStats } from "@/lib/stats";

export const metadata: Metadata = { title: "Instruktörsvy" };

export default async function InstructorPage() {
  const user = await requireCapability("instructor:view");
  const unread = await unreadNotificationCount(user.id);

  const [stats, teams, sessions, reports, alerts, followUps] =
    await Promise.all([
      overviewStats(user),
      db.team.findMany({
        where: { ...teamScope(user), status: "ACTIVE" },
        include: { dog: true, handler: true, region: true },
        orderBy: { dog: { name: "asc" } },
      }),
      db.trainingSession.findMany({
        where: { team: teamScope(user) },
        include: { team: { include: { dog: true, handler: true } } },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      db.operationalReport.findMany({
        where: { team: teamScope(user) },
        include: {
          team: { include: { dog: true, handler: true } },
          mission: true,
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      certificationAlerts(user, 5),
      db.followUp.findMany({
        where: { team: teamScope(user), status: "OPEN" },
        include: { team: { include: { dog: true, handler: true } } },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
    ]);

  // Aktivitetslistan blandar träning och rapporter i tidsordning – det är
  // så instruktören faktiskt följer sina ekipage.
  const activity = [
    ...sessions.map((s) => ({
      id: `s-${s.id}`,
      href: `/traning/${s.id}`,
      name: `${s.team.handler.name} & ${s.team.dog.name}`,
      text:
        s.status === "SUBMITTED"
          ? "Träning inskickad – att granska"
          : s.status === "APPROVED"
            ? "Träning godkänd"
            : "Träning rapporterad",
      // Tidpunkten som betyder något för instruktören: när passet godkändes,
      // annars när det senast ändrades.
      at: s.approvedAt ?? s.updatedAt,
      urgent: s.status === "SUBMITTED",
    })),
    ...reports.map((r) => ({
      id: `r-${r.id}`,
      href: `/rapporter/${r.id}`,
      name: `${r.team.handler.name} & ${r.team.dog.name}`,
      text: `Uppdrag rapporterat · ${r.mission.reference}`,
      at: r.submittedAt ?? r.createdAt,
      urgent: r.status === "SUBMITTED",
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  const pendingReview = sessions.filter((s) => s.status === "SUBMITTED").length;

  return (
    <AppShell
      title="Instruktörsvy – översikt"
      backHref="/mer"
      unread={unread}
      role={user.role}
    >
      {/* Ekipagelista */}
      <Link
        href="#ekipage"
        className="card mb-4 flex items-center gap-3 px-4 py-3.5"
      >
        <UsersIcon className="h-5 w-5 text-fg-muted" />
        <span className="flex-1 text-sm font-medium">Mina ekipage</span>
        <span className="text-sm text-fg-muted">{teams.length}</span>
        <ChevronRightIcon className="h-[18px] w-[18px] text-fg-dim" />
      </Link>

      {/* Nyckeltal */}
      <StatRow>
        <StatTile value={stats.teamCount} label="Ekipage" />
        <StatTile value={stats.missionCount} label="Uppdrag senaste 30 dagarna" />
        <StatTile value={stats.trainingHours} label="Träningstimmar 30 dagar" />
      </StatRow>

      {pendingReview > 0 ? (
        <Link
          href="/traning?status=SUBMITTED"
          className="card mt-4 flex items-center gap-3 border-brand/30 bg-brand/8 p-3.5"
        >
          <AlertIcon className="h-5 w-5 shrink-0 text-brand" />
          <p className="flex-1 text-sm font-medium">
            {pendingReview} träningspass väntar på din granskning
          </p>
          <ChevronRightIcon className="h-[18px] w-[18px] text-fg-dim" />
        </Link>
      ) : null}

      {/* Aktivitet */}
      <section className="mt-5">
        <SectionHeader title="Aktivitet" href="/traning" />
        {activity.length === 0 ? (
          <EmptyState
            icon={<UsersIcon className="h-7 w-7" />}
            title="Ingen aktivitet ännu"
            description="Träning och rapporter från dina ekipage visas här."
          />
        ) : (
          <div className="card divide-y divide-line-soft">
            {activity.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
              >
                <Avatar name={item.name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="truncate text-xs text-fg-muted">{item.text}</p>
                </div>
                <span className="shrink-0 text-xs text-fg-dim">
                  {formatRelative(item.at)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Certifikat som snart går ut */}
      {alerts.length > 0 ? (
        <section className="mt-5">
          <SectionHeader title="Certifikat att bevaka" href="/certifikat" />
          <div className="card divide-y divide-line-soft">
            {alerts.map(({ cert, status }) => {
              const days = daysUntil(cert.expiresAt);
              const subject =
                cert.team?.dog.name ?? cert.dog?.name ?? cert.user?.name ?? "—";
              return (
                <div key={cert.id} className="flex items-center gap-3 px-4 py-3">
                  <CertificateIcon
                    className={`h-5 w-5 shrink-0 ${CERT_ICON_CLASSES[status]}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {cert.type.name}
                    </p>
                    <p className="truncate text-xs text-fg-muted">{subject}</p>
                  </div>
                  <Badge tone={status === "EXPIRED" ? "danger" : "warn"}>
                    {days < 0 ? "Utgånget" : `${days} dagar kvar`}
                  </Badge>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Öppna uppföljningar */}
      {followUps.length > 0 ? (
        <section className="mt-5">
          <SectionHeader title="Uppföljningar" />
          <div className="card divide-y divide-line-soft">
            {followUps.map((f) => (
              <Link
                key={f.id}
                href={`/instruktor/ekipage/${f.teamId}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.title}</p>
                  <p className="truncate text-xs text-fg-muted">
                    {f.team.dog.name} · {f.team.handler.name}
                  </p>
                </div>
                <ChevronRightIcon className="h-[18px] w-[18px] text-fg-dim" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Ekipagen */}
      <section id="ekipage" className="mt-5">
        <SectionHeader title="Mina ekipage" />
        <div className="card divide-y divide-line-soft">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/instruktor/ekipage/${team.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
            >
              <Avatar name={team.dog.name} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {team.dog.name}
                </p>
                <p className="truncate text-xs text-fg-muted">
                  {team.handler.name} · {team.region.name}
                </p>
              </div>
              <ChevronRightIcon className="h-[18px] w-[18px] text-fg-dim" />
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
