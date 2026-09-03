import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Badge, SectionHeader } from "@/components/ui";
import { Karta, UtanKarta } from "@/components/Karta";
import {
  AvslutaUppdrag,
  NyHandelse,
  Timer,
  Tryckknapp,
} from "@/components/PagaendeUppdrag";
import {
  AlertIcon,
  BoxIcon,
  CheckIcon,
  ClipboardIcon,
  ClockIcon,
  FolderIcon,
  MapPinIcon,
  MessageIcon,
  MinusIcon,
  PhoneIcon,
  PlusIcon,
  ScentIcon,
  XIcon,
} from "@/components/icons";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamScope } from "@/lib/authz";
import {
  durationMinutes,
  formatDuration,
  formatTime,
  listaFranText,
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
 * kartan och timern vanliga formulär mot server actions: de fungerar även
 * innan sidans JavaScript hunnit fram, och ett tryck är ett tryck.
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
        {SNABBVAL.map(({ kind, label }) =>
          antal(kind) > 0 ? (
            <li key={kind} className="flex justify-between gap-3">
              <span className="text-fg-muted">{label}</span>
              <span className="font-semibold tabular-nums">{antal(kind)}</span>
            </li>
          ) : null,
        )}
        {antal("OTHER") > 0 ? (
          <li className="flex justify-between gap-3">
            <span className="text-fg-muted">Övriga händelser</span>
            <span className="font-semibold tabular-nums">{antal("OTHER")}</span>
          </li>
        ) : null}
      </ul>
    );

  return (
    <AppShell
      title="Pågående uppdrag"
      backHref={`/uppdrag/${mission.id}`}
      unread={unread}
      role={user.role}
    >
      {/* 1. Det föraren behöver se snabbast */}
      <section className="card mb-4 border-brand/25 bg-brand/6 p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <Badge tone="brand">Pågår</Badge>
          <span className="shrink-0 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[11px] font-medium text-fg-muted">
            ID: {mission.reference}
          </span>
        </div>

        <h2 className="text-[20px] font-bold leading-tight">
          {mission.missionType}
        </h2>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-fg-muted">
          <MapPinIcon className="h-4 w-4 shrink-0" />
          {adress || mission.locality}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-line-soft pt-3 text-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              Påbörjat
            </p>
            <p className="mt-0.5 font-semibold">
              {formatTime(assignment.startedAt)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              Tid på plats
            </p>
            <p className="mt-0.5 font-semibold text-brand">
              <Timer startedAt={assignment.startedAt.toISOString()} />
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              Sökinriktning
            </p>
            <p className="mt-0.5">{mission.discipline?.shortLabel ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              Beräknad total tid
            </p>
            <p className="mt-0.5">{beraknad}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              Ekipage
            </p>
            <p className="mt-0.5">
              {team.dog.name} · {team.handler.name}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Var uppdraget är, och var föraren är */}
      <section className="mb-4">
        {harKarta ? (
          <Karta
            lat={mission.latitude as number}
            lng={mission.longitude as number}
            label={mission.missionArea ?? adress}
            className="h-[240px]"
            visaPosition
          />
        ) : (
          <UtanKarta adress={adress || mission.locality} className="h-[240px]" />
        )}
        {mission.missionArea ? (
          <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5">
            <BoxIcon className="h-[18px] w-[18px] shrink-0 text-brand" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {mission.missionArea}
              </p>
              <p className="text-xs text-fg-muted">Uppdragsområde</p>
            </div>
          </div>
        ) : null}
      </section>

      {/* 3. Hur långt söket kommit – förarens egen bedömning */}
      <section className="card mb-4 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="section-label">Genomsökt område</h2>
          <span className="text-[22px] font-bold tabular-nums text-brand">
            {assignment.progressPercent} %
          </span>
        </div>

        <div
          className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-surface-3"
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

        <div className="mt-3 flex gap-2.5">
          <form action={setMissionProgress} className="flex-1">
            {uppdragsfalt}
            <input type="hidden" name="steg" value="-10" />
            <Tryckknapp
              className="btn btn-secondary w-full"
              aria-label="Minska genomsökt område med tio procent"
            >
              <MinusIcon className="h-[18px] w-[18px]" />
              10 %
            </Tryckknapp>
          </form>
          <form action={setMissionProgress} className="flex-1">
            {uppdragsfalt}
            <input type="hidden" name="steg" value="10" />
            <Tryckknapp
              className="btn btn-secondary w-full"
              aria-label="Öka genomsökt område med tio procent"
            >
              <PlusIcon className="h-[18px] w-[18px]" />
              10 %
            </Tryckknapp>
          </form>
        </div>
      </section>

      {/* 4. Snabbregistrering – ett tryck per händelse */}
      <SectionHeader title="Snabbregistrering" />
      <section className="mb-4">
        <div className="grid grid-cols-2 gap-2.5">
          {SNABBVAL.map(({ kind, label }) => (
            <form key={kind} action={registerMissionEvent}>
              {uppdragsfalt}
              <input type="hidden" name="kind" value={kind} />
              <Tryckknapp className="btn btn-secondary w-full justify-between">
                <span className="flex items-center gap-2">
                  {kind === "DEVIATION" ? (
                    <AlertIcon className="h-[18px] w-[18px] text-warn" />
                  ) : kind === "FIND" ? (
                    <ScentIcon className="h-[18px] w-[18px] text-ok" />
                  ) : kind === "MARKING" ? (
                    <CheckIcon className="h-[18px] w-[18px] text-brand" />
                  ) : (
                    <ClipboardIcon className="h-[18px] w-[18px] text-fg-muted" />
                  )}
                  {label}
                </span>
                {antal(kind) > 0 ? (
                  <span className="tabular-nums text-fg-muted">
                    {antal(kind)}
                  </span>
                ) : null}
              </Tryckknapp>
            </form>
          ))}
        </div>

        <div className="mt-2.5">
          <NyHandelse>
            <form action={registerMissionEvent} className="space-y-2.5">
              {uppdragsfalt}
              <div>
                <label className="field-label" htmlFor="kind">
                  Typ
                </label>
                <select id="kind" name="kind" defaultValue="OTHER" className="field">
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
          </NyHandelse>
        </div>
      </section>

      {/* Det som registrerats hittills */}
      {assignment.events.length > 0 ? (
        <section className="mb-4">
          <SectionHeader title={`Registrerat (${assignment.events.length})`} />
          <ul className="card divide-y divide-line-soft">
            {assignment.events.map((event) => (
              <li key={event.id} className="flex items-center gap-3 px-4 py-2.5">
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
        </section>
      ) : null}

      {/* 5. Checklistan */}
      <SectionHeader
        title={`Checklista ${klara}/${missionChecklist.length}`}
      />
      <section className="card mb-4 divide-y divide-line-soft">
        {missionChecklist.map((punkt) => {
          const klar = avbockade.has(punkt);
          return (
            <form key={punkt} action={toggleChecklistItem}>
              {uppdragsfalt}
              <input type="hidden" name="punkt" value={punkt} />
              <Tryckknapp
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
                aria-pressed={klar}
              >
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
              </Tryckknapp>
            </form>
          );
        })}
      </section>

      {/* 6. Kommunikation och dokument */}
      <SectionHeader title="Kommunikation och dokument" />
      <section className="card mb-6 divide-y divide-line-soft">
        {mission.contactPhone ? (
          <>
            <a
              href={`tel:${mission.contactPhone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
            >
              <PhoneIcon className="h-[18px] w-[18px] shrink-0 text-brand" />
              <span className="flex-1 text-sm">Ring kontaktperson</span>
              <span className="text-xs text-fg-muted">
                {mission.contactName ?? mission.contactPhone}
              </span>
            </a>
            <a
              href={`sms:${mission.contactPhone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
            >
              <MessageIcon className="h-[18px] w-[18px] shrink-0 text-brand" />
              <span className="flex-1 text-sm">Skicka meddelande</span>
            </a>
          </>
        ) : null}
        <Link
          href={`/uppdrag/${mission.id}`}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
        >
          <AlertIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
          <span className="flex-1 text-sm">Uppdragsinstruktioner</span>
        </Link>
        <Link
          href={`/uppdrag/${mission.id}/detaljer?flik=dokument`}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
        >
          <FolderIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
          <span className="flex-1 text-sm">Dokument</span>
        </Link>
        <Link
          href={`/uppdrag/${mission.id}/detaljer`}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
        >
          <ClockIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
          <span className="flex-1 text-sm">Uppdragsinformation</span>
        </Link>
      </section>

      {/* 7. Avsluta */}
      <AvslutaUppdrag sammanstallning={sammanstallning}>
        <form action={endMission} className="flex-1">
          {uppdragsfalt}
          <Tryckknapp className="btn btn-primary w-full">
            Avsluta och rapportera
          </Tryckknapp>
        </form>
      </AvslutaUppdrag>
    </AppShell>
  );
}
