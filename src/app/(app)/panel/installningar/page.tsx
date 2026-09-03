import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ChartCard } from "@/components/AdminCharts";
import { StatusDot, Td, Th } from "@/components/PanelUI";
import { requireCapability } from "@/lib/auth";
import { db } from "@/lib/db";
import { usesCloudStorage, BUCKET } from "@/lib/storage";
import { formatRelative } from "@/lib/format";
import {
  andradeNycklar,
  getSettings,
  NYCKLAR,
  RUBRIKER,
  type Settings,
} from "@/lib/settings";
import { SettingForm } from "./setting-form";

export const metadata: Metadata = { title: "Inställningar" };

const BESKRIVNINGAR: Record<keyof Settings, string> = {
  certWarningDays:
    "Hur långt före slutdatum ett certifikat räknas som snart utgånget, och när påminnelsen går ut.",
  trainingAreas:
    "Förslagen i rutan Träningsområde när ett pass rapporteras. Ett värde per rad.",
  searchEnvironments:
    "Förslagen i rutan Sökmiljö. Ett värde per rad; föraren kan fortfarande skriva något eget.",
  targetOdors: "Förslagen i rutan Måldoft. Ett värde per rad.",
  missionTypes: "Förslagen i rutan Uppdragstyp när ett uppdrag läggs upp.",
  missionChecklist:
    "Punkterna föraren bockar av i den operativa vyn under ett pågående uppdrag. Ett värde per rad.",
};

export default async function PanelSettingsPage() {
  const admin = await requireCapability("admin:manage");

  const [installningar, andrade, regioner, certTyper, inriktningar, media] =
    await Promise.all([
      getSettings(),
      andradeNycklar(),
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
      stalls: "SUPABASE_URL och SUPABASE_SERVICE_ROLE_KEY",
    },
    {
      namn: "Sparade bilagor",
      varde: `${media} st`,
      ok: true,
      stalls: "Laddas upp från träningspass, rapporter och profiler",
    },
    {
      namn: "Påminnelsejobb",
      varde: "Kräver nyckel",
      ok: true,
      stalls: "CRON_KEY, anropas på /api/cron",
    },
    {
      namn: "Databas",
      varde: "Ansluten",
      ok: true,
      stalls: "DATABASE_URL och DIRECT_URL",
    },
  ];

  /** Vem som ändrade en inställning, formaterat för formuläret. */
  const andradAv = (nyckel: keyof Settings) => {
    const rad = andrade.get(nyckel);
    if (!rad) return undefined;
    return {
      av: rad.updatedBy?.name ?? "okänd",
      nar: formatRelative(rad.updatedAt),
    };
  };

  /**
   * Versionsmärke för fältet, som byter värde när inställningen sparas
   * eller återställs – men aldrig medan någon skriver. Formuläret använder
   * det som React-nyckel: fältets defaultValue läses bara vid montering, så
   * utan nyckeln stod borttagna rader kvar i rutan efter en återställning,
   * och med en nyckel som följer själva värdet kunde fältet monteras om
   * mitt i inmatningen.
   */
  const version = (nyckel: keyof Settings) =>
    andrade.get(nyckel)?.updatedAt.toISOString() ?? "standard";

  return (
    <AdminShell
      user={admin}
      aktiv="/panel/installningar"
      title="Inställningar"
      subtitle={`${andrade.size} av ${NYCKLAR.length} inställningar avviker från standard`}
    >
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Ruta rubrik="Regioner" varde={regioner} />
        <Ruta rubrik="Sökinriktningar" varde={inriktningar} />
        <Ruta rubrik="Certifikattyper" varde={certTyper} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <ChartCard title="Verksamhetens värden">
          <p className="mb-1 text-[12px] text-fg-muted">
            Ändringarna slår igenom direkt i hela appen och loggas i
            systemloggen. Återställning tar bort det sparade värdet, så att
            standardvärdet gäller igen.
          </p>

          <SettingForm
            nyckel="certWarningDays"
            rubrik={RUBRIKER.certWarningDays}
            beskrivning={BESKRIVNINGAR.certWarningDays}
            varde={installningar.certWarningDays}
            typ="tal"
            andrad={andradAv("certWarningDays")}
            version={version("certWarningDays")}
          />
          {(
            [
              "trainingAreas",
              "searchEnvironments",
              "targetOdors",
              "missionTypes",
              "missionChecklist",
            ] as const
          ).map((nyckel) => (
            <SettingForm
              key={nyckel}
              nyckel={nyckel}
              rubrik={RUBRIKER[nyckel]}
              beskrivning={BESKRIVNINGAR[nyckel]}
              varde={installningar[nyckel]}
              typ="lista"
              andrad={andradAv(nyckel)}
              version={version(nyckel)}
            />
          ))}
        </ChartCard>

        <ChartCard title="Drift">
          <p className="mb-3 text-[12px] text-fg-muted">
            Sätts vid driftsättning och går inte att ändra härifrån – en
            knapp kan inte byta en miljövariabel i en process som redan kör.
          </p>
          {/* Egen tabell utan minsta bredd – den delade svämmar över i
              det här smala kortet. */}
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <Th>Inställning</Th>
                <Th>Ställs in via</Th>
              </tr>
            </thead>
            <tbody>
              {drift.map((d) => (
                <tr key={d.namn}>
                  <Td>
                    <span className="block font-medium">{d.namn}</span>
                    <StatusDot ok={d.ok}>{d.varde}</StatusDot>
                  </Td>
                  <Td className="break-words text-[12px] text-fg-muted">
                    {d.stalls}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
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
