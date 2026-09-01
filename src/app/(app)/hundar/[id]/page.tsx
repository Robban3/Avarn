import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Badge, CardHeader, Chip, StatusPill } from "@/components/ui";
import {
  EducationTimeline,
  InfoTile,
  KeyRow,
  ProfileAction,
  ProfileTabs,
} from "@/components/DogProfile";
import {
  AlertIcon,
  BriefcaseIcon,
  CalendarIcon,
  CertificateIcon,
  ChevronRightIcon,
  ChipIcon,
  ClipboardIcon,
  FolderIcon,
  GraduationIcon,
  HeightIcon,
  MessageIcon,
  PaletteIcon,
  PawIcon,
  PencilIcon,
  PlusCircleIcon,
  ScaleIcon,
  ScentIcon,
  SexIcon,
  ShieldIcon,
  TrainingIcon,
  XCircleIcon,
} from "@/components/icons";
import { CERT_ICON_CLASSES } from "@/components/cert-styles";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { can, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import {
  ageInYears,
  daysUntil,
  formatDate,
  formatNumber,
  formatShortDate,
} from "@/lib/format";
import { DOG_STATUS_LABELS, SESSION_STATUS_LABELS } from "@/lib/domain";
import { certStatus } from "@/lib/certifications";

export const metadata: Metadata = { title: "Hund" };

const TABS = [
  { value: "oversikt", label: "Översikt" },
  { value: "traning", label: "Träning" },
  { value: "certifikat", label: "Certifikat" },
  { value: "dokument", label: "Dokument" },
  { value: "historik", label: "Historik" },
];

/** Ikon per utbildningssteg, utifrån vad utbildningen heter. */
function educationIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("grund")) return <GraduationIcon className="h-6 w-6" />;
  if (lower.includes("fortsätt")) return <CertificateIcon className="h-6 w-6" />;
  if (lower.includes("specialist")) return <ScentIcon className="h-6 w-6" />;
  return <PawIcon className="h-6 w-6" />;
}

export default async function DogPage({
  params,
  searchParams,
}: PageProps<"/hundar/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const tab = typeof query.flik === "string" ? query.flik : "oversikt";

  const user = await requireUser();
  const unread = await unreadNotificationCount(user.id);

  // Hunden nås alltid via ett ekipage inom behörigheten, aldrig direkt på id.
  const team = await db.team.findFirst({
    where: { dogId: id, ...teamScope(user) },
    include: {
      handler: { include: { handlerProfile: true } },
      region: true,
      dog: {
        include: {
          disciplines: { include: { discipline: true } },
          educations: { orderBy: { completedAt: "asc" } },
          certifications: { include: { type: true } },
          photos: { orderBy: { createdAt: "desc" } },
        },
      },
      certifications: {
        include: { type: true, documents: true },
        orderBy: { expiresAt: "asc" },
      },
      trainingSessions: {
        orderBy: { startAt: "desc" },
        take: 20,
        include: { discipline: true, _count: { select: { media: true } } },
      },
      missionAssignments: {
        include: { mission: true },
        orderBy: { mission: { startAt: "desc" } },
        take: 10,
      },
      reports: {
        include: { mission: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      comments: { include: { author: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!team) notFound();
  const { dog } = team;

  const certifications = [...team.certifications, ...dog.certifications].sort(
    (a, b) => a.expiresAt.getTime() - b.expiresAt.getTime(),
  );

  const editable = can(user, "dog:create");

  // Dokument: intyg kopplade till certifikaten, samt hundens bilder.
  const documents = [
    ...team.certifications.flatMap((cert) =>
      cert.documents.map((doc) => ({
        id: doc.id,
        name: doc.originalName,
        context: cert.type.name,
        kind: doc.kind,
      })),
    ),
    ...dog.photos.map((photo) => ({
      id: photo.id,
      name: photo.originalName,
      context: "Foto",
      kind: photo.kind,
    })),
  ];

  // Historik: träning, uppdrag och kommentarer i tidsordning.
  const history = [
    ...team.trainingSessions.map((s) => ({
      id: `s-${s.id}`,
      at: s.startAt,
      icon: <PawIcon className="h-5 w-5" />,
      title: `Träning – ${s.trainingArea}`,
      subtitle: s.location,
      detail: `${s.foundCount}/${s.hideCount} markeringar`,
      href: `/traning/${s.id}`,
    })),
    ...team.reports.map((r) => ({
      id: `r-${r.id}`,
      at: r.submittedAt ?? r.createdAt,
      icon: <BriefcaseIcon className="h-5 w-5" />,
      title: `Uppdrag – ${r.mission.title}`,
      subtitle: r.mission.locality,
      detail: null,
      href: `/rapporter/${r.id}`,
    })),
    ...team.comments.map((c) => ({
      id: `c-${c.id}`,
      at: c.createdAt,
      icon: <MessageIcon className="h-5 w-5" />,
      title: `Kommentar från ${c.author.name}`,
      subtitle: c.body.slice(0, 90),
      detail: null,
      href: `/hundar/${dog.id}`,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  const hrefFor = (value: string) =>
    value === "oversikt" ? `/hundar/${dog.id}` : `/hundar/${dog.id}?flik=${value}`;

  return (
    <AppShell
      title={dog.name}
      backHref="/hundar"
      unread={unread}
      role={user.role}
      action={
        editable ? (
          <Link
            href={`/hundar/${dog.id}/redigera`}
            aria-label="Redigera hunden"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-2"
          >
            <PencilIcon className="h-[22px] w-[22px]" />
          </Link>
        ) : undefined
      }
    >
      <ProfileTabs tabs={TABS} active={tab} hrefFor={hrefFor} />

      {/* Hjältekort – visas på alla flikar, det är hundens identitet */}
      <section className="card mb-4 overflow-hidden sm:flex">
        {dog.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dog.photoUrl}
            alt=""
            className="h-56 w-full object-cover sm:h-auto sm:w-64 sm:shrink-0"
          />
        ) : (
          <span className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-brand/20 to-surface-3 text-brand sm:h-auto sm:w-64 sm:shrink-0">
            <PawIcon className="h-12 w-12" />
          </span>
        )}

        <div className="min-w-0 flex-1 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold leading-none">{dog.name}</h2>
            <StatusPill tone={dog.status === "ACTIVE" ? "brand" : "neutral"}>
              {(DOG_STATUS_LABELS[dog.status] ?? dog.status).toUpperCase()}
            </StatusPill>
          </div>
          <p className="mt-2 text-[15px] text-fg-muted">{dog.breed}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-muted">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-[18px] w-[18px] text-fg-dim" />
              {ageInYears(dog.birthDate)} år
            </span>
            <span>Född: {dog.birthDate.toISOString().slice(0, 10)}</span>
            {dog.sex ? (
              <span className="flex items-center gap-1.5">
                <SexIcon className="h-[18px] w-[18px] text-fg-dim" />
                {dog.sex === "HANE" ? "Hane" : "Tik"}
              </span>
            ) : null}
          </div>

          {dog.disciplines.length > 0 ? (
            <div className="mt-4">
              <p className="section-label mb-2">Sökinriktningar</p>
              <div className="flex flex-wrap gap-2">
                {dog.disciplines.map((d) => (
                  <Chip key={d.id}>{d.discipline.name}</Chip>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {tab === "oversikt" ? (
        <>
          {/* Förare, chip, registrering och försäkring */}
          <section className="card mb-4 grid divide-y divide-line-soft sm:grid-cols-2 sm:divide-y-0">
            <div className="divide-y divide-line-soft sm:border-r sm:border-line-soft">
              <InfoTile
                icon={<PawIcon className="h-[18px] w-[18px]" />}
                label="Förare"
                href={`/instruktor/ekipage/${team.id}`}
              >
                {team.handler.name}
              </InfoTile>
              <InfoTile
                icon={<ShieldIcon className="h-[18px] w-[18px]" />}
                label="Reg.nummer"
              >
                {dog.registrationNumber ?? "—"}
              </InfoTile>
            </div>
            <div className="divide-y divide-line-soft">
              <InfoTile
                icon={<ChipIcon className="h-[18px] w-[18px]" />}
                label="Mikrochip"
              >
                {dog.chipNumber ?? "—"}
              </InfoTile>
              <InfoTile
                icon={<ShieldIcon className="h-[18px] w-[18px]" />}
                label="Försäkring"
                sub={
                  dog.insuranceValidTo
                    ? `Giltig t.o.m. ${dog.insuranceValidTo.toISOString().slice(0, 10)}`
                    : undefined
                }
              >
                {dog.insurer ?? "—"}
              </InfoTile>
            </div>
          </section>

          {/* Utbildningstidslinje */}
          <section className="card mb-4 overflow-hidden">
            <CardHeader title="Utbildningar" />
            <EducationTimeline
              educations={dog.educations.map((e) => ({
                id: e.id,
                name: e.name,
                icon: educationIcon(e.name),
                completed: e.completedAt !== null,
                date: e.completedAt
                  ? e.completedAt.toISOString().slice(0, 10)
                  : null,
              }))}
            />
          </section>

          {/* Certifikat och nyckelinformation */}
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <section className="card overflow-hidden">
              <CardHeader title="Certifikat & behörigheter" href="/certifikat" />
              {certifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-fg-muted">
                  Inga registrerade certifikat.
                </p>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {certifications.slice(0, 5).map((cert) => {
                    const status = certStatus(cert.expiresAt);
                    const days = daysUntil(cert.expiresAt);
                    return (
                      <li
                        key={cert.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        {status === "VALID" ? (
                          <CertificateIcon
                            className={`h-5 w-5 shrink-0 ${CERT_ICON_CLASSES[status]}`}
                          />
                        ) : (
                          <AlertIcon
                            className={`h-5 w-5 shrink-0 ${CERT_ICON_CLASSES[status]}`}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {cert.type.name}
                          </p>
                          <p className="truncate text-xs text-fg-muted">
                            {status === "EXPIRED"
                              ? `Gick ut ${cert.expiresAt.toISOString().slice(0, 10)}`
                              : status === "EXPIRING"
                                ? `Går ut om ${days} dagar`
                                : `Giltig t.o.m. ${cert.expiresAt.toISOString().slice(0, 10)}`}
                          </p>
                        </div>
                        <Badge
                          tone={
                            status === "VALID"
                              ? "ok"
                              : status === "EXPIRING"
                                ? "warn"
                                : "danger"
                          }
                        >
                          {status === "VALID"
                            ? "Giltig"
                            : status === "EXPIRING"
                              ? "Snart utgående"
                              : "Utgången"}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="card overflow-hidden">
              <CardHeader title="Nyckelinformation" />
              <div className="py-1.5">
                <KeyRow
                  icon={<ScaleIcon className="h-[18px] w-[18px]" />}
                  label="Vikt"
                  value={dog.weightKg ? `${formatNumber(dog.weightKg)} kg` : "—"}
                />
                <KeyRow
                  icon={<HeightIcon className="h-[18px] w-[18px]" />}
                  label="Höjd"
                  value={dog.heightCm ? `${dog.heightCm} cm` : "—"}
                />
                <KeyRow
                  icon={<PaletteIcon className="h-[18px] w-[18px]" />}
                  label="Färg"
                  value={dog.color ?? "—"}
                />
                <KeyRow
                  icon={<ScentIcon className="h-[18px] w-[18px]" />}
                  label="HD / ED"
                  value={dog.hipsElbows ?? "—"}
                />
                <KeyRow
                  icon={<ScentIcon className="h-[18px] w-[18px]" />}
                  label="Mentalindex (MH)"
                  value={dog.mentalIndex ?? "—"}
                />
                <KeyRow
                  icon={<PlusCircleIcon className="h-[18px] w-[18px]" />}
                  label="Import"
                  value={dog.originCountry ?? "—"}
                />
                <KeyRow
                  icon={<XCircleIcon className="h-[18px] w-[18px]" />}
                  label="Kastrerad"
                  value={
                    dog.neutered === null || dog.neutered === undefined
                      ? "—"
                      : dog.neutered
                        ? "Ja"
                        : "Nej"
                  }
                />
              </div>
            </section>
          </div>

          {/* Senaste aktivitet */}
          <section className="card mb-4 overflow-hidden">
            <CardHeader
              title="Senaste aktivitet"
              href={hrefFor("historik")}
            />
            {history.length === 0 ? (
              <p className="px-4 py-6 text-sm text-fg-muted">
                Ingen aktivitet ännu.
              </p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {history.slice(0, 3).map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                    >
                      <span className="shrink-0 text-brand">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-fg-muted">
                          {item.subtitle}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-fg-muted">
                        {formatShortDate(item.at)}
                      </span>
                      {item.detail ? (
                        <Badge tone="ok">{item.detail}</Badge>
                      ) : (
                        <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Åtgärder */}
          <div className="flex gap-3">
            <ProfileAction
              href="/traning/nytt"
              icon={<PawIcon className="h-6 w-6" />}
            >
              Lägg till träning
            </ProfileAction>
            {can(user, "mission:create") ? (
              <ProfileAction
                href="/uppdrag/nytt"
                icon={<CalendarIcon className="h-6 w-6" />}
              >
                Nytt uppdrag
              </ProfileAction>
            ) : (
              <ProfileAction
                href="/uppdrag"
                icon={<BriefcaseIcon className="h-6 w-6" />}
              >
                Uppdrag
              </ProfileAction>
            )}
            <ProfileAction
              href={hrefFor("dokument")}
              icon={<FolderIcon className="h-6 w-6" />}
            >
              Dokument
            </ProfileAction>
          </div>
        </>
      ) : null}

      {tab === "traning" ? (
        <section className="card overflow-hidden">
          <CardHeader title="Träningspass" href="/traning" />
          {team.trainingSessions.length === 0 ? (
            <p className="px-4 py-6 text-sm text-fg-muted">
              Inga registrerade träningspass.
            </p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {team.trainingSessions.map((session) => (
                <li key={session.id}>
                  <Link
                    href={`/traning/${session.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                  >
                    <TrainingIcon className="h-5 w-5 shrink-0 text-brand" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {session.trainingArea} – {session.environment}
                      </p>
                      <p className="truncate text-xs text-fg-muted">
                        {formatDate(session.startAt)} · {session.location}
                      </p>
                      <p className="text-xs text-brand">
                        {session.foundCount}/{session.hideCount} markeringar
                      </p>
                    </div>
                    <Badge
                      tone={session.status === "APPROVED" ? "ok" : "neutral"}
                    >
                      {SESSION_STATUS_LABELS[session.status] ?? session.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "certifikat" ? (
        <section className="card overflow-hidden">
          <CardHeader title="Certifikat & behörigheter" href="/certifikat" />
          {certifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-fg-muted">
              Inga registrerade certifikat.
            </p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {certifications.map((cert) => {
                const status = certStatus(cert.expiresAt);
                return (
                  <li key={cert.id} className="flex items-start gap-3 px-4 py-3.5">
                    <CertificateIcon
                      className={`mt-0.5 h-5 w-5 shrink-0 ${CERT_ICON_CLASSES[status]}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{cert.type.name}</p>
                      <p className="text-xs text-fg-muted">
                        Utfärdat {cert.issuedAt.toISOString().slice(0, 10)}
                        {cert.issuer ? ` av ${cert.issuer}` : ""}
                      </p>
                      <p className="text-xs text-fg-dim">
                        Giltig t.o.m. {cert.expiresAt.toISOString().slice(0, 10)}
                        {cert.reference ? ` · ${cert.reference}` : ""}
                      </p>
                    </div>
                    <Badge
                      tone={
                        status === "VALID"
                          ? "ok"
                          : status === "EXPIRING"
                            ? "warn"
                            : "danger"
                      }
                    >
                      {status === "VALID"
                        ? "Giltig"
                        : status === "EXPIRING"
                          ? "Snart utgående"
                          : "Utgången"}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "dokument" ? (
        <section className="card overflow-hidden">
          <CardHeader title="Dokument" />
          {documents.length === 0 ? (
            <p className="px-4 py-6 text-sm text-fg-muted">
              Inga dokument. Intyg som bifogas ett certifikat och foton på
              hunden samlas här.
            </p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <a
                    href={`/api/media/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                  >
                    <ClipboardIcon className="h-5 w-5 shrink-0 text-fg-dim" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.name}</p>
                      <p className="truncate text-xs text-fg-muted">
                        {doc.context}
                      </p>
                    </div>
                    <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "historik" ? (
        <section className="card overflow-hidden">
          <CardHeader title="Historik" />
          {history.length === 0 ? (
            <p className="px-4 py-6 text-sm text-fg-muted">
              Ingen aktivitet ännu.
            </p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {history.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                  >
                    <span className="shrink-0 text-brand">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-fg-muted">
                        {item.subtitle}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-fg-muted">
                      {formatShortDate(item.at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </AppShell>
  );
}
