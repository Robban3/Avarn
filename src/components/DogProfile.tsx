import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, CardHeader, StatusPill, Tabs } from "./ui";
import { CheckCircleIcon, ChevronRightIcon } from "./icons";

/**
 * Delarna som bygger upp hundprofilen. Ligger samlade här eftersom de bara
 * används där, men är för många för att trängas i sidan.
 */

/**
 * Flikraden överst på profilen. Bor numera i ui.tsx som `Tabs`, eftersom
 * uppdragsdetaljen använder samma rad – re-exporteras här så att
 * hundprofilen slipper ändras.
 */
export const ProfileTabs = Tabs;

/** Ruta i informationsrutnätet: ikon, etikett och värde. */
export function InfoTile({
  icon,
  label,
  children,
  href,
  sub,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  href?: string;
  sub?: string;
}) {
  const content = (
    <>
      <span className="mt-0.5 shrink-0 text-fg-dim">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
          {label}
        </p>
        <p className="truncate text-sm text-fg">{children}</p>
        {sub ? <p className="truncate text-xs text-fg-muted">{sub}</p> : null}
      </div>
      {href ? (
        <ChevronRightIcon className="mt-2 h-[18px] w-[18px] shrink-0 text-fg-dim" />
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2"
      >
        {content}
      </Link>
    );
  }
  return <div className="flex gap-3 px-4 py-3.5">{content}</div>;
}

/**
 * Utbildningarna som en vågrät tidslinje. Genomförda får en bock; kommande
 * ritas dämpade, så att det syns var ekipaget befinner sig.
 */
export function EducationTimeline({
  educations,
}: {
  educations: {
    id: string;
    name: string;
    icon: ReactNode;
    completed: boolean;
    date: string | null;
  }[];
}) {
  if (educations.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-fg-muted">
        Inga utbildningar registrerade.
      </p>
    );
  }

  return (
    <div className="no-scrollbar overflow-x-auto px-4 py-5">
      <ol className="flex min-w-max items-start gap-0">
        {educations.map((edu, i) => (
          <li key={edu.id} className="flex items-start">
            {i > 0 ? (
              // Linjen mellan cirklarna, i höjd med deras mitt
              <span
                aria-hidden
                className={`mt-7 h-px w-10 sm:w-16 ${
                  edu.completed ? "bg-brand/50" : "bg-line"
                }`}
              />
            ) : null}
            <div className="flex w-32 flex-col items-center text-center">
              <span
                className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 ${
                  edu.completed
                    ? "border-brand/60 text-brand"
                    : "border-line text-fg-dim"
                }`}
              >
                {edu.icon}
                {edu.completed ? (
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-bg text-ok">
                    <CheckCircleIcon className="h-4 w-4" />
                  </span>
                ) : null}
              </span>
              <p className="mt-2.5 text-[13px] font-medium leading-tight text-fg">
                {edu.name}
              </p>
              <p
                className={`mt-1 text-[10px] font-semibold uppercase tracking-wide ${
                  edu.completed ? "text-brand" : "text-fg-dim"
                }`}
              >
                {edu.completed ? "Genomförd" : "Planerad"}
              </p>
              {edu.date ? (
                <p className="text-xs text-fg-muted">{edu.date}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Rad i nyckelinformationen. */
export function KeyRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span className="shrink-0 text-fg-dim">{icon}</span>
      <span className="flex-1 text-sm text-fg-muted">{label}</span>
      <span className="text-sm font-medium text-fg">{value}</span>
    </div>
  );
}

/** Knapparna längst ner på profilen. */
export function ProfileAction({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="card flex flex-1 flex-col items-center justify-center gap-2 px-2 py-4 text-center transition-colors hover:border-brand/40 hover:bg-surface-2"
    >
      <span className="text-brand">{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wide">
        {children}
      </span>
    </Link>
  );
}

export { Badge, CardHeader, StatusPill };
