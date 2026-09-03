"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapPinIcon, RouteIcon, TargetIcon } from "./icons";

/**
 * Karta över uppdragets plats.
 *
 * Rutorna kommer från OpenStreetMap och hämtas av besökarens webbläsare,
 * inte av servern – ingen nyckel behövs, och upphovsangivelsen ligger i
 * hörnet som licensen kräver.
 *
 * Leaflet laddas i en useEffect och inte genom react-leaflet: raderna här
 * väger lättare än ett omslutande bibliotek med egna versionskrav mot
 * React. Biblioteket rör vid `window`, så det importeras först när
 * komponenten faktiskt monterats i webbläsaren.
 *
 * Kartan hamnar inte i vägen på en mobil: rullning med fingret panorerar
 * sidan tills man tryckt på kartan, och hjulet zoomar bara med Ctrl.
 */

export type Punkt = { lat: number; lng: number };

/** Färger tagna ur temat; Leaflet ritar utanför Tailwinds klasser. */
const BRAND = "#4fd1c5";
const INFO = "#5aa9e6";
const WARN = "#e9b44c";
const GRA = "#98a2a3";
const BG = "#0b0e0f";

/** Ritad nål i stället för Leaflets standardbild, som bundlern inte når. */
function nalHtml(farg: string, storlek: number, ring: string) {
  return `<span style="display:block;width:${storlek}px;height:${storlek}px;border-radius:9999px;background:${farg};border:3px solid ${BG};box-shadow:0 0 0 ${ring}"></span>`;
}

export function Karta({
  lat,
  lng,
  label,
  zoom = 15,
  className = "h-[220px]",
  visaPosition = false,
  omrade,
  ytaKvm,
  motesplats,
  parkering,
}: {
  lat: number;
  lng: number;
  /** Visas i nålens ruta, t.ex. mötesplatsen. */
  label: string;
  zoom?: number;
  className?: string;
  /**
   * Ritar även ut var föraren själv är, med telefonens positionstjänst.
   * Positionen stannar i webbläsaren – den skickas aldrig till servern
   * och sparas inte.
   */
  visaPosition?: boolean;
  /** Uppdragsområdets hörn. Färre än tre punkter ritas inte som yta. */
  omrade?: Punkt[];
  /** Ytan i kvadratmeter, som ritas som cirkel när hörnen saknas. */
  ytaKvm?: number | null;
  motesplats?: Punkt | null;
  parkering?: Punkt | null;
}) {
  const rutan = useRef<HTMLDivElement>(null);
  const kartan = useRef<import("leaflet").Map | null>(null);
  const minPosition = useRef<Punkt | null>(null);
  const [positionsfel, setPositionsfel] = useState<string | null>(null);
  const [harPosition, setHarPosition] = useState(false);

  const harOmrade = (omrade?.length ?? 0) >= 3;
  const harCirkel = !harOmrade && typeof ytaKvm === "number" && ytaKvm > 0;

  // Punkterna som text, så att effekten inte startas om vid varje
  // rendering bara för att listan är ett nytt objekt.
  const omradesNyckel = (omrade ?? [])
    .map((p) => `${p.lat},${p.lng}`)
    .join(";");
  const motesNyckel = motesplats ? `${motesplats.lat},${motesplats.lng}` : "";
  const parkeringsNyckel = parkering ? `${parkering.lat},${parkering.lng}` : "";

  useEffect(() => {
    const element = rutan.current;
    if (!element) return;

    let karta: import("leaflet").Map | undefined;
    let vakt: number | undefined;
    let avbruten = false;

    const horn = omradesNyckel
      ? omradesNyckel.split(";").map((par) => {
          const [a, b] = par.split(",").map(Number);
          return [a, b] as [number, number];
        })
      : [];
    const punktUr = (nyckel: string) => {
      if (!nyckel) return null;
      const [a, b] = nyckel.split(",").map(Number);
      return [a, b] as [number, number];
    };

    void import("leaflet").then((L) => {
      // Komponenten kan ha lämnat sidan medan biblioteket laddades.
      if (avbruten || !rutan.current) return;

      karta = L.map(element, {
        center: [lat, lng],
        zoom,
        scrollWheelZoom: false,
        // Knapparna utgår: på en telefon zoomar man med två fingrar, och
        // Leaflets egna kontroller är vita och skär sig mot den mörka ytan.
        zoomControl: false,
        attributionControl: true,
      });
      kartan.current = karta;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(karta);

      // Uppdragsområdet: hörnen om de är angivna, annars en cirkel av rätt
      // storlek kring uppdragets punkt. Cirkeln är ungefärlig och märks som
      // sådan i teckenförklaringen – den säger hur stort området är, inte
      // var gränserna går.
      if (horn.length >= 3) {
        const yta = L.polygon(horn, {
          color: BRAND,
          weight: 2,
          fillColor: BRAND,
          fillOpacity: 0.18,
        }).addTo(karta);
        karta.fitBounds(yta.getBounds(), { padding: [28, 28] });
      } else if (typeof ytaKvm === "number" && ytaKvm > 0) {
        const cirkel = L.circle([lat, lng], {
          radius: Math.sqrt(ytaKvm / Math.PI),
          color: BRAND,
          weight: 2,
          dashArray: "5 5",
          fillColor: BRAND,
          fillOpacity: 0.14,
        }).addTo(karta);
        karta.fitBounds(cirkel.getBounds(), { padding: [28, 28] });
      }

      const nal = (farg: string, storlek: number, ring: string) =>
        L.divIcon({
          className: "",
          html: nalHtml(farg, storlek, ring),
          iconSize: [storlek, storlek],
          iconAnchor: [storlek / 2, storlek / 2],
        });

      L.marker([lat, lng], {
        icon: nal(BRAND, 18, "2px rgba(79,209,197,.45)"),
        title: label,
      }).addTo(karta);

      const motet = punktUr(motesNyckel);
      if (motet) {
        L.marker(motet, {
          icon: nal(WARN, 14, "3px rgba(233,180,76,.3)"),
          title: "Mötesplats",
        }).addTo(karta);
      }
      const parkeringen = punktUr(parkeringsNyckel);
      if (parkeringen) {
        L.marker(parkeringen, {
          icon: nal(GRA, 14, "3px rgba(152,162,163,.25)"),
          title: "Parkering",
        }).addTo(karta);
      }

      if (!visaPosition || !("geolocation" in navigator)) return;

      // "Du är här". Positionen följs så länge vyn är öppen och lämnar
      // aldrig webbläsaren; den ritas bara ut på kartan.
      let egenNal: import("leaflet").Marker | undefined;

      vakt = navigator.geolocation.watchPosition(
        (pos) => {
          if (avbruten || !karta) return;
          const punkt: [number, number] = [
            pos.coords.latitude,
            pos.coords.longitude,
          ];
          minPosition.current = { lat: punkt[0], lng: punkt[1] };
          if (egenNal) egenNal.setLatLng(punkt);
          else {
            egenNal = L.marker(punkt, {
              icon: nal(INFO, 14, "6px rgba(90,169,230,.25)"),
              title: "Du är här",
            }).addTo(karta);
          }
          setHarPosition(true);
          setPositionsfel(null);
        },
        (fel) => {
          if (avbruten) return;
          setHarPosition(false);
          setPositionsfel(
            fel.code === fel.PERMISSION_DENIED
              ? "Positionen är avstängd för appen."
              : "Positionen går inte att hämta just nu.",
          );
        },
        { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
      );
    });

    return () => {
      avbruten = true;
      if (vakt !== undefined) navigator.geolocation.clearWatch(vakt);
      karta?.remove();
      kartan.current = null;
    };
  }, [
    lat,
    lng,
    zoom,
    label,
    visaPosition,
    ytaKvm,
    omradesNyckel,
    motesNyckel,
    parkeringsNyckel,
  ]);

  /** Centrerar kartan på förarens position, när den är känd. */
  const centrera = useCallback(() => {
    const punkt = minPosition.current;
    if (punkt && kartan.current) {
      kartan.current.setView([punkt.lat, punkt.lng], 17);
    }
  }, []);

  const harTeckenforklaring =
    harOmrade || harCirkel || Boolean(motesplats) || Boolean(parkering) || visaPosition;

  return (
    <div>
      <div className="relative">
        <div
          ref={rutan}
          role="img"
          aria-label={`Karta över ${label}`}
          // Bakgrunden sätts på elementet: Leaflets egen stilmall laddas
          // efter vår och skulle annars lysa ljusgrå tills kartrutorna
          // kommit fram.
          style={{ backgroundColor: "var(--color-surface-2)" }}
          className={`w-full overflow-hidden rounded-xl border border-line ${className}`}
        />

        {harTeckenforklaring ? (
          <ul className="pointer-events-none absolute left-3 top-3 z-[400] space-y-1.5 rounded-lg border border-line bg-bg-deep/85 px-3 py-2.5 text-[11px] backdrop-blur">
            {visaPosition ? (
              <Tecken farg={INFO} rund>
                Du är här
              </Tecken>
            ) : null}
            {harOmrade ? (
              <Tecken farg={BRAND}>Uppdragsområde</Tecken>
            ) : harCirkel ? (
              <Tecken farg={BRAND} streckad>
                Uppdragsområde (ca)
              </Tecken>
            ) : null}
            {motesplats ? (
              <Tecken farg={WARN} rund>
                Mötesplats
              </Tecken>
            ) : null}
            {parkering ? (
              <Tecken farg={GRA} rund>
                Parkering
              </Tecken>
            ) : null}
          </ul>
        ) : null}

        {visaPosition ? (
          <button
            type="button"
            onClick={centrera}
            aria-label="Centrera kartan på min position"
            className="absolute right-3 top-3 z-[400] flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-bg-deep/85 text-fg backdrop-blur transition-colors hover:text-brand"
          >
            <TargetIcon className="h-[18px] w-[18px]" />
          </button>
        ) : null}
      </div>

      {visaPosition ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-fg-dim">
          <span
            aria-hidden
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              harPosition ? "bg-info" : "bg-fg-dim"
            }`}
          />
          {positionsfel ??
            (harPosition
              ? "Din position visas i blått och stannar i telefonen."
              : "Söker din position …")}
        </p>
      ) : null}
    </div>
  );
}

/** En rad i teckenförklaringen. */
function Tecken({
  farg,
  rund = false,
  streckad = false,
  children,
}: {
  farg: string;
  rund?: boolean;
  streckad?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2 text-fg">
      <span
        aria-hidden
        className={`h-3 w-3 shrink-0 ${rund ? "rounded-full" : "rounded-[3px]"}`}
        style={
          rund
            ? { backgroundColor: farg }
            : {
                border: `1.5px ${streckad ? "dashed" : "solid"} ${farg}`,
                backgroundColor: `${farg}2e`,
              }
        }
      />
      {children}
    </li>
  );
}

/** Länk ut till telefonens kartapp, med vägbeskrivning till punkten. */
export function Vagbeskrivning({
  lat,
  lng,
  adress,
  className = "",
}: {
  lat?: number | null;
  lng?: number | null;
  adress: string;
  className?: string;
}) {
  const mal =
    lat !== null && lat !== undefined && lng !== null && lng !== undefined
      ? `${lat},${lng}`
      : adress;
  return (
    <a
      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mal)}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Öppna vägbeskrivning i kartappen"
      className={className}
    >
      <RouteIcon className="h-[18px] w-[18px]" />
    </a>
  );
}

/**
 * Platsrutan när koordinater saknas. Bättre än en tom kartruta: den säger
 * vad som är känt om platsen och varför kartan inte finns.
 */
export function UtanKarta({
  adress,
  className = "h-[220px]",
}: {
  adress: string;
  className?: string;
}) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface-2 px-6 text-center ${className}`}
    >
      <MapPinIcon className="h-6 w-6 text-fg-dim" />
      <p className="text-sm text-fg">{adress}</p>
      <p className="text-xs text-fg-dim">
        Ingen koordinat är angiven för uppdraget, så kartan kan inte visas.
      </p>
    </div>
  );
}
