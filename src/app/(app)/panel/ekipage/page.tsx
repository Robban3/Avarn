import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ChartCard } from "@/components/AdminCharts";
import {
  MiniTag,
  PanelButton,
  StatusDot,
  Table,
  Td,
  Th,
} from "@/components/PanelUI";
import { Avatar } from "@/components/ui";
import { CertificateIcon, KebabIcon } from "@/components/icons";
import { CERT_ICON_CLASSES } from "@/components/cert-styles";
import { requirePanelUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamRows } from "@/lib/panel";
import { certStatus, certValidityText } from "@/lib/certifications";
import { formatRelative } from "@/lib/format";
import { TEAM_STATUS_LABELS } from "@/lib/domain";
import { PanelFilters } from "../filters";

export const metadata: Metadata = { title: "Ekipage" };

export default async function PanelTeamsPage({
  searchParams,
}: PageProps<"/panel/ekipage">) {
  const user = await requirePanelUser();
  const params = await searchParams;
  const regionId = typeof params.region === "string" ? params.region : "";
  const disciplineId =
    typeof params.inriktning === "string" ? params.inriktning : "";
  const q = typeof params.sok === "string" ? params.sok : "";

  const [rader, regioner, inriktningar] = await Promise.all([
    teamRows(user, { regionId, disciplineId, q }, 200),
    db.region.findMany({ orderBy: { sortOrder: "asc" } }),
    db.searchDiscipline.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const query = new URLSearchParams({
    vy: "ekipage",
    ...(regionId ? { region: regionId } : {}),
    ...(disciplineId ? { inriktning: disciplineId } : {}),
    ...(q ? { sok: q } : {}),
  });

  return (
    <AdminShell
      user={user}
      aktiv="/panel/ekipage"
      title="Ekipage"
      subtitle={`${rader.length} ekipage inom din behörighet`}
      actions={
        <PanelButton href={`/panel/export?${query}`}>Exportera</PanelButton>
      }
    >
      <ChartCard
        title="Alla ekipage"
        action={
          <PanelFilters
            regions={regioner.map((r) => ({ id: r.id, name: r.name }))}
            disciplines={inriktningar.map((d) => ({ id: d.id, name: d.name }))}
            region={regionId}
            discipline={disciplineId}
            q={q}
          />
        }
      >
        {rader.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-fg-muted">
            Inga ekipage matchar filtret.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Hundförare</Th>
                <Th>Hund</Th>
                <Th>Sökinriktningar</Th>
                <Th>Region</Th>
                <Th>Status</Th>
                <Th>Senaste aktivitet</Th>
                <Th>Certifikat</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rader.map(({ team, senast }) => (
                <tr key={team.id}>
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <Avatar name={team.handler.name} size={30} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {team.handler.name}
                        </span>
                        <span className="block truncate text-[11px] text-fg-dim">
                          {team.handler.email}
                        </span>
                      </span>
                    </span>
                  </Td>
                  <Td>
                    <Link
                      href={`/hundar/${team.dogId}`}
                      className="flex items-center gap-2.5 transition-colors hover:text-brand"
                    >
                      <Avatar
                        name={team.dog.name}
                        photoUrl={team.dog.photoUrl}
                        size={30}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {team.dog.name}
                        </span>
                        <span className="block truncate text-[11px] text-fg-dim">
                          {team.dog.breed}
                        </span>
                      </span>
                    </Link>
                  </Td>
                  <Td>
                    <span className="flex flex-wrap gap-1">
                      {team.dog.disciplines.length === 0 ? (
                        <span className="text-fg-dim">–</span>
                      ) : (
                        team.dog.disciplines.map((d) => (
                          <MiniTag key={d.id}>{d.discipline.name}</MiniTag>
                        ))
                      )}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {team.region.name}
                  </Td>
                  <Td>
                    <StatusDot ok={team.status === "ACTIVE"}>
                      {TEAM_STATUS_LABELS[team.status] ?? team.status}
                    </StatusDot>
                  </Td>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {senast ? formatRelative(senast) : "–"}
                  </Td>
                  <Td>
                    <span className="flex gap-1">
                      {team.certifications.length === 0 ? (
                        <span className="text-fg-dim">–</span>
                      ) : (
                        team.certifications.map((c) => (
                          <span
                            key={c.id}
                            title={`${c.type.name}: ${certValidityText(c.expiresAt)}`}
                          >
                            <CertificateIcon
                              className={`h-4 w-4 ${CERT_ICON_CLASSES[certStatus(c.expiresAt)]}`}
                            />
                          </span>
                        ))
                      )}
                    </span>
                  </Td>
                  <Td>
                    <Link
                      href={`/hundar/${team.dogId}`}
                      aria-label={`Öppna ${team.dog.name}`}
                      className="inline-flex text-fg-dim transition-colors hover:text-fg"
                    >
                      <KebabIcon className="h-4 w-4" />
                    </Link>
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
