import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

/**
 * Tömmer sessionskakan och skickar vidare till inloggningen.
 *
 * Behövs för den vars konto stängts av mitt i en session: kakan är
 * fortfarande signerad och giltig, så en ren omdirigering till /login
 * hade studsat tillbaka till /hem genom mellanlagret. Här försvinner
 * kakan först.
 */
export async function GET(request: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url));
}
