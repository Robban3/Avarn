import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import {
  ChartCard,
  Donut,
  KpiCard,
  LineChart,
  BarList,
  SwedenMap,
} from "@/components/AdminCharts";
import {
  CardAction,
  CardLink,
  FeedRow,
  MiniTag,
  PanelButton,
  StatusDot,
  Table,
  Td,
  Th,
} from "@/components/PanelUI";
import {
  BriefcaseIcon,
  CertificateIcon,
  CheckCircleIcon,
  ClockIcon,
  DogIcon,
  KebabIcon,
  MessageIcon,
  PlusIcon,
  TrainingIcon,
  UsersIcon,
} from "@/components/icons";
import { Avatar } from "@/components/ui";
import { CERT_ICON_CLASSES } from "@/components/cert-styles";
import { requirePanelUser } from "@/lib/auth";
import { can } from "@/lib/authz";
import { db } from "@/lib/db";
import {
  capacityByDiscipline,
  certificationAlerts,
  coverageByRegion,
  periodStats,
  trainingHoursByMonth,
} from "@/lib/stats";
import { recentActivity } from "@/lib/dashboard";
import { getSettings } from "@/lib/settings";
import {
  change,
  dogCount,
  latestMissions,
  missionsByDiscipline,
  periodFran,
  previousRollingFrom,
  rollingFrom,
  teamRows,
} from "@/lib/panel";
import { certStatus } from "@/lib/certifications";
import {
  daysUntil,
  formatRelative,
  formatShortDate,
  formatTime,
} from "@/lib/format";
import { MISSION_STATUS_LABELS, PERIODER, type PeriodKey } from "@/lib/domain";
import { PanelFilters, PeriodSelect } from "./filters";

export const metadata: Metadata = { title: "Översikt" };

export default async function PanelPage({
  searchParams,
}: PageProps<"/panel">) {
  const user = await requirePanelUser();
  const params = await searchParams;
  const period = (
    typeof params.period === "string" && params.period in PERIODER
      ? params.period
      : "30d"
  ) as PeriodKey;
  const regionId = typeof params.region === "string" ? params.region : "";
  const disciplineId =
    typeof params.inriktning === "string" ? params.inriktning : "";
  const q = typeof params.sok === "string" ? params.sok : "";

  const fran = periodFran(period);

  const [
    denna,
    forra,
    hundar,
    fordelning,
    timmar,
    tackning,
    kapacitet,
    certifikat,
    uppdrag,
    aktivitet,
    ekipage,
    regioner,
    inriktningar,
    installningar,
  ] = await Promise.all([
    periodStats(user, rollingFrom()),
    periodStats(user, previousRollingFrom(), rollingFrom()),
    dogCount(user),
    missionsByDiscipline(user, fran),
    trainingHoursByMonth(user, 6),
    coverageByRegion(user),
    capacityByDiscipline(user),
    certificationAlerts(user, 3),
    latestMissions(user, 5),
    recentActivity(user, 5),
    teamRows(user, { regionId, disciplineId, q }, 6),
    db.region.findMany({ orderBy: { sortOrder: "asc" } }),
    db.searchDiscipline.findMany({ orderBy: { sortOrder: "asc" } }),
    getSettings(),
  ]);

  const kpis = [
    {
      icon: <UsersIcon className="h-5 w-5" />,
      label: "Aktiva ekipage",
      value: String(denna.teamCount),
      change: change(denna.teamCount, forra.teamCount),
    },
    {
      icon: <DogIcon className="h-5 w-5" />,
      label: "Aktiva hundar",
      value: String(hundar.count),
      change: null,
    },
    {
      icon: <BriefcaseIcon className="h-5 w-5" />,
      label: "Uppdrag senaste 30 dagarna",
      value: String(denna.missionCount),
      change: change(denna.missionCount, forra.missionCount),
    },
    {
      icon: <ClockIcon className="h-5 w-5" />,
      label: "Träningstimmar 30 dagar",
      value: `${denna.trainingHours} h`,
      change: change(denna.trainingHours, forra.trainingHours, " h"),
    },
    {
      icon: <CheckCircleIcon className="h-5 w-5" />,
      label: "Genomförandegrad",
      value:
        denna.completionRate === null ? "–" : `${denna.completionRate}%`,
      change: change(denna.completionRate, forra.completionRate, "%"),
    },
  ];

  return (
    <AdminShell
      user={user}
      aktiv="/panel"
      title="Översikt"
      subtitle={`Välkommen tillbaka, ${user.name}`}
      actions={
        <>
          <PeriodSelect value={period} />
          <PanelButton href={`/panel/export?vy=ekipage`}>Exportera</PanelButton>
        </>
      }
    >
      {/* Nyckeltal */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* Fördelning och utveckling */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Uppdrag översikt"
          action={
            <span className="rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[12px] text-fg-muted">
              {PERIODER[period].label}
            </span>
          }
          footer={
            <CardLink href="/panel/uppdrag">Visa fullständig rapport</CardLink>
          }
        >
          {fordelning.length === 0 ? (
            <Tomt text="Inga uppdrag i perioden." />
          ) : (
            <Donut slices={fordelning} centerLabel="Totalt uppdrag" />
          )}
        </ChartCard>

        <ChartCard
          title="Träningstimmar över tid"
          action={
            <span className="rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[12px] text-fg-muted">
              Senaste 6 månaderna
            </span>
          }
          footer={
            <CardLink href="/panel/traning">Visa fullständig rapport</CardLink>
          }
        >
          <LineChart
            points={timmar.map((t) => ({ label: t.label, value: t.hours }))}
            unit="h"
          />
        </ChartCard>
      </div>

      {/* Geografi, kapacitet och certifikat */}
      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Ekipage per region"
          action={<CardAction href="/panel/regioner">Visa alla</CardAction>}
          footer={<CardLink href="/panel/regioner">Visa på karta</CardLink>}
        >
          <div className="flex items-start gap-4">
            <SwedenMap
              regions={tackning.map((t) => ({
                code: t.region.code,
                name: t.region.name,
                teams: t.teams,
              }))}
            />
            {/* Egen, smal tabell här – den delade har en minsta bredd
                som inte får plats i ett tredjedelskort. */}
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <Th>Region</Th>
                  <Th className="text-right">Ekipage</Th>
                </tr>
              </thead>
              <tbody>
                {tackning.map((t) => (
                  <tr key={t.region.id}>
                    <Td className="whitespace-nowrap text-fg-muted">
                      {t.region.name}
                    </Td>
                    <Td className="text-right tabular-nums">{t.teams}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        <ChartCard
          title="Top 5 sökinriktningar"
          action={<CardAction href="/panel/hundar">Visa alla</CardAction>}
          footer={
            <CardLink href="/panel/hundar">Visa fullständig rapport</CardLink>
          }
        >
          {kapacitet.length === 0 ? (
            <Tomt text="Inga sökinriktningar registrerade." />
          ) : (
            <BarList
              rows={kapacitet
                .slice(0, 5)
                .map((k) => ({ label: k.name, value: k.count }))}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Certifikat som går ut snart"
          action={<CardAction href="/panel/certifikat">Visa alla</CardAction>}
          footer={
            <CardLink href="/panel/certifikat">Hantera certifikat</CardLink>
          }
        >
          {certifikat.length === 0 ? (
            <Tomt text="Inga certifikat kräver åtgärd." />
          ) : (
            <ul className="divide-y divide-line-soft">
              {certifikat.map(({ cert, status }) => {
                const dagar = daysUntil(cert.expiresAt);
                return (
                  <li key={cert.id}>
                    <FeedRow
                      icon={
                        <CertificateIcon
                          className={`h-5 w-5 ${CERT_ICON_CLASSES[status]}`}
                        />
                      }
                      title={cert.type.name}
                      subtitle={
                        cert.team
                          ? `${cert.team.dog.name} · ${cert.team.handler.name}`
                          : (cert.dog?.name ?? cert.user?.name ?? "")
                      }
                      meta={
                        dagar < 0
                          ? "Utgånget"
                          : `Går ut om ${dagar} ${dagar === 1 ? "dag" : "dagar"}`
                      }
                      href="/panel/certifikat"
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </ChartCard>
      </div>

      {/* Senaste uppdragen och aktivitet */}
      <div className="mb-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <ChartCard
          title="Senaste uppdragen"
          action={<CardAction href="/panel/uppdrag">Visa alla</CardAction>}
          footer={<CardLink href="/panel/uppdrag">Visa alla uppdrag</CardLink>}
        >
          <Table>
            <thead>
              <tr>
                <Th>Datum</Th>
                <Th>Uppdrag</Th>
                <Th>Plats</Th>
                <Th>Ekipage</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {uppdrag.map((m) => {
                const ekipagen = m.assignments
                  .map((a) => `${a.team.dog.name} & ${a.team.handler.name.split(" ")[0]}`)
                  .join(", ");
                return (
                  <tr key={m.id}>
                    <Td className="whitespace-nowrap text-fg-muted">
                      {formatShortDate(m.startAt)}, {formatTime(m.startAt)}
                    </Td>
                    <Td>
                      <Link
                        href={`/uppdrag/${m.id}`}
                        className="hover:text-brand"
                      >
                        {m.title}
                      </Link>
                    </Td>
                    <Td className="text-fg-muted">{m.locality}</Td>
                    <Td className="text-fg-muted">{ekipagen || "–"}</Td>
                    <Td>
                      <StatusDot ok={m.status === "COMPLETED"}>
                        {MISSION_STATUS_LABELS[m.status] ?? m.status}
                      </StatusDot>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </ChartCard>

        <ChartCard
          title="Aktivitetsfeed"
          action={<CardAction href="/panel/traning">Visa alla</CardAction>}
        >
          <ul className="divide-y divide-line-soft">
            {aktivitet.map((a) => (
              <li key={a.id}>
                <FeedRow
                  icon={
                    a.kind === "training" ? (
                      <TrainingIcon className="h-4 w-4" />
                    ) : a.kind === "mission" ? (
                      <BriefcaseIcon className="h-4 w-4" />
                    ) : (
                      <MessageIcon className="h-4 w-4" />
                    )
                  }
                  title={a.title}
                  subtitle={a.subtitle}
                  meta={formatRelative(a.at)}
                  href={a.href}
                />
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>

      {/* Ekipage med filter */}
      <ChartCard
        title="Ekipage översikt"
        action={
          <PanelFilters
            regions={regioner.map((r) => ({ id: r.id, name: r.name }))}
            disciplines={inriktningar.map((d) => ({ id: d.id, name: d.name }))}
            region={regionId}
            discipline={disciplineId}
            q={q}
            period={period}
          />
        }
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardLink href="/panel/ekipage">Visa alla ekipage</CardLink>
            {can(user, "admin:manage") ? (
              <Link
                href="/hundar/ny"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-[#06201e] transition-colors hover:bg-brand-strong"
              >
                <PlusIcon className="h-4 w-4" />
                Lägg till ekipage
              </Link>
            ) : null}
          </div>
        }
      >
        {ekipage.length === 0 ? (
          <Tomt text="Inga ekipage matchar filtret." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Ekipage</Th>
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
              {ekipage.map(({ team, senast }) => (
                <tr key={team.id}>
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <Avatar name={team.handler.name} size={30} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {team.handler.name}
                        </span>
                        <span className="block text-[11px] text-fg-dim">
                          Hundförare
                        </span>
                      </span>
                    </span>
                  </Td>
                  <Td>
                    <span className="flex items-center gap-2.5">
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
                    </span>
                  </Td>
                  <Td>
                    <span className="flex flex-wrap gap-1">
                      {team.dog.disciplines.map((d) => (
                        <MiniTag key={d.id}>{d.discipline.name}</MiniTag>
                      ))}
                    </span>
                  </Td>
                  <Td className="text-fg-muted">{team.region.name}</Td>
                  <Td>
                    <StatusDot ok={team.status === "ACTIVE"}>
                      {team.status === "ACTIVE" ? "Aktiv" : "Pausad"}
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
                          <CertificateIcon
                            key={c.id}
                            className={`h-4 w-4 ${CERT_ICON_CLASSES[certStatus(c.expiresAt, installningar.certWarningDays)]}`}
                          />
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

function Tomt({ text }: { text: string }) {
  return (
    <p className="py-8 text-center text-[13px] text-fg-muted">{text}</p>
  );
}
