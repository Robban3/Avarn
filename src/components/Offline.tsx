"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "./icons";
import {
  hamtaKo,
  koLangd,
  laggIKo,
  prenumereraKo,
  serverKoLangd,
  taBortUrKo,
} from "@/lib/offlineko";
import { registerMissionEvent } from "@/app/(app)/uppdrag/actions";

/**
 * Offline-läget så som det syns för föraren.
 *
 * Tre delar som hänger ihop: statusraden som säger vad som gäller,
 * synkaren som tömmer kön när uppkopplingen kommer tillbaka, och
 * formuläret som lägger en registrering i kön i stället för att tappa
 * den. Servicearbetaren i public/sw.js sköter cachen av sidorna.
 */

/* ------------------------------------------------------ Uppkopplingen */

/**
 * Uppkopplingen, både som signal och som fråga.
 *
 * Webbläsarens online- och offline-händelser är inte att lita på i en
 * telefon som tappar täckning i en hall – de kommer sent eller inte
 * alls. Därför frågas flaggan också en gång i sekunden, så att
 * statusraden säger vad som faktiskt gäller och inte vad som gällde när
 * signalen senast kom fram.
 */
const prenumereraNat = (vid: () => void) => {
  window.addEventListener("online", vid);
  window.addEventListener("offline", vid);
  const id = setInterval(vid, 1000);
  return () => {
    window.removeEventListener("online", vid);
    window.removeEventListener("offline", vid);
    clearInterval(id);
  };
};

const arUppkopplad = () => navigator.onLine;
/** Servern renderar alltid som uppkopplad; den vet inget om telefonen. */
const serverUppkopplad = () => true;

function useUppkopplad() {
  return useSyncExternalStore(
    prenumereraNat,
    arUppkopplad,
    serverUppkopplad,
  );
}

function useKolangd() {
  return useSyncExternalStore(prenumereraKo, koLangd, serverKoLangd);
}

/* --------------------------------------------------------- Statusraden */

type Lage = "online" | "synkar" | "offline" | "klart";

/**
 * Statusraden med fyra lägen.
 *
 * Det är den här tryggheten som betyder något i en bagagehall: att det
 * står svart på vitt att registreringen ligger kvar i telefonen och
 * kommer fram sedan.
 */
export function Offlinestatus() {
  const router = useRouter();
  const uppkopplad = useUppkopplad();
  const kolangd = useKolangd();
  const [synkar, setSynkar] = useState(false);
  const [nyssKlart, setNyssKlart] = useState(false);
  // Bara en synkning i taget. Kön krymper medan den töms, och varje
  // ändring väcker effekten igen – utan spärren skulle en andra omgång
  // hinna skicka en post som den första redan skickat men inte hunnit
  // stryka, och registreringen blivit dubbel.
  const pagar = useRef(false);

  const synka = useCallback(async () => {
    if (pagar.current) return;
    const poster = await hamtaKo();
    if (poster.length === 0) return;

    pagar.current = true;
    setSynkar(true);
    try {
      for (const post of poster) {
        const data = new FormData();
        for (const [namn, varde] of post.falt) data.append(namn, varde);
        try {
          if (post.typ === "handelse") await registerMissionEvent(data);
          if (post.id !== undefined) await taBortUrKo(post.id);
        } catch {
          // Kommer den inte fram får den ligga kvar och prövas igen.
          // En registrering ska aldrig försvinna för att nätet svajade.
          break;
        }
      }
      // Servern har fått registreringarna, men sidan visar fortfarande
      // det den renderades med. Utan en omritning står räknarna kvar på
      // noll trots att markeringarna kommit fram.
      router.refresh();
      setNyssKlart(true);
    } finally {
      pagar.current = false;
      setSynkar(false);
    }
  }, [router]);

  // Kön töms så snart det finns uppkoppling och något i den: när nätet
  // kommer tillbaka, när en ny registrering läggs i kön, och en gång vid
  // start för det som köades innan appen stängdes.
  //
  // Synkningen startas efter renderingen och inte i den: den sätter
  // tillstånd, och det ska inte ske mitt i samma målning som just
  // upptäckte att det finns något att skicka.
  useEffect(() => {
    if (!uppkopplad || kolangd === 0) return;
    const id = setTimeout(() => void synka(), 0);
    return () => clearTimeout(id);
  }, [uppkopplad, kolangd, synka]);

  // "Allt synkroniserat" är ett kvitto och ingen vilostatus; efter en
  // stund räcker det med att det står Online.
  useEffect(() => {
    if (!nyssKlart) return;
    const id = setTimeout(() => setNyssKlart(false), 5000);
    return () => clearTimeout(id);
  }, [nyssKlart]);

  const lage: Lage = !uppkopplad
    ? "offline"
    : synkar || kolangd > 0
      ? "synkar"
      : nyssKlart
        ? "klart"
        : "online";

  const text =
    lage === "offline"
      ? kolangd > 0
        ? `Offline – ${kolangd} ${kolangd === 1 ? "registrering sparad" : "registreringar sparade"} i telefonen`
        : "Offline – registreringar sparas i telefonen"
      : lage === "synkar"
        ? "Synkar …"
        : lage === "klart"
          ? "Allt synkroniserat"
          : "Online";

  const farg =
    lage === "offline"
      ? "text-warn"
      : lage === "synkar"
        ? "text-info"
        : lage === "klart"
          ? "text-ok"
          : "text-fg-muted";

  const prick =
    lage === "offline"
      ? "bg-warn"
      : lage === "synkar"
        ? "bg-info"
        : "bg-ok";

  return (
    // Klistrad under sidhuvudet: föraren registrerar längre ner på
    // sidan, och beskedet om att det som trycks sparas i telefonen är
    // värdelöst om man måste rulla upp för att se det.
    <div
      role="status"
      data-lage={lage}
      className={`sticky top-14 z-20 -mx-4 mb-4 flex items-center gap-2 border-b border-line-soft bg-surface px-4 py-[7px] text-[11px] ${farg}`}
    >
      {lage === "klart" ? (
        <CheckIcon className="h-3 w-3" />
      ) : (
        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${prick}`} />
      )}
      {text}
    </div>
  );
}

/* ------------------------------------------------------- Köbart formulär */

/**
 * Ett formulär som alltid lägger registreringen i telefonen först.
 *
 * Kön är huvudvägen och inte undantaget. Att fråga navigator.onLine och
 * skicka direkt när svaret är ja såg enklare ut, men flaggan hinner
 * ligga kvar på "uppkopplad" en stund efter att täckningen tagit slut –
 * och då gick registreringen förlorad i ett misslyckat anrop. Nu läggs
 * den alltid i kön och skickas därifrån, så att ingenting kan försvinna
 * mellan trycket och servern.
 *
 * Utan JavaScript finns ingen onSubmit, och formuläret går rakt till
 * sin server action som förut. Ett tryck ska fungera även innan sidans
 * kod hunnit ladda.
 */
export function Kobartformular({
  action,
  typ,
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  typ: "handelse";
  className?: string;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(handelse) => {
        handelse.preventDefault();
        const falt = [
          ...new FormData(handelse.currentTarget).entries(),
        ].filter(
          (post): post is [string, string] => typeof post[1] === "string",
        );
        handelse.currentTarget.reset();
        void laggIKo({ typ, falt });
      }}
    >
      {children}
    </form>
  );
}
