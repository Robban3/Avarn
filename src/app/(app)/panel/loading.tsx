import { Kortskelett, Ruta } from "@/components/Skelett";

/**
 * Visas medan en sida i adminpanelen hämtas.
 *
 * Panelens sidomeny ligger i AdminShell och ritas av sidan själv, så
 * skelettet håller sig till innehållsytan och lämnar plats för menyn på
 * stora skärmar. Panelens sidor är de tyngsta i appen – översikten
 * räknar aggregat över hela regionen – och det är här väntan märks.
 */
export default function PanelLaddar() {
  return (
    <div className="min-h-dvh bg-bg lg:pl-[248px]" aria-busy="true">
      <header className="px-5 pb-5 pt-4 lg:px-8 lg:pt-5">
        <div className="mb-4 flex justify-end">
          <Ruta className="h-[34px] w-[34px] rounded-full" />
        </div>
        <Ruta className="h-7 w-56" />
      </header>

      <main className="px-5 pb-12 lg:px-8">
        <p className="sr-only" role="status">
          Laddar …
        </p>

        {/* Fyra nyckeltal på rad, som på panelens sidor */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="card p-4">
              <Ruta className="h-3 w-20" />
              <Ruta className="mt-3 h-7 w-14" />
            </div>
          ))}
        </div>

        <Kortskelett rader={6} />
      </main>
    </div>
  );
}
