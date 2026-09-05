"use client";

import { useEffect } from "react";

/**
 * Sista utvägen: felet uppstod i rotlayouten själv.
 *
 * Då finns ingen layout kvar att rita i, så den här filen måste ta med
 * sig både <html> och <body>. Färgerna står som hexvärden och inte som
 * klasser ur profilen – går layouten sönder är stilmallen det näst
 * troligaste som saknas, och en felsida som renderas svart på svart är
 * ingen felsida. Värdena är samma som --color-bg, --color-fg,
 * --color-fg-muted och --color-brand i globals.css.
 *
 * Det här är också det enda felet som inte går att rätta med en omritning
 * av vyn, så knappen laddar om sidan i stället.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Ohanterat fel i rotlayouten", error);
  }, [error]);

  return (
    <html lang="sv">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0 1.5rem",
          textAlign: "center",
          backgroundColor: "#0b0e0f",
          color: "#f4f7f7",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
          Något gick fel
        </h1>
        <p style={{ maxWidth: "20rem", fontSize: "0.875rem", color: "#98a2a3" }}>
          Appen kunde inte starta. Ladda om sidan – hjälper det inte, pröva
          igen om en stund.
        </p>

        {error.digest ? (
          <p style={{ fontSize: "0.75rem", color: "#6b7476" }}>
            Felkod: {error.digest}
          </p>
        ) : null}

        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "1rem",
            padding: "0.625rem 1.25rem",
            borderRadius: "0.75rem",
            border: "none",
            backgroundColor: "#4fd1c5",
            color: "#06201e",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Ladda om
        </button>
      </body>
    </html>
  );
}
