"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { PERIODER, type PeriodKey } from "@/lib/domain";

/**
 * Filtren skriver till adressraden i stället för till lokalt tillstånd, så
 * att en filtrerad vy går att spara som bokmärke och dela – och så att
 * sidan förblir en serverkomponent som hämtar rätt data direkt.
 */

function useSatt() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const satt = (andringar: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(andringar)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    startTransition(() => router.push(qs ? `?${qs}` : "?"));
  };

  return { satt, pending };
}

const FALT =
  "rounded-lg border border-line bg-surface px-3 py-2.5 text-[13px] text-fg outline-none transition-colors focus:border-brand-deep";

export function PeriodSelect({ value }: { value: PeriodKey }) {
  const { satt, pending } = useSatt();
  return (
    <select
      aria-label="Period"
      value={value}
      disabled={pending}
      onChange={(e) => satt({ period: e.target.value })}
      className={FALT}
    >
      {Object.entries(PERIODER).map(([key, p]) => (
        <option key={key} value={key}>
          {p.label}
        </option>
      ))}
    </select>
  );
}

export function PanelFilters({
  regions,
  disciplines,
  region,
  discipline,
  q,
}: {
  regions: { id: string; name: string }[];
  disciplines: { id: string; name: string }[];
  region: string;
  discipline: string;
  q: string;
  /** Bevaras av adressraden; tas emot för tydlighetens skull. */
  period?: PeriodKey;
}) {
  const { satt, pending } = useSatt();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Region"
        value={region}
        disabled={pending}
        onChange={(e) => satt({ region: e.target.value })}
        className={FALT}
      >
        <option value="">Alla regioner</option>
        {regions.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Sökinriktning"
        value={discipline}
        disabled={pending}
        onChange={(e) => satt({ inriktning: e.target.value })}
        className={FALT}
      >
        <option value="">Alla sökinriktningar</option>
        {disciplines.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          satt({ sok: String(data.get("sok") ?? "") });
        }}
      >
        <input
          name="sok"
          type="search"
          defaultValue={q}
          placeholder="Sök ekipage…"
          aria-label="Sök ekipage"
          className={`${FALT} w-[180px]`}
        />
      </form>
    </div>
  );
}
