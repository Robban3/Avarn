"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { AlertIcon } from "./icons";

/**
 * Den gemensamma felsidan bakom app/error.tsx och dess syskon.
 *
 * Utan en felgräns visar Next sin egen text – "Application error: a
 * client-side exception has occurred" – som varken säger vad som hänt
 * eller vart man ska ta vägen. En förare som står på ett uppdrag ska få
 * veta att det inte var hen som gjorde fel, och få en knapp att trycka på.
 *
 * `reset` ritar om samma vy utan att ladda om sidan. Det räcker för ett
 * databasfel som gick över, och är värt att pröva innan man ger sig av.
 *
 * Kastade `redirect()` och `notFound()` fångas inte av en felgräns – Next
 * behandlar dem som styrsignaler och inte som fel – så inloggning och
 * 404-sidan fungerar som förut.
 */
export function Felvy({
  error,
  reset,
  beskrivning,
  utvag,
  loggtext,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  beskrivning: ReactNode;
  /** Vart man tar vägen om omritningen inte hjälper. */
  utvag: { href: string; etikett: string };
  /** Raden felet loggas under, så att loggen säger var det uppstod. */
  loggtext: string;
}) {
  useEffect(() => {
    // Servern loggar redan sitt eget fel. Det här är klientens sida av
    // saken, och det enda stället där felet syns om det uppstod här.
    console.error(loggtext, error);
  }, [error, loggtext]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-warn">
        <AlertIcon className="h-7 w-7" />
      </div>
      <h1 className="text-lg font-semibold">Något gick fel</h1>
      <p className="mt-2 max-w-xs text-sm text-fg-muted">{beskrivning}</p>

      {/* Felkoden är det enda som går att söka på i loggen efteråt. Den
          står här i stället för ett felmeddelande som avslöjar systemets
          inre för den som inte ska se det. */}
      {error.digest ? (
        <p className="mt-3 text-xs text-fg-dim">Felkod: {error.digest}</p>
      ) : null}

      <div className="mt-6 flex w-full max-w-xs flex-col gap-2.5">
        <button type="button" onClick={reset} className="btn btn-primary">
          Försök igen
        </button>
        <Link href={utvag.href} className="btn btn-secondary">
          {utvag.etikett}
        </Link>
      </div>
    </main>
  );
}
