"use client";

import type { ReactNode } from "react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { XIcon } from "@/components/icons";
import { JaNej, Stegare } from "@/components/FormControls";
import { type ReportFormState } from "../actions";
import { INDICATION_OUTCOME_LABELS } from "@/lib/domain";

function Submit({
  value,
  className,
  children,
}: {
  value: string;
  className: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="submit"
      value={value}
      disabled={pending}
      className={`btn ${className}`}
    >
      {pending ? "Sparar …" : children}
    </button>
  );
}

/** Numrerat avsnitt, som i underlaget. */
function Avsnitt({
  nummer,
  rubrik,
  children,
}: {
  nummer: number;
  rubrik: string;
  children: ReactNode;
}) {
  return (
    // aria-label i stället för en legend: rubriken står redan synligt
    // nedanför, och två kopior av samma text förvirrar en skärmläsare.
    <fieldset className="card overflow-hidden" aria-label={rubrik}>
      <p className="border-b border-line-soft px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-fg-dim">
        {nummer}. {rubrik}
      </p>
      <div className="space-y-3.5 p-4">{children}</div>
    </fieldset>
  );
}

/** Skrivskyddad rad: förifyllt från uppdraget, inget att ändra. */
function Uppgift({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-sm text-fg-muted">{label}</span>
      <span className="min-w-0 text-right text-sm text-fg">{value}</span>
    </div>
  );
}

/** En markering som redan finns i rapporten. */
export type IndicationInitial = {
  location: string;
  description: string;
  outcome: string;
  handedOverTo: string;
};

/** Värdena i en befintlig rapport, när formuläret används för redigering. */
export type ReportInitial = {
  reportId: string;
  teamId: string;
  startedAt: string;
  endedAt: string;
  areasSearched: string;
  areaSize: string;
  findings: string;
  deviations: string;
  actions: string;
  comment: string;
  indications: IndicationInitial[];
};

/**
 * Rapporten fylls i direkt efter avslutat uppdrag, ofta i bil eller på
 * plats. Därför sex numrerade avsnitt i den ordning arbetet faktiskt gick:
 * vad uppdraget var, var man sökte, vad det gav, bilderna, en kommentar och
 * till sist vem som genomförde det.
 *
 * Samma formulär används för ny rapport och för att rätta en befintlig –
 * skillnaden är vilken action som tar emot det och om `initial` är satt.
 */
export function ReportForm({
  action,
  initial,
  mission,
  teams,
  defaults,
  genomfortAv,
  bilder,
}: {
  action: (
    prev: ReportFormState,
    formData: FormData,
  ) => Promise<ReportFormState>;
  initial?: ReportInitial;
  mission: {
    id: string;
    reference: string;
    title: string;
    missionType: string;
    locality: string;
    discipline: string | null;
    customer: string | null;
  };
  teams: { id: string; label: string }[];
  defaults: { startedAt: string; endedAt: string };
  /** Den inloggade föraren – rapporten skrivs alltid i eget namn. */
  genomfortAv: string;
  /** Bildrutan, eller upplysningen om att rapporten måste sparas först. */
  bilder: ReactNode;
}) {
  const [state, formAction] = useActionState<ReportFormState, FormData>(
    action,
    {},
  );
  // En rättelse öppnas med sina befintliga markeringar, en ny rapport med
  // en tom rad att börja skriva i.
  const [indications, setIndications] = useState<number[]>(() =>
    initial?.indications.length ? initial.indications.map((_, i) => i) : [0],
  );

  /**
   * Stegaren styr antalet markeringar. Höjs den läggs en rad till, sänks
   * den tas den sista bort – detaljerna per markering står kvar nedanför,
   * eftersom det är dem rapporten faktiskt är till för.
   */
  const settAntal = (antal: number) =>
    setIndications((prev) =>
      antal > prev.length
        ? [...prev, ...Array.from({ length: antal - prev.length }, (_, i) => (prev.at(-1) ?? -1) + 1 + i)]
        : prev.slice(0, antal),
    );

  return (
    <form id="rapport-form" action={formAction} className="space-y-4">
      <input type="hidden" name="missionId" value={mission.id} />
      {/* Bara vid rättelse. En ny rapport kan komma förifylld av det som
          registrerades under uppdraget, men har ännu inget id. */}
      {initial?.reportId ? (
        <input type="hidden" name="reportId" value={initial.reportId} />
      ) : null}

      {/* 1 */}
      <Avsnitt nummer={1} rubrik="Uppdragsinformation">
        <Uppgift label="Uppdragstyp" value={mission.missionType} />
        <Uppgift label="Sökinriktning" value={mission.discipline ?? "—"} />
        <Uppgift label="Kund" value={mission.customer ?? "—"} />
      </Avsnitt>

      {/* 2 */}
      <Avsnitt nummer={2} rubrik="Genomsökt område">
        <div>
          <label className="field-label" htmlFor="areasSearched">
            Område
          </label>
          <textarea
            id="areasSearched"
            name="areasSearched"
            rows={2}
            defaultValue={initial?.areasSearched}
            placeholder="t.ex. Terminal 5, bagagehall samt angränsande lastutrymme"
            className="field resize-y"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="areaSize">
            Yta (ca)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="areaSize"
              name="areaSize"
              type="number"
              min={0}
              max={10000000}
              inputMode="numeric"
              defaultValue={initial?.areaSize}
              placeholder="25000"
              className="field"
            />
            <span className="shrink-0 text-sm text-fg-muted">m²</span>
          </div>
        </div>
      </Avsnitt>

      {/* 3 */}
      <Avsnitt nummer={3} rubrik="Resultat">
        <Stegare
          label="Antal markeringar"
          value={indications.length}
          onChange={settAntal}
          max={20}
        />

        <div>
          <label className="field-label" htmlFor="findings">
            Fynd
          </label>
          <textarea
            id="findings"
            name="findings"
            rows={2}
            defaultValue={initial?.findings}
            placeholder="Vad hittades? Ange mängd och typ. Skriv “Inga fynd” om söket var utan resultat."
            className="field resize-y"
          />
        </div>

        <JaNej
          name="deviations"
          fraga="Avvikelser"
          defaultValue={initial?.deviations ?? ""}
          placeholder="t.ex. område som inte kunde genomsökas"
          rows={2}
        />

        <div>
          <label className="field-label" htmlFor="actions">
            Vidtagna åtgärder
          </label>
          <textarea
            id="actions"
            name="actions"
            rows={2}
            defaultValue={initial?.actions}
            placeholder="t.ex. överlämnat till polis på plats, kvittonummer"
            className="field resize-y"
          />
        </div>

        {indications.map((key, index) => {
          // Nyckeln är radens plats i den sparade rapporten, så en rättelse
          // öppnar varje markering med sina egna värden.
          const row = initial?.indications[key];
          return (
            <div
              key={key}
              className="space-y-3 rounded-lg border border-line bg-surface-2 p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-fg-muted">
                  Markering {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setIndications((prev) => prev.filter((k) => k !== key))
                  }
                  className="text-fg-dim transition-colors hover:text-danger"
                  aria-label={`Ta bort markering ${index + 1}`}
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label
                  className="field-label"
                  htmlFor={`indication-${index}-location`}
                >
                  Plats
                </label>
                <input
                  id={`indication-${index}-location`}
                  name={`indication-${index}-location`}
                  defaultValue={row?.location}
                  placeholder="t.ex. Bagageband 3, kolli 18"
                  className="field"
                />
              </div>

              <div>
                <label
                  className="field-label"
                  htmlFor={`indication-${index}-description`}
                >
                  Beskrivning
                </label>
                <input
                  id={`indication-${index}-description`}
                  name={`indication-${index}-description`}
                  defaultValue={row?.description}
                  placeholder="Hundens markering och vad kontrollen visade"
                  className="field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="field-label"
                    htmlFor={`indication-${index}-outcome`}
                  >
                    Utfall
                  </label>
                  <select
                    id={`indication-${index}-outcome`}
                    name={`indication-${index}-outcome`}
                    defaultValue={row?.outcome ?? "FIND"}
                    className="field"
                  >
                    {Object.entries(INDICATION_OUTCOME_LABELS).map(
                      ([v, label]) => (
                        <option key={v} value={v}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label
                    className="field-label"
                    htmlFor={`indication-${index}-handedOverTo`}
                  >
                    Överlämnat till
                  </label>
                  <input
                    id={`indication-${index}-handedOverTo`}
                    name={`indication-${index}-handedOverTo`}
                    defaultValue={row?.handedOverTo}
                    placeholder="t.ex. Polis"
                    className="field"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </Avsnitt>

      {/* 4 */}
      <Avsnitt nummer={4} rubrik="Bilder & filmer">
        {bilder}
      </Avsnitt>

      {/* 5 */}
      <Avsnitt nummer={5} rubrik="Kommentar">
        <label className="sr-only" htmlFor="comment">
          Kommentar
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          defaultValue={initial?.comment}
          placeholder="Hur gick arbetet? Något att ta med till nästa gång?"
          className="field resize-y"
        />
      </Avsnitt>

      {/* 6 */}
      <Avsnitt nummer={6} rubrik="Avslut">
        <Uppgift label="Genomfört av" value={genomfortAv} />

        <div>
          <label className="field-label" htmlFor="teamId">
            Ekipage
          </label>
          <select
            id="teamId"
            name="teamId"
            required
            defaultValue={initial?.teamId}
            className="field"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="startedAt">
              Påbörjat
            </label>
            <input
              id="startedAt"
              name="startedAt"
              type="datetime-local"
              defaultValue={initial?.startedAt ?? defaults.startedAt}
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="endedAt">
              Avslutat
            </label>
            <input
              id="endedAt"
              name="endedAt"
              type="datetime-local"
              defaultValue={initial?.endedAt ?? defaults.endedAt}
              className="field"
            />
          </div>
        </div>
      </Avsnitt>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-2.5 pt-1">
        <Submit value="utkast" className="btn-secondary flex-1">
          Spara utkast
        </Submit>
        <Submit value="skicka" className="btn-primary flex-1">
          Skicka rapport
        </Submit>
      </div>
    </form>
  );
}
