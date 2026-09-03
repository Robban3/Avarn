"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { formatStopwatch } from "@/lib/format";
import Link from "next/link";
import {
  ClipboardIcon,
  FolderIcon,
  MessageIcon,
  PhoneIcon,
  PlusIcon,
  StopIcon,
} from "./icons";

/**
 * Delarna i den operativa vyn som behöver ett eget läge i webbläsaren.
 * Resten av vyn är vanliga formulär med server actions, så att en
 * registrering är ett tryck och fungerar även innan sidans JavaScript
 * hunnit ladda.
 */

/**
 * Uppdragstiden, som räknar uppåt: "00:42:18".
 *
 * Starttiden kommer från servern och klockan går i webbläsaren. Första
 * renderingen visar samma värde som servern räknade fram, annars klagar
 * React på att texten inte stämmer.
 */
export function Timer({
  startedAt,
  className = "",
}: {
  startedAt: string;
  className?: string;
}) {
  const start = new Date(startedAt).getTime();
  const [nu, setNu] = useState<number | null>(null);

  // Klockan startas av intervallet och inte av ett anrop rakt i effekten:
  // servern har redan räknat fram första värdet, och en extra rendering
  // direkt vid montering ger bara en omritning i onödan.
  useEffect(() => {
    const id = setInterval(() => setNu(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`tabular-nums ${className}`} aria-live="off">
      {formatStopwatch((nu ?? start) - start)}
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
        className="btn w-full whitespace-nowrap border border-brand/45 px-3 text-[13px] text-brand transition-colors hover:bg-brand/10"
      >
        <StopIcon className="h-[18px] w-[18px]" />
        Avsluta uppdrag
      </button>
    );
  }

  // Panelen fälls upp underifrån i stället för på plats: knappen sitter i
  // en smal kolumn bredvid klockan, och en bekräftelse ska ha plats att
  // visa vad som faktiskt registrerats.
  return (
    <>
      <button
        type="button"
        onClick={() => setOppen(false)}
        aria-label="Stäng"
        className="fixed inset-0 z-40 bg-bg-deep/70 backdrop-blur-sm"
      />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-left">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="text-[17px] font-semibold">Avsluta uppdraget?</h2>
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
      </div>
    </>
  );
}

/**
 * Snabbregistreringens rad: de fyra knapparna plus "Ny händelse".
 *
 * Rutan för en ny händelse ser ut som de andra men fäller ut ett
 * formulär under hela raden – ett fält på en femtedels skärmbredd går
 * inte att skriva i. De fyra knapparna kommer in som färdiga formulär
 * från servern; komponenten här sköter bara utfällningen.
 */
export function Snabbregistrering({
  knappar,
  children,
}: {
  knappar: ReactNode;
  /** Formuläret för en ny händelse. */
  children: ReactNode;
}) {
  const [oppen, setOppen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-5 gap-1.5">
        {knappar}
        <button
          type="button"
          onClick={() => setOppen((v) => !v)}
          aria-expanded={oppen}
          className={`flex w-full flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2.5 transition-colors ${
            oppen
              ? "border-brand bg-brand/10 text-brand"
              : "border-brand/45 bg-surface-2 text-brand hover:bg-brand/10"
          }`}
        >
          <PlusIcon className="h-[18px] w-[18px]" />
          <span className="text-[9px] font-medium leading-tight">
            Ny händelse
          </span>
        </button>
      </div>

      {oppen ? (
        <div className="mt-2.5 rounded-xl border border-line bg-surface-2 p-3">
          {children}
        </div>
      ) : null}
    </>
  );
}

/** Listan över registrerade händelser, dold tills någon vill se den. */
export function Registrerat({
  antal,
  children,
}: {
  antal: number;
  children: ReactNode;
}) {
  const [oppen, setOppen] = useState(false);

  if (antal === 0) return null;

  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={() => setOppen((v) => !v)}
        aria-expanded={oppen}
        className="text-[13px] font-medium text-brand"
      >
        {oppen ? "Dölj registrerade" : `Visa registrerade (${antal})`}
      </button>
      {oppen ? <div className="mt-2.5">{children}</div> : null}
    </div>
  );
}

/**
 * Raden med kommunikation, dokument och rapport.
 *
 * Kommunikationskortet rymmer två handlingar i underlaget, ring och
 * meddelande. Kortet fäller ut dem i stället för att gissa vilken av dem
 * ett tryck menade – och panelen hamnar under hela raden, inte inuti det
 * smala kortet.
 */
export function Atgardskort({
  telefon,
  namn,
  dokumentHref,
  rapportHref,
}: {
  telefon: string | null;
  namn: string | null;
  dokumentHref: string;
  rapportHref: string;
}) {
  const [oppen, setOppen] = useState(false);
  const nummer = telefon?.replace(/\s/g, "") ?? "";

  const kortklass =
    "card flex flex-col items-start gap-1 p-3 text-left transition-colors hover:border-brand/40";
  const rubrikklass =
    "text-[10px] font-semibold uppercase leading-tight tracking-[0.06em]";

  return (
    <>
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => setOppen((v) => !v)}
          disabled={!telefon}
          aria-expanded={oppen}
          className={`${kortklass} disabled:opacity-50`}
        >
          <MessageIcon className="h-[18px] w-[18px] text-brand" />
          <span className={rubrikklass}>Kommunikation</span>
          <span className="text-[10px] leading-tight text-fg-muted">
            Ring / Meddelande
          </span>
        </button>

        <Link href={dokumentHref} className={kortklass}>
          <FolderIcon className="h-[18px] w-[18px] text-brand" />
          <span className={rubrikklass}>Dokument</span>
          <span className="text-[10px] leading-tight text-fg-muted">
            Visa uppdragsinfo
          </span>
        </Link>

        <Link href={rapportHref} className={kortklass}>
          <ClipboardIcon className="h-[18px] w-[18px] text-brand" />
          <span className={rubrikklass}>Rapport</span>
          <span className="text-[10px] leading-tight text-fg-muted">
            Öppna rapport
          </span>
        </Link>
      </div>

      {oppen && telefon ? (
        <div className="mt-2.5 flex gap-2.5">
          <a href={`tel:${nummer}`} className="btn btn-secondary flex-1">
            <PhoneIcon className="h-[18px] w-[18px] text-brand" />
            Ring {namn ?? "kontakt"}
          </a>
          <a href={`sms:${nummer}`} className="btn btn-secondary flex-1">
            <MessageIcon className="h-[18px] w-[18px] text-brand" />
            Meddelande
          </a>
        </div>
      ) : null}
    </>
  );
}
