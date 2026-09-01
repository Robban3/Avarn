"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { PhotoCircle } from "@/components/ui";
import { PlusIcon } from "@/components/icons";
import { updateDog, uploadDogPhoto, type EditDogState } from "./actions";
import { DOG_STATUS_LABELS } from "@/lib/domain";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Sparar …" : "Spara ändringar"}
    </button>
  );
}

type Dog = {
  id: string;
  name: string;
  breed: string;
  birthDate: string;
  sex: string | null;
  chipNumber: string | null;
  status: string;
  notes: string | null;
  photoUrl: string | null;
  disciplineIds: string[];
  registrationNumber: string;
  insurer: string;
  insuranceValidTo: string;
  weightKg: string;
  heightCm: string;
  color: string;
  hipsElbows: string;
  mentalIndex: string;
  originCountry: string;
  neutered: string;
};

export function EditDogForm({
  dog,
  disciplines,
}: {
  dog: Dog;
  disciplines: { id: string; name: string }[];
}) {
  const [state, action] = useActionState<EditDogState, FormData>(updateDog, {});
  const [selected, setSelected] = useState<string[]>(dog.disciplineIds);
  const photoRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className="space-y-5">
      {/* Fotot laddas upp direkt, separat från övriga uppgifter */}
      <section className="card flex items-center gap-4 p-4">
        <PhotoCircle name={dog.name} photoUrl={dog.photoUrl} size={72} />
        <form
          ref={photoRef}
          action={async (formData) => {
            setUploading(true);
            try {
              await uploadDogPhoto(formData);
            } finally {
              setUploading(false);
              photoRef.current?.reset();
            }
          }}
          className="min-w-0 flex-1"
        >
          <input type="hidden" name="dogId" value={dog.id} />
          <p className="text-sm font-medium">Foto</p>
          <p className="mb-2 text-xs text-fg-muted">
            Visas på hundkortet och startsidan.
          </p>
          <label className="btn btn-secondary cursor-pointer text-xs">
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files?.length) photoRef.current?.requestSubmit();
              }}
            />
            <PlusIcon className="h-4 w-4" />
            {uploading ? "Laddar upp …" : dog.photoUrl ? "Byt foto" : "Lägg till foto"}
          </label>
        </form>
      </section>

      <form action={action} className="space-y-5">
        <input type="hidden" name="dogId" value={dog.id} />
        <input type="hidden" name="disciplineIds" value={selected.join(",")} />

        <fieldset className="card space-y-3.5 p-4">
          <legend className="section-label px-1">Uppgifter</legend>

          <div>
            <label className="field-label" htmlFor="name">
              Namn
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={dog.name}
              className="field"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="breed">
              Ras
            </label>
            <input
              id="breed"
              name="breed"
              required
              defaultValue={dog.breed}
              className="field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="birthDate">
                Födelsedatum
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                required
                defaultValue={dog.birthDate}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="sex">
                Kön
              </label>
              <select
                id="sex"
                name="sex"
                defaultValue={dog.sex ?? ""}
                className="field"
              >
                <option value="">Ej angivet</option>
                <option value="HANE">Hane</option>
                <option value="TIK">Tik</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="chipNumber">
                Chipnummer
              </label>
              <input
                id="chipNumber"
                name="chipNumber"
                defaultValue={dog.chipNumber ?? ""}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={dog.status}
                className="field"
              >
                {Object.entries(DOG_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="notes">
              Anteckning
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={dog.notes ?? ""}
              className="field resize-y"
            />
          </div>
        </fieldset>

        <fieldset className="card space-y-3.5 p-4">
          <legend className="section-label px-1">Registrering och försäkring</legend>

          <div>
            <label className="field-label" htmlFor="registrationNumber">
              Reg.nummer
            </label>
            <input
              id="registrationNumber"
              name="registrationNumber"
              defaultValue={dog.registrationNumber}
              placeholder="t.ex. SE-AVAR-2020-1127"
              className="field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="insurer">
                Försäkringsbolag
              </label>
              <input
                id="insurer"
                name="insurer"
                defaultValue={dog.insurer}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="insuranceValidTo">
                Giltig t.o.m.
              </label>
              <input
                id="insuranceValidTo"
                name="insuranceValidTo"
                type="date"
                defaultValue={dog.insuranceValidTo}
                className="field"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="card space-y-3.5 p-4">
          <legend className="section-label px-1">Nyckelinformation</legend>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="weightKg">
                Vikt (kg)
              </label>
              <input
                id="weightKg"
                name="weightKg"
                type="number"
                min={0}
                step="0.1"
                defaultValue={dog.weightKg}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="heightCm">
                Höjd (cm)
              </label>
              <input
                id="heightCm"
                name="heightCm"
                type="number"
                min={0}
                defaultValue={dog.heightCm}
                className="field"
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="color">
              Färg
            </label>
            <input
              id="color"
              name="color"
              defaultValue={dog.color}
              placeholder="t.ex. Fawn med svart mask"
              className="field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="hipsElbows">
                HD / ED
              </label>
              <input
                id="hipsElbows"
                name="hipsElbows"
                defaultValue={dog.hipsElbows}
                placeholder="t.ex. A / 0"
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="mentalIndex">
                Mentalindex (MH)
              </label>
              <input
                id="mentalIndex"
                name="mentalIndex"
                defaultValue={dog.mentalIndex}
                placeholder="t.ex. 5 / 5"
                className="field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="originCountry">
                Import
              </label>
              <input
                id="originCountry"
                name="originCountry"
                defaultValue={dog.originCountry}
                placeholder="Ursprungsland"
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="neutered">
                Kastrerad
              </label>
              <select
                id="neutered"
                name="neutered"
                defaultValue={dog.neutered}
                className="field"
              >
                <option value="">Ej angivet</option>
                <option value="ja">Ja</option>
                <option value="nej">Nej</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="card space-y-3 p-4">
          <legend className="section-label px-1">Sökinriktningar</legend>
          <div className="flex flex-wrap gap-2">
            {disciplines.map((d) => {
              const on = selected.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggle(d.id)}
                  aria-pressed={on}
                  className={`chip transition-colors ${
                    on ? "border-brand/50 bg-brand/12 text-brand" : ""
                  }`}
                >
                  {d.name}
                </button>
              );
            })}
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
      </form>
    </div>
  );
}
