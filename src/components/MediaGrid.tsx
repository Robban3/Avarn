"use client";

import { useRef, useState } from "react";
import { PlayIcon, PlusIcon, XIcon } from "./icons";

type Asset = {
  id: string;
  kind: string;
  originalName: string;
};

/**
 * Bilder och filmer i en rad, med en ruta för att lägga till fler.
 * Filerna hämtas via /api/media/[id] som gör behörighetskontrollen.
 *
 * Rutan används på två sätt. Fristående sköter den sitt eget formulär.
 * Inne i rapportformuläret går det inte – ett formulär i ett formulär är
 * ogiltig HTML – och då pekar fälten i stället på formulär som ligger
 * utanför, genom `form`-attributet. Se `MediaForms` nedan.
 */
export function MediaGrid({
  assets,
  uploadAction,
  parentField,
  parentId,
  canAdd,
  uploadFormId,
  removeFormId,
}: {
  assets: Asset[];
  /** Server action som tar emot filerna. Utelämnas när formuläret är externt. */
  uploadAction?: (formData: FormData) => Promise<void>;
  parentField: "sessionId" | "reportId";
  parentId: string;
  canAdd: boolean;
  /** Id på ett formulär som ligger utanför – då ritas inget eget. */
  uploadFormId?: string;
  /** Id på formuläret som tar bort en fil. Utan det visas ingen kryssknapp. */
  removeFormId?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);

  const laggTill = (
    <label
      className={`flex h-[72px] w-[88px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line bg-surface-2 text-fg-dim transition-colors hover:border-brand/40 hover:text-brand ${
        uploading ? "opacity-60" : ""
      }`}
    >
      <input
        type="file"
        name="files"
        multiple
        accept="image/*,video/*"
        form={uploadFormId}
        className="sr-only"
        disabled={uploading}
        onChange={(e) => {
          if (!e.target.files?.length) return;
          // Med ett externt formulär pekar `form` på det; annars på vårt eget.
          (e.target.form ?? formRef.current)?.requestSubmit();
        }}
      />
      {uploading ? (
        <span className="text-[11px]">Laddar …</span>
      ) : (
        <>
          <PlusIcon className="h-5 w-5" />
          <span className="text-[10px] font-medium">Lägg till</span>
        </>
      )}
      <span className="sr-only">Lägg till bild eller film</span>
    </label>
  );

  return (
    <div className="flex flex-wrap gap-2.5">
      {assets.map((asset) => (
        <div key={asset.id} className="relative">
          <a
            href={`/api/media/${asset.id}`}
            target="_blank"
            rel="noreferrer"
            className="block h-[72px] w-[88px] overflow-hidden rounded-lg border border-line bg-surface-2"
            title={asset.originalName}
          >
            {asset.kind === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/media/${asset.id}`}
                alt={asset.originalName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-fg-muted">
                <PlayIcon className="h-7 w-7" />
              </span>
            )}
          </a>
          {removeFormId ? (
            <button
              type="submit"
              form={removeFormId}
              name="mediaId"
              value={asset.id}
              aria-label={`Ta bort ${asset.originalName}`}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-surface-3 text-fg-muted transition-colors hover:border-danger/50 hover:text-danger"
            >
              <XIcon className="h-3 w-3" />
            </button>
          ) : null}
        </div>
      ))}

      {canAdd && uploadFormId ? laggTill : null}

      {canAdd && !uploadFormId && uploadAction ? (
        <form
          ref={formRef}
          action={async (formData) => {
            setUploading(true);
            try {
              await uploadAction(formData);
            } finally {
              setUploading(false);
              formRef.current?.reset();
            }
          }}
        >
          <input type="hidden" name={parentField} value={parentId} />
          {laggTill}
        </form>
      ) : null}

      {assets.length === 0 && !canAdd ? (
        <p className="text-sm text-fg-muted">Inga bilder eller filmer.</p>
      ) : null}
    </div>
  );
}

/**
 * Formulären som hör till en MediaGrid inne i ett annat formulär. Ritas
 * utanför det, och nås av fälten genom `form`-attributet.
 */
export function MediaForms({
  uploadFormId,
  removeFormId,
  uploadAction,
  removeAction,
  parentField,
  parentId,
}: {
  uploadFormId: string;
  removeFormId: string;
  uploadAction: (formData: FormData) => Promise<void>;
  removeAction: (formData: FormData) => Promise<void>;
  parentField: "sessionId" | "reportId";
  parentId: string;
}) {
  return (
    <>
      <form id={uploadFormId} action={uploadAction} className="hidden">
        <input type="hidden" name={parentField} value={parentId} />
      </form>
      <form id={removeFormId} action={removeAction} className="hidden">
        <input type="hidden" name={parentField} value={parentId} />
      </form>
    </>
  );
}
