import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { SectionHeader, StatRow, StatTile } from "@/components/ui";
import { BarChart, HorizontalBars } from "@/components/BarChart";
import { requireCapability, unreadNotificationCount } from "@/lib/auth";
import { seesAllRegions, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import {
  capacityByDiscipline,
  coverageByRegion,
  overviewStats,
  startOfMonth,
  trainingHoursByMonth,
} from "@/lib/stats";
import { MISSION_STATUS_LABELS } from "@/lib/domain";

export const metadata: Metadata = { title: "Statistik" };

export default async function LeadershipPage({
  searchParams,
}: PageProps<"/ledning">) {
  const user = await requireCapability("stats:view");
  const params = await searchParams;
  const unread = await unreadNotificationCount(user.id);

  // Nationell nivå kan filtrera på region; regionalt ansvarig är redan
  // avgränsad av teamScope och ser bara sin egen.
  const regionFilter =
    seesAllRegions(user) && typeof params.region === "string" && params.region
      ? params.region
      : undefined;

  const [
    stats,
    hoursByMonth,
    capacity,
    coverage,
    regions,
    missionsByStatus,
    availableTeams,
  ] = await Promise.all([
    overviewStats(user),
    trainingHoursByMonth(user, 6, regionFilter),
    capacityByDiscipline(user, regionFilter),
    coverageByRegion(user),
    db.region.findMany({ orderBy: { sortOrder: "asc" } }),
    db.mission.groupBy({
      by: ["status"],
      where: {
        startAt: { gte: startOfMonth() },
        ...(regionFilter ? { regionId: regionFilter } : {}),
      },
      _count: { _all: true },
    }),
    // Kapacitet just nu: aktiva ekipage utan pågående frånvaro
    db.team.count({
      where: {
        ...teamScope(user),
        status: "ACTIVE",
        ...(regionFilter ? { regionId: regionFilter } : {}),
        availability: {
          none: {
            kind: "UNAVAILABLE",
            startAt: { lte: new Date() },
            endAt: { gte: new Date() },
          },
        },
      },
    }),
  ]);

  const visibleCoverage = coverage.filter(
    (row) => row.teams > 0 || row.missions > 0,
  );

  return (
    <AppShell
      title="Statistik"
      backHref="/mer"
      unread={unread}
      role={user.role}
    >
      {seesAllRegions(user) ? (
        <form action="/ledning" className="mb-4">
          <label className="field-label" htmlFor="region">
            Region
          </label>
          <select
            id="region"
            name="region"
            defaultValue={regionFilter ?? ""}
            className="field"
          >
            <option value="">Hela landet</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-secondary mt-2.5 w-full">
            Visa
          </button>
        </form>
      ) : null}

      <StatRow>
        <StatTile value={stats.teamCount} label="Aktiva ekipage" />
        <StatTile value={stats.missionCount} label="Uppdrag denna månad" />
        <StatTile value={stats.trainingHours} label="Träningstimmar" />
      </StatRow>

      <div className="mt-3">
        <StatRow>
          <StatTile value={availableTeams} label="Tillgänglig kapacitet nu" />
          <StatTile value={stats.sessionCount} label="Träningspass" />
          <StatTile value={stats.openFollowUps} label="Öppna uppföljningar" />
        </StatRow>
      </div>

      <section className="mt-5">
        <SectionHeader title="Träningstimmar per månad" />
        <div className="card px-4 pb-3 pt-4">
          <BarChart
            data={hoursByMonth.map((m) => ({ label: m.label, value: m.hours }))}
            unit="h"
            caption="Träningstimmar per månad de senaste sex månaderna."
          />
        </div>
      </section>

      <section className="mt-5">
        <SectionHeader title="Kapacitet per sökinriktning" />
        <div className="card p-4">
          <HorizontalBars
            data={capacity.map((c) => ({ label: c.name, value: c.count }))}
            unit="ekipage"
            caption="Antal aktiva ekipage per sökinriktning."
          />
          <p className="mt-3.5 text-xs text-fg-dim">
            Ett ekipage kan ha flera inriktningar och räknas då i varje.
          </p>
        </div>
      </section>

      <section className="mt-5">
        <SectionHeader title="Geografisk täckning" />
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left">
                <th className="px-4 py-2.5 font-medium text-fg-muted">Region</th>
                <th className="px-3 py-2.5 text-right font-medium text-fg-muted">
                  Ekipage
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-fg-muted">
                  Uppdrag
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-fg-muted">
                  Tim.
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleCoverage.map((row) => (
                <tr
                  key={row.region.id}
                  className="border-b border-line-soft last:border-0"
                >
                  <td className="px-4 py-2.5">{row.region.name}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {row.teams}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {row.missions}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {row.trainingHours}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-fg-dim">
          Uppdrag och träningstimmar avser innevarande månad.
        </p>
      </section>

      <section className="mt-5">
        <SectionHeader title="Uppdrag denna månad" href="/uppdrag" />
        <div className="card divide-y divide-line-soft">
          {missionsByStatus.length === 0 ? (
            <p className="px-4 py-4 text-sm text-fg-muted">
              Inga uppdrag den här månaden.
            </p>
          ) : (
            missionsByStatus.map((row) => (
              <div
                key={row.status}
                className="flex items-center justify-between px-4 py-2.5 text-sm"
              >
                <span className="text-fg-muted">
                  {MISSION_STATUS_LABELS[row.status] ?? row.status}
                </span>
                <span className="font-semibold tabular-nums">
                  {row._count._all}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <p className="mt-5 text-center text-xs text-fg-dim">
        Ledningsvyn visar sammanräknade siffror. Innehållet i enskilda
        rapporter nås bara av den som har behörighet till ekipaget.
      </p>

      <Link href="/rapporter" className="btn btn-secondary mt-4 w-full">
        Till rapporterna
      </Link>
    </AppShell>
  );
}
