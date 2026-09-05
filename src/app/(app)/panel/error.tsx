"use client";

import { Felvy } from "@/components/Felvy";

/**
 * Felgränsen för adminpanelen.
 *
 * Skild från appens egen bara för utvägen: den som sitter i panelen ska
 * tillbaka till översikten, inte kastas till förarappens startsida.
 */
export default function PanelError({
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
      loggtext="Ohanterat fel i adminpanelen"
      beskrivning="Vyn kunde inte visas. Pröva igen – går det inte kan uppgifterna vara låsta av en pågående ändring."
      utvag={{ href: "/panel", etikett: "Till översikten" }}
    />
  );
}
