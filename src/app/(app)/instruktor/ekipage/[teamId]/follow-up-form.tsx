"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { PlusIcon } from "@/components/icons";
import { createFollowUp, type FollowUpState } from "../../actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Skickar …" : "Kalla till uppföljning"}
    </button>
  );
}

/** Instruktören kallar ekipaget till en uppföljning. */
export function FollowUpForm({ teamId }: { teamId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<FollowUpState, FormData>(
    createFollowUp,
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
        Kalla till uppföljning
      </button>
    );
  }

  return (
    <form action={action} className="card space-y-3.5 p-4">
      <input type="hidden" name="teamId" value={teamId} />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Ny uppföljning</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn btn-ghost px-2 py-1 text-xs"
        >
          Avbryt
        </button>
      </div>

      <div>
        <label className="field-label" htmlFor="fu-title">
          Vad gäller det?
        </label>
        <input
          id="fu-title"
          name="title"
          required
          placeholder="t.ex. Uppföljning höga gömmor"
          className="field"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="fu-message">
          Meddelande
        </label>
        <textarea
          id="fu-message"
          name="message"
          rows={3}
          placeholder="Vad ska ekipaget förbereda?"
          className="field resize-y"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="fu-due">
          Senast
        </label>
        <input id="fu-due" name="dueDate" type="date" className="field" />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Submit />
      </div>
    </form>
  );
}
