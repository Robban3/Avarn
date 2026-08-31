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
    const ok = await db.team.findFirst({
      where: {
        ...scope,
        OR: [
          cert.teamId ? { id: cert.teamId } : {},
          cert.dogId ? { dogId: cert.dogId } : {},
          cert.userId ? { handlerId: cert.userId } : {},
        ].filter((c) => Object.keys(c).length > 0),
      },
      select: { id: true },
    });
    return ok ? asset : null;
  }

  // Filer utan koppling lämnas bara ut till den som laddade upp dem.
  return asset.uploadedById === user.id ? asset : null;
}
