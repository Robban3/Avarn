import Link from "next/link";
import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { ArrowLeftIcon, BellIcon, MenuIcon } from "./icons";

/**
 * Ramen kring varje sida: sidhuvud med titel, innehållsyta och de fem
 * flikarna längst ner. På större skärmar breddas innehållet men
 * strukturen är densamma, så mobilen förblir det som styr designen.
 */

type AppShellProps = {
  /** Utelämnas på hemskärmen, som i designunderlaget saknar rubrik. */
  title?: string;
  /** Visas som bakåtpil i stället för menyknapp. */
  backHref?: string;
  /** Extra knapp längst till höger i sidhuvudet, t.ex. filter eller spara. */
  action?: ReactNode;
  /** Antal olästa notifieringar; döljer klockan när värdet är undefined. */
  unread?: number;
  children: ReactNode;
  role: string;
};

export function AppShell({
  title,
  backHref,
  action,
  unread,
  children,
  role,
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-30 border-b border-line-soft bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-2 px-4">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="Tillbaka"
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-2"
            >
              <ArrowLeftIcon className="h-[22px] w-[22px]" />
            </Link>
          ) : (
            <Link
              href="/mer"
              aria-label="Meny"
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-2"
            >
              <MenuIcon className="h-[22px] w-[22px]" />
            </Link>
          )}

          {title ? (
            <h1 className="flex-1 truncate text-center text-[13px] font-semibold uppercase tracking-[0.12em] text-fg">
              {title}
            </h1>
          ) : (
            <span className="flex-1" />
          )}

          <div className="flex min-w-10 items-center justify-end gap-1">
            {action ?? <NotificationBell unread={unread} />}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-28 pt-4">
        {children}
      </main>

      <BottomNav role={role} />
    </div>
  );
}

export function NotificationBell({ unread }: { unread?: number }) {
  if (unread === undefined) return <span className="h-10 w-10" aria-hidden />;
  return (
    <Link
      href="/meddelanden"
      aria-label={
        unread > 0 ? `Meddelanden, ${unread} olästa` : "Meddelanden"
      }
      className="relative -mr-2 flex h-10 w-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-2"
    >
      <BellIcon className="h-[22px] w-[22px]" />
      {unread > 0 ? (
        <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-[#06201e]">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
