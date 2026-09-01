import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { BarList, ChartCard } from "@/components/AdminCharts";
import { MiniTag, StatusDot, Table, Td, Th } from "@/components/PanelUI";
import { Avatar } from "@/components/ui";
import { requirePanelUser } from "@/lib/auth";
import { teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { capacityByDiscipline } from "@/lib/stats";
import { ageInYears } from "@/lib/format";
import { DOG_STATUS_LABELS } from "@/lib/domain";

export const metadata: Metadata = { title: "Hundar" };

export default async function PanelDogsPage() {
  const user = await requirePanelUser();

  const [teams, kapacitet] = await Promise.all([
    db.team.findMany({
      where: teamScope(user),
      include: {
        handler: true,
        region: true,
        dog: {
          include: {
            disciplines: { include: { discipline: true } },
            educations: true,
          },
        },
      },
      orderBy: [{ dog: { name: "asc" } }],
    }),
    capacityByDiscipline(user),
  ]);

  return (
    <AdminShell
      user={user}
      aktiv="/panel/hundar"
      title="Hundar"
      subtitle={`${teams.length} hundar inom din behörighet`}
    >
      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_340px]">
        <ChartCard title="Alla hundar">
          <Table>
            <thead>
              <tr>
                <Th>Hund</Th>
                <Th>Ras</Th>
                <Th>Ålder</Th>
                <Th>Sökinriktningar</Th>
                <Th>Utbildningar</Th>
                <Th>Förare</Th>
                <Th>Region</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {teams.map(({ dog, handler, region, id }) => (
                <tr key={id}>
                  <Td>
                    <Link
                      href={`/hundar/${dog.id}`}
                      className="flex items-center gap-2.5 font-medium transition-colors hover:text-brand"
                    >
                      <Avatar name={dog.name} photoUrl={dog.photoUrl} size={30} />
                      {dog.name}
                    </Link>
                  </Td>
                  <Td className="text-fg-muted">{dog.breed}</Td>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {ageInYears(dog.birthDate)} år
                  </Td>
                  <Td>
                    <span className="flex flex-wrap gap-1">
                      {dog.disciplines.map((d) => (
                        <MiniTag key={d.id}>{d.discipline.name}</MiniTag>
                      ))}
                    </span>
                  </Td>
                  <Td className="tabular-nums text-fg-muted">
                    {dog.educations.length}
                  </Td>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {handler.name}
                  </Td>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {region.name}
                  </Td>
                  <Td>
                    <StatusDot ok={dog.status === "ACTIVE"}>
                      {DOG_STATUS_LABELS[dog.status] ?? dog.status}
                    </StatusDot>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ChartCard>

        <ChartCard title="Kapacitet per sökinriktning">
          {kapacitet.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-fg-muted">
              Inga sökinriktningar registrerade.
            </p>
          ) : (
            <BarList
              rows={kapacitet.map((k) => ({ label: k.name, value: k.count }))}
            />
          )}
        </ChartCard>
      </div>
    </AdminShell>
  );
}
