import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Badge,
  DetailList,
  DetailRow,
  EmptyState,
  SectionHeader,
  Tabs,
} from "@/components/ui";
import { Karta, UtanKarta } from "@/components/Karta";
import {
  BoxIcon,
  CarIcon,
  ClipboardIcon,
  ClockIcon,
  FolderIcon,
  CheckCircleIcon,
  MapPinIcon,
  MessageIcon,
  RouteIcon,
  ScentIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { audit } from "@/lib/audit";
import {
  durationMinutes,
  formatDayNumber,
  formatDuration,
  formatMonthShort,
  formatTimeRange,
  listaFranText,
} from "@/lib/format";
import { MISSION_STATUS_LABELS, missionTone } from "@/lib/domain";
import { missionForUser } from "@/lib/queries";
import { startMission } from "../../actions";

export const metadata: Metadata = { title: "Uppdrag – detaljer" };

const FLIKAR = [
  { value: "oversikt", label: "Översikt" },
  { value: "plats", label: "Plats" },
  { value: "checklista", label: "Checklista" },
  { value: "dokument", label: "Dokument" },
];

/**
 * Den operativa vyn: var uppdraget ligger, hur man tar sig dit och vad som
 * gäller på plats. Skild från uppdragssidan, som är till för att förbereda
 * sig – här är föraren redan på väg.
 */
export default async function MissionDetailsPage({
  params,
  searchParams,
}: PageProps<"/uppdrag/[id]/detaljer">) {
  const { id } = await params;
  const query = await searchParams;
  const user = await requireUser();
  const unread = await unreadNotificationCount(user.id);

  // Exakt samma avgränsning som uppdragssidan – en ny route får aldrig bli
  // en genväg förbi behörigheten.
  const mission = await missionForUser(user, id);
  if (!mission) notFound();

  await audit({
    userId: user.id,
    action: "READ",
    entityType: "Mission",
    entityId: mission.id,
    detail: "Platsvy",
  });

  const flik = typeof query.flik === "string" ? query.flik : "oversikt";
  const hrefFor = (value: string) =>
    value === "oversikt"
      ? `/uppdrag/${mission.id}/detaljer`
      : `/uppdrag/${mission.id}/detaljer?flik=${value}`;

  const adress = [mission.address, mission.locality].filter(Boolean).join(", ");
  const utrustning = listaFranText(mission.equipment);
  const harKarta = mission.latitude !== null && mission.longitude !== null;
  const kartlank = harKarta
    ? `https://www.google.com/maps/search/?api=1&query=${mission.latitude},${mission.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adress)}`;

  const varaktighet = mission.endAt
    ? formatDuration(durationMinutes(mission.startAt, mission.endAt))
    : "–";

  // Föraren får starta sitt eget uppdrag. Ledningen har egna knappar på
  // uppdragssidan; här handlar det om den som faktiskt är på plats.
  const egenTilldelning = mission.assignments.find(
    (a) => a.team.handlerId === user.id && a.status === "ACCEPTED",
  );
  const kanStarta =
    egenTilldelning !== undefined &&
    ["PLANNED", "ASSIGNED"].includes(mission.status);

  const datumkort = (
    <section className="card mb-4 flex items-center gap-3 p-4">
      <div className="flex shrink-0 flex-col items-center leading-none">
        <span className="text-[22px] font-bold">
          {formatDayNumber(mission.startAt)}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
          {formatMonthShort(mission.startAt)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-fg-muted">
          {formatTimeRange(mission.startAt, mission.endAt)}
        </p>
        <p className="truncate text-[15px] font-semibold">{mission.title}</p>
        <p className="truncate text-xs text-fg-muted">{mission.locality}</p>
      </div>
      <Badge tone={missionTone(mission.status)}>
        {MISSION_STATUS_LABELS[mission.status] ?? mission.status}
      </Badge>
    </section>
  );

  const kartrutan = (hojd: string) =>
    harKarta ? (
      <Karta
        lat={mission.latitude as number}
        lng={mission.longitude as number}
        label={mission.meetingPoint ?? adress}
        className={hojd}
      />
    ) : (
      <UtanKarta adress={adress || mission.locality} className={hojd} />
    );

  const oppnaIKarta = (
    <a
      href={kartlank}
      target="_blank"
      rel="noreferrer"
      className="btn btn-secondary w-full"
    >
      <MapPinIcon className="h-[18px] w-[18px] text-brand" />
      Öppna i karta
    </a>
  );

  const startaKnapp = kanStarta ? (
    <form action={startMission} className="mt-4">
      <input type="hidden" name="missionId" value={mission.id} />
      <button type="submit" className="btn btn-primary w-full">
        <CheckCircleIcon className="h-[18px] w-[18px]" />
        Starta uppdrag
      </button>
      <p className="mt-2 text-center text-xs text-fg-dim">
        Tryck när du är på plats. Tiden följer med till rapporten.
      </p>
    </form>
  ) : null;

  return (
    <AppShell
      title="Uppdrag – detaljer"
      backHref={`/uppdrag/${mission.id}`}
      unread={unread}
      role={user.role}
    >
      <Tabs tabs={FLIKAR} active={flik} hrefFor={hrefFor} />

      {flik === "oversikt" ? (
        <>
          {datumkort}

          <div className="mb-4">
            {kartrutan("h-[260px]")}
            {mission.meetingPoint ? (
              <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5">
                <RouteIcon className="h-[18px] w-[18px] shrink-0 text-brand" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {mission.meetingPoint}
                  </p>
                  <p className="text-xs text-fg-muted">Mötesplats</p>
                </div>
              </div>
            ) : null}
          </div>

          <SectionHeader title="Uppdragsinformation" />
          <DetailList className="mb-4">
            <DetailRow
              icon={<ClipboardIcon className="h-[18px] w-[18px]" />}
              label="UppdragsID"
            >
              {mission.reference}
            </DetailRow>
            {mission.customer ? (
              <DetailRow
                icon={<UsersIcon className="h-[18px] w-[18px]" />}
                label="Uppdragsgivare"
              >
                {mission.customer.name}
              </DetailRow>
            ) : null}
            {mission.contactName ? (
              <DetailRow
                icon={<UserIcon className="h-[18px] w-[18px]" />}
                label="Kontaktperson"
              >
                <span className="block">{mission.contactName}</span>
                {mission.contactPhone ? (
                  <span className="block text-xs text-fg-muted">
                    {mission.contactPhone}
                  </span>
                ) : null}
              </DetailRow>
            ) : null}
            <DetailRow
              icon={<BoxIcon className="h-[18px] w-[18px]" />}
              label="Uppdragstyp"
            >
              {mission.missionType}
            </DetailRow>
            {mission.discipline ? (
              <DetailRow
                icon={<ScentIcon className="h-[18px] w-[18px]" />}
                label="Sökinriktning"
              >
                {mission.discipline.shortLabel}
              </DetailRow>
            ) : null}
            <DetailRow
              icon={<ClockIcon className="h-[18px] w-[18px]" />}
              label="Beräknad varaktighet"
            >
              {varaktighet}
            </DetailRow>
          </DetailList>

          {mission.contactPhone ? (
            <a
              href={`sms:${mission.contactPhone.replace(/\s/g, "")}`}
              className="btn btn-secondary w-full"
            >
              <MessageIcon className="h-[18px] w-[18px] text-brand" />
              Kontakta uppdragsgivare
            </a>
          ) : null}

          {startaKnapp}
        </>
      ) : null}

      {flik === "plats" ? (
        <>
          <div className="mb-4">{kartrutan("h-[300px]")}</div>

          <DetailList className="mb-4">
            <DetailRow
              icon={<MapPinIcon className="h-[18px] w-[18px]" />}
              label="Adress"
              align="column"
            >
              {adress || mission.locality}
            </DetailRow>
            {mission.meetingPoint ? (
              <DetailRow
                icon={<RouteIcon className="h-[18px] w-[18px]" />}
                label="Mötesplats"
                align="column"
              >
                {mission.meetingPoint}
              </DetailRow>
            ) : null}
            {mission.parkingInfo ? (
              <DetailRow
                icon={<CarIcon className="h-[18px] w-[18px]" />}
                label="Parkering"
                align="column"
              >
                {mission.parkingInfo}
              </DetailRow>
            ) : null}
            {mission.missionArea ? (
              <DetailRow
                icon={<BoxIcon className="h-[18px] w-[18px]" />}
                label="Uppdragsområde"
                align="column"
              >
                {mission.missionArea}
              </DetailRow>
            ) : null}
            {utrustning.length > 0 ? (
              <DetailRow
                icon={<ShieldIcon className="h-[18px] w-[18px]" />}
                label="Utrustning / krav"
                align="column"
              >
                <span className="flex flex-wrap gap-1.5 pt-0.5">
                  {utrustning.map((krav) => (
                    <span key={krav} className="chip">
                      {krav}
                    </span>
                  ))}
                </span>
              </DetailRow>
            ) : null}
          </DetailList>

          {oppnaIKarta}
          {startaKnapp}
        </>
      ) : null}

      {flik === "checklista" ? (
        <EmptyState
          icon={<CheckCircleIcon className="h-7 w-7" />}
          title="Ingen checklista"
          description="Det här uppdraget har ingen checklista upplagd. Särskilda instruktioner och krav finns på uppdragssidan."
          action={
            <Link
              href={`/uppdrag/${mission.id}`}
              className="btn btn-secondary"
            >
              Till uppdraget
            </Link>
          }
        />
      ) : null}

      {flik === "dokument" ? (
        <EmptyState
          icon={<FolderIcon className="h-7 w-7" />}
          title="Inga dokument"
          description="Inga dokument är kopplade till uppdraget. Bilder och filmer från genomförandet läggs i den operativa rapporten."
        />
      ) : null}
    </AppShell>
  );
}
