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
  CertificateIcon,
  ClipboardIcon,
  ClockIcon,
  FileIcon,
  FolderIcon,
  ImageIcon,
  MovieIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronRightIcon,
  MapPinIcon,
  MessageIcon,
  RouteIcon,
  ScentIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import {
  LaggTillBilaga,
  OfflineMarkering,
  TaBortDokument,
} from "@/components/Dokument";
import { CERT_ICON_CLASSES } from "@/components/cert-styles";
import { Offlinestatus } from "@/components/Offline";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { can } from "@/lib/authz";
import { db } from "@/lib/db";
import {
  CERT_STATUS_LABELS,
  CERT_STATUS_TONES,
  certStatus,
  certValidityText,
} from "@/lib/certifications";
import { audit } from "@/lib/audit";
import {
  durationMinutes,
  formatDayNumber,
  formatDuration,
  formatMonthShort,
  formatShortDate,
  formatTime,
  formatTimeRange,
  listaFranText,
} from "@/lib/format";
import { MISSION_STATUS_LABELS, missionTone } from "@/lib/domain";
import { getSettings } from "@/lib/settings";
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

  // Dokumenten och behörigheterna hämtas först när fliken visas – de
  // andra flikarna ska inte betala för två frågor de aldrig använder.
  const flik = typeof query.flik === "string" ? query.flik : "oversikt";
  const kanLaggaUppUnderlag = can(user, "mission:create");
  const [dokument, behorigheter] =
    flik === "dokument"
      ? await Promise.all([
          db.mediaAsset.findMany({
            where: { missionId: mission.id },
            include: { uploadedBy: { select: { name: true } } },
            orderBy: { createdAt: "asc" },
          }),
          // Behörigheterna uppdraget kräver, hämtade ur certifikatmodulen
          // för de ekipage som faktiskt är tilldelade.
          db.certification.findMany({
            where: {
              OR: [
                { teamId: { in: mission.assignments.map((a) => a.teamId) } },
                {
                  dogId: {
                    in: mission.assignments.map((a) => a.team.dogId),
                  },
                },
                {
                  userId: {
                    in: mission.assignments.map((a) => a.team.handlerId),
                  },
                },
              ],
            },
            include: { type: true },
            orderBy: { expiresAt: "asc" },
          }),
        ])
      : [[], []];

  const underlag = dokument.filter((d) => d.missionSource !== "ATTACHMENT");
  const bilagor = dokument.filter((d) => d.missionSource === "ATTACHMENT");
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
    !egenTilldelning.startedAt &&
    ["PLANNED", "ASSIGNED"].includes(mission.status);

  // Checklistan är gemensam för uppdraget och bockas av i den operativa
  // vyn; här visas bara hur långt ekipaget kommit.
  const { missionChecklist: checklista } = await getSettings();
  const avbockade = new Set(listaFranText(egenTilldelning?.checklistDone));
  const klara = checklista.filter((p) => avbockade.has(p)).length;

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
      {/* Statusraden hör hemma där dokumenten läses, och bara där. */}
      {flik === "dokument" ? <Offlinestatus /> : null}

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
        <section>
          <p className="mb-3 text-sm text-fg-muted">
            {klara} av {checklista.length} punkter avbockade. Punkterna
            bockas av i den operativa vyn medan uppdraget pågår.
          </p>
          <ul className="card divide-y divide-line-soft">
            {checklista.map((punkt) => {
              const klar = avbockade.has(punkt);
              return (
                <li key={punkt} className="flex items-center gap-3 px-4 py-3">
                  <span
                    aria-hidden
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      klar
                        ? "border-brand bg-brand text-[#06201e]"
                        : "border-line bg-surface-2 text-transparent"
                    }`}
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <span
                    className={`flex-1 text-sm ${klar ? "text-fg-muted line-through" : "text-fg"}`}
                  >
                    {punkt}
                  </span>
                </li>
              );
            })}
          </ul>
          {kanStarta ? (
            <p className="mt-3 text-sm text-fg-dim">
              Starta uppdraget under fliken Plats för att börja bocka av.
            </p>
          ) : null}
          {egenTilldelning?.startedAt && !egenTilldelning.endedAt ? (
            <Link
              href={`/uppdrag/${mission.id}/pagaende`}
              className="btn btn-primary mt-4 w-full"
            >
              Öppna pågående uppdrag
            </Link>
          ) : null}
        </section>
      ) : null}

      {flik === "dokument" ? (
        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="section-label">Från uppdragsgivaren</h2>
          </div>
          {underlag.length === 0 ? (
            <p className="mb-4 text-sm text-fg-muted">
              Inget underlag är upplagt på uppdraget ännu.
            </p>
          ) : (
            <div className="card mb-4 divide-y divide-line-soft">
              {underlag.map((dokument) => (
                <Dokumentrad
                  key={dokument.id}
                  dokument={dokument}
                  missionId={mission.id}
                  farTaBort={
                    dokument.uploadedById === user.id || kanLaggaUppUnderlag
                  }
                />
              ))}
            </div>
          )}

          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="section-label">Egna bilagor</h2>
            <LaggTillBilaga missionId={mission.id} />
          </div>
          {bilagor.length === 0 ? (
            <p className="mb-4 text-sm text-fg-muted">
              Foton och filer du lägger till på plats hamnar här.
            </p>
          ) : (
            <div className="card mb-4 divide-y divide-line-soft">
              {bilagor.map((dokument) => (
                <Dokumentrad
                  key={dokument.id}
                  dokument={dokument}
                  missionId={mission.id}
                  farTaBort={
                    dokument.uploadedById === user.id || kanLaggaUppUnderlag
                  }
                />
              ))}
            </div>
          )}

          {behorigheter.length > 0 ? (
            <>
              <SectionHeader title="Behörigheter" />
              <div className="card divide-y divide-line-soft">
                {behorigheter.map((cert) => {
                  const status = certStatus(cert.expiresAt);
                  return (
                    <Link
                      key={cert.id}
                      href="/certifikat"
                      className="flex items-start gap-3 px-3.5 py-3 transition-colors hover:bg-surface-2"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                        <CertificateIcon
                          className={`h-[18px] w-[18px] ${CERT_ICON_CLASSES[status]}`}
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {cert.type.name}
                        </p>
                        <p className="truncate text-xs text-fg-muted">
                          {certValidityText(cert.expiresAt)}
                        </p>
                      </div>
                      <Badge tone={CERT_STATUS_TONES[status]}>
                        {CERT_STATUS_LABELS[status]}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : null}

          {underlag.length === 0 && bilagor.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={<FolderIcon className="h-7 w-7" />}
                title="Inga dokument ännu"
                description={
                  kanLaggaUppUnderlag
                    ? "Lägg upp uppdragsgivarens underlag här, så finns det hos föraren på plats."
                    : "Uppdragsgivarens underlag läggs upp av regionalt ansvarig. Egna bilagor kan du lägga till här."
                }
                action={
                  <LaggTillBilaga
                    missionId={mission.id}
                    variant="knapp"
                    etikett={
                      kanLaggaUppUnderlag ? "Lägg upp underlag" : "Lägg till bilaga"
                    }
                  />
                }
              />
            </div>
          ) : null}
        </section>
      ) : null}
    </AppShell>
  );
}

/** Filstorlek i det format en förare läser i förbifarten. */
function filstorlek(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

const FILIKON = {
  IMAGE: ImageIcon,
  VIDEO: MovieIcon,
  DOCUMENT: FileIcon,
} as const;

/**
 * En rad i dokumentlistan: filikon efter typ, namn, vem som lade upp den
 * och när – och offline-status bara på de filer som faktiskt finns kvar i
 * telefonen.
 */
function Dokumentrad({
  dokument,
  missionId,
  farTaBort,
}: {
  dokument: {
    id: string;
    kind: string;
    originalName: string;
    size: number;
    createdAt: Date;
    uploadedBy: { name: string };
  };
  missionId: string;
  farTaBort: boolean;
}) {
  const Ikon = FILIKON[dokument.kind as keyof typeof FILIKON] ?? FileIcon;
  const url = `/api/media/${dokument.id}`;

  return (
    <div className="flex items-start gap-3 px-3.5 py-3">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 flex-1 items-start gap-3"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-brand">
          <Ikon className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {dokument.originalName}
          </span>
          <span className="mt-0.5 block truncate text-xs text-fg-muted">
            {filstorlek(dokument.size)} · {dokument.uploadedBy.name} ·{" "}
            {formatShortDate(dokument.createdAt)} {formatTime(dokument.createdAt)}
          </span>
          <OfflineMarkering url={url} />
        </span>
      </a>
      {farTaBort ? (
        <TaBortDokument
          missionId={missionId}
          dokumentId={dokument.id}
          namn={dokument.originalName}
        />
      ) : (
        <ChevronRightIcon className="mt-1.5 h-[18px] w-[18px] shrink-0 text-fg-dim" />
      )}
    </div>
  );
}
