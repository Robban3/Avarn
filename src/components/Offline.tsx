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
import { CheckIcon, MinusIcon, PlusIcon } from "./icons";
import {
  hamtaKo,
  koLangd,
  laggIKo,
  prenumereraKo,
  serverKoLangd,
  raknaForsok,
  taBortUrKo,
  MAX_FORSOK,
  type Kotyp,
} from "@/lib/offlineko";
import {
  registerMissionEvent,
  setChecklistItem,
  setMissionProgress,
} from "@/app/(app)/uppdrag/actions";

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
          if (post.typ === "checklista") await setChecklistItem(data);
          if (post.typ === "framdrift") await setMissionProgress(data);
          if (post.id !== undefined) await taBortUrKo(post.id);
        } catch {
          // Kommer den inte fram får den ligga kvar och prövas igen. En
          // registrering ska aldrig försvinna för att nätet svajade.
          //
          // Men den får inte stå i vägen för resten heller. Misslyckas
          // den flera gånger i rad är det inte nätet det hänger på, och
          // då hoppas den över så att det som ligger bakom kommer fram.
          // Posten ligger kvar och räknas fortfarande.
          if (post.id !== undefined) await raknaForsok(post.id);
          if ((post.forsok ?? 0) + 1 < MAX_FORSOK) break;
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
  typ: Kotyp;
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

/* ------------------------------------------- Checklistan och framdriften */

/**
 * Ett värde som visar förarens tryck direkt, men följer servern så snart
 * den svarat.
 *
 * Utan uppkoppling kommer svaret först långt senare, och en knapp som
 * inte rör sig när man trycker på den trycker man på igen. Det lokala
 * värdet gäller därför tills serverns hunnit ikapp, och lämnas sedan
 * över – justeringen görs under renderingen, som React föreskriver för
 * tillstånd som följer en propp.
 */
function useEgetVarde<T>(franServern: T, likhet: (a: T, b: T) => boolean) {
  const kolangd = useKolangd();
  const [eget, setEget] = useState(franServern);
  const [sett, setSett] = useState(franServern);

  // Ligger det kvar oskickade tryck i kön är serverns värde äldre än
  // förarens. Två snabba tryck köar två poster; när den första kommit
  // fram ritas sidan om med det värdet, och utan spärren hade det
  // hoppat tillbaka ett steg innan den andra hann fram.
  if (kolangd === 0 && !likhet(franServern, sett)) {
    setSett(franServern);
    setEget(franServern);
  }

  return [eget, setEget] as const;
}

/**
 * Checklistan i den operativa vyn.
 *
 * Avbockningen sätter ett läge och växlar inte: en köad registrering ska
 * tåla att skickas om utan att ta tillbaka sig själv.
 */
export function Checklista({
  missionId,
  punkter,
  avbockade,
  action,
}: {
  missionId: string;
  punkter: string[];
  avbockade: string[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [klara, setKlara] = useEgetVarde(avbockade, (a, b) =>
    a.length === b.length && a.every((v, i) => v === b[i]),
  );
  const avbockad = (punkt: string) => klara.includes(punkt);

  const satt = (punkt: string, nyttLage: boolean) => {
    setKlara(
      nyttLage ? [...klara, punkt] : klara.filter((v) => v !== punkt),
    );
    const data = new FormData();
    data.append("missionId", missionId);
    data.append("punkt", punkt);
    data.append("klar", nyttLage ? "1" : "0");
    void laggIKo({ typ: "checklista", falt: [...data.entries()] as [string, string][] });
  };

  return (
    <>
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h2 className="section-label">Checklista</h2>
        <span className="text-xs font-medium text-brand">
          {klara.length} / {punkter.length} klara
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-3">
        {punkter.map((punkt) => {
          const klar = avbockad(punkt);
          return (
            // Formuläret finns kvar för den som inte fått sidans kod
            // ännu: då går trycket rakt till sin server action.
            <form
              key={punkt}
              action={action}
              onSubmit={(handelse) => {
                handelse.preventDefault();
                satt(punkt, !klar);
              }}
            >
              <input type="hidden" name="missionId" value={missionId} />
              <input type="hidden" name="punkt" value={punkt} />
              <input type="hidden" name="klar" value={klar ? "0" : "1"} />
              <button
                type="submit"
                aria-pressed={klar}
                className="flex w-full items-center gap-2.5 py-2 text-left transition-opacity hover:opacity-80"
              >
                <span
                  aria-hidden
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${
                    klar
                      ? "border-brand bg-brand text-[#06201e]"
                      : "border-line bg-surface-2 text-transparent"
                  }`}
                >
                  <CheckIcon className="h-3 w-3" />
                </span>
                <span
                  className={`min-w-0 flex-1 text-[13px] leading-tight ${
                    klar ? "text-fg-muted" : "text-fg"
                  }`}
                >
                  {punkt}
                </span>
              </button>
            </form>
          );
        })}
      </div>
    </>
  );
}

/** Mätaren för genomsökt andel, i steg om tio procent. */
export function Genomsokt({
  missionId,
  andel,
  action,
}: {
  missionId: string;
  andel: number;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [varde, setVarde] = useEgetVarde(andel, (a, b) => a === b);

  const flytta = (steg: number) => {
    const nytt = Math.min(100, Math.max(0, varde + steg));
    if (nytt === varde) return;
    setVarde(nytt);
    const data = new FormData();
    data.append("missionId", missionId);
    data.append("andel", String(nytt));
    void laggIKo({ typ: "framdrift", falt: [...data.entries()] as [string, string][] });
  };

  const knapp =
    "flex h-5 w-5 items-center justify-center rounded border border-line bg-surface-2 text-fg transition-colors hover:bg-surface-3";

  return (
    <>
      <div className="mt-1.5 flex items-center gap-1.5 whitespace-nowrap">
        <Stegknapp
          missionId={missionId}
          andel={Math.max(0, varde - 10)}
          action={action}
          onTryck={() => flytta(-10)}
          etikett="Minska genomsökt område med tio procent"
          className={knapp}
        >
          <MinusIcon className="h-3 w-3" />
        </Stegknapp>
        <span className="text-[15px] font-bold tabular-nums text-brand">
          {varde} %
        </span>
        <Stegknapp
          missionId={missionId}
          andel={Math.min(100, varde + 10)}
          action={action}
          onTryck={() => flytta(10)}
          etikett="Öka genomsökt område med tio procent"
          className={knapp}
        >
          <PlusIcon className="h-3 w-3" />
        </Stegknapp>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-3"
        role="progressbar"
        aria-valuenow={varde}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Genomsökt område"
      >
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${varde}%` }}
        />
      </div>
    </>
  );
}

function Stegknapp({
  missionId,
  andel,
  action,
  onTryck,
  etikett,
  className,
  children,
}: {
  missionId: string;
  andel: number;
  action: (formData: FormData) => void | Promise<void>;
  onTryck: () => void;
  etikett: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(handelse) => {
        handelse.preventDefault();
        onTryck();
      }}
    >
      <input type="hidden" name="missionId" value={missionId} />
      <input type="hidden" name="andel" value={andel} />
      <button type="submit" aria-label={etikett} className={className}>
        {children}
      </button>
    </form>
  );
}
