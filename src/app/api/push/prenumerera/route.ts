import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Telefonens prenumeration på notiser.
 *
 * En rad per enhet, inte per användare: samma person kan ha appen på
 * mobilen och på en surfplatta och vill bli väckt på båda.
 *
 * Adressen pushtjänsten ger ut är i praktiken en hemlighet – den som har
 * den kan skicka notiser till telefonen. Därför kopplas den till den
 * inloggade sessionen och lämnas aldrig ut igen.
 */

type Kropp = {
  endpoint?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
};

export async function POST(request: Request) {
  const user = await requireUser();

  let kropp: Kropp;
  try {
    kropp = (await request.json()) as Kropp;
  } catch {
    return Response.json({ fel: "Ogiltig kropp." }, { status: 400 });
  }

  const { endpoint, keys } = kropp;
  if (
    typeof endpoint !== "string" ||
    !/^https:\/\//.test(endpoint) ||
    typeof keys?.p256dh !== "string" ||
    typeof keys?.auth !== "string"
  ) {
    return Response.json({ fel: "Ofullständig prenumeration." }, { status: 400 });
  }

  // Samma adress kan komma tillbaka efter en ominstallation eller när
  // webbläsaren förnyar den. Då ska den byta ägare, inte bli en dubblett.
  await db.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    update: { userId: user.id, p256dh: keys.p256dh, auth: keys.auth },
  });

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await requireUser();

  let endpoint: unknown;
  try {
    ({ endpoint } = (await request.json()) as Kropp);
  } catch {
    return Response.json({ fel: "Ogiltig kropp." }, { status: 400 });
  }

  if (typeof endpoint !== "string") {
    return Response.json({ fel: "Adress saknas." }, { status: 400 });
  }

  // Bara den egna. Annars hade en känd adress räckt för att stänga av
  // notiserna för någon annan.
  await db.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });

  return Response.json({ ok: true });
}
