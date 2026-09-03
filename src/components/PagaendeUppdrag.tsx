"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { formatDuration } from "@/lib/format";

/**
 * Delarna i den operativa vyn som behöver ett eget läge i webbläsaren.
 * Resten av vyn är vanliga formulär med server actions, så att en
 * registrering är ett tryck och fungerar även innan sidans JavaScript
 * hunnit ladda.
 */

/**
 * Tiden sedan uppdraget påbörjades, som räknar uppåt.
 *
 * Starttiden kommer från servern och klockan går i webbläsaren. Första
 * renderingen visar samma värde som servern räknade fram, annars klagar
 * React på att texten inte stämmer.
 */
export function Timer({ startedAt }: { startedAt: string }) {
  const start = new Date(startedAt).getTime();
  const [nu, setNu] = useState<number | null>(null);

  // Klockan startas av intervallet och inte av ett anrop rakt i effekten:
  // servern har redan räknat fram första värdet, och en extra rendering
  // direkt vid montering ger bara en omritning i onödan.
  useEffect(() => {
    const id = setInterval(() => setNu(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const minuter = Math.max(0, Math.floor(((nu ?? start) - start) / 60_000));
  const sekunder = Math.max(0, Math.floor(((nu ?? start) - start) / 1000) % 60);

  // formatDuration ger "–" för noll, vilket betyder "ingen varaktighet".
  // En klocka som just startat har en varaktighet: den är noll minuter.
  return (
    <span className="tabular-nums" aria-live="off">
      {minuter === 0 ? "0 min" : formatDuration(minuter)}
      {nu === null ? null : (
        <span className="text-fg-dim">
          {" "}
          {String(sekunder).padStart(2, "0")}s
        </span>
      )}
    </span>
  );
}

/** Knapp som visar att den arbetar, för de tryck som sparar direkt. */
export function Tryckknapp({
  className,
  children,
  ...rest
}: {
  className: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} ${pending ? "opacity-60" : ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * "Avsluta uppdrag" i två steg: först en sammanställning av det som
 * registrerats, sedan bekräftelsen. Ett uppdrag ska inte kunna avslutas
 * av ett tryck i fickan, och föraren ska se vad som följer med till
 * rapporten innan hen lämnar platsen.
 */
export function AvslutaUppdrag({
  sammanstallning,
  children,
}: {
  sammanstallning: ReactNode;
  /** Formuläret som faktiskt avslutar uppdraget. */
  children: ReactNode;
}) {
  const [oppen, setOppen] = useState(false);

  if (!oppen) {
    return (
      <button
        type="button"
        onClick={() => setOppen(true)}
        className="btn btn-primary w-full"
      >
        Avsluta uppdrag
      </button>
    );
  }

  return (
    <div className="card border-brand/30 bg-brand/8 p-4">
      <h2 className="text-[15px] font-semibold">Avsluta uppdraget?</h2>
      <p className="mt-1 text-sm text-fg-muted">
        Det här följer med till den operativa rapporten:
      </p>
      <div className="mt-3">{sammanstallning}</div>
      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          onClick={() => setOppen(false)}
          className="btn btn-secondary flex-1"
        >
          Inte än
        </button>
        {children}
      </div>
    </div>
  );
}

/**
 * "Ny händelse": typ och text i stället för ett ensamt tryck. De fyra
 * snabbknapparna räcker för det mesta, men ibland behöver något beskrivas
 * med ord medan det är färskt.
 */
export function NyHandelse({ children }: { children: ReactNode }) {
  const [oppen, setOppen] = useState(false);

  if (!oppen) {
    return (
      <button
        type="button"
        onClick={() => setOppen(true)}
        className="btn btn-secondary w-full"
      >
        Ny händelse
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-[13px] font-semibold">Ny händelse</p>
        <button
          type="button"
          onClick={() => setOppen(false)}
          className="text-[13px] text-fg-muted transition-colors hover:text-fg"
        >
          Stäng
        </button>
      </div>
      {children}
    </div>
  );
}
