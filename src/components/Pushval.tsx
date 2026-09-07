"use client";

import { useCallback, useEffect, useState } from "react";
import { SectionHeader } from "./ui";

/**
 * Reglaget för notiser på den här telefonen.
 *
 * Push kan misslyckas av fyra helt olika skäl, och ett avstängt reglage
 * säger ingenting om vilket. Därför beskriver komponenten läget i klartext
 * i stället för att bara se inaktiv ut – särskilt det första fallet, som är
 * det vanligaste och det mest överraskande:
 *
 * **iPhone skickar bara notiser till appar som lagts till på hemskärmen.**
 * I ett Safari-fönster finns `PushManager` inte alls, hur nya iOS än är.
 * Utan den förklaringen ser funktionen ut att vara trasig.
 *
 * Prenumerationen hör till enheten, inte till kontot: samma person kan ha
 * appen på mobilen och på en surfplatta och vill bli väckt på båda.
 */

type Lage =
  | "laddar"
  | "behover-hemskarm"
  | "stods-ej"
  | "nekad"
  | "av"
  | "på";

/** Den publika nyckeln som råa byte, som pushManager.subscribe vill ha den. */
function nyckelTillByte(base64url: string): ArrayBuffer {
  const fyllt = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const rad = atob(fyllt.padEnd(Math.ceil(fyllt.length / 4) * 4, "="));
  const buffert = new ArrayBuffer(rad.length);
  const ut = new Uint8Array(buffert);
  for (let i = 0; i < rad.length; i += 1) ut[i] = rad.charCodeAt(i);
  return buffert;
}

/**
 * Körs appen från hemskärmen?
 *
 * iOS svarar på `navigator.standalone`, övriga på display-mode. Frågan
 * ställs bara för att kunna ge rätt förklaring – saknas stödet är det
 * ändå avgjort.
 */
function franHemskarmen() {
  const iOS = "standalone" in navigator;
  if (iOS) return (navigator as { standalone?: boolean }).standalone === true;
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function Pushval({ publikNyckel }: { publikNyckel: string }) {
  const [lage, setLage] = useState<Lage>("laddar");
  const [arbetar, setArbetar] = useState(false);

  useEffect(() => {
    let avbruten = false;

    (async () => {
      const stods =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      if (!stods) {
        // Saknas PushManager på en iPhone är det nästan alltid för att
        // appen körs i Safari och inte från hemskärmen.
        const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        if (!avbruten) {
          setLage(iOS && !franHemskarmen() ? "behover-hemskarm" : "stods-ej");
        }
        return;
      }

      if (Notification.permission === "denied") {
        if (!avbruten) setLage("nekad");
        return;
      }

      const registrering = await navigator.serviceWorker.ready;
      const befintlig = await registrering.pushManager.getSubscription();
      if (!avbruten) setLage(befintlig ? "på" : "av");
    })().catch(() => {
      if (!avbruten) setLage("stods-ej");
    });

    return () => {
      avbruten = true;
    };
  }, []);

  const slaPa = useCallback(async () => {
    setArbetar(true);
    try {
      const tillstand = await Notification.requestPermission();
      if (tillstand !== "granted") {
        setLage(tillstand === "denied" ? "nekad" : "av");
        return;
      }

      const registrering = await navigator.serviceWorker.ready;
      const prenumeration = await registrering.pushManager.subscribe({
        // Krävs av webbläsaren: varje push måste leda till en synlig notis.
        // Servicearbetaren visar en även när hämtningen misslyckas.
        userVisibleOnly: true,
        applicationServerKey: nyckelTillByte(publikNyckel),
      });

      const svar = await fetch("/api/push/prenumerera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prenumeration.toJSON()),
      });
      if (!svar.ok) throw new Error("kunde inte sparas");

      setLage("på");
    } catch {
      setLage("av");
    } finally {
      setArbetar(false);
    }
  }, [publikNyckel]);

  const slaAv = useCallback(async () => {
    setArbetar(true);
    try {
      const registrering = await navigator.serviceWorker.ready;
      const prenumeration = await registrering.pushManager.getSubscription();
      if (prenumeration) {
        // Servern först: lyckas avregistreringen i webbläsaren men inte
        // hos oss står en död adress kvar och tar emot utskick.
        await fetch("/api/push/prenumerera", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: prenumeration.endpoint }),
        });
        await prenumeration.unsubscribe();
      }
      setLage("av");
    } finally {
      setArbetar(false);
    }
  }, []);

  if (lage === "laddar") return null;

  const FORKLARINGAR: Partial<Record<Lage, string>> = {
    "behover-hemskarm":
      "Lägg till appen på hemskärmen först. iPhone skickar bara notiser till appar som installerats därifrån – dela-knappen, sedan Lägg till på hemskärmen.",
    "stods-ej": "Den här webbläsaren kan inte ta emot notiser.",
    nekad:
      "Notiser är blockerade för appen. Slå på dem i telefonens inställningar, under Notiser.",
  };

  const forklaring = FORKLARINGAR[lage];

  return (
    <>
      <SectionHeader title="Notiser" />
      <div className="card p-4">
        {forklaring ? (
          <p className="text-sm text-fg-muted">{forklaring}</p>
        ) : (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Notiser på den här enheten</p>
              <p className="mt-0.5 text-xs text-fg-dim">
                {lage === "på"
                  ? "Du väcks vid uppdrag, kommentarer och certifikat som går ut."
                  : "Få veta om uppdrag och kommentarer utan att öppna appen."}
              </p>
            </div>
            <button
              type="button"
              onClick={lage === "på" ? slaAv : slaPa}
              disabled={arbetar}
              aria-pressed={lage === "på"}
              className={
                lage === "på"
                  ? "btn btn-secondary shrink-0"
                  : "btn btn-primary shrink-0"
              }
            >
              {arbetar ? "…" : lage === "på" ? "Stäng av" : "Slå på"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
