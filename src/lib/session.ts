import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import type { Role } from "./domain";

/**
 * Sessionshantering med signerad cookie (JWT via jose). Vald framför ett
 * färdigt inloggningsbibliotek för att hålla beroendena få och för att
 * samma verifiering ska kunna köras både i middleware och på servern.
 */

const COOKIE_NAME = "avarn_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // en arbetsdag

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  regionId: string | null;
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET saknas eller är för kort. Sätt den i .env innan appen startas.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    name: user.name,
    email: user.email,
    role: user.role,
    regionId: user.regionId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

/** Verifierar en token. Fungerar även i middleware (Edge runtime). */
export async function verifySessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: payload.role as Role,
      regionId: (payload.regionId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken(user);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Aktuell användare, eller null om ingen giltig session finns. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
