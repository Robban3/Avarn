import "server-only";
import { db } from "./db";
import { teamScope } from "./authz";
import type { SessionUser } from "./session";
import { periodStats, previousRollingFrom, rollingFrom } from "./stats";
import { certStatus } from "./certifications";
import { valjNotiser, type Notis } from "./notiser";
import { daysUntil } from "./format";
import { getSettings } from "./settings";

/**
 * Underlaget till hundförarens startsida. Samlat här så att sidan blir en
 * ren vy, och så att alla frågor går genom samma behörighetsavgränsning.
 */

/** Är något av användarens ekipage tillgängligt just nu? */
export async function availabilityNow(user: SessionUser) {
  const now = new Date();

  const unavailable = await db.teamAvailability.findFirst({
    where: {
      team: teamScope(user),
      kind: "UNAVAILABLE",
      startAt: { lte: now },
      endAt: { gte: now },
    },
    select: { note: true },
  });
  if (unavailable) {
    return { available: false, note: unavailable.note ?? "Ej tillgänglig" };
  }

  const available = await db.teamAvailability.findFirst({
    where: {
      team: teamScope(user),
      kind: "AVAILABLE",
      startAt: { lte: now },
      endAt: { gte: now },
    },
    select: { note: true },
  });

  return available
    ? { available: true, note: "Tillgänglig" }
    : { available: false, note: "Ingen tjänstgöring inlagd" };
}

/** Nyckeltal för de senaste 30 dagarna, jämförda med de 30 dessförinnan. */
export async function monthlyStats(user: SessionUser) {
  const nu = rollingFrom();
  const innan = previousRollingFrom();

  const [current, previous] = await Promise.all([
    periodStats(user, nu),
    periodStats(user, innan, nu),
  ]);

  /** Formaterar skillnaden mellan två tal som text och riktning. */
  const change = (now: number | null, before: number | null, suffix = "") => {
    if (now === null || before === null) return null;
    const diff = now - before;
    if (diff === 0)
      return { text: "oförändrat mot föregående 30 dagar", direction: "flat" as const };
    return {
      text: `${Math.abs(diff)}${suffix} mot föregående 30 dagar`,
      direction: diff > 0 ? ("up" as const) : ("down" as const),
    };
  };

  return {
    current,
    changes: {
      sessions: change(current.sessionCount, previous.sessionCount),
      missions: change(current.missionCount, previous.missionCount),
      hours: change(current.trainingHours, previous.trainingHours, " h"),
      completion: change(current.completionRate, previous.completionRate, "%"),
    },
  };
}

/**
 * Viktiga notiser: certifikat som snart går ut, uppföljningar och olästa
 * meddelanden – sammanfört till en lista som går att klicka på.
 */
export async function importantNotices(user: SessionUser, take = 4) {
  const limit = new Date();
  const { certWarningDays } = await getSettings();
  limit.setDate(limit.getDate() + certWarningDays);

  const scope = teamScope(user);

  const [certifications, followUps, notifications] = await Promise.all([
    db.certification.findMany({
      where: {
        expiresAt: { lte: limit },
        // Avgränsningen ligger i relationen: en id-lista hade hämtat hela
        // beståndet i onödan för den som ser allt.
        OR: [
          { team: scope },
          { dog: { teams: { some: scope } } },
          { user: { teams: { some: scope } } },
        ],
      },
      include: { type: true },
      orderBy: { expiresAt: "asc" },
      take,
    }),
    db.followUp.findMany({
      where: { team: scope, status: "OPEN" },
      include: { instructor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take,
    }),
    db.notification.findMany({
      where: { userId: user.id, readAt: null, type: { not: "CERT_EXPIRING" } },
      orderBy: { createdAt: "desc" },
      take,
    }),
  ]);

  const nu = Date.now();

  /**
   * `ordning` är tiden kvar till åtgärd i millisekunder: negativ för något
   * som redan passerat, noll för sådant som ligger och väntar nu. Ett
   * utgånget certifikat hamnar alltså före en öppen uppföljning, som i sin
   * tur går före ett certifikat som går ut om en månad.
   */
  const certNotiser = certifications.map((cert) => {
    const days = daysUntil(cert.expiresAt);
    return {
      id: `cert-${cert.id}`,
      text:
        days < 0
          ? `“${cert.type.name}” har gått ut`
          : `“${cert.type.name}” går ut om ${days} ${days === 1 ? "dag" : "dagar"}`,
      href: "/certifikat",
      urgent: certStatus(cert.expiresAt, certWarningDays) !== "VALID",
      at: cert.expiresAt,
      ordning: cert.expiresAt.getTime() - nu,
    };
  });

  const ovrigaNotiser = [
    ...followUps.map((f) => ({
      id: `fu-${f.id}`,
      text: `Uppföljning: ${f.title}`,
      href: "/traning",
      urgent: false,
      at: f.createdAt,
      ordning: 0,
    })),
    ...notifications.map((n) => ({
      id: `n-${n.id}`,
      text: n.title,
      href: n.url ?? "/meddelanden",
      urgent: false,
      at: n.createdAt,
      ordning: 0,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  // Varannan plats från varje håll, så att en sorts notis aldrig fyller
  // listan. Tidigare klipptes den osorterade listan rakt av: hade föraren
  // fyra certifikat i varningsfönstret syntes aldrig en uppföljning eller
  // ett oläst meddelande.
  return valjNotiser<Notis>([certNotiser, ovrigaNotiser], take);
}

/** Tidslinje över träning, uppdrag och kommentarer. */
export async function recentActivity(user: SessionUser, take = 5) {
  const scope = teamScope(user);

  const [sessions, reports, comments] = await Promise.all([
    db.trainingSession.findMany({
      where: { team: scope },
      include: { team: { include: { dog: true } } },
      orderBy: { startAt: "desc" },
      take,
    }),
    db.operationalReport.findMany({
      where: { team: scope },
      include: { mission: true },
      orderBy: { createdAt: "desc" },
      take,
    }),
    db.comment.findMany({
      where: {
        OR: [
          { trainingSession: { team: scope } },
          { report: { team: scope } },
        ],
        authorId: { not: user.id },
      },
      include: {
        author: { select: { name: true } },
        trainingSession: { select: { id: true } },
        report: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
    }),
  ]);

  const items = [
    ...sessions.map((s) => ({
      id: `s-${s.id}`,
      kind: "training" as const,
      at: s.startAt,
      title: `${s.trainingArea} – ${s.environment}`,
      subtitle: s.location,
      status: s.status,
      detail: `${s.foundCount}/${s.hideCount} markeringar`,
      href: `/traning/${s.id}`,
    })),
    ...reports.map((r) => ({
      id: `r-${r.id}`,
      kind: "mission" as const,
      at: r.submittedAt ?? r.createdAt,
      title: `Uppdrag – ${r.mission.title}`,
      subtitle: r.mission.locality,
      status: r.status,
      detail: r.status === "APPROVED" ? "Rapport godkänd" : "Rapport inlämnad",
      href: `/rapporter/${r.id}`,
    })),
    ...comments.map((c) => ({
      id: `c-${c.id}`,
      kind: "comment" as const,
      at: c.createdAt,
      title: `Kommentar från ${c.author.name}`,
      subtitle: c.body.slice(0, 80),
      status: null,
      detail: null,
      href: c.trainingSessionId
        ? `/traning/${c.trainingSessionId}`
        : c.reportId
          ? `/rapporter/${c.reportId}`
          : "/meddelanden",
    })),
  ];

  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, take);
}
