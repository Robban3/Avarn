"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { PlusIcon } from "@/components/icons";
import { createCertification, type CertFormState } from "./actions";

type CertType = {
  id: string;
  name: string;
  validityMonths: number;
  appliesTo: string;
};

type Subject = { value: string; label: string; appliesTo: string };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Registrerar …" : "Registrera certifikat"}
    </button>
  );
}

/** Dagens datum som YYYY-MM-DD i svensk tidszon. */
function today() {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "01";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function CertForm({
  types,
  subjects,
}: {
  types: CertType[];
  subjects: Subject[];
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<CertFormState, FormData>(
    createCertification,
    {},
  );
  const [typeId, setTypeId] = useState(types[0]?.id ?? "");
  const [issuedAt, setIssuedAt] = useState(today());

  const type = types.find((t) => t.id === typeId);

  // Bara mottagare som certifikattypen faktiskt gäller för.
  const validSubjects = useMemo(
    () => subjects.filter((s) => !type || s.appliesTo === type.appliesTo),
    [subjects, type],
  );

  // Förhandsvisar utgångsdatumet så att det syns innan man sparar.
  const expiryPreview = useMemo(() => {
    if (!type || !issuedAt) return null;
    const d = new Date(issuedAt);
    if (Number.isNaN(d.getTime())) return null;
    d.setMonth(d.getMonth() + type.validityMonths);
    return d.toISOString().slice(0, 10);
  }, [type, issuedAt]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-secondary w-full"
      >
        <PlusIcon className="h-[18px] w-[18px]" />
        Registrera certifikat
      </button>
    );
  }

  return (
    <form action={action} className="card space-y-3.5 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Nytt certifikat</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn btn-ghost px-2 py-1 text-xs"
        >
          Avbryt
        </button>
      </div>

      <div>
        <label className="field-label" htmlFor="typeId">
          Certifikattyp
        </label>
        <select
          id="typeId"
          name="typeId"
          required
          className="field"
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
        >
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.validityMonths} mån)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="subject">
          Gäller
        </label>
        <select id="subject" name="subject" required className="field">
          {validSubjects.length === 0 ? (
            <option value="">Ingen möjlig mottagare</option>
          ) : (
            validSubjects.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="issuedAt">
            Utfärdat
          </label>
          <input
            id="issuedAt"
            name="issuedAt"
            type="date"
            required
            className="field"
            value={issuedAt}
            onChange={(e) => setIssuedAt(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="expiresAt">
            Giltigt till
          </label>
          <input
            id="expiresAt"
            name="expiresAt"
            type="date"
            className="field"
            placeholder={expiryPreview ?? ""}
          />
        </div>
      </div>

      {expiryPreview ? (
        <p className="-mt-1.5 text-xs text-fg-dim">
          Lämnas fältet tomt sätts {expiryPreview}, enligt giltighetstiden.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="issuer">
            Utfärdare
          </label>
          <input
            id="issuer"
            name="issuer"
            placeholder="t.ex. Svenska Brukshundklubben"
            className="field"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="reference">
            Referens
          </label>
          <input id="reference" name="reference" className="field" />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="document">
          Intyg (bild eller PDF)
        </label>
        <input
          id="document"
          name="document"
          type="file"
          accept="image/*,application/pdf"
          className="field file:mr-3 file:rounded file:border-0 file:bg-surface-3 file:px-2.5 file:py-1 file:text-xs file:text-fg"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="notes">
          Anteckning
        </label>
        <textarea id="notes" name="notes" rows={2} className="field resize-y" />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? <p className="text-sm text-ok">{state.ok}</p> : null}

      <div className="flex justify-end">
        <Submit />
      </div>
    </form>
  );
}
