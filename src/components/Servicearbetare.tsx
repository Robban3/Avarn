"use client";

import { useEffect } from "react";

/**
 * Registrerar servicearbetaren, som cachar appens resurser och sidor.
 *
 * Ligger i den inloggade delen av appen och inte i rotlayouten: en
 * utloggad besökare har inget att cacha, och cachen ska inte finnas till
 * innan någon loggat in.
 */
export function Servicearbetare() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Flaggan talar om för servicearbetaren att den inte får cacha
    // utvecklingsserverns filer, som byter innehåll på samma adress.
    const adress =
      process.env.NODE_ENV === "production" ? "/sw.js" : "/sw.js?dev=1";
    navigator.serviceWorker.register(adress).catch(() => {
      // Går det inte fungerar appen ändå, bara utan offline-läge.
    });
  }, []);

  return null;
}

/**
 * Tömmer cachen och kön vid sessionsgränsen.
 *
 * Ligger på inloggningssidan, dit man kommer både när man loggar ut och
 * när man loggar in. Utan det här skulle nästa användare på samma telefon
 * kunna öppna föregående användares uppdrag ur cachen.
 */
export function Rensacache() {
  useEffect(() => {
    void (async () => {
      try {
        for (const namn of await caches.keys()) await caches.delete(namn);
      } catch {
        // Cache API saknas i osäkra sammanhang; då finns inget att rensa.
      }
      navigator.serviceWorker?.controller?.postMessage({ typ: "rensa-cache" });
      try {
        indexedDB.deleteDatabase("avarn-offline");
      } catch {
        // Samma sak: finns den inte behöver den inte tömmas.
      }
    })();
  }, []);

  return null;
}
