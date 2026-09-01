import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ChartCard } from "@/components/AdminCharts";
import { Table, Td, Th } from "@/components/PanelUI";
import { Badge } from "@/components/ui";
import { requirePanelUser } from "@/lib/auth";
import { teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { formatShortDate, formatTimeRange } from "@/lib/format";
import { REPORT_STATUS_LABELS, reportTone } from "@/lib/domain";

export const metadata: Metadata = { title: "Rapporter" };

export default async function PanelReportsPage({
  searchParams,
}: PageProps<"/panel/rapporter">) {
  const user = await requirePanelUser();
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "alla";

  const rapporter = await db.operationalReport.findMany({
    where: {
      team: teamScope(user),
      ...(status !== "alla" ? { status } : {}),
    },
    include: {
      mission: true,
      team: { include: { dog: true, handler: true } },
      author: true,
      _count: { select: { indications: true, media: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const filter = [
    { value: "alla", label: "Alla" },
    { value: "SUBMITTED", label: "Inskickade" },
    { value: "APPROVED", label: "Godkända" },
    { value: "CHANGES_REQUESTED", label: "Kompletteras" },
    { value: "DRAFT", label: "Utkast" },
  ];

  return (
    <AdminShell
      user={user}
      aktiv="/panel/rapporter"
      title="Rapporter"
      subtitle={`${rapporter.length} operativa rapporter`}
    >
      <ChartCard
        title="Operativa rapporter"
        action={
          <div className="flex flex-wrap gap-1">
            {filter.map((f) => (
              <Link
                key={f.value}
                href={
                  f.value === "alla"
                    ? "/panel/rapporter"
                    : `/panel/rapporter?status=${f.value}`
                }
                aria-current={status === f.value ? "true" : undefined}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  status === f.value
                    ? "bg-brand/12 text-brand"
                    : "text-fg-muted hover:bg-surface-2"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
        }
      >
        {rapporter.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-fg-muted">
            Inga rapporter med den statusen.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Datum</Th>
                <Th>Uppdrag</Th>
                <Th>Ekipage</Th>
                <Th>Upprättad av</Th>
                <Th className="text-right">Markeringar</Th>
                <Th className="text-right">Bilder</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rapporter.map((r) => (
                <tr key={r.id}>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {formatShortDate(r.createdAt)}
                    {r.startedAt ? (
                      <span className="block text-[11px] text-fg-dim">
                        {formatTimeRange(r.startedAt, r.endedAt)}
                      </span>
                    ) : null}
                  </Td>
                  <Td>
                    <Link
                      href={`/rapporter/${r.id}`}
                      className="font-medium transition-colors hover:text-brand"
                    >
                      {r.mission.title}
                    </Link>
                    <span className="block text-[11px] text-fg-dim">
                      {r.mission.reference}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {r.team.dog.name} &amp; {r.team.handler.name}
                  </Td>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {r.author.name}
                  </Td>
                  <Td className="text-right tabular-nums">
                    {r._count.indications}
                  </Td>
                  <Td className="text-right tabular-nums">{r._count.media}</Td>
                  <Td>
                    <Badge tone={reportTone(r.status)}>
                      {REPORT_STATUS_LABELS[r.status] ?? r.status}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </ChartCard>
    </AdminShell>
  );
}
