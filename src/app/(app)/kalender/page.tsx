import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Dagslista,
  Krockar,
  Manadsrutnat,
  Prickforklaring,
  Veckorutnat,
} from "@/components/Kalender";
import { EmptyState, Tabs } from "@/components/ui";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { currentUserRecord, unreadNotificationCount } from "@/lib/auth";
import { kalenderhandelser } from "@/lib/queries";
import {
  addDaysKey,
  dateKey,
  formatDayHeading,
  formatMonthYear,
  isoWeek,
  startOfDay,
  startOfWeekKey,
} from "@/lib/format";
import { forstaIManaden, manadsrutnat, perDag, veckans } from "@/lib/kalender";
import type { Role } from "@/lib/domain";
import type { SessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Kalender" };

/**
 * Kalendern: månad, vald dag och vecka.
 *
 * Månadsvyn är huvudvyn – ett tryck på Kalender landar här. Vyn och den
 * valda dagen ligger i adressen, som flikarna gör överallt annars i
 * appen, så att sidan förblir en serverkomponent och bakåtknappen
 * fungerar.
 */
export default async function KalenderPage({
  searchParams,
}: PageProps<"/kalender">) {
  const record = await currentUserRecord();
  const user: SessionUser = {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role as Role,
    regionId: record.regionId,
  };
  const unread = await unreadNotificationCount(user.id);

  const params = await searchParams;
  const idag = dateKey(new Date());
  const vald = giltigNyckel(params.dag) ?? idag;
  const vy = params.vy === "vecka" ? "vecka" : "manad";

  // Hämtas för hela det som ritas: månadsrutnätet spänner över hela
  // veckor, så dagar strax före och efter månaden är också synliga.
  const dagar = vy === "vecka" ? veckans(vald) : manadsrutnat(vald).map((r) => r.nyckel);
  const handelser = await kalenderhandelser(
    user,
    startOfDay(dagar[0]),
    startOfDay(addDaysKey(dagar[dagar.length - 1], 1)),
  );

  const href = (dag: string, nyVy = vy) =>
    `/kalender?dag=${dag}&vy=${nyVy}`;

  // Månadspilarna går till den första i grannmånaden; veckopilarna ett
  // steg i taget. Ligger dagens datum i den nya månaden väljs den, så att
  // ett tryck fram och tillbaka landar där man började.
  const forra =
    vy === "vecka"
      ? addDaysKey(vald, -7)
      : narmastIManaden(addDaysKey(forstaIManaden(vald), -1), idag);
  const nasta =
    vy === "vecka"
      ? addDaysKey(vald, 7)
      : narmastIManaden(
          addDaysKey(sistaIManaden(vald), 1),
          idag,
        );

  const dagensHandelser = perDag(handelser, dagar).get(vald) ?? [];

  return (
    <AppShell title="Kalender" unread={unread} role={user.role}>
      <div className="mb-3 flex items-center justify-between">
        <Link
          href={href(forra)}
          aria-label={vy === "vecka" ? "Föregående vecka" : "Föregående månad"}
          className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-2"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        {/* Sidhuvudet bär sidans h1; det här är rubriken över rutnätet. */}
        <h2 className="text-[17px] font-semibold">
          {vy === "vecka"
            ? `Vecka ${isoWeek(vald)} · ${veckospann(vald)}`
            : formatMonthYear(vald)}
        </h2>
        <Link
          href={href(nasta)}
          aria-label={vy === "vecka" ? "Nästa vecka" : "Nästa månad"}
          className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-2"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </Link>
      </div>

      <Tabs
        tabs={[
          { value: "manad", label: "Månad" },
          { value: "vecka", label: "Vecka" },
        ]}
        active={vy}
        hrefFor={(value) => href(vald, value as "manad" | "vecka")}
      />

      {vy === "manad" ? (
        <>
          <Manadsrutnat
            manad={vald}
            vald={vald}
            idag={idag}
            handelser={handelser}
            href={(dag) => href(dag)}
          />
          <Prickforklaring />

          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="section-label">{formatDayHeading(vald)}</h2>
            {dagensHandelser.length > 0 ? (
              <span className="text-xs text-fg-dim">
                {dagensHandelser.length}{" "}
                {dagensHandelser.length === 1 ? "post" : "poster"}
              </span>
            ) : null}
          </div>

          {dagensHandelser.length === 0 ? (
            <EmptyState
              icon={<CalendarIcon className="h-7 w-7" />}
              title="Inget inplanerat"
              description="Varken uppdrag eller träning ligger på den här dagen."
            />
          ) : (
            <Dagslista handelser={dagensHandelser} />
          )}
        </>
      ) : (
        <>
          <Veckorutnat
            dag={vald}
            handelser={handelser}
            idag={idag}
            href={(dag) => href(dag, "manad")}
          />
          <Krockar dag={vald} handelser={handelser} />
        </>
      )}

      <Link href="/profil" className="btn btn-secondary mt-4 w-full">
        <CheckCircleIcon className="h-[18px] w-[18px]" />
        Sätt tillgänglighet
      </Link>
    </AppShell>
  );
}

/** "YYYY-MM-DD" ur adressen, eller null för allt annat. */
function giltigNyckel(value: string | string[] | undefined) {
  if (typeof value !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  // Ett datum som inte finns, t.ex. 2026-02-31, ska inte bli 2 mars.
  return dateKey(new Date(`${value}T12:00:00Z`)) === value ? value : null;
}

const sistaIManaden = (nyckel: string) => {
  const rutor = manadsrutnat(nyckel).filter((r) => r.iManaden);
  return rutor[rutor.length - 1].nyckel;
};

/** Dagens datum om det ligger i månaden, annars månadens första. */
function narmastIManaden(nyckel: string, idag: string) {
  return idag.slice(0, 7) === nyckel.slice(0, 7) ? idag : forstaIManaden(nyckel);
}

/**
 * "21–27 sep" – veckans spann i rubriken. Går veckan över ett månadsskifte
 * skrivs båda månaderna ut: "31 aug–6 sep".
 */
function veckospann(nyckel: string) {
  const mandag = startOfWeekKey(nyckel);
  const sondag = addDaysKey(mandag, 6);
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    month: "short",
    timeZone: "Europe/Stockholm",
  });
  const manad = (dag: string) =>
    fmt.format(new Date(`${dag}T12:00:00Z`)).replace(".", "");
  const samma = mandag.slice(0, 7) === sondag.slice(0, 7);
  const start = samma
    ? String(Number(mandag.slice(8)))
    : `${Number(mandag.slice(8))} ${manad(mandag)}`;
  return `${start}–${Number(sondag.slice(8))} ${manad(sondag)}`;
}
