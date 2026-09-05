import type { ReactNode } from "react";

/**
 * Skelettvyerna som visas medan en sida hämtas.
 *
 * Utan en loading.tsx står appen still tills servern svarat – trycket på
 * en flik ser ut att inte ha tagit, och föraren trycker igen. Skelettet
 * byter vy direkt och visar ramen medan innehållet är på väg.
 *
 * Det ritar formen, inte innehållet: sidhuvudet, kortens höjd och
 * flikraden ligger där de kommer att ligga, så att sidan inte hoppar när
 * den riktiga vyn kommer. Rutorna har ingen text – en gissad rubrik som
 * visar sig vara fel är värre än ingen.
 *
 * Pulsen står stilla för den som bett om mindre rörelse i systemet.
 *
 * ---------------------------------------------------------------------
 * VIKTIGT om var en loading.tsx får ligga.
 *
 * En loading.tsx gör att svaret börjar strömma direkt, med statuskod 200,
 * och gäller hela segmentet *med alla sidor under sig*. Ett `notFound()`
 * som kastas efter att strömningen börjat hinner då inte längre sätta
 * 404 – sidan visar rätt innehåll, men svaret säger 200.
 *
 * Det är inte en detalj här: de tolv sidor som kastar notFound() gör det
 * för att en post ligger utanför behörigheten, och 404 i stället för
 * "nekad" är just det som gör att id:n inte går att räkna upp
 * (se missionForUser i src/lib/queries.ts). Provet "en förare i en annan
 * region når varken fliken eller filen" i e2e/dokument.spec.ts vaktar det.
 *
 * Därför ligger loading.tsx bara på segment som varken själva eller i
 * något underliggande segment kastar notFound(). Listvyerna – /hundar,
 * /uppdrag, /traning, /rapporter – har alla en [id]-sida under sig och
 * får därför ingen. Lägg inte till en där utan att först flytta
 * väntan till en <Suspense> inuti sidan, som lämnar statuskoden i fred.
 */

/** En grå ruta. `w` och `h` är Tailwind-klasser. */
export function Ruta({ className = "" }: { className?: string }) {
  return (
    <div
      className={`motion-safe:animate-pulse rounded-md bg-surface-2 ${className}`}
    />
  );
}

/** Ett kort med några rader i, som listorna i appen. */
export function Kortskelett({ rader = 3 }: { rader?: number }) {
  return (
    <div className="card divide-y divide-line-soft">
      {Array.from({ length: rader }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-3.5 py-3.5">
          <Ruta className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Ruta className="h-3.5 w-2/5" />
            <Ruta className="h-3 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Förarappens ram: sidhuvud, innehåll och de fem flikarna.
 *
 * Ramen ritas här och inte med AppShell, eftersom den senare behöver
 * användarens roll – och att slå upp den hade gjort skelettet till just
 * den väntan det ska dölja.
 */
export function Appskelett({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg" aria-busy="true">
      <header className="sticky top-0 z-30 border-b border-line-soft bg-bg">
        <div className="mx-auto flex min-h-14 w-full max-w-4xl items-center gap-2 px-4 py-2">
          <Ruta className="h-6 w-6 shrink-0 rounded-full" />
          <Ruta className="h-3.5 w-32" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-4">
        {/* Skärmläsaren ska säga att något är på väg, inte läsa upp
            tomma rutor. */}
        <p className="sr-only" role="status">
          Laddar …
        </p>
        {children ?? (
          <>
            <Ruta className="mb-3 h-3 w-24" />
            <Kortskelett />
            <Ruta className="mb-3 mt-6 h-3 w-28" />
            <Kortskelett rader={2} />
          </>
        )}
      </main>

      <div
        aria-hidden
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-bg-deep"
      >
        <div className="mx-auto flex w-full max-w-4xl items-stretch pb-[env(safe-area-inset-bottom)]">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="flex h-16 flex-1 flex-col items-center justify-center gap-1.5"
            >
              <Ruta className="h-[22px] w-[22px] rounded-lg" />
              <Ruta className="h-2 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
