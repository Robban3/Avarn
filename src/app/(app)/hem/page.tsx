import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Badge,
  CardHeader,
  DateBlock,
  DisciplineTag,
  IconStat,
  PhotoCircle,
  SectionHeader,
  StatCard,
  StatusPill,
} from "@/components/ui";
import {
  BellIcon,
  BriefcaseIcon,
  CalendarIcon,
  CertificateIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  DogIcon,
  MessageIcon,
  PlusIcon,
  ScentIcon,
  BoxIcon,
  TrainingIcon,
} from "@/components/icons";
import { currentUserRecord, unreadNotificationCount } from "@/lib/auth";
import { can, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { upcomingMissions } from "@/lib/queries";
import {
  availabilityNow,
  importantNotices,
  monthlyStats,
  recentActivity,
} from "@/lib/dashboard";
import {
  formatDate,
  formatDayNumber,
  formatMonthShort,
  formatShortDate,
  formatTime,
  formatWeekday,
} from "@/lib/format";
import {
  DOG_STATUS_LABELS,
  ROLE_LABELS,
  SESSION_STATUS_LABELS,
  type Role,
} from "@/lib/domain";
import type { SessionUser } from "@/lib/session";

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

  const [
    unread,
    availability,
    missions,
    latestSession,
    notices,
    teams,
    stats,
    activity,
  ] = await Promise.all([
    unreadNotificationCount(user.id),
    availabilityNow(user),
    upcomingMissions(user, 3),
    db.trainingSession.findFirst({
      where: { team: teamScope(user) },
      include: {
        team: { include: { dog: true } },
        media: { where: { kind: "IMAGE" }, take: 1 },
      },
      orderBy: { startAt: "desc" },
    }),
    importantNotices(user, 3),
    db.team.findMany({
      where: { ...teamScope(user), status: "ACTIVE" },
      include: { dog: true },
      orderBy: { dog: { name: "asc" } },
      take: 4,
    }),
    monthlyStats(user),
    recentActivity(user, 3),
  ]);

  const today = new Date();
  const showsOthers = can(user, "team:viewOthers");

  const shortcuts = [
    { href: "/hundar", label: showsOthers ? "Ekipage" : "Mina hundar", Icon: DogIcon },
    { href: "/uppdrag", label: "Uppdrag", Icon: BriefcaseIcon },
    { href: "/traning", label: "Träning", sub: "Dagbok", Icon: TrainingIcon },
    { href: "/meddelanden", label: "Meddelanden", Icon: MessageIcon, badge: unread },
  ];

  const ACTIVITY_ICONS = {
    training: TrainingIcon,
    mission: BriefcaseIcon,
    comment: MessageIcon,
  };

  return (
    <AppShell
      branded
      title="Hundar"
      menu={false}
      unread={unread}
      role={user.role}
      wide
    >
      {/* 1. Personligt sidhuvud */}
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <PhotoCircle
            name={record.name}
            photoUrl={record.handlerProfile?.photoUrl}
            size={72}
          />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-brand">
              Välkommen tillbaka
            </p>
            <p className="truncate text-2xl font-semibold leading-tight">
              {record.name}
            </p>
            <p className="text-sm text-fg-muted">
              {ROLE_LABELS[user.role] ?? user.role}
            </p>
            <div className="mt-2">
              <StatusPill tone={availability.available ? "brand" : "neutral"}>
                {availability.note}
              </StatusPill>
            </div>
          </div>
        </div>

        <div className="card flex items-center gap-3 px-4 py-3 sm:w-56">
          <CalendarIcon className="h-6 w-6 shrink-0 text-fg-dim" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-fg-dim">
              Idag
            </p>
            <p className="truncate text-[15px] font-semibold">
              {formatDate(today)}
            </p>
            <p className="text-xs capitalize text-fg-muted">
              {formatWeekday(today)}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Snabbgenvägar */}
      <section className="mb-4">
        <SectionHeader title="Snabbgenvägar" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {shortcuts.map(({ href, label, sub, Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className="card relative flex flex-col items-center justify-center gap-2 px-2 py-5 transition-colors hover:border-surface-3 hover:bg-surface-2"
            >
              <Icon className="h-7 w-7 text-brand" />
              <span className="text-center text-sm font-medium leading-tight">
                {label}
              </span>
              {sub ? (
                <span className="-mt-1 text-[11px] text-fg-dim">{sub}</span>
              ) : null}
              {badge ? (
                <span className="absolute right-2.5 top-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-[#06201e]">
                  {badge > 9 ? "9+" : badge}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      {/* 3 & 4. Kommande uppdrag och senaste träning */}
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <section className="card overflow-hidden">
          <CardHeader title="Kommande uppdrag" href="/uppdrag" />
          {missions.length === 0 ? (
            <p className="px-4 py-6 text-sm text-fg-muted">
              Inga kommande uppdrag.
            </p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {missions.map((mission) => (
                <li key={mission.id}>
                  <Link
                    href={`/uppdrag/${mission.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                  >
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
                    <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card overflow-hidden">
          <CardHeader title="Senaste träning" href="/traning" />
          {!latestSession ? (
            <p className="px-4 py-6 text-sm text-fg-muted">
              Inget träningspass registrerat ännu.
            </p>
          ) : (
            <>
              <Link
                href={`/traning/${latestSession.id}`}
                className="flex gap-3.5 p-4 transition-colors hover:bg-surface-2"
              >
                {latestSession.media[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/media/${latestSession.media[0].id}`}
                    alt=""
                    className="h-24 w-28 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-24 w-28 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand/20 to-surface-3 text-brand">
                    <TrainingIcon className="h-8 w-8" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-fg-muted">
                    {formatDate(latestSession.startAt)}
                  </p>
                  <p className="truncate text-[15px] font-semibold">
                    {latestSession.trainingArea} – {latestSession.environment}
                  </p>
                  <p className="truncate text-xs text-fg-muted">
                    {latestSession.location}
                  </p>
                  <p className="mt-2 text-[11px] text-fg-dim">Resultat</p>
                  <p className="text-sm font-medium text-brand">
                    {latestSession.foundCount}/{latestSession.hideCount}{" "}
                    markeringar
                  </p>
                </div>
              </Link>
              <div className="flex border-t border-line-soft py-3.5">
                <IconStat
                  icon={<ScentIcon className="h-5 w-5" />}
                  label="Måldoft"
                  value={latestSession.targetOdor}
                />
                <IconStat
                  icon={<BoxIcon className="h-5 w-5" />}
                  label="Gömmor"
                  value={`${latestSession.hideCount} st`}
                />
                <IconStat
                  icon={<CheckCircleIcon className="h-5 w-5" />}
                  label="Bedömning"
                  value={
                    SESSION_STATUS_LABELS[latestSession.status] ??
                    latestSession.status
                  }
                  highlight={latestSession.status === "APPROVED"}
                />
              </div>
            </>
          )}
        </section>
      </div>

      {/* 5 & 6. Viktiga notiser och mina hundar */}
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <section className="card overflow-hidden">
          <CardHeader title="Viktiga notiser" href="/meddelanden" />
          {notices.length === 0 ? (
            <p className="px-4 py-6 text-sm text-fg-muted">
              Inget som kräver din uppmärksamhet.
            </p>
          ) : (
            <div className="flex gap-3 p-4">
              <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-fg-dim">
                <BellIcon className="h-5 w-5" />
              </span>
              <ul className="min-w-0 flex-1 space-y-2">
                {notices.map((notice) => (
                  <li key={notice.id}>
                    <Link
                      href={notice.href}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-surface-3 ${
                        notice.urgent
                          ? "border-warn/30 bg-warn/8"
                          : "border-line bg-surface-2"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate text-[13px]">
                        {notice.text}
                      </span>
                      <ChevronRightIcon className="h-4 w-4 shrink-0 text-fg-dim" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="card overflow-hidden">
          <CardHeader title={showsOthers ? "Ekipage" : "Mina hundar"} href="/hundar" />
          <ul className="divide-y divide-line-soft">
            {teams.map((team) => (
              <li key={team.id}>
                <Link
                  href={`/hundar/${team.dogId}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                >
                  <PhotoCircle
                    name={team.dog.name}
                    photoUrl={team.dog.photoUrl}
                    size={48}
                    ring={false}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {team.dog.name}
                    </p>
                    <p className="truncate text-xs text-fg-muted">
                      {team.dog.breed}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-brand">
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full bg-brand"
                      />
                      {DOG_STATUS_LABELS[team.dog.status] ?? team.dog.status}
                    </p>
                  </div>
                  <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
                </Link>
              </li>
            ))}
          </ul>
          {can(user, "dog:create") || can(user, "dog:manage") ? (
            <div className="p-4">
              <Link href="/hundar/ny" className="btn btn-secondary w-full">
                <PlusIcon className="h-[18px] w-[18px]" />
                Lägg till hund
              </Link>
            </div>
          ) : null}
        </section>
      </div>

      {/* 7. Aktivitet och statistik */}
      <section className="mb-4">
        <SectionHeader title="Aktivitet översikt" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={<TrainingIcon className="h-5 w-5" />}
            value={stats.current.sessionCount}
            label="Träningar"
            change={stats.changes.sessions}
          />
          <StatCard
            icon={<BriefcaseIcon className="h-5 w-5" />}
            value={stats.current.missionCount}
            label="Uppdrag"
            change={stats.changes.missions}
          />
          <StatCard
            icon={<ClockIcon className="h-5 w-5" />}
            value={`${stats.current.trainingHours} h`}
            label="Träningstimmar"
            change={stats.changes.hours}
          />
          <StatCard
            icon={<CertificateIcon className="h-5 w-5" />}
            value={
              stats.current.completionRate === null
                ? "—"
                : `${stats.current.completionRate}%`
            }
            label="Genomförandegrad"
            change={stats.changes.completion}
          />
        </div>
      </section>

      {/* 8. Senaste aktivitet */}
      <section className="card overflow-hidden">
        <CardHeader title="Senaste aktivitet" href="/traning" />
        {activity.length === 0 ? (
          <p className="px-4 py-6 text-sm text-fg-muted">
            Ingen aktivitet ännu.
          </p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {activity.map((item) => {
              const Icon = ACTIVITY_ICONS[item.kind];
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-brand" />
                    <span className="w-14 shrink-0 text-xs text-fg-muted">
                      {formatShortDate(item.at)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-fg-muted">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                      {item.status ? (
                        <Badge
                          tone={item.status === "APPROVED" ? "ok" : "neutral"}
                        >
                          {SESSION_STATUS_LABELS[item.status] ?? item.status}
                        </Badge>
                      ) : null}
                      {item.detail ? (
                        <span className="text-[11px] text-fg-dim">
                          {item.detail}
                        </span>
                      ) : null}
                    </div>
                    <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
