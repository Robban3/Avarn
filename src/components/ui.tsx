import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "./icons";
import { initials } from "@/lib/format";

/* -------------------------------------------------------------- Sektioner */

/** Versal sektionsrubrik med valfri "Visa alla"-länk till höger. */
export function SectionHeader({
  title,
  href,
  linkLabel = "Visa alla",
  className = "",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={`mb-2.5 flex items-center justify-between ${className}`}>
      <h2 className="section-label">{title}</h2>
      {href ? (
        <Link href={href} className="text-xs font-medium text-brand">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ Kort */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`card ${className}`}>{children}</div>;
}

/** Kort som är en länk – får en chevron till höger. */
export function LinkCard({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`card flex items-center gap-3 p-3.5 transition-colors hover:border-surface-3 hover:bg-surface-2 ${className}`}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
    </Link>
  );
}

/* ---------------------------------------------------------------- Märken */

type Tone = "brand" | "ok" | "warn" | "danger" | "neutral" | "info";

const TONE_CLASSES: Record<Tone, string> = {
  brand: "bg-brand/12 text-brand border-brand/25",
  ok: "bg-ok/12 text-ok border-ok/25",
  warn: "bg-warn/12 text-warn border-warn/25",
  danger: "bg-danger/12 text-danger border-danger/25",
  info: "bg-info/12 text-info border-info/25",
  neutral: "bg-surface-2 text-fg-muted border-line",
};

/** Statusetikett, t.ex. "Godkänt" eller "Aktiv". */
export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Liten versal tagg för sökdisciplin, t.ex. "SÖK – SPÅR". */
export function DisciplineTag({ label }: { label: string }) {
  return (
    <span className="whitespace-nowrap rounded border border-brand/25 bg-brand/10 px-1.5 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.06em] text-brand">
      {label}
    </span>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="chip">{children}</span>;
}

/* ---------------------------------------------------------------- Avatar */

/**
 * Bilder är inte inlagda i seed-datan, så avataren faller tillbaka på
 * initialer. Läggs ett foto in visas det i stället.
 */
export function Avatar({
  name,
  photoUrl,
  size = 40,
  ring = false,
}: {
  name: string;
  photoUrl?: string | null;
  size?: number;
  ring?: boolean;
}) {
  const ringClass = ring ? "ring-2 ring-brand/60 ring-offset-2 ring-offset-bg" : "";
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-full object-cover ${ringClass}`}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-surface-3 font-semibold text-fg-muted ${ringClass}`}
    >
      {initials(name)}
    </span>
  );
}

/* ------------------------------------------------------------ Detaljrader */

/** Rad med ikon, etikett och värde – används i pass- och rapportvyerna. */
export function DetailRow({
  icon,
  label,
  children,
  align = "row",
}: {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
  /** "column" när värdet är en längre text som behöver egen rad. */
  align?: "row" | "column";
}) {
  return (
    <div className="flex gap-3 px-4 py-3">
      {icon ? (
        <span className="mt-0.5 shrink-0 text-fg-dim">{icon}</span>
      ) : null}
      <div
        className={
          align === "row"
            ? "flex min-w-0 flex-1 items-start justify-between gap-4"
            : "min-w-0 flex-1"
        }
      >
        <span className="shrink-0 text-sm text-fg-muted">{label}</span>
        <div
          className={
            align === "row"
              ? "min-w-0 text-right text-sm text-fg"
              : "mt-1 text-sm text-fg"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Behållare som drar en tunn linje mellan varje DetailRow. */
export function DetailList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`card divide-y divide-line-soft ${className}`}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------ Datumblock */

/** Stort dagnummer med månad under – som i uppdragslistan. */
export function DateBlock({ day, month }: { day: string; month: string }) {
  return (
    <div className="flex w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-2 py-1.5">
      <span className="text-lg font-semibold leading-none text-fg">{day}</span>
      <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-fg-dim">
        {month}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------- Nyckeltal */

export function StatTile({
  value,
  label,
}: {
  value: ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-2 py-4 text-center">
      <span className="text-2xl font-semibold leading-none text-brand">
        {value}
      </span>
      <span className="mt-1.5 text-[11px] leading-tight text-fg-muted">
        {label}
      </span>
    </div>
  );
}

/** Rad med nyckeltal, avdelade med tunna linjer. */
export function StatRow({ children }: { children: ReactNode }) {
  return (
    <div className="card flex divide-x divide-line-soft">{children}</div>
  );
}

/* ----------------------------------------------------------- Tomt läge */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      {icon ? <div className="mb-3 text-fg-dim">{icon}</div> : null}
      <p className="text-sm font-medium text-fg">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-xs text-sm text-fg-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
