"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { PlusIcon } from "@/components/icons";
import { createUser, type AdminState } from "./actions";
import { ROLE_LABELS, type Role } from "@/lib/domain";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Skapar …" : "Skapa konto"}
    </button>
  );
}

export function UserForm({
  regions,
  roles,
}: {
  regions: { id: string; name: string }[];
  roles: Role[];
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<AdminState, FormData>(createUser, {});

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-secondary w-full"
      >
        <PlusIcon className="h-[18px] w-[18px]" />
        Nytt konto
      </button>
    );
  }

  return (
    <form action={action} className="card space-y-3.5 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Nytt konto</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn btn-ghost px-2 py-1 text-xs"
        >
          Avbryt
        </button>
      </div>

      <div>
        <label className="field-label" htmlFor="u-name">
          Namn
        </label>
        <input id="u-name" name="name" required className="field" />
      </div>

      <div>
        <label className="field-label" htmlFor="u-email">
          E-post
        </label>
        <input
          id="u-email"
          name="email"
          type="email"
          required
          placeholder="fornamn.efternamn@avarn.se"
          className="field"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="u-role">
            Roll
          </label>
          <select id="u-role" name="role" required className="field">
            {roles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="u-region">
            Region
          </label>
          <select id="u-region" name="regionId" className="field">
            <option value="">Ingen</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="u-phone">
          Telefon
        </label>
        <input id="u-phone" name="phone" type="tel" className="field" />
      </div>

      <div>
        <label className="field-label" htmlFor="u-password">
          Tillfälligt lösenord
        </label>
        <input
          id="u-password"
          name="password"
          type="text"
          required
          minLength={8}
          className="field"
        />
        <p className="mt-1.5 text-xs text-fg-dim">
          Minst åtta tecken. Användaren bör byta det vid första inloggningen.
        </p>
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
