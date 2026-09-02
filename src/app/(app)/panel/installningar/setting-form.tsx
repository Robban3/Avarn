"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { resetSetting, updateSetting, type SettingsState } from "./actions";

/**
 * Ett fält per inställning. Listorna redigeras som en textruta med ett
 * värde per rad – det är snabbare än att klicka sig igenom rader, och
 * ordningen i rutan blir ordningen i formulären ute i appen.
 */

function Spara({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-[#06201e] transition-colors hover:bg-brand-strong disabled:opacity-50"
    >
      {pending ? "Sparar …" : children}
    </button>
  );
}

function Aterstall() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-line px-3.5 py-2 text-[13px] font-medium text-fg-muted transition-colors hover:bg-surface-2 disabled:opacity-50"
    >
      {pending ? "…" : "Återställ till standard"}
    </button>
  );
}

export function SettingForm({
  nyckel,
  rubrik,
  beskrivning,
  varde,
  typ,
  andrad,
}: {
  nyckel: string;
  rubrik: string;
  beskrivning: string;
  varde: number | string[];
  typ: "tal" | "lista";
  /** Vem som ändrade och när, om värdet avviker från standard. */
  andrad?: { av: string; nar: string };
}) {
  const [state, action] = useActionState<SettingsState, FormData>(
    updateSetting,
    {},
  );
  const [reset, resetAction] = useActionState<SettingsState, FormData>(
    resetSetting,
    {},
  );

  const svar = state.error ?? reset.error ?? state.ok ?? reset.ok;
  const fel = Boolean(state.error ?? reset.error);

  return (
    <div className="border-b border-line-soft py-4 last:border-b-0">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[14px] font-semibold">{rubrik}</h3>
        {andrad ? (
          <p className="text-[11px] text-fg-dim">
            Ändrad av {andrad.av} {andrad.nar}
          </p>
        ) : (
          <p className="text-[11px] text-fg-dim">Standardvärde</p>
        )}
      </div>
      <p className="mb-3 text-[12px] text-fg-muted">{beskrivning}</p>

      {/*
        key följer värdet: defaultValue läses bara när fältet monteras, så
        efter "Återställ till standard" stod de borttagna raderna kvar i
        rutan – och trycktes Spara skrevs de tillbaka. Ett nytt värde ger
        nu ett nytt fält. Nyckeln sitter på fältet och inte på formuläret,
        så att en inskickning aldrig kan tappas för att formuläret byts ut
        under fötterna på den.
      */}
      <form action={action} className="flex flex-wrap items-end gap-2.5">
        <input type="hidden" name="nyckel" value={nyckel} />
        {typ === "tal" ? (
          <label className="flex items-center gap-2">
            <input
              key={String(varde)}
              name="varde"
              type="number"
              min={1}
              max={365}
              defaultValue={String(varde)}
              aria-label={rubrik}
              className="field w-[110px]"
            />
            <span className="text-[13px] text-fg-muted">dagar</span>
          </label>
        ) : (
          <textarea
            key={(varde as string[]).join("\n")}
            name="varde"
            rows={Math.min(Math.max((varde as string[]).length, 3), 10)}
            defaultValue={(varde as string[]).join("\n")}
            aria-label={rubrik}
            className="field w-full max-w-[420px] resize-y font-mono text-[12px]"
          />
        )}
        <Spara>Spara</Spara>
      </form>

      {andrad ? (
        <form action={resetAction} className="mt-2.5">
          <input type="hidden" name="nyckel" value={nyckel} />
          <Aterstall />
        </form>
      ) : null}

      {svar ? (
        <p
          role="status"
          className={`mt-2.5 text-[12px] ${fel ? "text-danger" : "text-ok"}`}
        >
          {svar}
        </p>
      ) : null}
    </div>
  );
}
