"use client";

import { useEffect, useRef } from "react";
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
}: {
  lat: number;
  lng: number;
  /** Visas i nålens ruta, t.ex. mötesplatsen. */
  label: string;
  zoom?: number;
  className?: string;
}) {
  const rutan = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = rutan.current;
    if (!element) return;

    let karta: import("leaflet").Map | undefined;
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
    });

    return () => {
      avbruten = true;
      karta?.remove();
    };
  }, [lat, lng, zoom, label]);

  return (
    <div
      ref={rutan}
      role="img"
      aria-label={`Karta över ${label}`}
      // Bakgrunden sätts på elementet: Leaflets egen stilmall laddas efter
      // vår och skulle annars lysa ljusgrå tills kartrutorna kommit fram.
      style={{ backgroundColor: "var(--color-surface-2)" }}
      className={`w-full overflow-hidden rounded-xl border border-line ${className}`}
    />
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
