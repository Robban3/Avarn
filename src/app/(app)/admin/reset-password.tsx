"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { resetPassword, type AdminState } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs text-fg-dim transition-colors hover:text-fg-muted"
    >
      {pending ? "Återställer …" : "Återställ lösenord"}
    </button>
  );
}

/**
 * Det nya lösenordet visas bara i svaret på den här åtgärden och lagras
 * aldrig i klartext, så det måste noteras direkt.
 */
export function ResetPasswordButton({ userId }: { userId: string }) {
  const [state, action] = useActionState<AdminState, FormData>(
    resetPassword,
    {},
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={action}>
        <input type="hidden" name="userId" value={userId} />
        <Submit />
      </form>
      {state.ok ? (
        <p className="max-w-52 text-right text-[11px] leading-tight text-ok">
          {state.ok}
        </p>
      ) : null}
      {state.error ? (
        <p className="text-[11px] text-danger">{state.error}</p>
      ) : null}
    </div>
  );
}
