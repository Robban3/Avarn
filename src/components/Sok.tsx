"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { ClockIcon, SearchIcon, XIcon } from "./icons";
import type { Sokgrupp } from "@/lib/sok";

/**
 * Sökfältet och de senaste sökningarna.
 *
 * Sökningen är ett vanligt formulär som skickas till /sok, så den
 * fungerar även innan sidans JavaScript hunnit ladda. Det enda som
 * behöver webbläsaren är listan över tidigare sökningar – den hör hemma
 * i telefonen och inte i databasen: den är personlig, ointressant för
 * alla andra och ska inte överleva att man byter enhet.
 */

const NYCKEL = "avarn.senaste-sokningar";
const MAX = 5;

/* ------------------------------------------------- Lagringen i telefonen */

const TOMT: string[] = [];
let cacheRatext = "";
let cache = TOMT;

function las(): string[] {
  try {
    const ratext = localStorage.getItem(NYCKEL) ?? "";
    // Samma referens tillbaka när ingenting ändrats: useSyncExternalStore
    // jämför med === och skulle annars rita om i en oändlig slinga.
    if (ratext !== cacheRatext) {
      cacheRatext = ratext;
      const tolkat: unknown = ratext ? JSON.parse(ratext) : [];
      cache = Array.isArray(tolkat)
        ? tolkat.filter((v): v is string => typeof v === "string").slice(0, MAX)
        : TOMT;
    }
    return cache;
  } catch {
    // Privat läge, full lagring eller trasigt innehåll: ingen lista.
    return TOMT;
  }
}

function skriv(varden: string[]) {
  try {
    localStorage.setItem(NYCKEL, JSON.stringify(varden.slice(0, MAX)));
  } catch {
    // Går det inte att spara får listan vara tom. Sökningen fungerar ändå.
  }
  window.dispatchEvent(new Event("avarn:sokningar"));
}

function prenumerera(vid: () => void) {
  window.addEventListener("storage", vid);
  window.addEventListener("avarn:sokningar", vid);
  return () => {
    window.removeEventListener("storage", vid);
    window.removeEventListener("avarn:sokningar", vid);
  };
}

/** Serverns svar är alltid en tom lista – den känner inte telefonen. */
const serverlas = () => TOMT;

/**
 * Listan som den ser ut just nu. useSyncExternalStore och inte ett
 * tillstånd i en effekt: localStorage finns inte på servern, och det här
 * är API:t som låter serverns tomma lista och telefonens riktiga mötas
 * utan att hydreringen klagar.
 */
function useSenaste() {
  return useSyncExternalStore(prenumerera, las, serverlas);
}

/* ------------------------------------------------------------- Sökfältet */

export function Sokfalt({
  varde,
  typ,
}: {
  varde: string;
  /** Följer med i formuläret så att ett filter överlever en ny sökning. */
  typ?: Sokgrupp;
}) {
  // Sökningen sparas när resultatet visats, inte medan man skriver – då
  // hade varje bokstav blivit en egen rad i listan.
  useEffect(() => {
    const q = varde.trim();
    if (q.length < 2) return;
    const tidigare = las().filter((v) => v.toLowerCase() !== q.toLowerCase());
    skriv([q, ...tidigare]);
  }, [varde]);

  return (
    <form action="/sok" className="mb-4">
      {typ ? <input type="hidden" name="typ" value={typ} /> : null}
      <label className="sr-only" htmlFor="q">
        Sök i hela systemet
      </label>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-fg-dim" />
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={varde}
          autoComplete="off"
          placeholder="Sök uppdrag, hund, rapport…"
          className="field pl-10"
        />
      </div>
    </form>
  );
}

/* ------------------------------------------------- Senaste sökningarna */

export function SenasteSokningar() {
  const senaste = useSenaste();
  if (senaste.length === 0) return null;

  return (
    <section className="mb-5">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="section-label">Senaste sökningar</h2>
        <button
          type="button"
          onClick={() => skriv([])}
          className="text-xs font-medium text-brand"
        >
          Rensa
        </button>
      </div>
      <div className="card divide-y divide-line-soft">
        {senaste.map((sokning) => (
          <div key={sokning} className="flex items-center gap-3 px-3.5 py-2.5">
            <ClockIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
            <Link
              href={`/sok?q=${encodeURIComponent(sokning)}`}
              className="min-w-0 flex-1 truncate text-sm"
            >
              {sokning}
            </Link>
            <button
              type="button"
              aria-label={`Ta bort ${sokning}`}
              onClick={() => skriv(senaste.filter((v) => v !== sokning))}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-fg-dim transition-colors hover:bg-surface-3 hover:text-fg"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
