import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

/**
 * Första spärren: utloggade skickas till inloggningssidan och inloggade
 * bort från den. Den egentliga behörighetskontrollen görs i varje sida och
 * server action – det här lagret sparar bara onödiga anrop.
 */
const PUBLIC_PATHS = [
  "/login",
  "/manifest.webmanifest",
  "/ikon.svg",
  "/ikon-maskable.svg",
  // Schemalagda jobb autentiserar med egen nyckel i stället för session.
  "/api/cron",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await verifySessionToken(token) : null;

  if (!user && !isPublic) {
    // API-vägar ska svara med en statuskod, inte med inloggningssidans HTML.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Inloggning krävs." }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Så att användaren landar rätt efter inloggning.
    if (pathname !== "/") url.searchParams.set("retur", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/hem";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Allt utom Next-interna filer och statiska tillgångar.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)",
  ],
};
