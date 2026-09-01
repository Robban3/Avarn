import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon, DownloadIcon } from "./icons";

/**
 * Återkommande delar i adminpanelen: tabellramen, filterraden och de små
 * länkarna längst ner i korten. Samlade så att alla sidor i panelen ser
 * likadana ut utan att upprepa klasserna.
 */

/** "Visa fullständig rapport →" längst ner i ett kort. */
export function CardLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand transition-colors hover:text-brand-strong"
    >
      {children}
      <span aria-hidden>→</span>
    </Link>
  );
}

/** Liten länk uppe till höger i ett kort, t.ex. "Visa alla". */
export function CardAction({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="shrink-0 text-[13px] font-medium text-brand transition-colors hover:text-brand-strong"
    >
      {children}
    </Link>
  );
}

/** Knapp i topplisten, t.ex. "Exportera". */
export function PanelButton({
  href,
  children,
  icon,
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[13px] font-medium text-fg transition-colors hover:bg-surface-2"
    >
      {children}
      {icon ?? <DownloadIcon className="h-4 w-4" />}
    </Link>
  );
}

/* ---------------------------------------------------------------- Tabell */

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap border-b border-line px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-dim ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`border-b border-line-soft px-3 py-3 align-middle text-[13px] ${className}`}
    >
      {children}
    </td>
  );
}

/** Rad i aktivitetsflödet och andra listor med ikon, text och undertext. */
export function FeedRow({
  icon,
  title,
  subtitle,
  meta,
  href,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  meta?: string;
  href?: string;
}) {
  const innehall = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-fg-muted">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium">{title}</span>
        {subtitle ? (
          <span className="block truncate text-[12px] text-fg-muted">
            {subtitle}
          </span>
        ) : null}
      </span>
      {meta ? (
        <span className="shrink-0 whitespace-nowrap text-[12px] text-fg-dim">
          {meta}
        </span>
      ) : null}
      {href ? (
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-fg-dim" />
      ) : null}
    </>
  );

  if (!href) {
    return <div className="flex items-center gap-3 py-2.5">{innehall}</div>;
  }
  return (
    <Link
      href={href}
      className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-2"
    >
      {innehall}
    </Link>
  );
}

/** Statusprick med text – aldrig bara färg. */
export function StatusDot({
  ok,
  children,
}: {
  ok: boolean;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px]">
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-ok" : "bg-fg-dim"}`}
      />
      {children}
    </span>
  );
}

/** Liten tagg för sökinriktning i tabellrader. */
export function MiniTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] text-fg-muted">
      {children}
    </span>
  );
}
