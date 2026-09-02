import "server-only";
import { db } from "./db";
import { teamScope } from "./authz";
import type { SessionUser } from "./session";

/**
 * En mediafil får bara lämnas ut till den som får se passet, rapporten
 * eller certifikatet den hör till. Kontrollen görs mot samma
 * ekipageavgränsning som resten av appen.
 */
export async function canAccessMedia(user: SessionUser, mediaId: string) {
  const asset = await db.mediaAsset.findUnique({
    where: { id: mediaId },
    include: {
      trainingSession: { select: { teamId: true } },
      report: { select: { teamId: true } },
      certification: { select: { teamId: true, dogId: true, userId: true } },
      dog: { select: { id: true } },
      profileUser: { select: { id: true } },
    },
  });
  if (!asset) return null;

  const scope = teamScope(user);

  if (asset.trainingSessionId && asset.trainingSession) {
    const ok = await db.team.findFirst({
      where: { id: asset.trainingSession.teamId, ...scope },
      select: { id: true },
    });
    return ok ? asset : null;
  }

  if (asset.reportId && asset.report) {
    const ok = await db.team.findFirst({
      where: { id: asset.report.teamId, ...scope },
      select: { id: true },
    });
    return ok ? asset : null;
  }

  if (asset.certificationId && asset.certification) {
    const cert = asset.certification;
    const villkor = [
      cert.teamId ? { id: cert.teamId } : null,
      cert.dogId ? { dogId: cert.dogId } : null,
      cert.userId ? { handlerId: cert.userId } : null,
    ].filter((c) => c !== null);

    // Ett certifikat utan mottagare hör inte till något ekipage. Neka
    // uttryckligen i stället för att skicka ett tomt OR till Prisma och
    // förlita sig på att det råkar bli ett nej.
    if (villkor.length === 0) return null;

    const ok = await db.team.findFirst({
      where: { AND: [scope, { OR: villkor }] },
      select: { id: true },
    });
    return ok ? asset : null;
  }

  // Hundfoto: syns för alla som ser hunden genom sitt ekipage.
  if (asset.dogId) {
    const ok = await db.team.findFirst({
      where: { dogId: asset.dogId, ...scope },
      select: { id: true },
    });
    return ok ? asset : null;
  }

  // Profilbild: den egna, eller en förare inom behörigheten.
  if (asset.profileUserId) {
    if (asset.profileUserId === user.id) return asset;
    const ok = await db.team.findFirst({
      where: { handlerId: asset.profileUserId, ...scope },
      select: { id: true },
    });
    return ok ? asset : null;
  }

  // Filer utan koppling lämnas bara ut till den som laddade upp dem.
  return asset.uploadedById === user.id ? asset : null;
}
