/**
 * Ikonuppsättning i konturstil, 24x24, stroke 1.6 – samma visuella vikt i
 * hela appen. Ikonerna ärver färg via currentColor.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function Icon({ className = "h-6 w-6", children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 10.5 12 3.5l8.5 7" />
    <path d="M5.5 9.5V20h13V9.5" />
    <path d="M9.75 20v-5.5h4.5V20" />
  </Icon>
);

export const PawIcon = (p: IconProps) => (
  <Icon {...p}>
    <ellipse cx="7" cy="8.5" rx="1.9" ry="2.4" />
    <ellipse cx="12" cy="7" rx="1.9" ry="2.5" />
    <ellipse cx="17" cy="8.5" rx="1.9" ry="2.4" />
    <path d="M12 12.2c-2.6 0-4.7 1.9-4.7 4.2 0 1.7 1.2 2.6 2.6 2.6.9 0 1.5-.4 2.1-.4s1.2.4 2.1.4c1.4 0 2.6-.9 2.6-2.6 0-2.3-2.1-4.2-4.7-4.2Z" />
  </Icon>
);

export const DogIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 5.5v5.2c0 4 3.1 7.3 7 7.3h1.8v3h6.2v-6.2c0-2.4-1.3-4.5-3.3-5.6" />
    <path d="M4.5 5.5 8 8.6" />
    <path d="M16.2 9.4V6.2l2.6-1.7v4.1" />
    <circle cx="11.6" cy="9.4" r=".9" fill="currentColor" stroke="none" />
  </Icon>
);

export const BriefcaseIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="7.5" width="18" height="12.5" rx="2.2" />
    <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
    <path d="M3 12.5h18" />
  </Icon>
);

export const TrainingIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="15.5" cy="4.8" r="1.8" />
    <path d="M13.6 20.5 11 15.4l-2.6-2 1-5 3.6-1.3 2.6 3 2.8 1" />
    <path d="M11 15.4 7.4 17l-1.8 3.5" />
    <path d="M12.4 7.1 8.9 8.4 6.1 11" />
  </Icon>
);

export const MoreIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="5.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="18.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </Icon>
);

export const BellIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 16V10.5a6 6 0 1 0-12 0V16l-1.6 2.2h15.2L18 16Z" />
    <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
  </Icon>
);

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const FilterIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 5.5h17l-6.6 7.6v5.3l-3.8 2v-7.3L3.5 5.5Z" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
  </Icon>
);

export const CheckCircleIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.3 12.2 11 14.9l4.8-5" />
  </Icon>
);

export const ShieldIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.2 5 6v6c0 4 3 7.3 7 8.8 4-1.5 7-4.8 7-8.8V6l-7-2.8Z" />
    <path d="M9.2 12.1 11.3 14.2 15 10.4" />
  </Icon>
);

export const CertificateIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="9.5" r="5" />
    <path d="M9.2 13.6 8 21l4-2 4 2-1.2-7.4" />
    <path d="M10.2 9.4 11.5 10.7 14 8.2" />
  </Icon>
);

export const MapPinIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21c4-4.2 6-7.3 6-10a6 6 0 1 0-12 0c0 2.7 2 5.8 6 10Z" />
    <circle cx="12" cy="11" r="2.2" />
  </Icon>
);

export const TreeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3 7 10h3l-3.5 5h11L14 10h3L12 3Z" />
    <path d="M12 15v6" />
  </Icon>
);

export const ScentIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </Icon>
);

export const BoxIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5 20 7.6v8.8L12 20.5 4 16.4V7.6L12 3.5Z" />
    <path d="M4 7.6 12 11.8l8-4.2" />
    <path d="M12 11.8v8.7" />
  </Icon>
);

export const MessageIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 5.5H4v10.2h4.2l3.1 3.1 3.1-3.1H20V5.5Z" />
  </Icon>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.5 5.5 16 12l-6.5 6.5" />
  </Icon>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.5 9.5 12 16l6.5-6.5" />
  </Icon>
);

export const PlayIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M10.3 8.9 15.5 12l-5.2 3.1V8.9Z" fill="currentColor" />
  </Icon>
);

export const LockIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="10.2" width="14" height="9.8" rx="2.2" />
    <path d="M8.2 10.2V7.6a3.8 3.8 0 0 1 7.6 0v2.6" />
  </Icon>
);

export const CompassIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M15.2 8.8 13.4 13.4 8.8 15.2 10.6 10.6 15.2 8.8Z" />
  </Icon>
);

export const ClockIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.4V12l3 1.8" />
  </Icon>
);

export const AlertIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4.2 21 19.5H3L12 4.2Z" />
    <path d="M12 10v4" />
    <circle cx="12" cy="16.8" r=".9" fill="currentColor" stroke="none" />
  </Icon>
);

export const UsersIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9.2" cy="8.5" r="3.2" />
    <path d="M3.5 19.5c0-3.1 2.5-5.2 5.7-5.2s5.7 2.1 5.7 5.2" />
    <path d="M16 5.6a3.2 3.2 0 0 1 0 6.1" />
    <path d="M17.2 14.6c2 .6 3.3 2.3 3.3 4.9" />
  </Icon>
);

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="15" rx="2.2" />
    <path d="M3.5 10h17" />
    <path d="M8 3.5v4M16 3.5v4" />
  </Icon>
);

export const ChartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="M8 16.5v-4M12.5 16.5V8M17 16.5v-6.5" />
  </Icon>
);

export const LogoutIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.5 5.5H6.5v13h8" />
    <path d="M11 12h9.5" />
    <path d="M17.5 8.5 21 12l-3.5 3.5" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M15.8 15.8 20.5 20.5" />
  </Icon>
);

export const XIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const SettingsIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
  </Icon>
);

export const ClipboardIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="5" width="14" height="16" rx="2.2" />
    <path d="M9 5V3.8h6V5" />
    <path d="M8.6 11h6.8M8.6 15h4.6" />
  </Icon>
);

export const UserIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8.2" r="3.7" />
    <path d="M4.8 20.2c0-3.6 3.2-6 7.2-6s7.2 2.4 7.2 6" />
  </Icon>
);
