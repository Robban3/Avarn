"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "./icons";

/**
 * Formulärdelar som behöver hålla ett eget läge. Ligger i en egen fil och
 * inte i ui.tsx, eftersom "use client" smittar hela modulen – ui.tsx ska
 * kunna renderas på servern.
 */

/**
 * Räknare med minus och plus, för tal man justerar ett steg i taget med
 * tummen. Värdet ligger i ett dolt fält så att formuläret skickar det
 * som vanligt.
 */
export function Stegare({
  name,
  label,
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  name?: string;
  label: string;
  value: number;
  onChange: (nytt: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-fg-muted">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Minska ${label.toLowerCase()}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-2 text-fg transition-colors hover:bg-surface-3 disabled:opacity-40"
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <span
          aria-live="polite"
          className="w-9 text-center text-[15px] font-semibold tabular-nums"
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Öka ${label.toLowerCase()}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-2 text-fg transition-colors hover:bg-surface-3 disabled:opacity-40"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
      {name ? <input type="hidden" name={name} value={value} /> : null}
    </div>
  );
}

/**
 * Ja eller nej, med en textruta som fälls ut vid ja.
 *
 * Avvikelser lagras som fritext: tom text betyder inga avvikelser. Väljaren
 * finns för att "Nej" ska vara ett tryck i stället för en tom rad man kan
 * glömma – och för att ett ja alltid ska kräva en förklaring.
 */
export function JaNej({
  name,
  fraga,
  defaultValue = "",
  placeholder,
  rows = 3,
}: {
  name: string;
  fraga: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}) {
  const [ja, setJa] = useState(defaultValue.trim().length > 0);
  const [text, setText] = useState(defaultValue);

  const knapp = (aktiv: boolean) =>
    `flex-1 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors ${
      aktiv
        ? "border-brand bg-brand/10 text-brand"
        : "border-line bg-surface-2 text-fg-muted hover:text-fg"
    }`;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-fg-muted">{fraga}</span>
        <div className="flex w-[132px] gap-2">
          <button
            type="button"
            onClick={() => setJa(false)}
            aria-pressed={!ja}
            className={knapp(!ja)}
          >
            Nej
          </button>
          <button
            type="button"
            onClick={() => setJa(true)}
            aria-pressed={ja}
            className={knapp(ja)}
          >
            Ja
          </button>
        </div>
      </div>

      {ja ? (
        <textarea
          name={name}
          rows={rows}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label={fraga}
          className="field mt-2.5 resize-y"
        />
      ) : (
        // Ett tomt värde skickas ändå med, så att ett tidigare ifyllt
        // stycke faktiskt rensas när man byter till Nej.
        <input type="hidden" name={name} value="" />
      )}
    </div>
  );
}
