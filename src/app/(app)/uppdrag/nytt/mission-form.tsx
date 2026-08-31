"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createMission, type MissionFormState } from "../actions";

type Option = { id: string; label: string };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Sparar …" : "Lägg upp uppdraget"}
    </button>
  );
}

export function MissionForm({
  regions,
  customers,
  disciplines,
  missionTypes,
  defaults,
}: {
  regions: Option[];
  customers: Option[];
  disciplines: Option[];
  missionTypes: string[];
  defaults: { date: string; startTime: string; endTime: string; regionId: string };
}) {
  const [state, action] = useActionState<MissionFormState, FormData>(
    createMission,
    {},
  );

  return (
    <form action={action} className="space-y-5">
      <fieldset className="card space-y-3.5 p-4">
        <legend className="section-label px-1">Uppdraget</legend>

        <div>
          <label className="field-label" htmlFor="title">
            Rubrik
          </label>
          <input
            id="title"
            name="title"
            required
            placeholder="t.ex. Flygplatskontroll"
            className="field"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="missionType">
            Uppdragstyp
          </label>
          <input
            id="missionType"
            name="missionType"
            required
            list="missionTypes"
            defaultValue={missionTypes[0]}
            className="field"
          />
          <datalist id="missionTypes">
            {missionTypes.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="field-label" htmlFor="disciplineId">
            Sökdisciplin
          </label>
          <select id="disciplineId" name="disciplineId" className="field">
            <option value="">Ej angiven</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="card space-y-3.5 p-4">
        <legend className="section-label px-1">Tid och plats</legend>

        <div>
          <label className="field-label" htmlFor="date">
            Datum
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={defaults.date}
            className="field"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="startTime">
              Starttid
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              required
              defaultValue={defaults.startTime}
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="endTime">
              Sluttid
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              defaultValue={defaults.endTime}
              className="field"
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="address">
            Adress
          </label>
          <input
            id="address"
            name="address"
            placeholder="t.ex. Terminal 5, bagagehall"
            className="field"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="locality">
            Ort
          </label>
          <input
            id="locality"
            name="locality"
            required
            placeholder="t.ex. Arlanda, Stockholm"
            className="field"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="regionId">
            Region
          </label>
          <select
            id="regionId"
            name="regionId"
            required
            defaultValue={defaults.regionId}
            className="field"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="card space-y-3.5 p-4">
        <legend className="section-label px-1">Kund och kontakt</legend>

        <div>
          <label className="field-label" htmlFor="customerId">
            Kund
          </label>
          <select id="customerId" name="customerId" className="field">
            <option value="">Ingen angiven</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="contactName">
              Kontaktperson
            </label>
            <input id="contactName" name="contactName" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="contactPhone">
              Telefon
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              className="field"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="card space-y-3.5 p-4">
        <legend className="section-label px-1">Särskilda instruktioner</legend>
        <div>
          <label className="sr-only" htmlFor="specialInstructions">
            Särskilda instruktioner
          </label>
          <textarea
            id="specialInstructions"
            name="specialInstructions"
            rows={4}
            placeholder="Anmälningsrutin, tillträde, samordning med polis eller kund …"
            className="field resize-y"
          />
        </div>
      </fieldset>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <Submit />
      <p className="pb-2 text-center text-xs text-fg-dim">
        Ekipage tilldelas i nästa steg, med förslag utifrån kompetens,
        tillgänglighet och region.
      </p>
    </form>
  );
}
