"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { LockIcon } from "@/components/icons";
import { changePassword, type PasswordState } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Byter …" : "Byt lösenord"}
    </button>
  );
}

export function PasswordForm() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState<PasswordState, FormData>(
    async (prev, formData) => {
      const result = await changePassword(prev, formData);
      if (result.ok) ref.current?.reset();
      return result;
    },
    {},
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-secondary w-full"
      >
        <LockIcon className="h-[18px] w-[18px]" />
        Byt lösenord
      </button>
    );
  }

  return (
    <form ref={ref} action={action} className="card space-y-3.5 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Byt lösenord</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn btn-ghost px-2 py-1 text-xs"
        >
          Stäng
        </button>
      </div>

      <div>
        <label className="field-label" htmlFor="current">
          Nuvarande lösenord
        </label>
        <input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
          className="field"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="next">
          Nytt lösenord
        </label>
        <input
          id="next"
          name="next"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className="field"
        />
        <p className="mt-1.5 text-xs text-fg-dim">Minst 12 tecken.</p>
      </div>

      <div>
        <label className="field-label" htmlFor="repeat">
          Upprepa nytt lösenord
        </label>
        <input
          id="repeat"
          name="repeat"
          type="password"
          autoComplete="new-password"
          required
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
  );
}
