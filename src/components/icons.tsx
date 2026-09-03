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
    {/* Hundhuvud i framvy: hjässa, hängande öron, nos */}
    <path d="M7.2 6.8C5.9 8.2 5.3 10.2 5.3 12.2c0 3.6 3 6.3 6.7 6.3s6.7-2.7 6.7-6.3c0-2-.6-4-1.9-5.4" />
    <path d="M7.2 6.8 5.4 3.2l4.3 1.9" />
    <path d="M16.8 6.8l1.8-3.6-4.3 1.9" />
    <path d="M10.4 15.4c.5.5 1 .7 1.6.7s1.1-.2 1.6-.7" />
    <circle cx="9.7" cy="11.4" r=".95" fill="currentColor" stroke="none" />
    <circle cx="14.3" cy="11.4" r=".95" fill="currentColor" stroke="none" />
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

export const MinusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14" />
  </Icon>
);

export const PhoneIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7.2 3.8h3l1.3 3.4-1.9 1.4a11.5 11.5 0 0 0 5.8 5.8l1.4-1.9 3.4 1.3v3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 5.2 6a2 2 0 0 1 2-2.2Z" />
  </Icon>
);

export const CarIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 16.5v2.2h2.6v-2.2M16.9 16.5v2.2h2.6v-2.2" />
    <path d="M3.6 16.5v-4l1.9-4.6a2 2 0 0 1 1.9-1.2h9.2a2 2 0 0 1 1.9 1.2l1.9 4.6v4Z" />
    <path d="M3.6 12.5h16.8M7 15h1.5M15.5 15H17" />
  </Icon>
);

export const TargetIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <circle cx="12" cy="12" r="7.5" />
    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
  </Icon>
);

export const FlagIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 21V4" />
    <path d="M6 4.5h11l-2.2 3.6L17 11.7H6" />
  </Icon>
);

export const StopwatchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 10v3.5l2.3 1.6M9.5 2.5h5M12 2.5V6M18.8 7.4l1.4-1.4" />
  </Icon>
);

export const StopIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
  </Icon>
);

export const RouteIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21s6.2-6.1 6.2-10.4a6.2 6.2 0 1 0-12.4 0C5.8 14.9 12 21 12 21Z" />
    <circle cx="12" cy="10.4" r="2.3" />
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

export const PencilIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20h4.2L19 9.2a2.1 2.1 0 0 0 0-3l-1.2-1.2a2.1 2.1 0 0 0-3 0L4 15.8V20Z" />
    <path d="M13.8 6.2 17.8 10.2" />
  </Icon>
);

export const ChipIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="7.5" y="7.5" width="9" height="9" rx="1.6" />
    <path d="M10 4.5v3M14 4.5v3M10 16.5v3M14 16.5v3M4.5 10h3M4.5 14h3M16.5 10h3M16.5 14h3" />
  </Icon>
);

export const ScaleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 8.5h12l1.5 11.5h-15L6 8.5Z" />
    <path d="M9.5 8.5a2.5 2.5 0 0 1 5 0" />
  </Icon>
);

export const HeightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 20V11M12 20V6M18 20v-6" />
  </Icon>
);

export const PaletteIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5c-4.7 0-8.5 3.5-8.5 8 0 3 2.2 4.6 4.4 4.6 1.4 0 2-.7 2-1.6 0-1.6 1.3-2.4 3-2.4h1.6c3 0 6-1.4 6-4.1 0-2.7-3.4-4.5-8.5-4.5Z" />
    <circle cx="8.4" cy="9.4" r=".95" fill="currentColor" stroke="none" />
    <circle cx="12.4" cy="7.6" r=".95" fill="currentColor" stroke="none" />
  </Icon>
);

export const PlusCircleIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8.6v6.8M8.6 12h6.8" />
  </Icon>
);

export const XCircleIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
  </Icon>
);

export const FolderIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 6.5h5.6l1.8 2.2h9.6V19H3.5V6.5Z" />
  </Icon>
);

export const GraduationIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4.5 21 9l-9 4.5L3 9l9-4.5Z" />
    <path d="M6.8 11v4.6c0 1.5 2.3 2.7 5.2 2.7s5.2-1.2 5.2-2.7V11" />
  </Icon>
);

export const SexIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="9.5" r="4.5" />
    <path d="M12 14v6M9.4 17.4h5.2" />
  </Icon>
);

/* ------------------------------------------------- Ikoner för adminpanelen */

export const GridIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </Icon>
);

export const BuildingIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20h16" />
    <path d="M6 20V5.5A1.5 1.5 0 0 1 7.5 4h5A1.5 1.5 0 0 1 14 5.5V20" />
    <path d="M14 20V10h3.5A1.5 1.5 0 0 1 19 11.5V20" />
    <path d="M8.5 8h3M8.5 11.5h3M8.5 15h3" />
  </Icon>
);

export const HandshakeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 11.5 7 8h4l2 1.75L11 11.5 9 10" />
    <path d="M20.5 11.5 17 8h-3.5" />
    <path d="m13 12 2.5 2.5M11 14l2 2M9 16l1.5 1.5" />
    <path d="M3.5 11.5 6 14M20.5 11.5 18 14" />
  </Icon>
);

export const DownloadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4v10" />
    <path d="m8 10.5 4 4 4-4" />
    <path d="M4.5 18.5h15" />
  </Icon>
);

/** Tre lodräta punkter – radmenyn i tabellerna. */
export const KebabIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <circle cx="12" cy="5.5" r=".6" fill="currentColor" />
    <circle cx="12" cy="12" r=".6" fill="currentColor" />
    <circle cx="12" cy="18.5" r=".6" fill="currentColor" />
  </Icon>
);
