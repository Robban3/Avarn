import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { BUCKET, ensureBucket, storageClient } from "./storage";

/**
 * Bilder och filmer lämnas bara ut via /api/media/[id], som kontrollerar
 * behörigheten först – aldrig direkt från /public.
 *
 * Var filen faktiskt ligger avgörs av src/lib/storage.ts: Supabase Storage
 * när nycklarna är satta, annars disken. Anropande kod behöver inte veta
 * vilket.
 */

const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

/** 25 MB räcker för foton och korta klipp från telefonen. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const ALLOWED: Record<string, { ext: string; kind: "IMAGE" | "VIDEO" | "DOCUMENT" }> = {
  "image/jpeg": { ext: ".jpg", kind: "IMAGE" },
  "image/png": { ext: ".png", kind: "IMAGE" },
  "image/webp": { ext: ".webp", kind: "IMAGE" },
  "image/heic": { ext: ".heic", kind: "IMAGE" },
  "video/mp4": { ext: ".mp4", kind: "VIDEO" },
  "video/quicktime": { ext: ".mov", kind: "VIDEO" },
  "application/pdf": { ext: ".pdf", kind: "DOCUMENT" },
  // Uppdragsunderlag är oftast pdf, men en anteckning eller en exporterad
  // lista kommer lika gärna som ren text.
  "text/plain": { ext: ".txt", kind: "DOCUMENT" },
  "text/csv": { ext: ".csv", kind: "DOCUMENT" },
};

export function isAllowedType(mimeType: string) {
  return mimeType in ALLOWED;
}

export function kindFor(mimeType: string) {
  return ALLOWED[mimeType]?.kind ?? "DOCUMENT";
}

export function uploadPath(storedName: string) {
  return path.join(UPLOAD_DIR, storedName);
}

/** Sparar filen med ett slumpat namn så att inget originalnamn kan styra sökvägen. */
export async function storeUpload(file: File) {
  const spec = ALLOWED[file.type];
  if (!spec) {
    throw new Error(`Filtypen ${file.type} stöds inte.`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Filen är för stor. Högst 25 MB per fil.");
  }

  const storedName = `${randomUUID()}${spec.ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const client = storageClient();
  if (client) {
    await ensureBucket(client);
    const { error } = await client.storage
      .from(BUCKET)
      .upload(storedName, bytes, { contentType: file.type, upsert: false });
    if (error) {
      throw new Error(`Kunde inte spara filen: ${error.message}`);
    }
  } else {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(uploadPath(storedName), bytes);
  }

  return {
    storedName,
    kind: spec.kind,
    mimeType: file.type,
    size: file.size,
    originalName: file.name || `fil${spec.ext}`,
  };
}

/** Hämtar filens innehåll. Anropas bara efter godkänd behörighetskontroll. */
export async function readUpload(storedName: string): Promise<Buffer | null> {
  const client = storageClient();

  if (client) {
    const { data, error } = await client.storage.from(BUCKET).download(storedName);
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  }

  try {
    return await readFile(uploadPath(storedName));
  } catch {
    return null;
  }
}

export async function removeUpload(storedName: string) {
  const client = storageClient();

  if (client) {
    await client.storage.from(BUCKET).remove([storedName]);
    return;
  }

  try {
    await unlink(uploadPath(storedName));
  } catch {
    // Filen kan redan vara borta; databasposten är det som räknas.
  }
}
