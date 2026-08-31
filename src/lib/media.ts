import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Bilder och filmer sparas på disk utanför /public och lämnas bara ut via
 * /api/media/[id], som kontrollerar behörigheten först. Vill man byta till
 * molnlagring är det de här tre funktionerna som ska skrivas om.
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

  await mkdir(UPLOAD_DIR, { recursive: true });
  const storedName = `${randomUUID()}${spec.ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(uploadPath(storedName), bytes);

  return {
    storedName,
    kind: spec.kind,
    mimeType: file.type,
    size: file.size,
    originalName: file.name || `fil${spec.ext}`,
  };
}

export async function removeUpload(storedName: string) {
  try {
    await unlink(uploadPath(storedName));
  } catch {
    // Filen kan redan vara borta; databasposten är det som räknas.
  }
}
