"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseIcon,
  HomeIcon,
  MoreIcon,
  PawIcon,
  TrainingIcon,
} from "./icons";

/**
 * De fem flikarna. Samma uppsättning för alla roller – instruktörs-,
 * lednings- och adminvyerna nås under "Mer", så att den operativa
 * navigeringen ser likadan ut oavsett vem som är inloggad.
 */
const TABS = [
  { href: "/hem", label: "Hem", Icon: HomeIcon },
  { href: "/hundar", label: "Hundar", Icon: PawIcon },
  { href: "/uppdrag", label: "Uppdrag", Icon: BriefcaseIcon },
  { href: "/traning", label: "Träning", Icon: TrainingIcon },
  { href: "/mer", label: "Mer", Icon: MoreIcon },
];

export function BottomNav({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Huvudmeny"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-bg-deep/95 backdrop-blur"
      data-role={role}
    >
      <ul className="mx-auto flex w-full max-w-4xl items-stretch pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ href, label, Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 transition-colors ${
                  active ? "text-brand" : "text-fg-dim hover:text-fg-muted"
                }`}
              >
                <Icon className="h-[22px] w-[22px]" />
                <span className="text-[10px] font-medium tracking-wide">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
