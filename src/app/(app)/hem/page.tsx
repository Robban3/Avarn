import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Avatar,
  Badge,
  DateBlock,
  DisciplineTag,
  EmptyState,
  LinkCard,
  SectionHeader,
} from "@/components/ui";
import {
  AlertIcon,
  BriefcaseIcon,
  MessageIcon,
  PawIcon,
  TrainingIcon,
  UsersIcon,
} from "@/components/icons";
import { currentUserRecord, unreadNotificationCount } from "@/lib/auth";
import { can } from "@/lib/authz";
import {
  expiringCertifications,
  recentSessions,
  upcomingMissions,
} from "@/lib/queries";
import {
  formatDayNumber,
  formatMonthShort,
  formatShortDate,
  formatTime,
  daysUntil,
} from "@/lib/format";
import { ROLE_LABELS, SESSION_STATUS_LABELS } from "@/lib/domain";
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/session";
import type { Role } from "@/lib/domain";

export const metadata: Metadata = { title: "Hem" };

export default async function HomePage() {
  const record = await currentUserRecord();
  const user: SessionUser = {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role as Role,
    regionId: record.regionId,
  };

  const [unread, missions, sessions, expiring, unreadNotifications] =
    await Promise.all([
      unreadNotificationCount(user.id),
      upcomingMissions(user, 3),
      recentSessions(user, 2),
      expiringCertifications(user, 30),
      db.notification.count({ where: { userId: user.id, readAt: null } }),
    ]);

  const quickLinks = [
    { href: "/traning", label: "Träningsdagbok", Icon: TrainingIcon },
    { href: "/uppdrag", label: "Uppdrag", Icon: BriefcaseIcon },
    {
      href: "/hundar",
      label: can(user, "team:viewOthers") ? "Ekipage" : "Mina hundar",
      Icon: PawIcon,
    },
    {
      href: "/meddelanden",
      label: "Meddelanden",
      Icon: MessageIcon,
      badge: unreadNotifications,
    },
  ];

  return (
    <AppShell unread={unread} role={user.role}>
      {/* Hälsning */}
      <section className="mb-6 flex items-center gap-3.5">
        <Avatar
          name={record.name}
          photoUrl={record.handlerProfile?.photoUrl}
          size={56}
          ring
        />
        <div className="min-w-0">
          <p className="text-xs text-fg-muted">Välkommen,</p>
          <p className="truncate text-xl font-semibold leading-tight">
            {record.name}
          </p>
          <p className="text-sm text-brand">
            {ROLE_LABELS[user.role] ?? user.role}
            {record.region ? ` · ${record.region.name}` : ""}
          </p>
        </div>
      </section>

      {/* Snabbgenvägar */}
      <section className="mb-6">
        <SectionHeader title="Snabbgenvägar" />
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map(({ href, label, Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className="card relative flex items-center gap-2.5 p-3 transition-colors hover:border-surface-3 hover:bg-surface-2"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/12 text-brand">
                <Icon className="h-[20px] w-[20px]" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                {label}
              </span>
              {badge ? (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-[#06201e]">
                  {badge > 9 ? "9+" : badge}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      {/* Varning om behörigheter */}
      {expiring.length > 0 ? (
        <section className="mb-6">
          <Link
            href="/certifikat"
            className="card flex items-center gap-3 border-warn/30 bg-warn/8 p-3.5"
          >
            <AlertIcon className="h-5 w-5 shrink-0 text-warn" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fg">
                {expiring.length === 1
                  ? "1 behörighet behöver förnyas"
                  : `${expiring.length} behörigheter behöver förnyas`}
              </p>
              <p className="truncate text-xs text-fg-muted">
                {expiring[0].type.name} –{" "}
                {daysUntil(expiring[0].expiresAt) < 0
                  ? "har gått ut"
                  : `${daysUntil(expiring[0].expiresAt)} dagar kvar`}
              </p>
            </div>
          </Link>
        </section>
      ) : null}

      {/* Kommande uppdrag */}
      <section className="mb-6">
        <SectionHeader title="Kommande uppdrag" href="/uppdrag" />
        {missions.length === 0 ? (
          <EmptyState
            icon={<BriefcaseIcon className="h-7 w-7" />}
            title="Inga kommande uppdrag"
            description="Nya uppdrag visas här så snart de tilldelats ditt ekipage."
          />
        ) : (
          <div className="space-y-2.5">
            {missions.map((mission) => (
              <LinkCard key={mission.id} href={`/uppdrag/${mission.id}`}>
                <div className="flex items-center gap-3">
                  <DateBlock
                    day={formatDayNumber(mission.startAt)}
                    month={formatMonthShort(mission.startAt)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-fg-muted">
                      {formatTime(mission.startAt)}
                    </p>
                    <p className="truncate text-sm font-semibold">
                      {mission.title}
                    </p>
                    <p className="truncate text-xs text-fg-muted">
                      {mission.locality}
                    </p>
                  </div>
                  {mission.discipline ? (
                    <DisciplineTag label={mission.discipline.shortLabel} />
                  ) : null}
                </div>
              </LinkCard>
            ))}
          </div>
        )}
      </section>

      {/* Senaste träningen */}
      <section className="mb-6">
        <SectionHeader title="Senaste träningen" href="/traning" />
        {sessions.length === 0 ? (
          <EmptyState
            icon={<TrainingIcon className="h-7 w-7" />}
            title="Inga registrerade träningspass"
            description="Rapportera ditt första pass i träningsdagboken."
            action={
              <Link href="/traning/nytt" className="btn btn-primary">
                Nytt träningspass
              </Link>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {sessions.map((session) => (
              <LinkCard key={session.id} href={`/traning/${session.id}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-fg-dim">
                    <UsersIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-fg-muted">
                      {formatShortDate(session.startAt)} ·{" "}
                      {session.team.dog.name}
                    </p>
                    <p className="truncate text-sm font-semibold">
                      {session.trainingArea} – {session.environment}
                    </p>
                    <p className="text-xs text-brand">
                      Resultat: {session.foundCount}/{session.hideCount}{" "}
                      markeringar
                    </p>
                  </div>
                  <Badge
                    tone={session.status === "APPROVED" ? "ok" : "neutral"}
                  >
                    {SESSION_STATUS_LABELS[session.status] ?? session.status}
                  </Badge>
                </div>
              </LinkCard>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
