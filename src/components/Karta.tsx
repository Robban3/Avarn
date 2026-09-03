"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapPinIcon } from "./icons";

/**
 * Karta över uppdragets plats.
 *
 * Rutorna kommer från OpenStreetMap och hämtas av besökarens webbläsare,
 * inte av servern – ingen nyckel behövs, och upphovsangivelsen ligger i
 * hörnet som licensen kräver.
 *
 * Leaflet laddas i en useEffect och inte genom react-leaflet: fyrtio rader
 * här väger lättare än ett omslutande bibliotek med egna versionskrav mot
 * React. Biblioteket rör vid `window`, så det importeras först när
 * komponenten faktiskt monterats i webbläsaren.
 *
 * Kartan hamnar inte i vägen på en mobil: rullning med fingret panorerar
 * sidan tills man tryckt på kartan, och hjulet zoomar bara med Ctrl.
 */
export function Karta({
  lat,
  lng,
  label,
  zoom = 15,
  className = "h-[220px]",
  visaPosition = false,
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
}) {
  const rutan = useRef<HTMLDivElement>(null);
  const [positionsfel, setPositionsfel] = useState<string | null>(null);
  const [harPosition, setHarPosition] = useState(false);

  useEffect(() => {
    const element = rutan.current;
    if (!element) return;

    let karta: import("leaflet").Map | undefined;
    let vakt: number | undefined;
    let avbruten = false;

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

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(karta);

      // Nålen ritas som en egen markering i stället för Leaflets
      // standardbild – den ligger i en bildfil vi ändå inte skulle nå
      // genom bundlern, och en ritad nål följer temats färger.
      const nal = L.divIcon({
        className: "",
        html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#4fd1c5;border:3px solid #0b0e0f;box-shadow:0 0 0 2px rgba(79,209,197,.45)"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      L.marker([lat, lng], { icon: nal, title: label }).addTo(karta);

      if (!visaPosition || !("geolocation" in navigator)) return;

      // "Du är här". Positionen följs så länge vyn är öppen och lämnar
      // aldrig webbläsaren; den ritas bara ut på kartan.
      const egenIkon = L.divIcon({
        className: "",
        html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#5aa9e6;border:3px solid #0b0e0f;box-shadow:0 0 0 6px rgba(90,169,230,.25)"></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      let egenNal: import("leaflet").Marker | undefined;

      vakt = navigator.geolocation.watchPosition(
        (pos) => {
          if (avbruten || !karta) return;
          const punkt: [number, number] = [
            pos.coords.latitude,
            pos.coords.longitude,
          ];
          if (egenNal) egenNal.setLatLng(punkt);
          else {
            egenNal = L.marker(punkt, {
              icon: egenIkon,
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
    };
  }, [lat, lng, zoom, label, visaPosition]);

  return (
    <div>
      <div
        ref={rutan}
        role="img"
        aria-label={`Karta över ${label}`}
        // Bakgrunden sätts på elementet: Leaflets egen stilmall laddas
        // efter vår och skulle annars lysa ljusgrå tills kartrutorna kommit
        // fram.
        style={{ backgroundColor: "var(--color-surface-2)" }}
        className={`w-full overflow-hidden rounded-xl border border-line ${className}`}
      />
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
