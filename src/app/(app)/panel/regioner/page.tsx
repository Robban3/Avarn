import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ChartCard, SwedenMap } from "@/components/AdminCharts";
import { Table, Td, Th } from "@/components/PanelUI";
import { requireCapability } from "@/lib/auth";
import { coverageByRegion, capacityByDiscipline } from "@/lib/stats";
import { db } from "@/lib/db";
import { REGION_LAN } from "@/lib/domain";

export const metadata: Metadata = { title: "Regioner" };

export default async function PanelRegionsPage() {
  const user = await requireCapability("stats:view");

  const [tackning, kapacitet, tillgangliga] = await Promise.all([
    coverageByRegion(user),
    capacityByDiscipline(user),
    // Ekipage som är tillgängliga just nu – kapaciteten man faktiskt kan
    // ta ut, inte bara den som finns på pappret.
    db.teamAvailability.findMany({
      where: {
        kind: "AVAILABLE",
        startAt: { lte: new Date() },
        endAt: { gte: new Date() },
      },
      select: { teamId: true, team: { select: { regionId: true } } },
    }),
  ]);

  const perRegion = new Map<string, number>();
  for (const a of tillgangliga) {
    perRegion.set(
      a.team.regionId,
      (perRegion.get(a.team.regionId) ?? 0) + 1,
    );
  }

  const totalt = tackning.reduce((s, t) => s + t.teams, 0);

  return (
    <AdminShell
      user={user}
      aktiv="/panel/regioner"
      title="Regioner"
      subtitle={`${totalt} ekipage fördelade på ${tackning.length} regioner`}
    >
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <ChartCard title="Geografisk täckning">
          <div className="flex justify-center py-2">
            <SwedenMap
              className="h-[300px] w-auto"
              regions={tackning.map((t) => ({
                code: t.region.code,
                name: t.region.name,
                teams: t.teams,
              }))}
            />
          </div>
          <p className="mt-2 text-center text-[11px] text-fg-dim">
            Mörkare ton betyder fler ekipage. Länsgränserna är öppna data,
            se data/KALLA.md.
          </p>
        </ChartCard>

        <div className="space-y-4">
          <ChartCard title="Kapacitet per region">
            <Table>
              <thead>
                <tr>
                  <Th>Region</Th>
                  <Th className="text-right">Ekipage</Th>
                  <Th className="text-right">Tillgängliga nu</Th>
                  <Th className="text-right">Uppdrag 30 dagar</Th>
                  <Th className="text-right">Träningstimmar</Th>
                </tr>
              </thead>
              <tbody>
                {tackning.map((t) => (
                  <tr key={t.region.id}>
                    <Td>
                      <span className="font-medium">{t.region.name}</span>
                      <span className="mt-0.5 block text-[11px] text-fg-dim">
                        {(REGION_LAN[t.region.code] ?? []).join(", ") || "–"}
                      </span>
                    </Td>
                    <Td className="text-right tabular-nums">{t.teams}</Td>
                    <Td className="text-right tabular-nums text-fg-muted">
                      {perRegion.get(t.region.id) ?? 0}
                    </Td>
                    <Td className="text-right tabular-nums text-fg-muted">
                      {t.missions}
                    </Td>
                    <Td className="text-right tabular-nums text-fg-muted">
                      {t.trainingHours} h
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ChartCard>

          <ChartCard title="Sökinriktningar i din behörighet">
            <Table>
              <thead>
                <tr>
                  <Th>Sökinriktning</Th>
                  <Th className="text-right">Ekipage</Th>
                </tr>
              </thead>
              <tbody>
                {kapacitet.map((k) => (
                  <tr key={k.name}>
                    <Td className="font-medium">{k.name}</Td>
                    <Td className="text-right tabular-nums">{k.count}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ChartCard>
        </div>
      </div>
    </AdminShell>
  );
}
