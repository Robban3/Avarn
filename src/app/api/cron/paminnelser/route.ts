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

  if (certifications.length === 0) {
    return Response.json({ granskade: 0, skapade: 0 });
  }

  // Allt som behövs för mottagarlistorna hämtas i klump före loopen. Per
  // certifikat blev det annars tre frågor plus en per mottagare – med
  // femhundra certifikat tusentals rundturer i rad.
  const dogIds = [...new Set(certifications.flatMap((c) => c.dogId ?? []))];
  const teamIds = [...new Set(certifications.flatMap((c) => c.teamId ?? []))];
  const regionIds = [
    ...new Set(certifications.flatMap((c) => c.team?.regionId ?? [])),
  ];

  const [teamsPerDog, instruktorer, chefer] = await Promise.all([
    dogIds.length
      ? db.team.findMany({
          where: { dogId: { in: dogIds } },
          select: { dogId: true, handlerId: true },
        })
      : [],
    teamIds.length
      ? db.instructorAssignment.findMany({
          where: { teamId: { in: teamIds } },
          select: { teamId: true, instructorId: true },
        })
      : [],
    regionIds.length
      ? db.user.findMany({
          where: {
            role: "REGIONAL_MANAGER",
            regionId: { in: regionIds },
            active: true,
          },
          select: { id: true, regionId: true },
        })
      : [],
  ]);

  const forarePerHund = new Map<string, string[]>();
  for (const t of teamsPerDog) {
    forarePerHund.set(t.dogId, [
      ...(forarePerHund.get(t.dogId) ?? []),
      t.handlerId,
    ]);
  }
  const instruktorerPerEkipage = new Map<string, string[]>();
  for (const i of instruktorer) {
    instruktorerPerEkipage.set(i.teamId, [
      ...(instruktorerPerEkipage.get(i.teamId) ?? []),
      i.instructorId,
    ]);
  }
  const cheferPerRegion = new Map<string, string[]>();
  for (const m of chefer) {
    if (!m.regionId) continue;
    cheferPerRegion.set(m.regionId, [
      ...(cheferPerRegion.get(m.regionId) ?? []),
      m.id,
    ]);
  }

  /**
   * Adressen bär identiteten: certifikatets id och den tröskel varningen
   * gäller. Avdubbleringen skedde tidigare på rubrik och text, men texten
   * innehåller antal dagar kvar och ändras alltså varje dygn – ett
   * certifikat med fyrtiofem dagar kvar gav fyrtiofem notiser i stället
   * för två, och ett utgånget gav en ny varje dygn i evighet.
   */
  const url = (certId: string, threshold: number) =>
    `/certifikat#cert-${certId}-${threshold}`;

  type Paminnelse = {
    userId: string;
    url: string;
    title: string;
    body: string;
  };
  const planerade: Paminnelse[] = [];

  for (const cert of certifications) {
    const days = daysUntil(cert.expiresAt);
    // Närmaste passerade tröskel, så att varje nivå ger en varning.
    const threshold = THRESHOLDS.filter((t) => days <= t).sort((a, b) => a - b)[0];
    if (threshold === undefined) continue;

    const subject =
      cert.team?.dog.name ?? cert.dog?.name ?? cert.user?.name ?? "ekipaget";

    // Mottagare: berörd hundförare samt instruktörer och regionansvariga.
    const recipients = new Set<string>();
    if (cert.userId) recipients.add(cert.userId);
    if (cert.team) recipients.add(cert.team.handlerId);
    if (cert.dogId) {
      for (const id of forarePerHund.get(cert.dogId) ?? []) recipients.add(id);
    }
    if (cert.teamId) {
      for (const id of instruktorerPerEkipage.get(cert.teamId) ?? [])
        recipients.add(id);
    }
    if (cert.team?.regionId) {
      for (const id of cheferPerRegion.get(cert.team.regionId) ?? [])
        recipients.add(id);
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
      planerade.push({ userId, url: url(cert.id, threshold), title, body });
    }
  }

  const redanSkickade = new Set(
    (
      await db.notification.findMany({
        where: {
          type: "CERT_EXPIRING",
          url: { in: [...new Set(planerade.map((p) => p.url))] },
        },
        select: { userId: true, url: true },
      })
    ).map((n) => `${n.userId}|${n.url}`),
  );

  let created = 0;
  for (const p of planerade) {
    const nyckel = `${p.userId}|${p.url}`;
    if (redanSkickade.has(nyckel)) continue;
    redanSkickade.add(nyckel);
    await notify({
      userId: p.userId,
      type: "CERT_EXPIRING",
      title: p.title,
      body: p.body,
      url: p.url,
    });
    created += 1;
  }

  return Response.json({
    granskade: certifications.length,
    skapade: created,
  });
}

/** GET ger samma svar, för enkel kontroll från en schemaläggare som bara gör GET. */
export const GET = POST;
