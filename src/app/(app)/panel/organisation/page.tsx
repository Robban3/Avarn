import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ChartCard } from "@/components/AdminCharts";
import { MiniTag, Table, Td, Th } from "@/components/PanelUI";
import { requireCapability } from "@/lib/auth";
import { db } from "@/lib/db";
import { CERT_APPLIES_TO_LABELS, ROLE_LABELS, type Role } from "@/lib/domain";

export const metadata: Metadata = { title: "Organisation" };

/**
 * Organisationens stomme: regionerna, sökinriktningarna och
 * certifikattyperna. Det är de här posterna resten av appen hänger på –
 * ett uppdrag har en region, en hund en sökinriktning, ett ekipage ett
 * certifikat av en viss typ.
 */
export default async function PanelOrgPage() {
  const admin = await requireCapability("admin:manage");

  const [regioner, inriktningar, certTyper, roller] = await Promise.all([
    db.region.findMany({
      include: { _count: { select: { users: true, teams: true, missions: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    db.searchDiscipline.findMany({
      include: { _count: { select: { dogs: true, missions: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    db.certificationType.findMany({
      include: { _count: { select: { certifications: true } } },
      orderBy: { name: "asc" },
    }),
    db.user.groupBy({ by: ["role"], _count: { role: true } }),
  ]);

  return (
    <AdminShell
      user={admin}
      aktiv="/panel/organisation"
      title="Organisation"
      subtitle={`${regioner.length} regioner · ${inriktningar.length} sökinriktningar · ${certTyper.length} certifikattyper`}
    >
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Regioner">
          <Table>
            <thead>
              <tr>
                <Th>Region</Th>
                <Th>Kod</Th>
                <Th className="text-right">Användare</Th>
                <Th className="text-right">Ekipage</Th>
                <Th className="text-right">Uppdrag</Th>
              </tr>
            </thead>
            <tbody>
              {regioner.map((r) => (
                <tr key={r.id}>
                  <Td className="font-medium">{r.name}</Td>
                  <Td className="text-fg-dim">{r.code}</Td>
                  <Td className="text-right tabular-nums">{r._count.users}</Td>
                  <Td className="text-right tabular-nums">{r._count.teams}</Td>
                  <Td className="text-right tabular-nums">
                    {r._count.missions}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ChartCard>

        <ChartCard title="Roller">
          <Table>
            <thead>
              <tr>
                <Th>Roll</Th>
                <Th className="text-right">Användare</Th>
              </tr>
            </thead>
            <tbody>
              {roller.map((r) => (
                <tr key={r.role}>
                  <Td className="font-medium">
                    {ROLE_LABELS[r.role as Role] ?? r.role}
                  </Td>
                  <Td className="text-right tabular-nums">{r._count.role}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Sökinriktningar">
          <Table>
            <thead>
              <tr>
                <Th>Namn</Th>
                <Th>Etikett</Th>
                <Th className="text-right">Hundar</Th>
                <Th className="text-right">Uppdrag</Th>
              </tr>
            </thead>
            <tbody>
              {inriktningar.map((d) => (
                <tr key={d.id}>
                  <Td className="font-medium">{d.name}</Td>
                  <Td>
                    <MiniTag>{d.shortLabel}</MiniTag>
                  </Td>
                  <Td className="text-right tabular-nums">{d._count.dogs}</Td>
                  <Td className="text-right tabular-nums">
                    {d._count.missions}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ChartCard>

        <ChartCard title="Certifikattyper">
          <Table>
            <thead>
              <tr>
                <Th>Namn</Th>
                <Th>Gäller</Th>
                <Th className="text-right">Giltighet</Th>
                <Th className="text-right">Utfärdade</Th>
              </tr>
            </thead>
            <tbody>
              {certTyper.map((t) => (
                <tr key={t.id}>
                  <Td className="font-medium">{t.name}</Td>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {CERT_APPLIES_TO_LABELS[t.appliesTo] ?? t.appliesTo}
                  </Td>
                  <Td className="whitespace-nowrap text-right tabular-nums text-fg-muted">
                    {t.validityMonths} mån
                  </Td>
                  <Td className="text-right tabular-nums">
                    {t._count.certifications}
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
