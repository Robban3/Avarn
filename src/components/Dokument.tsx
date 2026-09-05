"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useFormStatus } from "react-dom";
import { PlusIcon, TrashIcon } from "./icons";
import {
  arCachad,
  cacheversion,
  forhamta,
  hamtarNu,
  prenumereraCache,
  prova,
  serverCacheversion,
} from "@/lib/dokumentcache";
import {
  removeMissionDocument,
  uploadMissionDocument,
  type DokumentFormState,
} from "@/app/(app)/uppdrag/actions";

/**
 * De delar av dokumentfliken som behöver ett eget läge i webbläsaren:
 * filväljaren, förhämtningen till telefonen, och beskedet om en fil finns
 * kvar där.
 */

/* --------------------------------------------------------- Offline-status */

/** Ritar om när något lagts i cachen eller en hämtning börjat eller slutat. */
function useCacheversion() {
  return useSyncExternalStore(
    prenumereraCache,
    cacheversion,
    serverCacheversion,
  );
}

/**
 * "Tillgänglig offline" – men bara när det är sant.
 *
 * Statusen läses ur webbläsarens egen cache i stället för ur databasen.
 * Ett dokument som kräver uppkoppling får ingen status alls; frånvaron är
 * beskedet, och en text som lovar offline när filen inte finns i telefonen
 * är värre än ingen text i en bagagehall utan täckning.
 */
export function OfflineMarkering({ url }: { url: string }) {
  useCacheversion();

  // Avläsningen är asynkron och svaret hamnar i den delade lagringen, som
  // ritar om alla rader som väntar på det. Därför inget eget tillstånd.
  useEffect(() => {
    prova(url);
  }, [url]);

  if (!arCachad(url)) return null;

  return (
    <span className="mt-[3px] flex items-center gap-1.5 text-[11px] text-fg-dim">
      <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-ok" />
      Tillgänglig offline
    </span>
  );
}

/* ------------------------------------------------------------ Förhämtning */

/**
 * Uppkopplingen. Samma avvägning som i Offline.tsx: webbläsarens
 * online-händelser kommer sent eller inte alls i en telefon som tappar
 * täckning, så flaggan frågas också med jämna mellanrum. Här räcker det
 * med var femte sekund – en hämtning som börjar några sekunder sent
 * märks inte, till skillnad från en statusrad som ljuger.
 */
const prenumereraNat = (vid: () => void) => {
  window.addEventListener("online", vid);
  window.addEventListener("offline", vid);
  const id = setInterval(vid, 5000);
  return () => {
    window.removeEventListener("online", vid);
    window.removeEventListener("offline", vid);
    clearInterval(id);
  };
};

/**
 * Hämtar hem uppdragets dokument så snart fliken öppnas.
 *
 * Poängen med hela dokumentfliken är att underlaget ska finnas där
 * täckningen inte gör det. Att vänta på att föraren öppnar varje fil är
 * att lita på att hen gör det medan hen fortfarande har nät – och det är
 * precis det man inte tänker på förrän det är för sent.
 *
 * Raden visar vad som faktiskt ligger i telefonen. Den räknar bara de
 * filer som hämtas hem; filmer lämnas därhän, eftersom en bilaga kan vara
 * 25 MB och ingen ska ladda ner den på mobildata utan att ha bett om det.
 */
export function Forhamtade({
  urler,
  filmer = 0,
}: {
  /** Adresserna som ska finnas i telefonen. */
  urler: string[];
  /** Antal filmer som hoppas över, för textens skull. */
  filmer?: number;
}) {
  useCacheversion();
  const uppkopplad = useSyncExternalStore(
    prenumereraNat,
    () => navigator.onLine,
    () => true,
  );

  // Hämtningen startas efter renderingen och görs om när uppkopplingen
  // kommer tillbaka.
  //
  // Effekten hänger på adresserna som en sträng och inte på listan:
  // `urler` är ett nytt fält vid varje rendering, och statusraden ritar om
  // sig varje gång en fil kommit fram – med listan som beroende hade
  // hämtningen startats om vid varje sådan omritning.
  const nyckel = urler.join(" ");
  useEffect(() => {
    if (!uppkopplad || !nyckel) return;
    void forhamta(nyckel.split(" "));
  }, [nyckel, uppkopplad]);

  if (urler.length === 0) return null;

  const klara = urler.filter(arCachad).length;
  const alla = klara === urler.length;
  const hamtar = hamtarNu() > 0;

  const text = hamtar
    ? `Hämtar dokument till telefonen … (${klara} av ${urler.length})`
    : alla
      ? urler.length === 1
        ? "Dokumentet finns i telefonen"
        : `Alla ${urler.length} dokument finns i telefonen`
      : uppkopplad
        ? `${klara} av ${urler.length} dokument finns i telefonen`
        : `${klara} av ${urler.length} dokument finns i telefonen – resten hämtas när du har täckning`;

  return (
    <p
      role="status"
      className={`mb-3 flex items-center gap-2 text-[11px] ${
        alla ? "text-ok" : "text-fg-dim"
      }`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          alla ? "bg-ok" : hamtar ? "bg-info" : "bg-fg-dim"
        }`}
      />
      <span>
        {text}
        {filmer > 0 ? (
          <>
            {". "}
            {filmer === 1 ? "Filmen hämtas" : "Filmer hämtas"} när du öppnar{" "}
            {filmer === 1 ? "den" : "dem"}.
          </>
        ) : null}
      </span>
    </p>
  );
}

/* ------------------------------------------------------------ Uppladdning */

function Sparaknapp() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`btn btn-primary flex-1 ${pending ? "opacity-60" : ""}`}
    >
      {pending ? "Laddar upp …" : "Lägg till"}
    </button>
  );
}

/**
 * Knappen som fäller ut filväljaren.
 *
 * Utfällt i stället för alltid synligt: listan är det viktiga, och en
 * filväljare som ligger uppslagen mitt i den drar blicken från den.
 */
export function LaggTillBilaga({
  missionId,
  etikett = "Lägg till bilaga",
  variant = "lank",
}: {
  missionId: string;
  etikett?: string;
  /** "lank" i sektionsrubriken, "knapp" i det tomma läget. */
  variant?: "lank" | "knapp";
}) {
  const [oppen, setOppen] = useState(false);
  const [state, action] = useActionState<DokumentFormState, FormData>(
    uploadMissionDocument,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Formuläret töms när filen gått iväg, så att nästa bilaga börjar tomt.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOppen((v) => !v)}
        aria-expanded={oppen}
        className={
          variant === "knapp"
            ? "btn btn-secondary mt-5"
            : "text-xs font-medium text-brand"
        }
      >
        {variant === "knapp" ? (
          <>
            <PlusIcon className="h-[18px] w-[18px]" />
            {etikett}
          </>
        ) : (
          `+ ${oppen ? "Stäng" : "Lägg till"}`
        )}
      </button>

      {oppen ? (
        <form
          ref={formRef}
          action={action}
          className="mt-3 rounded-xl border border-line bg-surface-2 p-3"
        >
          <input type="hidden" name="missionId" value={missionId} />
          <label className="field-label" htmlFor="fil">
            Fil (pdf, bild, film eller text – högst 25 MB)
          </label>
          <input
            id="fil"
            name="fil"
            type="file"
            required
            accept=".pdf,.txt,.csv,image/*,video/mp4,video/quicktime"
            className="field"
          />
          {state.error ? (
            <p className="mt-2 text-sm text-danger">{state.error}</p>
          ) : null}
          {state.ok ? (
            <p className="mt-2 text-sm text-ok">{state.ok}</p>
          ) : null}
          <div className="mt-3 flex gap-2.5">
            <button
              type="button"
              onClick={() => setOppen(false)}
              className="btn btn-secondary flex-1"
            >
              Avbryt
            </button>
            <Sparaknapp />
          </div>
        </form>
      ) : null}
    </>
  );
}

/** Papperskorgen på en rad man själv lagt upp. */
export function TaBortDokument({
  missionId,
  dokumentId,
  namn,
}: {
  missionId: string;
  dokumentId: string;
  namn: string;
}) {
  return (
    <form action={removeMissionDocument}>
      <input type="hidden" name="missionId" value={missionId} />
      <input type="hidden" name="dokumentId" value={dokumentId} />
      <button
        type="submit"
        aria-label={`Ta bort ${namn}`}
        className="flex h-8 w-8 items-center justify-center rounded-full text-fg-dim transition-colors hover:bg-surface-3 hover:text-danger"
      >
        <TrashIcon className="h-[18px] w-[18px]" />
      </button>
    </form>
  );
}
