import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Avatar, PageHeading, SectionHeader } from "@/components/ui";
import {
  CalendarIcon,
  CertificateIcon,
  ChartIcon,
  ChevronRightIcon,
  ClipboardIcon,
  GridIcon,
  LogoutIcon,
  MessageIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { AvarnLogo } from "@/components/AvarnLogo";
import { currentUserRecord, unreadNotificationCount } from "@/lib/auth";
import { can } from "@/lib/authz";
import { ROLE_LABELS, type Role } from "@/lib/domain";
import { logout } from "@/app/login/actions";

export const metadata: Metadata = { title: "Mer" };

export default async function MorePage() {
  const record = await currentUserRecord();
  const role = record.role as Role;
  const unread = await unreadNotificationCount(record.id);
  const user = { role, id: record.id, regionId: record.regionId };

  const items = [
    {
      href: "/sok",
      label: "Sök",
      Icon: SearchIcon,
      show: true,
    },
    {
      href: "/kalender",
      label: "Kalender",
      Icon: CalendarIcon,
      show: true,
    },
    {
      href: "/certifikat",
      label: "Certifikat och behörigheter",
      Icon: CertificateIcon,
      show: true,
    },
    {
      href: "/meddelanden",
      label: "Meddelanden",
      Icon: MessageIcon,
      show: true,
      badge: unread,
    },
    {
      href: "/rapporter",
      label: "Operativa rapporter",
      Icon: ClipboardIcon,
      show: true,
    },
    {
      // Adminpanelen är en skrivbordsvy; posten visas för alla som når den.
      href: "/panel",
      label: "Adminpanel",
      Icon: GridIcon,
      show:
        can(user, "instructor:view") ||
        can(user, "stats:view") ||
        can(user, "admin:manage"),
    },
    {
      href: "/instruktor",
      label: "Instruktörsvy",
      Icon: UsersIcon,
      show: can(user, "instructor:view"),
    },
    {
      href: "/ledning",
      label: "Statistik och kapacitet",
      Icon: ChartIcon,
      show: can(user, "stats:view"),
    },
    {
      href: "/admin",
      label: "Administration",
      Icon: SettingsIcon,
      show: can(user, "admin:manage"),
    },
    { href: "/profil", label: "Min profil", Icon: UserIcon, show: true },
  ].filter((i) => i.show);

  return (
    <AppShell branded title="Hundar" menu={false} unread={unread} role={role}>
      <PageHeading>Mer</PageHeading>

      <Link
        href="/profil"
        className="card mb-5 flex items-center gap-3.5 p-4 transition-colors hover:bg-surface-2"
      >
        <Avatar
          name={record.name}
          photoUrl={record.handlerProfile?.photoUrl}
          size={52}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{record.name}</p>
          <p className="truncate text-sm text-brand">
            {ROLE_LABELS[role] ?? role}
          </p>
          <p className="truncate text-xs text-fg-dim">
            {record.region?.name ?? "Hela landet"}
          </p>
        </div>
        <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
      </Link>

      <SectionHeader title="Meny" />
      <nav className="card divide-y divide-line-soft">
        {items.map(({ href, label, Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2"
          >
            <Icon className="h-5 w-5 shrink-0 text-fg-muted" />
            <span className="flex-1 text-sm">{label}</span>
            {badge ? (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-[#06201e]">
                {badge > 9 ? "9+" : badge}
              </span>
            ) : null}
            <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
          </Link>
        ))}
      </nav>

      <form action={logout} className="mt-5">
        <button type="submit" className="btn btn-danger w-full">
          <LogoutIcon className="h-[18px] w-[18px]" />
          Logga ut
        </button>
      </form>

      <div className="mt-10 flex flex-col items-center gap-2 pb-4">
        <AvarnLogo />
        <p className="text-xs text-fg-dim">Hundtjänst</p>
      </div>
    </AppShell>
  );
}
