"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { PlusIcon } from "@/components/icons";
import { addExercise, createPlan, type PlanFormState } from "./actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Sparar …" : label}
    </button>
  );
}

/** Instruktörens formulär för att lägga upp en ny plan. */
export function NewPlanForm({
  teams,
  defaults,
}: {
  teams: { id: string; label: string }[];
  defaults: { start: string; end: string };
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<PlanFormState, FormData>(
    createPlan,
    {},
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-secondary w-full"
      >
        <PlusIcon className="h-[18px] w-[18px]" />
        Ny träningsplan
      </button>
    );
  }

  return (
    <form action={action} className="card space-y-3.5 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Ny träningsplan</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn btn-ghost px-2 py-1 text-xs"
        >
          Avbryt
        </button>
      </div>

      <div>
        <label className="field-label" htmlFor="plan-team">
          Ekipage
        </label>
        <select id="plan-team" name="teamId" required className="field">
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="plan-title">
          Rubrik
        </label>
        <input
          id="plan-title"
          name="title"
          required
          placeholder="t.ex. Uthållighet i svår terräng"
          className="field"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="plan-purpose">
          Syfte
        </label>
        <textarea
          id="plan-purpose"
          name="purpose"
          rows={3}
          placeholder="Vad ska ekipaget utveckla under perioden?"
          className="field resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="plan-start">
            Från
          </label>
          <input
            id="plan-start"
            name="periodStart"
            type="date"
            required
            defaultValue={defaults.start}
            className="field"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="plan-end">
            Till
          </label>
          <input
            id="plan-end"
            name="periodEnd"
            type="date"
            required
            defaultValue={defaults.end}
            className="field"
          />
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Submit label="Skapa plan" />
      </div>
    </form>
  );
}

/** Lägger till en övning i en befintlig plan. */
export function AddExerciseForm({
  planId,
  environments,
  targetOdors,
}: {
  planId: string;
  environments: string[];
  targetOdors: string[];
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<PlanFormState, FormData>(
    addExercise,
    {},
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-brand transition-colors hover:bg-surface-2"
      >
        <PlusIcon className="h-[18px] w-[18px]" />
        Lägg till övning
      </button>
    );
  }

  return (
    <form action={action} className="space-y-3 border-t border-line-soft p-4">
      <input type="hidden" name="planId" value={planId} />

      <div>
        <label className="field-label" htmlFor={`ex-title-${planId}`}>
          Övning
        </label>
        <input
          id={`ex-title-${planId}`}
          name="title"
          required
          placeholder="t.ex. Höga gömmor i lagermiljö"
          className="field"
        />
      </div>

      <div>
        <label className="field-label" htmlFor={`ex-inst-${planId}`}>
          Instruktion
        </label>
        <textarea
          id={`ex-inst-${planId}`}
          name="instructions"
          rows={3}
          placeholder="Hur ska övningen genomföras?"
          className="field resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor={`ex-env-${planId}`}>
            Sökmiljö
          </label>
          <input
            id={`ex-env-${planId}`}
            name="environment"
            list={`envs-${planId}`}
            className="field"
          />
          <datalist id={`envs-${planId}`}>
            {environments.map((e) => (
              <option key={e} value={e} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="field-label" htmlFor={`ex-odor-${planId}`}>
            Måldoft
          </label>
          <input
            id={`ex-odor-${planId}`}
            name="targetOdor"
            list={`odors-${planId}`}
            className="field"
          />
          <datalist id={`odors-${planId}`}>
            {targetOdors.map((e) => (
              <option key={e} value={e} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor={`ex-due-${planId}`}>
          Klart senast
        </label>
        <input
          id={`ex-due-${planId}`}
          name="dueDate"
          type="date"
          className="field"
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn btn-ghost"
        >
          Avbryt
        </button>
        <Submit label="Lägg till" />
      </div>
    </form>
  );
}
