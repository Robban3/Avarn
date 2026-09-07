import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Den senaste olästa aviseringen, för servicearbetaren.
 *
 * Utskicken innehåller ingen text – de väcker bara telefonen, och det är
 * den här rutten som säger vad notisen ska stå. Se kommentaren överst i
 * src/lib/push.ts om varför.
 *
 * Lämnar ut tre fält och inget mer: allt som inte behövs för att rita en
 * notis är något som inte behöver lämna servern.
 */
export async function GET() {
  const user = await requireUser();

  const senaste = await db.notification.findFirst({
    where: { userId: user.id, readAt: null },
    orderBy: { createdAt: "desc" },
    select: { title: true, body: true, url: true },
  });

  const olasta = await db.notification.count({
    where: { userId: user.id, readAt: null },
  });

  return Response.json(
    { notis: senaste, olasta },
    { headers: { "Cache-Control": "no-store" } },
  );
}
