"use client";

import { Felvy } from "@/components/Felvy";

/** Felgränsen för hela den inloggade appen. Se src/components/Felvy.tsx. */
export default function AppError({
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
      loggtext="Ohanterat fel i appen"
      beskrivning="Vyn kunde inte visas. Det är inget du har gjort fel – pröva igen, och håll i minnet att registreringar du redan gjort ligger kvar i telefonen tills de kommit fram."
      utvag={{ href: "/hem", etikett: "Till startsidan" }}
    />
  );
}
