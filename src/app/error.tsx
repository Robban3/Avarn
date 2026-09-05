"use client";

import { Felvy } from "@/components/Felvy";

/**
 * Felgränsen utanför den inloggade appen: inloggningssidan och
 * nekad-sidan.
 *
 * Den inloggade delen har en egen i (app)/error.tsx som länkar till
 * startsidan. Här går utvägen till inloggningen i stället – den som ser
 * det här felet har med all sannolikhet ingen session.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Felvy
      error={error}
      reset={reset}
      loggtext="Ohanterat fel"
      beskrivning="Sidan kunde inte visas. Pröva igen om en stund."
      utvag={{ href: "/login", etikett: "Till inloggningen" }}
    />
  );
}
