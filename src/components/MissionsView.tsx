import Link from "next/link";
import type { ReactNode } from "react";
import {
  CalendarIcon,
  ChevronRightIcon,
  ClipboardIcon,
  BoxIcon,
  MapPinIcon,
  PawIcon,
  UserIcon,
  UsersIcon,
} from "./icons";

/**
 * Uppdragsvyns egna byggstenar. Listan är förarens arbetsdag på en skärm:
 * datumraden överst för att hoppa till en dag, och ett kort per uppdrag där
 * kund, kontaktperson och särskild info syns direkt – utan att man behöver
 * öppna uppdraget för att veta vem man ska möta.
 */

/* -------------------------------------------------------------- Datumrad */

export type DayTile = {
  /** "2026-05-24" – används som nyckel och i länken. */
  key: string;
  day: string;
  month: string;
  count: number;
  href: string;
  active: boolean;
};

/**
 * Vågrät rad med dagar. "Idag" står först och visar allt som är kvar att
 * göra; en dag väljs för att smalna av listan till just den dagen.
 */
export function DayStrip({
  todayHref,
  todayActive,
  days,
  moreHref,
}: {
  todayHref: string;
  todayActive: boolean;
  days: DayTile[];
  moreHref?: string;
}) {
  return (
    <div className="no-scrollbar -mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4">
      <TileFrame href={todayHref} active={todayActive}>
        <CalendarIcon className="h-[18px] w-[18px]" />
        <span className="mt-1.5 text-[12px] font-medium">Idag</span>
      </TileFrame>

      {days.map((d) => (
        <TileFrame key={d.key} href={d.href} active={d.active}>
          <span className="text-[19px] font-bold leading-none">{d.day}</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
            {d.month}
          </span>
          <span className="mt-1.5 whitespace-nowrap text-[9.5px] text-fg-dim">
            {d.count} uppdrag
          </span>
        </TileFrame>
      ))}

      {moreHref ? (
        <TileFrame href={moreHref} active={false}>
          <CalendarIcon className="h-[18px] w-[18px]" />
          <span className="mt-1.5 text-[12px] font-medium">Mer</span>
        </TileFrame>
      ) : null}
    </div>
  );
}

function TileFrame({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`flex min-h-[76px] min-w-[58px] flex-1 basis-0 shrink-0 flex-col items-center justify-center rounded-xl border px-1 py-2.5 text-center transition-colors ${
        active
          ? "border-brand bg-brand/10 text-brand"
          : "border-line bg-surface text-fg hover:bg-surface-2"
      }`}
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------ Statusmärke */

type OutlineTone = "brand" | "warn" | "ok" | "danger" | "neutral";

const OUTLINE_CLASSES: Record<OutlineTone, string> = {
  brand: "border-brand/45 text-brand",
  warn: "border-warn/45 text-warn",
  ok: "border-ok/45 text-ok",
  danger: "border-danger/45 text-danger",
  neutral: "border-line text-fg-muted",
};

/** Ihålig statusetikett, som i uppdragslistan: bara ram och text. */
export function OutlineBadge({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: OutlineTone;
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-1.5 text-[10px] font-bold uppercase leading-none tracking-[0.08em] ${OUTLINE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------ Uppdragskort */

export type MissionCardProps = {
  href: string;
  day: string;
  month: string;
  time: string;
  title: string;
  locality: string;
  discipline?: string | null;
  status: { label: string; tone: OutlineTone };
  customer?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  missionType: string;
  specialInstructions?: string | null;
};

export function MissionCard({
  href,
  day,
  month,
  time,
  title,
  locality,
  discipline,
  status,
  customer,
  contactName,
  contactPhone,
  missionType,
  specialInstructions,
}: MissionCardProps) {
  return (
    <Link
      href={href}
      className="card block overflow-hidden transition-colors hover:border-surface-3 hover:bg-surface-2"
    >
      <div className="flex items-stretch gap-3.5 p-4">
        {/* Datumskena: dag, månad och starttid */}
        <div className="flex w-[52px] shrink-0 flex-col border-r border-line pr-3.5">
          <span className="text-[22px] font-bold leading-none">{day}</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
            {month}
          </span>
          <span className="mt-auto pt-3 text-[13px] font-semibold text-brand">
            {time}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-semibold">{title}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-fg-muted">
            <MapPinIcon className="h-[14px] w-[14px] shrink-0 text-fg-dim" />
            <span className="truncate">{locality}</span>
          </p>
          {discipline ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-fg-muted">
              <PawIcon className="h-[14px] w-[14px] shrink-0 text-fg-dim" />
              <span className="truncate">{discipline}</span>
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-start gap-2">
          <OutlineBadge tone={status.tone}>{status.label}</OutlineBadge>
          <ChevronRightIcon className="mt-1 h-[18px] w-[18px] text-fg-dim" />
        </div>
      </div>

      {/* Det man behöver veta innan man åker: vem, vad och var man möts */}
      <div className="grid grid-cols-4 divide-x divide-line border-t border-line">
        <Fact icon={<UsersIcon className="h-2.5 w-2.5" />} label="Kund">
          {customer}
        </Fact>
        <Fact icon={<UserIcon className="h-2.5 w-2.5" />} label="Kontaktperson">
          {contactName}
          {contactPhone ? (
            <>
              <br />
              {contactPhone}
            </>
          ) : null}
        </Fact>
        <Fact icon={<BoxIcon className="h-2.5 w-2.5" />} label="Uppdragstyp">
          {missionType}
        </Fact>
        <Fact icon={<ClipboardIcon className="h-2.5 w-2.5" />} label="Särskild info">
          {specialInstructions}
        </Fact>
      </div>
    </Link>
  );
}

function Fact({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  const tomt =
    children === null || children === undefined || children === "";
  return (
    <div className="px-2 py-3">
      <p className="flex items-center gap-[3px] text-[8.5px] leading-none text-fg-dim">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </p>
      {/* Två rader räcker – hela texten står på uppdragets egen sida. */}
      <p className="mt-1.5 line-clamp-2 break-words text-[11.5px] leading-snug text-fg">
        {tomt ? <span className="text-fg-dim">–</span> : children}
      </p>
    </div>
  );
}

/* --------------------------------------------------------- Tillgänglighet */

export function AvailabilityCard({
  available,
  note,
  href,
}: {
  available: boolean;
  note: string;
  href: string;
}) {
  return (
    <div className="card mb-5 flex items-center gap-3 p-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand">
        <CalendarIcon className="h-[20px] w-[20px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold">Tillgänglighet</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-fg-muted">
          <span
            aria-hidden
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              available ? "bg-ok" : "bg-fg-dim"
            }`}
          />
          <span className="truncate">{note}</span>
        </p>
      </div>
      <Link
        href={href}
        className="shrink-0 rounded-lg border border-brand/40 px-2 py-2 text-[11px] font-medium text-brand transition-colors hover:bg-brand/10"
      >
        Ändra tillgänglighet
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------- Påminnelser */

export type Reminder = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: ReactNode;
};

export function ReminderList({ reminders }: { reminders: Reminder[] }) {
  return (
    <div className="card divide-y divide-line">
      {reminders.map((r) => (
        <Link
          key={r.id}
          href={r.href}
          className="flex items-center gap-3 p-3.5 transition-colors first:rounded-t-[calc(var(--radius-card)-1px)] last:rounded-b-[calc(var(--radius-card)-1px)] hover:bg-surface-2"
        >
          <span className="shrink-0 text-fg-muted">{r.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium leading-snug">{r.title}</p>
            <p className="mt-0.5 truncate text-[12px] text-fg-muted">
              {r.subtitle}
            </p>
          </div>
          <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
        </Link>
      ))}
    </div>
  );
}
