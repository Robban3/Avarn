"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { PlusIcon, XIcon } from "@/components/icons";
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
  findings: string;
  deviations: string;
  actions: string;
  indications: IndicationInitial[];
};

/**
 * Rapporten fylls i direkt efter avslutat uppdrag, ofta i bil eller på
 * plats. Därför få fält, tydliga rubriker och markeringar som läggs till
 * en i taget i stället för ett stort formulär. Samma formulär används för
 * ny rapport och för att rätta en befintlig – skillnaden är vilken action
 * som tar emot det och om `initial` är satt.
 */
export function ReportForm({
  action,
  initial,
  mission,
  teams,
  defaults,
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
  };
  teams: { id: string; label: string }[];
  defaults: { startedAt: string; endedAt: string };
}) {
  const [state, formAction] = useActionState<ReportFormState, FormData>(
    action,
    {},
  );
  // En rättelse öppnas med sina befintliga markeringar, en ny rapport med
  // en tom rad att börja skriva i.
  const [indications, setIndications] = useState<number[]>(() =>
    initial?.indications.length
      ? initial.indications.map((_, i) => i)
      : [0],
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="missionId" value={mission.id} />
      {initial ? (
        <input type="hidden" name="reportId" value={initial.reportId} />
      ) : null}

      <fieldset className="card space-y-3.5 p-4">
        <legend className="section-label px-1">Uppdrag</legend>
        <p className="text-sm font-semibold">{mission.title}</p>
        <p className="-mt-2 text-xs text-fg-muted">
          {mission.reference} · {mission.missionType} · {mission.locality}
        </p>

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
      </fieldset>

      <fieldset className="card space-y-3.5 p-4">
        <legend className="section-label px-1">Genomförande</legend>

        <div>
          <label className="field-label" htmlFor="areasSearched">
            Genomsökta områden
          </label>
          <textarea
            id="areasSearched"
            name="areasSearched"
            rows={3}
            defaultValue={initial?.areasSearched}
            placeholder="t.ex. Terminal 5, bagagehall samt angränsande lastutrymme"
            className="field resize-y"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="findings">
            Fynd
          </label>
          <textarea
            id="findings"
            name="findings"
            rows={3}
            defaultValue={initial?.findings}
            placeholder="Vad hittades? Ange mängd och typ. Skriv “Inga fynd” om söket var utan resultat."
            className="field resize-y"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="deviations">
            Avvikelser
          </label>
          <textarea
            id="deviations"
            name="deviations"
            rows={2}
            defaultValue={initial?.deviations}
            placeholder="t.ex. område som inte kunde genomsökas"
            className="field resize-y"
          />
        </div>

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
      </fieldset>

      <fieldset className="card space-y-3.5 p-4">
        <legend className="section-label px-1">Markeringar</legend>

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
              {indications.length > 1 ? (
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
              ) : null}
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
                  {Object.entries(INDICATION_OUTCOME_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
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

        <button
          type="button"
          onClick={() =>
            setIndications((prev) => [...prev, (prev.at(-1) ?? 0) + 1])
          }
          className="flex items-center gap-2 text-sm font-medium text-brand"
        >
          <PlusIcon className="h-[18px] w-[18px]" />
          Lägg till markering
        </button>
      </fieldset>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-2.5">
        <Submit value="skicka" className="btn-primary flex-1">
          Skicka in rapporten
        </Submit>
        <Submit value="utkast" className="btn-secondary">
          Spara utkast
        </Submit>
      </div>

      <p className="pb-2 text-center text-xs text-fg-dim">
        Bilder läggs till när rapporten är sparad.
      </p>
    </form>
  );
}
