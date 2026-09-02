import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ChartCard } from "@/components/AdminCharts";
import { Table, Td, Th } from "@/components/PanelUI";
import { requireCapability } from "@/lib/auth";
import { db } from "@/lib/db";
import { regionScope, seesAllRegions } from "@/lib/authz";
import { formatShortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Kunder" };

export default async function PanelCustomersPage() {
  const user = await requireCapability("stats:view");

  // En kund syns om den har uppdrag inom användarens region. En regionalt
  // ansvarig ska inte se andra regioners kundregister, och uppdragslistan
  // per kund avgränsas på samma sätt.
  const omrade = regionScope(user);
  const kunder = await db.customer.findMany({
    where: seesAllRegions(user) ? {} : { missions: { some: omrade } },
    include: {
      missions: {
        where: omrade,
        select: { id: true, startAt: true, status: true, title: true },
        orderBy: { startAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <AdminShell
      user={user}
      aktiv="/panel/kunder"
      title="Kunder"
      subtitle={`${kunder.length} kunder`}
    >
      <ChartCard title="Alla kunder">
        {kunder.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-fg-muted">
            Inga kunder registrerade.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Kund</Th>
                <Th>Organisationsnummer</Th>
                <Th>Kontaktperson</Th>
                <Th>Telefon</Th>
                <Th className="text-right">Uppdrag</Th>
                <Th>Senaste uppdrag</Th>
              </tr>
            </thead>
            <tbody>
              {kunder.map((k) => (
                <tr key={k.id}>
                  <Td className="font-medium">{k.name}</Td>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {k.orgNumber ?? "–"}
                  </Td>
                  <Td className="text-fg-muted">{k.contactName ?? "–"}</Td>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {k.contactPhone ?? "–"}
                  </Td>
                  <Td className="text-right tabular-nums">
                    {k.missions.length}
                  </Td>
                  <Td className="text-fg-muted">
                    {k.missions[0] ? (
                      <>
                        {k.missions[0].title}
                        <span className="block text-[11px] text-fg-dim">
                          {formatShortDate(k.missions[0].startAt)}
                        </span>
                      </>
                    ) : (
                      "–"
                    )}
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
