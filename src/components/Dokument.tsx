"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { PlusIcon, TrashIcon } from "./icons";
import {
  removeMissionDocument,
  uploadMissionDocument,
  type DokumentFormState,
} from "@/app/(app)/uppdrag/actions";

/**
 * De delar av dokumentfliken som behöver ett eget läge i webbläsaren:
 * filväljaren, och beskedet om en fil finns kvar i telefonen.
 */

/* --------------------------------------------------------- Offline-status */

/**
 * "Tillgänglig offline" – men bara när det är sant.
 *
 * Statusen läses ur webbläsarens egen cache i stället för ur databasen.
 * Ett dokument som kräver uppkoppling får ingen status alls; frånvaron är
 * beskedet, och en text som lovar offline när filen inte finns i telefonen
 * är värre än ingen text i en bagagehall utan täckning.
 *
 * Ingenting fyller cachen ännu – det gör servicearbetaren i offline-steget.
 * Fram till dess visar den här raden med rätta ingenting.
 */
export function OfflineMarkering({ url }: { url: string }) {
  const [cachad, setCachad] = useState(false);

  useEffect(() => {
    let avbruten = false;
    // caches saknas i osäkra sammanhang och i äldre webbläsare; då är
    // svaret "vet inte", vilket visas som ingen status.
    if (typeof caches === "undefined") return;
    caches
      .match(url)
      .then((svar) => {
        if (!avbruten && svar) setCachad(true);
      })
      .catch(() => {});
    return () => {
      avbruten = true;
    };
  }, [url]);

  if (!cachad) return null;

  return (
    <span className="mt-[3px] flex items-center gap-1.5 text-[11px] text-fg-dim">
      <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-ok" />
      Tillgänglig offline
    </span>
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
