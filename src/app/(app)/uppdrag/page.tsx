import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { EmptyState, SectionHeader } from "@/components/ui";
import {
  AvailabilityCard,
  DayStrip,
  MissionCard,
  PageHeading,
  ReminderList,
  type DayTile,
  type Reminder,
} from "@/components/MissionsView";
import {
  BriefcaseIcon,
  CertificateIcon,
  FilterIcon,
  PlusIcon,
  ShieldIcon,
} from "@/components/icons";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { can, regionScope, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { availabilityNow } from "@/lib/dashboard";
import { expiringCertifications } from "@/lib/queries";
import {
  dateKey,
  daysUntil,
  formatDate,
  formatDayNumber,
  formatMonthShort,
  formatTime,
} from "@/lib/format";
import type { Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Uppdrag" };

const TABS = [
  { value: "kommande", label: "Kommande" },
  { value: "pagaende", label: "Pågående" },
  { value: "historik", label: "Historik" },
];

/** Antal dagar i datumraden, och hur många "Mer" fäller ut. */
const DAYS_SHORT = 4;
const DAYS_LONG = 10;

export default async function MissionsPage({
  searchParams,
}: PageProps<"/uppdrag">) {
  const user = await requireUser();
  const params = await searchParams;
  const tab = typeof params.flik === "string" ? params.flik : "kommande";
  const day = typeof params.dag === "string" ? params.dag : "";
  const disciplineId =
    typeof params.disciplin === "string" ? params.disciplin : "";
  const showFilter = params.filter === "1" || Boolean(disciplineId);
  const dayCount = params.dagar === "fler" ? DAYS_LONG : DAYS_SHORT;
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

  const [allMissions, disciplines, availability, certifications] =
    await Promise.all([
      db.mission.findMany({
        where: {
          AND: [
            visibility,
            timeFilter,
            disciplineId ? { disciplineId } : {},
          ],
        },
        include: {
          discipline: true,
          customer: true,
          assignments: {
            include: { team: { include: { dog: true, handler: true } } },
          },
        },
        orderBy: { startAt: tab === "historik" ? "desc" : "asc" },
        take: 50,
      }),
      db.searchDiscipline.findMany({ orderBy: { sortOrder: "asc" } }),
      availabilityNow(user),
      expiringCertifications(user),
    ]);

  // Dagarna räknas ur samma lista som visas, så siffran på brickan och
  // antalet kort under den kan aldrig säga emot varandra.
  const perDay = new Map<string, number>();
  for (const m of allMissions) {
    const key = dateKey(m.startAt);
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }

  const missions = day
    ? allMissions.filter((m) => dateKey(m.startAt) === day)
    : allMissions;

  /** Bevarar övriga val när en länk byter en enda parameter. */
  const hrefWith = (changes: Record<string, string>) => {
    const next = new URLSearchParams();
    const base: Record<string, string> = {
      flik: tab,
      dag: day,
      disciplin: disciplineId,
      dagar: dayCount === DAYS_LONG ? "fler" : "",
      filter: showFilter ? "1" : "",
      ...changes,
    };
    for (const [k, v] of Object.entries(base)) if (v) next.set(k, v);
    const qs = next.toString();
    return qs ? `/uppdrag?${qs}` : "/uppdrag";
  };

  const days: DayTile[] = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const key = dateKey(d);
    return {
      key,
      day: formatDayNumber(d),
      month: formatMonthShort(d),
      count: perDay.get(key) ?? 0,
      href: hrefWith({ dag: key }),
      active: day === key,
    };
  });

  // Två påminnelser räcker i uppdragsvyn; resten finns under Certifikat.
  const reminders: Reminder[] = certifications.slice(0, 2).map((cert) => {
    const kvar = daysUntil(cert.expiresAt);
    return {
      id: cert.id,
      title:
        kvar < 0
          ? `${cert.type.name} har gått ut`
          : `${cert.type.name} går ut om ${kvar} ${kvar === 1 ? "dag" : "dagar"}`,
      subtitle: `Giltig t.o.m. ${formatDate(cert.expiresAt)}`,
      href: "/certifikat",
      icon:
        cert.type.appliesTo === "DOG" ? (
          <CertificateIcon className="h-[22px] w-[22px]" />
        ) : (
          <ShieldIcon className="h-[22px] w-[22px]" />
        ),
    };
  });

  return (
    <AppShell branded title="Hundar" menu={false} unread={unread} role={user.role}>
      <PageHeading
        action={
          can(user, "mission:create") ? (
            <Link
              href="/uppdrag/nytt"
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-brand/40 px-3 py-2 text-[13px] font-medium text-brand transition-colors hover:bg-brand/10"
            >
              <PlusIcon className="h-[16px] w-[16px]" />
              Nytt uppdrag
            </Link>
          ) : undefined
        }
      >
        Uppdrag
      </PageHeading>

      {/* Kommande / Pågående / Historik, med filtret till höger */}
      <div className="mb-5 flex items-end justify-between gap-3 border-b border-line">
        <div className="no-scrollbar flex gap-5 overflow-x-auto">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={`/uppdrag?flik=${t.value}`}
              className={`shrink-0 whitespace-nowrap pb-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                tab === t.value
                  ? "border-b-2 border-brand text-brand"
                  : "text-fg-dim hover:text-fg-muted"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 pb-2">
          <Link
            href={hrefWith({ filter: showFilter ? "" : "1", disciplin: "" })}
            aria-expanded={showFilter}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
              showFilter
                ? "border-brand bg-brand/10 text-brand"
                : "border-brand/40 text-brand hover:bg-brand/10"
            }`}
          >
            <FilterIcon className="h-[16px] w-[16px]" />
            Filter
          </Link>
        </div>
      </div>

      {showFilter ? (
        <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
          <FilterChip href={hrefWith({ disciplin: "" })} active={!disciplineId}>
            Alla
          </FilterChip>
          {disciplines.map((d) => (
            <FilterChip
              key={d.id}
              href={hrefWith({ disciplin: d.id })}
              active={disciplineId === d.id}
            >
              {d.name}
            </FilterChip>
          ))}
        </div>
      ) : null}

      {tab === "kommande" ? (
        <DayStrip
          todayHref={hrefWith({ dag: "" })}
          todayActive={!day}
          days={days}
          moreHref={
            dayCount === DAYS_SHORT ? hrefWith({ dagar: "fler" }) : undefined
          }
        />
      ) : null}

      <SectionHeader
        title={
          tab === "kommande"
            ? "Kommande uppdrag"
            : tab === "pagaende"
              ? "Pågående uppdrag"
              : "Tidigare uppdrag"
        }
        className="[&>h2]:text-fg-muted"
      />

      {missions.length === 0 ? (
        <EmptyState
          icon={<BriefcaseIcon className="h-7 w-7" />}
          title={
            day
              ? "Inga uppdrag den dagen"
              : tab === "kommande"
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
        <div className="mb-5 space-y-2.5">
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              href={`/uppdrag/${mission.id}`}
              day={formatDayNumber(mission.startAt)}
              month={formatMonthShort(mission.startAt)}
              time={formatTime(mission.startAt)}
              title={mission.title}
              locality={mission.locality}
              discipline={mission.discipline?.name ?? null}
              status={missionStatus(mission, teamIds, !can(user, "mission:assign"))}
              customer={mission.customer?.name ?? null}
              contactName={mission.contactName}
              contactPhone={mission.contactPhone}
              missionType={mission.missionType}
              specialInstructions={mission.specialInstructions}
            />
          ))}
        </div>
      )}

      <AvailabilityCard
        available={availability.available}
        note={
          availability.available
            ? "Du är tillgänglig för uppdrag"
            : availability.note
        }
        href="/profil"
      />

      {reminders.length > 0 ? (
        <>
          <SectionHeader
            title="Påminnelser"
            href="/certifikat"
            className="[&>h2]:text-fg-muted"
          />
          <ReminderList reminders={reminders} />
        </>
      ) : null}
    </AppShell>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-[12px] font-medium transition-colors ${
        active
          ? "border-brand bg-brand/10 text-brand"
          : "border-line bg-surface text-fg-muted hover:bg-surface-2"
      }`}
    >
      {children}
    </Link>
  );
}

/**
 * Etiketten på kortet är den som betyder något för den som tittar: ett
 * obesvarat erbjudande går före uppdragets egen status. Föraren uppmanas
 * att svara, chefen får bara veta att svaret dröjer.
 */
function missionStatus(
  mission: {
    status: string;
    assignments: { status: string; teamId: string }[];
  },
  teamIds: string[],
  ownAnswer: boolean,
): { label: string; tone: "brand" | "warn" | "ok" | "danger" | "neutral" } {
  const mine = mission.assignments.filter((a) => teamIds.includes(a.teamId));
  if (mine.some((a) => a.status === "OFFERED")) {
    return { label: ownAnswer ? "Svara" : "Erbjudet", tone: "warn" };
  }
  switch (mission.status) {
    case "IN_PROGRESS":
      return { label: "Pågående", tone: "brand" };
    case "COMPLETED":
      return { label: "Avslutat", tone: "ok" };
    case "CANCELLED":
      return { label: "Inställt", tone: "danger" };
    case "ASSIGNED":
      return { label: "Tilldelat", tone: "brand" };
    default:
      return { label: "Planerat", tone: "neutral" };
  }
}
