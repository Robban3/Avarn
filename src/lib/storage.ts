import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lagringsbackend för bilagor.
 *
 * Finns Supabase-nycklarna används Supabase Storage – nödvändigt i drift,
 * eftersom Vercels filsystem är flyktigt och uppladdade filer annars
 * försvinner vid varje driftsättning. Saknas nycklarna används disken, så
 * att lokal utveckling fungerar utan moln.
 *
 * Hinken är privat. Filer lämnas aldrig ut direkt härifrån utan går alltid
 * via /api/media/[id], som gör behörighetskontrollen först.
 */

export const BUCKET = "avarn-media";

let cached: SupabaseClient | null = null;

/** Supabase-klienten, eller null när lagringen ska ske på disk. */
export function storageClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  cached ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function usesCloudStorage() {
  return storageClient() !== null;
}

let bucketChecked = false;

/** Skapar hinken första gången den behövs, så att inget måste göras för hand. */
export async function ensureBucket(client: SupabaseClient) {
  if (bucketChecked) return;

  const { data } = await client.storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await client.storage.createBucket(BUCKET, {
      public: false,
    });
    // "already exists" uppstår när två anrop skapar hinken samtidigt.
    if (error && !/exists/i.test(error.message)) {
      throw new Error(`Kunde inte skapa lagringshinken: ${error.message}`);
    }
  }
  bucketChecked = true;
}
