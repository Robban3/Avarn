import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ChartCard, LineChart } from "@/components/AdminCharts";
import { Table, Td, Th } from "@/components/PanelUI";
import { Avatar, Badge } from "@/components/ui";
import { AlertIcon } from "@/components/icons";
import { requirePanelUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamScope } from "@/lib/authz";
import { trainingHoursByMonth } from "@/lib/stats";
import { periodFran, trainingByTeam } from "@/lib/panel";
import { formatShortDate, formatTimeRange } from "@/lib/format";
import {
  PERIODER,
  SESSION_STATUS_LABELS,
  type PeriodKey,
} from "@/lib/domain";

export const metadata: Metadata = { title: "Träning" };

/** Ett ekipage behöver uppföljning om det inte tränat, eller träffar dåligt. */
const BEHOVER_UPPFOLJNING = (rad: {
  pass: number;
  completionRate: number | null;
}) => rad.pass === 0 || (rad.completionRate !== null && rad.completionRate < 70);

export default async function PanelTrainingPage({
  searchParams,
}: PageProps<"/panel/traning">) {
  const user = await requirePanelUser();
  const params = await searchParams;
  const period = (
    typeof params.period === "string" && params.period in PERIODER
      ? params.period
      : "3m"
  ) as PeriodKey;

  const fran = periodFran(period);

  const [timmar, perEkipage, senaste] = await Promise.all([
    trainingHoursByMonth(user, 6),
    trainingByTeam(user, fran),
    db.trainingSession.findMany({
      where: { team: teamScope(user) },
      include: { team: { include: { dog: true, handler: true } } },
      orderBy: { startAt: "desc" },
      take: 15,
    }),
  ]);

  const totalt = perEkipage.reduce((s, r) => s + r.hours, 0);
  const pass = perEkipage.reduce((s, r) => s + r.pass, 0);
  const uppfoljning = perEkipage.filter(BEHOVER_UPPFOLJNING);

  return (
    <AdminShell
      user={user}
      aktiv="/panel/traning"
      title="Träning"
      subtitle={`${totalt} timmar på ${pass} pass i ${PERIODER[period].label.toLowerCase()}`}
    >
      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <ChartCard title="Träningstimmar över tid">
          <LineChart
            points={timmar.map((t) => ({ label: t.label, value: t.hours }))}
            unit="h"
          />
        </ChartCard>

        <ChartCard title="Behöver uppföljning">
          {uppfoljning.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-fg-muted">
              Inget ekipage sticker ut i perioden.
            </p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {uppfoljning.map((r) => (
                <li key={r.team.id} className="flex items-center gap-3 py-3">
                  <AlertIcon className="h-5 w-5 shrink-0 text-warn" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">
                      {r.team.dog.name} &amp; {r.team.handler.name}
                    </span>
                    <span className="block text-[12px] text-fg-muted">
                      {r.pass === 0
                        ? "Inga pass i perioden"
                        : `${r.completionRate}% genomförandegrad på ${r.pass} pass`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Resultat per ekipage">
          <Table>
            <thead>
              <tr>
                <Th>Ekipage</Th>
                <Th className="text-right">Pass</Th>
                <Th className="text-right">Timmar</Th>
                <Th className="text-right">Genomförandegrad</Th>
              </tr>
            </thead>
            <tbody>
              {perEkipage.map((r) => (
                <tr key={r.team.id}>
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <Avatar
                        name={r.team.dog.name}
                        photoUrl={r.team.dog.photoUrl}
                        size={28}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {r.team.dog.name}
                        </span>
                        <span className="block truncate text-[11px] text-fg-dim">
                          {r.team.handler.name}
                        </span>
                      </span>
                    </span>
                  </Td>
                  <Td className="text-right tabular-nums">{r.pass}</Td>
                  <Td className="text-right tabular-nums">{r.hours} h</Td>
                  <Td className="text-right tabular-nums">
                    {r.completionRate === null ? "–" : `${r.completionRate}%`}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ChartCard>

        <ChartCard title="Senaste passen">
          <Table>
            <thead>
              <tr>
                <Th>Datum</Th>
                <Th>Pass</Th>
                <Th>Ekipage</Th>
                <Th>Resultat</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {senaste.map((s) => (
                <tr key={s.id}>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {formatShortDate(s.startAt)}
                    <span className="block text-[11px] text-fg-dim">
                      {formatTimeRange(s.startAt, s.endAt)}
                    </span>
                  </Td>
                  <Td>
                    <Link
                      href={`/traning/${s.id}`}
                      className="font-medium transition-colors hover:text-brand"
                    >
                      {s.trainingArea}
                    </Link>
                    <span className="block text-[11px] text-fg-dim">
                      {s.environment}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {s.team.dog.name}
                  </Td>
                  <Td className="whitespace-nowrap tabular-nums text-fg-muted">
                    {s.foundCount}/{s.hideCount}
                  </Td>
                  <Td>
                    <Badge
                      tone={
                        s.status === "APPROVED"
                          ? "ok"
                          : s.status === "SUBMITTED"
                            ? "brand"
                            : s.status === "CHANGES_REQUESTED"
                              ? "warn"
                              : "neutral"
                      }
                    >
                      {SESSION_STATUS_LABELS[s.status] ?? s.status}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ChartCard>
      </div>
    </AdminShell>
  );
}
