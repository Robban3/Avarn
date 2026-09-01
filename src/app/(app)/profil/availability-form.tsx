"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarIcon, XIcon } from "@/components/icons";
import { StatusPill } from "@/components/ui";
import {
  removeAvailability,
  setAvailability,
  type AvailabilityState,
} from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Sparar …" : "Spara period"}
    </button>
  );
}

type Period = {
  id: string;
  kind: string;
  range: string;
  note: string | null;
  current: boolean;
};

export function AvailabilityForm({
  teams,
  periods,
  defaults,
}: {
  teams: { id: string; label: string }[];
  periods: Period[];
  defaults: { start: string; end: string };
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<AvailabilityState, FormData>(
    setAvailability,
    {},
  );

  return (
    <div className="space-y-3">
      {periods.length > 0 ? (
        <div className="card divide-y divide-line-soft">
          {periods.map((period) => (
            <div key={period.id} className="flex items-center gap-3 px-4 py-3">
              <CalendarIcon className="h-5 w-5 shrink-0 text-fg-dim" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{period.range}</p>
                {period.note ? (
                  <p className="truncate text-xs text-fg-muted">{period.note}</p>
                ) : null}
              </div>
              {period.current ? (
                <StatusPill
                  tone={period.kind === "AVAILABLE" ? "brand" : "warn"}
                >
                  {period.kind === "AVAILABLE" ? "Tillgänglig nu" : "Frånvarande nu"}
                </StatusPill>
              ) : (
                <span className="shrink-0 text-xs text-fg-dim">
                  {period.kind === "AVAILABLE" ? "Tjänstgöring" : "Frånvaro"}
                </span>
              )}
              <form action={removeAvailability}>
                <input type="hidden" name="availabilityId" value={period.id} />
                <button
                  type="submit"
                  aria-label="Ta bort perioden"
                  className="text-fg-dim transition-colors hover:text-danger"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <p className="card px-4 py-4 text-sm text-fg-muted">
          Ingen tjänstgöring eller frånvaro inlagd.
        </p>
      )}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-secondary w-full"
        >
          <CalendarIcon className="h-[18px] w-[18px]" />
          Lägg till period
        </button>
      ) : (
        <form action={action} className="card space-y-3.5 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Ny period</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-ghost px-2 py-1 text-xs"
            >
              Avbryt
            </button>
          </div>

          <div>
            <label className="field-label" htmlFor="av-team">
              Ekipage
            </label>
            <select id="av-team" name="teamId" required className="field">
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="av-kind">
              Typ
            </label>
            <select id="av-kind" name="kind" required className="field">
              <option value="AVAILABLE">Tillgänglig för uppdrag</option>
              <option value="UNAVAILABLE">Frånvarande</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="av-start">
                Från och med
              </label>
              <input
                id="av-start"
                name="startAt"
                type="date"
                required
                defaultValue={defaults.start}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="av-end">
                Till och med
              </label>
              <input
                id="av-end"
                name="endAt"
                type="date"
                required
                defaultValue={defaults.end}
                className="field"
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="av-note">
              Anteckning
            </label>
            <input
              id="av-note"
              name="note"
              placeholder="t.ex. Semester eller Ordinarie tjänstgöring"
              className="field"
            />
          </div>

          {state.error ? (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          ) : null}
          {state.ok ? <p className="text-sm text-ok">{state.ok}</p> : null}

          <div className="flex justify-end">
            <Submit />
          </div>
        </form>
      )}
    </div>
  );
}
