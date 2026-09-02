import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ChartCard } from "@/components/AdminCharts";
import { Table, Td, Th } from "@/components/PanelUI";
import { Badge } from "@/components/ui";
import { AlertIcon, CertificateIcon, LockIcon } from "@/components/icons";
import { CERT_ICON_CLASSES } from "@/components/cert-styles";
import { requirePanelUser } from "@/lib/auth";
import { certificationOverview } from "@/lib/panel";
import { certStatus } from "@/lib/certifications";
import { daysUntil, formatDate } from "@/lib/format";


export const metadata: Metadata = { title: "Certifikat & behörigheter" };

export default async function PanelCertsPage() {
  const user = await requirePanelUser();
  const { utgangna, snart, saknade, ejTillgangliga, teams, certWarningDays } =
    await certificationOverview(user);

  return (
    <AdminShell
      user={user}
      aktiv="/panel/certifikat"
      title="Certifikat & behörigheter"
      subtitle={`${teams.length} ekipage · ${utgangna.length} utgångna, ${snart.length} går ut inom ${certWarningDays} dagar`}
    >
      {/* Det som hindrar arbete står först */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Ekipage som inte får tas ut">
          {ejTillgangliga.length === 0 ? (
            <Tomt text="Alla ekipage har giltig grundbehörighet." />
          ) : (
            <ul className="divide-y divide-line-soft">
              {ejTillgangliga.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <LockIcon className="h-5 w-5 shrink-0 text-danger" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">
                      {t.dog.name} &amp; {t.handler.name}
                    </span>
                    <span className="block text-[12px] text-fg-muted">
                      Saknar giltigt NHPR eller auktoriserat ekipage ·{" "}
                      {t.region.name}
                    </span>
                  </span>
                  <Link
                    href="/certifikat"
                    className="shrink-0 text-[12px] font-medium text-brand"
                  >
                    Åtgärda
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>

        <ChartCard title="Saknade utbildningar">
          {saknade.length === 0 ? (
            <Tomt text="Varje sökinriktning har sitt certifikat." />
          ) : (
            <ul className="divide-y divide-line-soft">
              {saknade.map((s) => (
                <li
                  key={`${s.team.id}-${s.inriktning}`}
                  className="flex items-center gap-3 py-3"
                >
                  <AlertIcon className="h-5 w-5 shrink-0 text-warn" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">
                      {s.team.dog.name}: {s.inriktning}
                    </span>
                    <span className="block text-[12px] text-fg-muted">
                      Hunden söker på inriktningen men saknar giltigt
                      certifikat för den
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title={`Utgångna behörigheter (${utgangna.length})`}>
          {utgangna.length === 0 ? (
            <Tomt text="Inget certifikat har gått ut." />
          ) : (
            <CertTabell rader={utgangna} />
          )}
        </ChartCard>

        <ChartCard
          title={`Går ut inom ${certWarningDays} dagar (${snart.length})`}
        >
          {snart.length === 0 ? (
            <Tomt text="Inget certifikat närmar sig sitt slutdatum." />
          ) : (
            <CertTabell rader={snart} />
          )}
        </ChartCard>
      </div>
    </AdminShell>
  );
}

function CertTabell({
  rader,
}: {
  rader: {
    cert: { id: string; expiresAt: Date; type: { name: string } };
    agare: string;
  }[];
}) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Certifikat</Th>
          <Th>Gäller</Th>
          <Th>Giltigt t.o.m.</Th>
          <Th>Läge</Th>
        </tr>
      </thead>
      <tbody>
        {rader.map(({ cert, agare }) => {
          const status = certStatus(cert.expiresAt);
          const kvar = daysUntil(cert.expiresAt);
          return (
            <tr key={cert.id}>
              <Td>
                <span className="flex items-center gap-2.5 font-medium">
                  <CertificateIcon
                    className={`h-4 w-4 shrink-0 ${CERT_ICON_CLASSES[status]}`}
                  />
                  {cert.type.name}
                </span>
              </Td>
              <Td className="text-fg-muted">{agare}</Td>
              <Td className="whitespace-nowrap text-fg-muted">
                {formatDate(cert.expiresAt)}
              </Td>
              <Td>
                <Badge
                  tone={
                    status === "VALID"
                      ? "ok"
                      : status === "EXPIRING"
                        ? "warn"
                        : "danger"
                  }
                >
                  {status === "EXPIRED"
                    ? `Utgånget sedan ${Math.abs(kvar)} d`
                    : kvar === 0
                      ? "Går ut idag"
                      : `${kvar} dagar kvar`}
                </Badge>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

function Tomt({ text }: { text: string }) {
  return <p className="py-8 text-center text-[13px] text-fg-muted">{text}</p>;
}
