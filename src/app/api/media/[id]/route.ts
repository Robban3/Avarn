import type { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/session";
import { canAccessMedia } from "@/lib/media-access";
import { readUpload } from "@/lib/media";
import { audit } from "@/lib/audit";

/**
 * Lämnar ut en uppladdad fil, men först efter behörighetskontroll.
 * Filerna ligger i privat lagring just för att den här kontrollen ska
 * kunna göras – de är aldrig åtkomliga via en publik adress.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return new Response("Inloggning krävs.", { status: 401 });
  }

  const asset = await canAccessMedia(user, id);
  if (!asset) {
    await audit({
      userId: user.id,
      action: "DENIED",
      entityType: "MediaAsset",
      entityId: id,
      detail: "Försök att hämta fil utanför behörighet",
    });
    // Samma svar som för en fil som inte finns, så att adressen inte
    // avslöjar om filen existerar.
    return new Response("Hittades inte.", { status: 404 });
  }

  const bytes = await readUpload(asset.storedName);
  if (!bytes) {
    return new Response("Hittades inte.", { status: 404 });
  }

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `inline; filename="${encodeURIComponent(asset.originalName)}"`,
      // Filerna är skyddsvärda och får inte mellanlagras av delade cacher.
      "Cache-Control": "private, max-age=3600",
    },
  });
}
