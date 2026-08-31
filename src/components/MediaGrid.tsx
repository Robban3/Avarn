"use client";

import { useRef, useState } from "react";
import { PlayIcon, PlusIcon } from "./icons";

type Asset = {
  id: string;
  kind: string;
  originalName: string;
};

/**
 * Bilder och filmer i en rad, med en ruta för att lägga till fler.
 * Filerna hämtas via /api/media/[id] som gör behörighetskontrollen.
 */
export function MediaGrid({
  assets,
  uploadAction,
  parentField,
  parentId,
  canAdd,
}: {
  assets: Asset[];
  /** Server action som tar emot filerna. */
  uploadAction?: (formData: FormData) => Promise<void>;
  parentField: "sessionId" | "reportId";
  parentId: string;
  canAdd: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);

  return (
    <div className="flex flex-wrap gap-2.5">
      {assets.map((asset) => (
        <a
          key={asset.id}
          href={`/api/media/${asset.id}`}
          target="_blank"
          rel="noreferrer"
          className="relative h-[72px] w-[88px] overflow-hidden rounded-lg border border-line bg-surface-2"
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
      ))}

      {canAdd && uploadAction ? (
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
          <label
            className={`flex h-[72px] w-[88px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-line bg-surface-2 text-fg-dim transition-colors hover:border-brand/40 hover:text-brand ${
              uploading ? "opacity-60" : ""
            }`}
          >
            <input
              type="file"
              name="files"
              multiple
              accept="image/*,video/*"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files?.length) formRef.current?.requestSubmit();
              }}
            />
            {uploading ? (
              <span className="text-[11px]">Laddar …</span>
            ) : (
              <PlusIcon className="h-6 w-6" />
            )}
            <span className="sr-only">Lägg till bild eller film</span>
          </label>
        </form>
      ) : null}

      {assets.length === 0 && !canAdd ? (
        <p className="text-sm text-fg-muted">Inga bilder eller filmer.</p>
      ) : null}
    </div>
  );
}
