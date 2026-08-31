"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Loggar in …" : "Logga in"}
    </button>
  );
}

export function LoginForm({ retur }: { retur?: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="retur" value={retur ?? ""} />

      <div>
        <label className="field-label" htmlFor="email">
          E-postadress
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          required
          className="field"
          placeholder="fornamn.efternamn@avarn.se"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="password">
          Lösenord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          placeholder="••••••••"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
