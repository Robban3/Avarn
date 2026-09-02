import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import { getSettings } from "@/lib/settings";
import { daysUntil } from "@/lib/format";

/**
 * Skapar påminnelser om certifikat som snart går ut.
 *
 * Anropas av en schemaläggare en gång per dygn:
 *   curl -H "x-cron-key: $CRON_KEY" https://.../api/cron/paminnelser
 *
 * Vercels schemaläggare skickar i stället "Authorization: Bearer $CRON_SECRET"
 * och kan inte sätta egna huvuden, så båda formerna godtas.
 *
 * Varje mottagare varnas en gång per certifikat och tröskel (30 respektive
 * 7 dagar), så att en daglig körning inte fyller meddelandelistan.
 */



/** Godkänner anropet om nyckeln stämmer, oavsett vilket huvud den kom i. */
function isAuthorised(request: NextRequest) {
  const expected = process.env.CRON_KEY;
  if (!expected) return false;

  if (request.headers.get("x-cron-key") === expected) return true;

  // Vercel Cron: Authorization: Bearer <CRON_SECRET>
  const bearer = request.headers.get("authorization");
  const vercelSecret = process.env.CRON_SECRET;
  if (bearer?.startsWith("Bearer ")) {
    const token = bearer.slice(7);
    if (token === expected) return true;
    if (vercelSecret && token === vercelSecret) return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  if (!process.env.CRON_KEY) {
    return Response.json(
      { error: "CRON_KEY är inte konfigurerad." },
      { status: 500 },
    );
  }
  if (!isAuthorised(request)) {
    return Response.json({ error: "Ogiltig nyckel." }, { status: 401 });
  }

  // Den yttersta gränsen är den inställda; 30 och 7 dagar är de
  // påminnelser som alltid går ut när det börjar bli kort om tid.
  const { certWarningDays } = await getSettings();
  const THRESHOLDS = [certWarningDays, 30, 7].filter(
    (t, i, alla) => alla.indexOf(t) === i,
  );

  const limit = new Date();
  limit.setDate(limit.getDate() + Math.max(...THRESHOLDS));

  const certifications = await db.certification.findMany({
    where: { expiresAt: { lte: limit } },
    include: {
      type: true,
      dog: true,
      user: true,
      team: { include: { handler: true, dog: true, region: true } },
    },
  });

  let created = 0;

  for (const cert of certifications) {
    const days = daysUntil(cert.expiresAt);
    // Närmaste passerade tröskel, så att varje nivå ger en varning.
    const threshold = THRESHOLDS.filter((t) => days <= t).sort((a, b) => a - b)[0];
    if (threshold === undefined && days >= 0) continue;

    const subject =
      cert.team?.dog.name ?? cert.dog?.name ?? cert.user?.name ?? "ekipaget";

    // Mottagare: berörd hundförare samt instruktörer och regionansvariga.
    const recipients = new Set<string>();
    if (cert.userId) recipients.add(cert.userId);
    if (cert.team) recipients.add(cert.team.handlerId);
    if (cert.dogId) {
      const teams = await db.team.findMany({
        where: { dogId: cert.dogId },
        select: { handlerId: true, regionId: true },
      });
      teams.forEach((t) => recipients.add(t.handlerId));
    }

    const teamId = cert.teamId ?? null;
    if (teamId) {
      const instructors = await db.instructorAssignment.findMany({
        where: { teamId },
        select: { instructorId: true },
      });
      instructors.forEach((i) => recipients.add(i.instructorId));
    }

    const regionId = cert.team?.regionId;
    if (regionId) {
      const managers = await db.user.findMany({
        where: { role: "REGIONAL_MANAGER", regionId, active: true },
        select: { id: true },
      });
      managers.forEach((m) => recipients.add(m.id));
    }

    const title =
      days < 0
        ? `Behörighet har gått ut: ${cert.type.name}`
        : `Behörighet löper ut: ${cert.type.name}`;
    const body =
      days < 0
        ? `${subject} – gick ut för ${Math.abs(days)} dagar sedan.`
        : `${subject} – ${days} ${days === 1 ? "dag" : "dagar"} kvar.`;

    for (const userId of recipients) {
      // Har mottagaren redan varnats för samma certifikat och nivå?
      const existing = await db.notification.findFirst({
        where: {
          userId,
          type: "CERT_EXPIRING",
          title,
          body,
        },
      });
      if (existing) continue;

      await notify({
        userId,
        type: "CERT_EXPIRING",
        title,
        body,
        url: "/certifikat",
      });
      created += 1;
    }
  }

  return Response.json({
    granskade: certifications.length,
    skapade: created,
  });
}

/** GET ger samma svar, för enkel kontroll från en schemaläggare som bara gör GET. */
export const GET = POST;
