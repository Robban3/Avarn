"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createDog, type DogFormState } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Registrerar …" : "Registrera hund"}
    </button>
  );
}

export function DogForm({
  disciplines,
  handlers,
  ownId,
}: {
  disciplines: { id: string; name: string }[];
  /** Tom lista för hundförare, som alltid registrerar åt sig själva. */
  handlers: { id: string; name: string }[];
  ownId: string;
}) {
  const [state, action] = useActionState<DogFormState, FormData>(createDog, {});
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="disciplineIds" value={selected.join(",")} />

      <fieldset className="card space-y-3.5 p-4">
        <legend className="section-label px-1">Hunden</legend>

        <div>
          <label className="field-label" htmlFor="name">
            Namn
          </label>
          <input id="name" name="name" required className="field" />
        </div>

        <div>
          <label className="field-label" htmlFor="breed">
            Ras
          </label>
          <input
            id="breed"
            name="breed"
            required
            placeholder="t.ex. Belgisk vallhund (Malinois)"
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
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="sex">
              Kön
            </label>
            <select id="sex" name="sex" className="field">
              <option value="">Ej angivet</option>
              <option value="HANE">Hane</option>
              <option value="TIK">Tik</option>
            </select>
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="chipNumber">
            Chipnummer
          </label>
          <input id="chipNumber" name="chipNumber" className="field" />
        </div>
      </fieldset>

      {handlers.length > 0 ? (
        <fieldset className="card space-y-3.5 p-4">
          <legend className="section-label px-1">Ekipage</legend>
          <div>
            <label className="field-label" htmlFor="handlerId">
              Hundförare
            </label>
            <select
              id="handlerId"
              name="handlerId"
              defaultValue={ownId}
              className="field"
            >
              {handlers.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
      ) : null}

      <fieldset className="card space-y-3 p-4">
        <legend className="section-label px-1">Sökinriktningar</legend>
        <p className="text-xs text-fg-muted">
          Välj de inriktningar hunden utbildas mot. Kan ändras senare.
        </p>
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
  );
}
