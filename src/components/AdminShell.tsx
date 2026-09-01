import Link from "next/link";
import type { ReactNode } from "react";
import { AvarnLogo, AvarnMark } from "./AvarnLogo";
import { Avatar } from "./ui";
import {
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  CertificateIcon,
  ChevronDownIcon,
  ClipboardIcon,
  CompassIcon,
  DogIcon,
  GridIcon,
  HandshakeIcon,
  MessageIcon,
  SettingsIcon,
  TrainingIcon,
  UsersIcon,
} from "./icons";
import { ROLE_LABELS, type Role } from "@/lib/domain";
import { can, type Action } from "@/lib/authz";
import type { SessionUser } from "@/lib/session";

/**
 * Adminpanelens ram. Till skillnad från mobilappen är det här en
 * skrivbordsvy: fast sidomeny till vänster, innehållet till höger. Samma
 * panel för instruktör, regionalt ansvarig och administratör – menyn
 * kortas efter behörighet i stället för att det finns tre olika paneler.
 */

/** Versionen som visas nederst i sidomenyn. Följer package.json. */
const VERSION = "0.1.0";

type MenuItem = {
  href: string;
  label: string;
  Icon: (p: { className?: string }) => ReactNode;
  /** Utelämnas när posten är öppen för alla som når panelen. */
  krav?: Action;
};

const HUVUDMENY: MenuItem[] = [
  { href: "/panel", label: "Översikt", Icon: GridIcon },
  { href: "/panel/ekipage", label: "Ekipage", Icon: UsersIcon },
  { href: "/panel/hundar", label: "Hundar", Icon: DogIcon },
  { href: "/panel/uppdrag", label: "Uppdrag", Icon: BriefcaseIcon },
  { href: "/panel/traning", label: "Träning", Icon: TrainingIcon },
  { href: "/panel/rapporter", label: "Rapporter", Icon: ClipboardIcon },
  {
    href: "/panel/certifikat",
    label: "Certifikat & behörigheter",
    Icon: CertificateIcon,
  },
  { href: "/panel/meddelanden", label: "Meddelanden", Icon: MessageIcon },
  { href: "/panel/kalender", label: "Kalender", Icon: CalendarIcon },
];

const ADMINISTRATION: MenuItem[] = [
  {
    href: "/panel/anvandare",
    label: "Användare & roller",
    Icon: UsersIcon,
    krav: "admin:manage",
  },
  {
    href: "/panel/organisation",
    label: "Organisation",
    Icon: BuildingIcon,
    krav: "admin:manage",
  },
  {
    href: "/panel/regioner",
    label: "Regioner",
    Icon: CompassIcon,
    krav: "stats:view",
  },
  {
    href: "/panel/kunder",
    label: "Kunder",
    Icon: HandshakeIcon,
    krav: "stats:view",
  },
  {
    href: "/panel/installningar",
    label: "Inställningar",
    Icon: SettingsIcon,
    krav: "admin:manage",
  },
  {
    href: "/panel/systemlogg",
    label: "Systemlogg",
    Icon: ClipboardIcon,
    krav: "admin:manage",
  },
];

export function AdminShell({
  user,
  aktiv,
  title,
  subtitle,
  actions,
  children,
}: {
  user: SessionUser & { name: string };
  /** Vilken menypost som är vald – href:en, t.ex. "/panel/ekipage". */
  aktiv: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const synliga = (poster: MenuItem[]) =>
    poster.filter((p) => !p.krav || can(user, p.krav));

  const huvud = synliga(HUVUDMENY);
  const admin = synliga(ADMINISTRATION);

  return (
    <div className="min-h-dvh bg-bg">
      {/* Sidomenyn ligger still medan innehållet rullar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col overflow-y-auto border-r border-line-soft bg-bg-deep lg:flex">
        <div className="px-5 pb-6 pt-5">
          <AvarnLogo />
          <span className="mt-3 inline-flex rounded-md border border-brand/30 bg-brand/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand">
            Admin panel
          </span>
        </div>

        <MenuGroup rubrik="Huvudmeny" poster={huvud} aktiv={aktiv} />
        {admin.length > 0 ? (
          <MenuGroup rubrik="Administration" poster={admin} aktiv={aktiv} />
        ) : null}

        <div className="mt-auto flex items-center gap-2.5 px-5 pb-5 pt-8">
          <AvarnMark className="h-4 w-auto text-fg-dim" />
          <span className="text-[10px] text-fg-dim">v{VERSION}</span>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        {/* Under lg finns ingen plats för sidomenyn – då blir den en rad */}
        <nav
          aria-label="Adminmeny"
          className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line-soft bg-bg-deep px-4 py-2.5 lg:hidden"
        >
          {[...huvud, ...admin].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={aktiv === href ? "page" : undefined}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                aktiv === href
                  ? "bg-brand/12 text-brand"
                  : "text-fg-muted hover:bg-surface-2"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <header className="px-5 pb-5 pt-4 lg:px-8 lg:pt-5">
          <div className="mb-4 flex justify-end">
            <Link
              href="/profil"
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-2"
            >
              <Avatar name={user.name} size={34} />
              <span className="hidden text-right sm:block">
                <span className="block text-[13px] font-semibold leading-tight">
                  {user.name}
                </span>
                <span className="block text-[11px] leading-tight text-fg-muted">
                  {ROLE_LABELS[user.role as Role] ?? user.role}
                </span>
              </span>
              <ChevronDownIcon className="h-4 w-4 text-fg-dim" />
            </Link>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[26px] font-semibold leading-tight">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-[13px] text-fg-muted">{subtitle}</p>
              ) : null}
            </div>
            {actions ? (
              <div className="flex flex-wrap items-center gap-3">{actions}</div>
            ) : null}
          </div>
        </header>

        <main className="px-5 pb-12 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function MenuGroup({
  rubrik,
  poster,
  aktiv,
}: {
  rubrik: string;
  poster: MenuItem[];
  aktiv: string;
}) {
  return (
    <div className="mb-2">
      <p className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-fg-dim">
        {rubrik}
      </p>
      <ul className="px-3">
        {poster.map(({ href, label, Icon }) => {
          const vald = aktiv === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={vald ? "page" : undefined}
                className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors ${
                  vald
                    ? "bg-brand/12 font-semibold text-brand"
                    : "text-fg-muted hover:bg-surface-2 hover:text-fg"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
