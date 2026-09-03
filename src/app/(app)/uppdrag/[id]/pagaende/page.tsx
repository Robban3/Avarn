import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Avatar, Badge } from "@/components/ui";
import { Karta, UtanKarta, Vagbeskrivning } from "@/components/Karta";
import {
  Atgardskort,
  AvslutaUppdrag,
  Registrerat,
  Snabbregistrering,
  Timer,
  Tryckknapp,
} from "@/components/PagaendeUppdrag";
import {
  AlertIcon,
  CheckIcon,
  ClipboardIcon,
  FlagIcon,
  MinusIcon,
  PawIcon,
  PlusIcon,
  ScentIcon,
  StopwatchIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "@/components/icons";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamScope } from "@/lib/authz";
import {
  durationMinutes,
  formatDayNumber,
  formatDuration,
  formatMonthShort,
  formatNumber,
  formatTime,
  formatTimeRange,
  listaFranText,
  parseKoordinatlista,
} from "@/lib/format";
import { EVENT_LABELS, eventTone } from "@/lib/domain";
import { getSettings } from "@/lib/settings";
import {
  endMission,
  registerMissionEvent,
  removeMissionEvent,
  setMissionProgress,
  toggleChecklistItem,
} from "../../actions";

export const metadata: Metadata = { title: "Pågående uppdrag" };

/** Snabbknapparna, i den ordning de sitter i underlaget. */
const SNABBVAL = [
  { kind: "MARKING", label: "Markering" },
  { kind: "FIND", label: "Fynd" },
  { kind: "DEVIATION", label: "Avvikelse" },
  { kind: "NOTE", label: "Notering" },
] as const;

/**
 * Vyn föraren har uppe medan uppdraget pågår.
 *
 * Den prioriterar det som behövs snabbt: hur länge man hållit på, var man
 * är, hur långt söket kommit – och framför allt att en markering ska gå
 * att registrera med ett tryck utan att lämna sidan. Därför är allt utom
 * kartan, klockan och de utfällbara panelerna vanliga formulär mot server
 * actions: de fungerar även innan sidans JavaScript hunnit fram, och ett
 * tryck är ett tryck.
 */
export default async function OngoingMissionPage({
  params,
}: PageProps<"/uppdrag/[id]/pagaende">) {
  const { id } = await params;
  const user = await requireUser();
  const unread = await unreadNotificationCount(user.id);

  // Bara den egna, påbörjade tilldelningen – samma villkor som alla
  // handlingar i vyn kräver.
  const assignment = await db.missionAssignment.findFirst({
    where: {
      missionId: id,
      status: "ACCEPTED",
      team: { AND: [teamScope(user), { handlerId: user.id }] },
    },
    include: {
      mission: { include: { discipline: true, customer: true } },
      team: { include: { dog: true, handler: true } },
      events: { orderBy: { at: "desc" }, include: { createdBy: true } },
    },
  });

  if (!assignment) notFound();

  // Inte påbörjat, eller redan avslutat: då finns inget pågående uppdrag
  // att visa, och uppdragssidan är rätt plats.
  if (!assignment.startedAt || assignment.endedAt) {
    redirect(`/uppdrag/${id}`);
  }

  const { mission, team } = assignment;
  const { missionChecklist } = await getSettings();

  const adress = [mission.address, mission.locality].filter(Boolean).join(", ");
  const harKarta = mission.latitude !== null && mission.longitude !== null;
  const beraknad = mission.endAt
    ? formatDuration(durationMinutes(mission.startAt, mission.endAt))
    : "–";

  // Ett trasigt hörn ska inte släcka vyn mitt i ett uppdrag: kartan ritas
  // utan yta i stället, och området går att rätta efteråt.
  let omrade: { lat: number; lng: number }[] = [];
  try {
    omrade = parseKoordinatlista(mission.areaPolygon);
  } catch {
    omrade = [];
  }

  const avbockade = new Set(listaFranText(assignment.checklistDone));
  const klara = missionChecklist.filter((p) => avbockade.has(p)).length;

  const antal = (kind: string) =>
    assignment.events.filter((e) => e.kind === kind).length;

  /** Dolt fält som varje formulär i vyn behöver. */
  const uppdragsfalt = (
    <input type="hidden" name="missionId" value={mission.id} />
  );

  const sammanstallning =
    assignment.events.length === 0 ? (
      <p className="text-sm text-fg-muted">
        Inga händelser registrerade. Rapporten får då fyllas i från minnet.
      </p>
    ) : (
      <ul className="space-y-1 text-sm">
        {[...SNABBVAL, { kind: "OTHER", label: "Övriga händelser" }].map(
          ({ kind, label }) =>
            antal(kind) > 0 ? (
              <li key={kind} className="flex justify-between gap-3">
                <span className="text-fg-muted">{label}</span>
                <span className="font-semibold tabular-nums">
                  {antal(kind)}
                </span>
              </li>
            ) : null,
        )}
      </ul>
    );

  return (
    <AppShell
      title="Pågående uppdrag"
      subtitle={
        <span className="inline-flex items-center gap-1.5">
          Uppdrag pågår
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ok" />
        </span>
      }
      backHref={`/uppdrag/${mission.id}`}
      unread={unread}
      role={user.role}
    >
      {/* 1. Vilket uppdrag, när och vilket nummer */}
      <section className="card mb-3 flex items-start gap-3 p-4">
        <div className="flex w-12 shrink-0 flex-col items-center rounded-lg border border-line bg-surface-2 py-2 leading-none">
          <span className="text-[20px] font-bold">
            {formatDayNumber(mission.startAt)}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
            {formatMonthShort(mission.startAt)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[17px] font-semibold leading-tight">
            {mission.missionType}
          </h2>
          <p className="mt-0.5 truncate text-sm text-fg-muted">
            {mission.locality}
          </p>
          <p className="truncate text-sm text-fg-muted">
            {formatTimeRange(mission.startAt, mission.endAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge tone="danger">Pågående</Badge>
          <span className="text-[11px] text-fg-dim">ID: {mission.reference}</span>
        </div>
      </section>

      {/* 2. Uppdragstiden, och vägen ut ur uppdraget */}
      <section className="card mb-3 flex items-center gap-3 p-4">
        <StopwatchIcon className="h-10 w-10 shrink-0 text-brand" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
            Uppdragstid
          </p>
          <Timer
            startedAt={assignment.startedAt.toISOString()}
            className="text-[26px] font-bold leading-tight"
          />
          <p className="text-xs text-fg-muted">
            Påbörjat {formatTime(assignment.startedAt)}
          </p>
        </div>
        <div className="shrink-0">
          <AvslutaUppdrag sammanstallning={sammanstallning}>
            <form action={endMission} className="flex-1">
              {uppdragsfalt}
              <Tryckknapp className="btn btn-primary w-full">
                Avsluta och rapportera
              </Tryckknapp>
            </form>
          </AvslutaUppdrag>
        </div>
      </section>

      {/* 3. Vem och vad, på en rad */}
      <section className="card mb-3 grid grid-cols-2 divide-x divide-y divide-line-soft min-[420px]:grid-cols-4 min-[420px]:divide-y-0">
        <Fakta
          ikon={<PawIcon className="h-[18px] w-[18px]" />}
          etikett="Sökinriktning"
          varde={mission.discipline?.shortLabel ?? "—"}
        />
        <Fakta
          ikon={<Avatar name={team.dog.name} photoUrl={team.dog.photoUrl} size={22} />}
          etikett="Hund"
          varde={team.dog.name}
        />
        <Fakta
          ikon={<UserIcon className="h-[18px] w-[18px]" />}
          etikett="Förare"
          varde={team.handler.name}
        />
        <Fakta
          ikon={<UsersIcon className="h-[18px] w-[18px]" />}
          etikett="Kund"
          varde={mission.customer?.name ?? "—"}
        />
      </section>

      {/* 4. Kartan med uppdragsområdet */}
      <section className="card mb-3 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <h2 className="section-label">Karta och uppdragsområde</h2>
          <Link
            href={`/uppdrag/${mission.id}/detaljer?flik=plats`}
            className="shrink-0 text-xs font-medium text-brand"
          >
            Visa större karta
          </Link>
        </div>

        <div className="relative px-4">
          {harKarta ? (
            <Karta
              lat={mission.latitude as number}
              lng={mission.longitude as number}
              label={mission.missionArea ?? adress}
              className="h-[260px]"
              visaPosition
              omrade={omrade}
              ytaKvm={mission.areaSizeSqm}
              motesplats={
                mission.meetingLat !== null && mission.meetingLng !== null
                  ? { lat: mission.meetingLat, lng: mission.meetingLng }
                  : null
              }
              parkering={
                mission.parkingLat !== null && mission.parkingLng !== null
                  ? { lat: mission.parkingLat, lng: mission.parkingLng }
                  : null
              }
            />
          ) : (
            <UtanKarta adress={adress || mission.locality} className="h-[260px]" />
          )}

          <Vagbeskrivning
            lat={mission.meetingLat ?? mission.latitude}
            lng={mission.meetingLng ?? mission.longitude}
            adress={adress || mission.locality}
            className="absolute right-7 top-[68px] z-[400] flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-bg-deep/85 text-fg backdrop-blur transition-colors hover:text-brand"
          />
        </div>

        <div className="mt-3 grid grid-cols-3 divide-x divide-line-soft border-t border-line-soft">
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              Genomsökt
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 whitespace-nowrap">
              <form action={setMissionProgress}>
                {uppdragsfalt}
                <input type="hidden" name="steg" value="-10" />
                <Tryckknapp
                  className="flex h-5 w-5 items-center justify-center rounded border border-line bg-surface-2 text-fg transition-colors hover:bg-surface-3"
                  aria-label="Minska genomsökt område med tio procent"
                >
                  <MinusIcon className="h-3 w-3" />
                </Tryckknapp>
              </form>
              <span className="text-[15px] font-bold tabular-nums text-brand">
                {assignment.progressPercent} %
              </span>
              <form action={setMissionProgress}>
                {uppdragsfalt}
                <input type="hidden" name="steg" value="10" />
                <Tryckknapp
                  className="flex h-5 w-5 items-center justify-center rounded border border-line bg-surface-2 text-fg transition-colors hover:bg-surface-3"
                  aria-label="Öka genomsökt område med tio procent"
                >
                  <PlusIcon className="h-3 w-3" />
                </Tryckknapp>
              </form>
            </div>
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-3"
              role="progressbar"
              aria-valuenow={assignment.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Genomsökt område"
            >
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${assignment.progressPercent}%` }}
              />
            </div>
          </div>

          <Nyckeltal
            etikett="Yta (ca)"
            varde={
              mission.areaSizeSqm
                ? `${formatNumber(mission.areaSizeSqm, 0)} m²`
                : "—"
            }
          />
          <Nyckeltal etikett="Beräknad tid" varde={beraknad} />
        </div>
      </section>

      {/* 5. Snabbregistrering – ett tryck per händelse */}
      <section className="card mb-3 p-4">
        <h2 className="section-label mb-2.5">Snabbregistrering</h2>

        <Snabbregistrering
          knappar={SNABBVAL.map(({ kind, label }) => (
            <form key={kind} action={registerMissionEvent}>
              {uppdragsfalt}
              <input type="hidden" name="kind" value={kind} />
              <Tryckknapp
                className="flex w-full flex-col items-center gap-1 rounded-lg border border-line bg-surface-2 px-1 py-2.5 transition-colors hover:border-brand/40"
                aria-label={`Registrera ${label.toLowerCase()}`}
              >
                <span className={ikonfarg(kind)}>{ikon(kind)}</span>
                <span className="text-[15px] font-bold tabular-nums leading-none">
                  {antal(kind)}
                </span>
                <span className="text-[9px] leading-tight text-fg-muted">
                  {label}
                </span>
              </Tryckknapp>
            </form>
          ))}
        >
          <form action={registerMissionEvent} className="space-y-2.5">
              {uppdragsfalt}
              <div>
                <label className="field-label" htmlFor="kind">
                  Typ
                </label>
                <select
                  id="kind"
                  name="kind"
                  defaultValue="OTHER"
                  className="field"
                >
                  {Object.entries(EVENT_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="note">
                  Vad hände?
                </label>
                <textarea
                  id="note"
                  name="note"
                  rows={2}
                  placeholder="t.ex. hunden markerade vid bagageband 7"
                  className="field resize-y"
                />
              </div>
            <Tryckknapp className="btn btn-primary w-full">
              Registrera
            </Tryckknapp>
          </form>
        </Snabbregistrering>

        {/* Ett feltryck ska gå att ta bort igen. */}
        <Registrerat antal={assignment.events.length}>
          <ul className="divide-y divide-line-soft rounded-lg border border-line">
            {assignment.events.map((event) => (
              <li key={event.id} className="flex items-center gap-3 px-3 py-2.5">
                <span className="w-[46px] shrink-0 text-[13px] tabular-nums text-fg-muted">
                  {formatTime(event.at)}
                </span>
                <div className="min-w-0 flex-1">
                  <Badge tone={eventTone(event.kind)}>
                    {EVENT_LABELS[event.kind] ?? event.kind}
                  </Badge>
                  {event.note ? (
                    <p className="mt-1 text-sm text-fg-muted">{event.note}</p>
                  ) : null}
                </div>
                <form action={removeMissionEvent} className="shrink-0">
                  {uppdragsfalt}
                  <input type="hidden" name="eventId" value={event.id} />
                  <Tryckknapp
                    className="flex h-8 w-8 items-center justify-center rounded-full text-fg-dim transition-colors hover:text-danger"
                    aria-label={`Ta bort ${EVENT_LABELS[event.kind] ?? "händelsen"} ${formatTime(event.at)}`}
                  >
                    <XIcon className="h-4 w-4" />
                  </Tryckknapp>
                </form>
              </li>
            ))}
          </ul>
        </Registrerat>
      </section>

      {/* 6. Checklistan */}
      <section className="card mb-3 p-4">
        <div className="mb-2.5 flex items-baseline justify-between gap-3">
          <h2 className="section-label">Checklista</h2>
          <span className="text-xs font-medium text-brand">
            {klara} / {missionChecklist.length} klara
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3">
          {missionChecklist.map((punkt) => {
            const klar = avbockade.has(punkt);
            return (
              <form key={punkt} action={toggleChecklistItem}>
                {uppdragsfalt}
                <input type="hidden" name="punkt" value={punkt} />
                <Tryckknapp
                  className="flex w-full items-center gap-2.5 py-2 text-left transition-opacity hover:opacity-80"
                  aria-pressed={klar}
                >
                  <span
                    aria-hidden
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${
                      klar
                        ? "border-brand bg-brand text-[#06201e]"
                        : "border-line bg-surface-2 text-transparent"
                    }`}
                  >
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  <span
                    className={`min-w-0 flex-1 text-[13px] leading-tight ${klar ? "text-fg-muted" : "text-fg"}`}
                  >
                    {punkt}
                  </span>
                </Tryckknapp>
              </form>
            );
          })}
        </div>
      </section>

      {/* 7. Kommunikation, dokument och rapport */}
      <Atgardskort
        telefon={mission.contactPhone}
        namn={mission.contactName}
        dokumentHref={`/uppdrag/${mission.id}/detaljer?flik=dokument`}
        rapportHref={`/rapporter/nytt?uppdrag=${mission.id}`}
      />
    </AppShell>
  );
}

/** En ruta i faktaraden: ikon, etikett och värde. */
function Fakta({
  ikon,
  etikett,
  varde,
}: {
  ikon: React.ReactNode;
  etikett: string;
  varde: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 px-2.5 py-3">
      <span className="shrink-0 text-fg-dim">{ikon}</span>
      <div className="min-w-0">
        <p className="truncate text-[10px] text-fg-dim">{etikett}</p>
        <p className="truncate text-[12px] font-medium">{varde}</p>
      </div>
    </div>
  );
}

/** En cell i raden under kartan. */
function Nyckeltal({ etikett, varde }: { etikett: string; varde: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
        {etikett}
      </p>
      <p className="mt-1.5 text-[15px] font-semibold tabular-nums">{varde}</p>
    </div>
  );
}

/** Ikonen för varje registreringsknapp. */
function ikon(kind: string) {
  const klass = "h-[18px] w-[18px]";
  if (kind === "MARKING") return <FlagIcon className={klass} />;
  if (kind === "FIND") return <ScentIcon className={klass} />;
  if (kind === "DEVIATION") return <AlertIcon className={klass} />;
  return <ClipboardIcon className={klass} />;
}

/** Färgerna skrivs ut i klartext, annars ser Tailwind dem inte. */
function ikonfarg(kind: string) {
  if (kind === "MARKING") return "text-brand";
  if (kind === "FIND") return "text-ok";
  if (kind === "DEVIATION") return "text-warn";
  return "text-fg-muted";
}
