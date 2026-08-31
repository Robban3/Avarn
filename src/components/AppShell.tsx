import Link from "next/link";
import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { AvarnLogo } from "./AvarnLogo";
import { ArrowLeftIcon, BellIcon, MenuIcon } from "./icons";

/**
 * Ramen kring varje sida: sidhuvud med titel, innehållsyta och de fem
 * flikarna längst ner. På större skärmar breddas innehållet men
 * strukturen är densamma, så mobilen förblir det som styr designen.
 */

type AppShellProps = {
  /** Utelämnas när sidhuvudet bara ska visa logotypen. */
  title?: string;
  /**
   * Visar logotypen till vänster med sidnamnet i turkos bredvid, i stället
   * för en centrerad versal rubrik. Används på startsidan.
   */
  branded?: boolean;
  /** Visas som bakåtpil i stället för menyknapp. */
  backHref?: string;
  /** Extra knapp längst till höger i sidhuvudet, t.ex. filter eller spara. */
  action?: ReactNode;
  /** Antal olästa notifieringar; döljer klockan när värdet är undefined. */
  unread?: number;
  /** Bredare innehållsyta för instrumentpanelen. */
  wide?: boolean;
  children: ReactNode;
  role: string;
};

export function AppShell({
  title,
  branded = false,
  backHref,
  action,
  unread,
  wide = false,
  children,
  role,
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-30 border-b border-line-soft bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
        <div
          className={`mx-auto flex h-14 w-full items-center gap-2 px-4 ${
            wide ? "max-w-5xl" : "max-w-4xl"
          }`}
        >
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

          {branded ? (
            <div className="flex flex-1 items-center gap-3">
              <AvarnLogo />
              {title ? (
                <>
                  <span
                    aria-hidden
                    className="h-5 w-px bg-line"
                  />
                  <h1 className="truncate text-[13px] font-semibold uppercase tracking-[0.12em] text-brand">
                    {title}
                  </h1>
                </>
              ) : null}
            </div>
          ) : title ? (
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

      <main
        className={`mx-auto w-full flex-1 px-4 pb-28 pt-4 ${
          wide ? "max-w-5xl" : "max-w-4xl"
        }`}
      >
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
