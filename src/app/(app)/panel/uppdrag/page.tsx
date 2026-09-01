import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ChartCard, Donut } from "@/components/AdminCharts";
import { StatusDot, Table, Td, Th } from "@/components/PanelUI";
import { requirePanelUser } from "@/lib/auth";
import { seesAllRegions, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { missionsByDiscipline, periodFran } from "@/lib/panel";
import { formatShortDate, formatTime } from "@/lib/format";
import { MISSION_STATUS_LABELS, PERIODER, type PeriodKey } from "@/lib/domain";
import type { Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Uppdrag" };

const LAGEN = [
  { value: "alla", label: "Alla", status: null },
  { value: "planerade", label: "Planerade", status: ["PLANNED", "ASSIGNED"] },
  { value: "pagaende", label: "Pågående", status: ["IN_PROGRESS"] },
  { value: "genomforda", label: "Genomförda", status: ["COMPLETED"] },
];

export default async function PanelMissionsPage({
  searchParams,
}: PageProps<"/panel/uppdrag">) {
  const user = await requirePanelUser();
  const params = await searchParams;
  const lage = typeof params.lage === "string" ? params.lage : "alla";
  const period = (
    typeof params.period === "string" && params.period in PERIODER
      ? params.period
      : "30d"
  ) as PeriodKey;

  const valt = LAGEN.find((l) => l.value === lage) ?? LAGEN[0];

  const teamIds = (
    await db.team.findMany({ where: teamScope(user), select: { id: true } })
  ).map((t) => t.id);

  const synlighet: Prisma.MissionWhereInput = seesAllRegions(user)
    ? {}
    : { assignments: { some: { teamId: { in: teamIds } } } };

  const [uppdrag, fordelning] = await Promise.all([
    db.mission.findMany({
      where: {
        AND: [
          synlighet,
          valt.status ? { status: { in: valt.status } } : {},
        ],
      },
      include: {
        region: true,
        discipline: true,
        customer: true,
        assignments: {
          include: { team: { include: { dog: true, handler: true } } },
        },
      },
      orderBy: { startAt: "desc" },
      take: 200,
    }),
    missionsByDiscipline(user, periodFran(period)),
  ]);

  return (
    <AdminShell
      user={user}
      aktiv="/panel/uppdrag"
      title="Uppdrag"
      subtitle={`${uppdrag.length} uppdrag i vyn`}
    >
      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <ChartCard
          title="Uppdrag"
          action={
            <div className="flex gap-1">
              {LAGEN.map((l) => (
                <Link
                  key={l.value}
                  href={`/panel/uppdrag?lage=${l.value}`}
                  aria-current={lage === l.value ? "true" : undefined}
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    lage === l.value
                      ? "bg-brand/12 text-brand"
                      : "text-fg-muted hover:bg-surface-2"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          }
        >
          {uppdrag.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-fg-muted">
              Inga uppdrag i det här läget.
            </p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Datum</Th>
                  <Th>Referens</Th>
                  <Th>Uppdrag</Th>
                  <Th>Typ</Th>
                  <Th>Region</Th>
                  <Th>Plats</Th>
                  <Th>Ekipage</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {uppdrag.map((m) => (
                  <tr key={m.id}>
                    <Td className="whitespace-nowrap text-fg-muted">
                      {formatShortDate(m.startAt)}, {formatTime(m.startAt)}
                    </Td>
                    <Td className="whitespace-nowrap text-fg-dim">
                      {m.reference}
                    </Td>
                    <Td>
                      <Link
                        href={`/uppdrag/${m.id}`}
                        className="font-medium transition-colors hover:text-brand"
                      >
                        {m.title}
                      </Link>
                    </Td>
                    <Td className="whitespace-nowrap text-fg-muted">
                      {m.missionType}
                    </Td>
                    <Td className="whitespace-nowrap text-fg-muted">
                      {m.region.name}
                    </Td>
                    <Td className="text-fg-muted">{m.locality}</Td>
                    <Td className="text-fg-muted">
                      {m.assignments.length === 0
                        ? "–"
                        : m.assignments
                            .map((a) => `${a.team.dog.name} & ${a.team.handler.name.split(" ")[0]}`)
                            .join(", ")}
                    </Td>
                    <Td>
                      <StatusDot ok={m.status === "COMPLETED"}>
                        {MISSION_STATUS_LABELS[m.status] ?? m.status}
                      </StatusDot>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </ChartCard>

        <ChartCard title="Fördelning på sökinriktning">
          {fordelning.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-fg-muted">
              Inga uppdrag i perioden.
            </p>
          ) : (
            <Donut slices={fordelning} centerLabel="Totalt uppdrag" />
          )}
        </ChartCard>
      </div>
    </AdminShell>
  );
}
