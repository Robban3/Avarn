"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createMission,
  updateMission,
  type MissionFormState,
} from "../actions";

type Option = { id: string; label: string };

/** Värdena som ska stå i rutorna när ett befintligt uppdrag rättas. */
export type MissionDefaults = {
  date: string;
  startTime: string;
  endTime: string;
  regionId: string;
  title?: string;
  missionType?: string;
  disciplineId?: string;
  customerId?: string;
  contactName?: string;
  contactPhone?: string;
  address?: string;
  locality?: string;
  meetingPoint?: string;
  parkingInfo?: string;
  missionArea?: string;
  equipment?: string;
  koordinater?: string;
  motesKoordinater?: string;
  parkeringsKoordinater?: string;
  omradesKoordinater?: string;
  ytaKvm?: string;
  specialInstructions?: string;
};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Sparar …" : label}
    </button>
  );
}

/**
 * Formuläret för att lägga upp ett uppdrag, och för att rätta ett
 * befintligt. Samma fält i båda fallen – skickas `missionId` med går
 * inskickningen till updateMission i stället.
 */
export function MissionForm({
  regions,
  customers,
  disciplines,
  missionTypes,
  defaults,
  missionId,
}: {
  regions: Option[];
  customers: Option[];
  disciplines: Option[];
  missionTypes: string[];
  defaults: MissionDefaults;
  missionId?: string;
}) {
  const [state, action] = useActionState<MissionFormState, FormData>(
    missionId ? updateMission : createMission,
    {},
  );

  return (
    <form action={action} className="space-y-5">
      {missionId ? (
        <input type="hidden" name="missionId" value={missionId} />
      ) : null}

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
            defaultValue={defaults.title}
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
            defaultValue={defaults.missionType ?? missionTypes[0]}
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
          <select
            id="disciplineId"
            name="disciplineId"
            defaultValue={defaults.disciplineId ?? ""}
            className="field"
          >
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
            defaultValue={defaults.address}
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
            defaultValue={defaults.locality}
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
          <select
            id="customerId"
            name="customerId"
            defaultValue={defaults.customerId ?? ""}
            className="field"
          >
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
            <input
              id="contactName"
              name="contactName"
              defaultValue={defaults.contactName}
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="contactPhone">
              Telefon
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              defaultValue={defaults.contactPhone}
              className="field"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="card space-y-3.5 p-4">
        <legend className="section-label px-1">På plats</legend>

        <div>
          <label className="field-label" htmlFor="meetingPoint">
            Mötesplats
          </label>
          <input
            id="meetingPoint"
            name="meetingPoint"
            defaultValue={defaults.meetingPoint}
            placeholder="t.ex. P5, Personalentré"
            className="field"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="parkingInfo">
            Parkering
          </label>
          <input
            id="parkingInfo"
            name="parkingInfo"
            defaultValue={defaults.parkingInfo}
            placeholder="t.ex. Parkering P5, passerkort krävs vid bom"
            className="field"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="missionArea">
            Uppdragsområde
          </label>
          <input
            id="missionArea"
            name="missionArea"
            defaultValue={defaults.missionArea}
            placeholder="t.ex. Terminal 5, Bagagehall"
            className="field"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="koordinater">
            Koordinater
          </label>
          <input
            id="koordinater"
            name="koordinater"
            defaultValue={defaults.koordinater}
            placeholder="59.6498, 17.9239"
            className="field"
          />
          <p className="mt-1.5 text-xs text-fg-dim">
            Kopieras från en karttjänst. Lämnas fältet tomt visas adressen
            utan karta.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="motesKoordinater">
              Mötesplatsens koordinater
            </label>
            <input
              id="motesKoordinater"
              name="motesKoordinater"
              defaultValue={defaults.motesKoordinater}
              placeholder="59.6501, 17.9250"
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="parkeringsKoordinater">
              Parkeringens koordinater
            </label>
            <input
              id="parkeringsKoordinater"
              name="parkeringsKoordinater"
              defaultValue={defaults.parkeringsKoordinater}
              placeholder="59.6510, 17.9210"
              className="field"
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="ytaKvm">
            Yta (ca)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="ytaKvm"
              name="ytaKvm"
              type="number"
              min={0}
              max={10000000}
              inputMode="numeric"
              defaultValue={defaults.ytaKvm}
              placeholder="25000"
              className="field"
            />
            <span className="shrink-0 text-sm text-fg-muted">m²</span>
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="omradesKoordinater">
            Uppdragsområdets hörn
          </label>
          <textarea
            id="omradesKoordinater"
            name="omradesKoordinater"
            rows={4}
            defaultValue={defaults.omradesKoordinater}
            placeholder={"59.6510, 17.9200\n59.6512, 17.9280\n59.6480, 17.9275"}
            className="field resize-y font-mono text-[12px]"
          />
          <p className="mt-1.5 text-xs text-fg-dim">
            En koordinat per rad, minst tre. Ritas som en yta på kartan.
            Lämnas det tomt men ytan är ifylld ritas en cirkel av rätt
            storlek i stället, märkt som ungefärlig.
          </p>
        </div>

        <div>
          <label className="field-label" htmlFor="equipment">
            Utrustning och krav
          </label>
          <textarea
            id="equipment"
            name="equipment"
            rows={4}
            defaultValue={defaults.equipment}
            placeholder={"Väst\nID-kort\nFicklampa\nVäderkläder"}
            className="field resize-y"
          />
          <p className="mt-1.5 text-xs text-fg-dim">En rad per post.</p>
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
            defaultValue={defaults.specialInstructions}
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

      <Submit label={missionId ? "Spara ändringarna" : "Lägg upp uppdraget"} />
      {missionId ? null : (
        <p className="pb-2 text-center text-xs text-fg-dim">
          Ekipage tilldelas i nästa steg, med förslag utifrån kompetens,
          tillgänglighet och region.
        </p>
      )}
    </form>
  );
}
