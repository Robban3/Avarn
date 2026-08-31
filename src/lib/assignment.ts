import "server-only";
import { db } from "./db";
import { teamScope } from "./authz";
import type { SessionUser } from "./session";
import { certStatus } from "./certifications";

/**
 * Förslag på ekipage till ett uppdrag, utifrån de tre saker som avgör i
 * praktiken: rätt sökinriktning, ledig tid och rätt geografi. Förslaget är
 * rådgivande – tilldelningen görs alltid av en människa.
 */
export type TeamSuggestion = {
  team: Awaited<ReturnType<typeof loadCandidates>>[number];
  score: number;
  reasons: string[];
};

async function loadCandidates(user: SessionUser, regionId: string) {
  return db.team.findMany({
    where: { ...teamScope(user), status: "ACTIVE" },
    include: {
      dog: { include: { disciplines: { include: { discipline: true } } } },
      handler: true,
      region: true,
      availability: true,
      certifications: true,
      missionAssignments: {
        where: { status: { in: ["OFFERED", "ACCEPTED"] } },
        include: { mission: true },
      },
      _count: { select: { trainingSessions: true } },
    },
    // Regionens egna ekipage först, men andra regioner utesluts inte –
    // ibland behöver ett uppdrag förstärkning utifrån.
    orderBy: { regionId: regionId ? "asc" : "asc" },
  });
}

export async function suggestTeams(
  user: SessionUser,
  mission: {
    id: string;
    regionId: string;
    startAt: Date;
    endAt: Date | null;
    disciplineId: string | null;
  },
  limit = 5,
): Promise<TeamSuggestion[]> {
  const candidates = await loadCandidates(user, mission.regionId);
  const missionEnd = mission.endAt ?? mission.startAt;

  const suggestions = candidates
    .filter((team) =>
      // Redan tilldelade ekipage föreslås inte igen.
      !team.missionAssignments.some((a) => a.missionId === mission.id),
    )
    .map((team) => {
      const reasons: string[] = [];
      let score = 0;

      // Kompetens
      if (mission.disciplineId) {
        const match = team.dog.disciplines.find(
          (d) => d.disciplineId === mission.disciplineId,
        );
        if (match) {
          score += 3;
          reasons.push(`Har ${match.discipline.name}`);
        }
      } else {
        score += 1;
      }

      // Geografi
      if (team.regionId === mission.regionId) {
        score += 2;
        reasons.push("Egen region");
      } else {
        reasons.push(`Från ${team.region.name}`);
      }

      // Tillgänglighet: markerad frånvaro som överlappar uppdraget
      const unavailable = team.availability.some(
        (a) =>
          a.kind === "UNAVAILABLE" &&
          a.startAt <= missionEnd &&
          a.endAt >= mission.startAt,
      );
      if (unavailable) {
        score -= 5;
        reasons.push("Frånvarande");
      } else {
        const available = team.availability.some(
          (a) =>
            a.kind === "AVAILABLE" &&
            a.startAt <= mission.startAt &&
            a.endAt >= missionEnd,
        );
        if (available) {
          score += 2;
          reasons.push("Tillgängligt");
        }
      }

      // Krock med annat uppdrag samma tid
      const clash = team.missionAssignments.some(
        (a) =>
          a.mission.startAt <= missionEnd &&
          (a.mission.endAt ?? a.mission.startAt) >= mission.startAt,
      );
      if (clash) {
        score -= 4;
        reasons.push("Bokat samma tid");
      }

      // Giltiga behörigheter
      const expired = team.certifications.filter(
        (c) => certStatus(c.expiresAt) === "EXPIRED",
      );
      if (expired.length > 0) {
        score -= 3;
        reasons.push("Utgången behörighet");
      }

      return { team, score, reasons };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return suggestions;
}
