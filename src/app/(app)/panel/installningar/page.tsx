import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ChartCard } from "@/components/AdminCharts";
import { StatusDot, Table, Td, Th } from "@/components/PanelUI";
import { requireCapability } from "@/lib/auth";
import { db } from "@/lib/db";
import { usesCloudStorage, BUCKET } from "@/lib/storage";
import {
  CERT_WARNING_DAYS,
  MISSION_TYPES,
  SEARCH_ENVIRONMENTS,
  TARGET_ODORS,
  TRAINING_AREAS,
} from "@/lib/domain";

export const metadata: Metadata = { title: "Inställningar" };

/**
 * Vad systemet är inställt på just nu. Värdena är avsiktligt läsbara men
 * inte redigerbara härifrån – de sätts i miljövariabler och i koden, och
 * en knapp som låtsas ändra dem vore värre än ingen knapp alls. Sidan
 * säger i stället var var sak ställs in.
 */
export default async function PanelSettingsPage() {
  const admin = await requireCapability("admin:manage");

  const [regioner, certTyper, inriktningar, media] = await Promise.all([
    db.region.count(),
    db.certificationType.count(),
    db.searchDiscipline.count(),
    db.mediaAsset.count(),
  ]);

  const moln = usesCloudStorage();

  const drift = [
    {
      namn: "Bilagor lagras i",
      varde: moln ? `Supabase Storage (${BUCKET})` : "Filsystemet på servern",
      ok: moln,
      stalls: moln
        ? "SUPABASE_URL och SUPABASE_SERVICE_ROLE_KEY"
        : "Sätt SUPABASE_URL och SUPABASE_SERVICE_ROLE_KEY för molnlagring",
    },
    {
      namn: "Sparade bilagor",
      varde: `${media} st`,
      ok: true,
      stalls: "Laddas upp från träningspass, rapporter och profiler",
    },
    {
      namn: "Varning före certifikat går ut",
      varde: `${CERT_WARNING_DAYS} dagar`,
      ok: true,
      stalls: "CERT_WARNING_DAYS i src/lib/domain.ts",
    },
    {
      namn: "Påminnelsejobb",
      varde: "Kräver nyckel",
      ok: true,
      stalls: "CRON_KEY, anropas på /api/cron",
    },
  ];

  const listor = [
    { namn: "Träningsområden", varden: TRAINING_AREAS },
    { namn: "Sökmiljöer", varden: SEARCH_ENVIRONMENTS },
    { namn: "Måldofter", varden: TARGET_ODORS },
    { namn: "Uppdragstyper", varden: MISSION_TYPES },
  ];

  return (
    <AdminShell
      user={admin}
      aktiv="/panel/installningar"
      title="Inställningar"
      subtitle="Systemets nuvarande läge och var varje sak ställs in"
    >
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Ruta rubrik="Regioner" varde={regioner} />
        <Ruta rubrik="Sökinriktningar" varde={inriktningar} />
        <Ruta rubrik="Certifikattyper" varde={certTyper} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Drift">
          <Table>
            <thead>
              <tr>
                <Th>Inställning</Th>
                <Th>Nuvarande värde</Th>
                <Th>Ställs in via</Th>
              </tr>
            </thead>
            <tbody>
              {drift.map((d) => (
                <tr key={d.namn}>
                  <Td className="font-medium">{d.namn}</Td>
                  <Td>
                    <StatusDot ok={d.ok}>{d.varde}</StatusDot>
                  </Td>
                  <Td className="text-fg-muted">{d.stalls}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ChartCard>

        <ChartCard title="Valbara värden i formulären">
          <Table>
            <thead>
              <tr>
                <Th>Lista</Th>
                <Th>Värden</Th>
              </tr>
            </thead>
            <tbody>
              {listor.map((l) => (
                <tr key={l.namn}>
                  <Td className="whitespace-nowrap font-medium">{l.namn}</Td>
                  <Td className="text-fg-muted">{l.varden.join(", ")}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p className="mt-3 text-[12px] text-fg-dim">
            Listorna är förslag i formulären – fritext är fortfarande
            tillåtet, så en ny sökmiljö kan skrivas in direkt av föraren.
          </p>
        </ChartCard>
      </div>
    </AdminShell>
  );
}

function Ruta({ rubrik, varde }: { rubrik: string; varde: number }) {
  return (
    <div className="card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
        {rubrik}
      </p>
      <p className="mt-1.5 text-[24px] font-bold leading-none">{varde}</p>
    </div>
  );
}
