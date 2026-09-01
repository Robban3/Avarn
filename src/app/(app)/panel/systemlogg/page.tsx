import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ChartCard } from "@/components/AdminCharts";
import { Table, Td, Th } from "@/components/PanelUI";
import { Badge } from "@/components/ui";
import { requireCapability } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Systemlogg" };

const HANDELSE_TON: Record<string, "ok" | "brand" | "warn" | "danger" | "neutral"> = {
  CREATE: "ok",
  UPDATE: "brand",
  DELETE: "danger",
  READ: "neutral",
  LOGIN: "brand",
  LOGIN_FAILED: "warn",
};

export default async function PanelAuditPage({
  searchParams,
}: PageProps<"/panel/systemlogg">) {
  const admin = await requireCapability("admin:manage");
  const params = await searchParams;
  const handelse = typeof params.handelse === "string" ? params.handelse : "";

  const [poster, typer] = await Promise.all([
    db.auditLog.findMany({
      where: handelse ? { action: handelse } : {},
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.auditLog.groupBy({ by: ["action"], _count: { action: true } }),
  ]);

  return (
    <AdminShell
      user={admin}
      aktiv="/panel/systemlogg"
      title="Systemlogg"
      subtitle={`${poster.length} senaste händelserna`}
    >
      <ChartCard
        title="Revisionslogg"
        action={
          <div className="flex flex-wrap gap-1">
            <Link
              href="/panel/systemlogg"
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                handelse === ""
                  ? "bg-brand/12 text-brand"
                  : "text-fg-muted hover:bg-surface-2"
              }`}
            >
              Alla
            </Link>
            {typer.map((t) => (
              <Link
                key={t.action}
                href={`/panel/systemlogg?handelse=${t.action}`}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  handelse === t.action
                    ? "bg-brand/12 text-brand"
                    : "text-fg-muted hover:bg-surface-2"
                }`}
              >
                {t.action} ({t._count.action})
              </Link>
            ))}
          </div>
        }
      >
        {poster.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-fg-muted">
            Inga händelser av den typen.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Tidpunkt</Th>
                <Th>Användare</Th>
                <Th>Händelse</Th>
                <Th>Objekt</Th>
                <Th>Detalj</Th>
              </tr>
            </thead>
            <tbody>
              {poster.map((p) => (
                <tr key={p.id}>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {formatDateTime(p.createdAt)}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {p.user?.name ?? (
                      <span className="text-fg-dim">Systemet</span>
                    )}
                  </Td>
                  <Td>
                    <Badge tone={HANDELSE_TON[p.action] ?? "neutral"}>
                      {p.action}
                    </Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {p.entityType}
                  </Td>
                  <Td className="text-fg-muted">{p.detail ?? "–"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </ChartCard>
    </AdminShell>
  );
}
