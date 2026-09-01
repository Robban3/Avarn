import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Avatar,
  Badge,
  Chip,
  DetailList,
  DetailRow,
  LinkCard,
  SectionHeader,
} from "@/components/ui";
import { CertificateIcon, TrainingIcon, UserIcon } from "@/components/icons";
import { CERT_ICON_CLASSES } from "@/components/cert-styles";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { can, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import {
  ageInYears,
  formatShortDate,
  formatDate,
} from "@/lib/format";
import { DOG_STATUS_LABELS, SESSION_STATUS_LABELS } from "@/lib/domain";
import { certStatus, certValidityText } from "@/lib/certifications";

export const metadata: Metadata = { title: "Hund" };

export default async function DogPage({ params }: PageProps<"/hundar/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const unread = await unreadNotificationCount(user.id);

  // Hunden hämtas via ett ekipage inom behörigheten – aldrig direkt på id,
  // så att en gissad adress inte kan öppna någon annans hund.
  const team = await db.team.findFirst({
    where: { dogId: id, ...teamScope(user) },
    include: {
      handler: { include: { handlerProfile: true } },
      region: true,
      dog: {
        include: {
          disciplines: { include: { discipline: true } },
          educations: { orderBy: { completedAt: "desc" } },
          certifications: { include: { type: true } },
        },
      },
      certifications: { include: { type: true } },
      trainingSessions: {
        orderBy: { startAt: "desc" },
        take: 5,
        include: { discipline: true },
      },
    },
  });

  if (!team) notFound();

  const { dog } = team;
  const certs = [...team.certifications, ...dog.certifications].sort(
    (a, b) => a.expiresAt.getTime() - b.expiresAt.getTime(),
  );

  return (
    <AppShell
      title={dog.name}
      backHref="/hundar"
      unread={unread}
      role={user.role}
    >
      <section className="card mb-4 flex items-start gap-4 p-4">
        <Avatar name={dog.name} photoUrl={dog.photoUrl} size={80} />
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold leading-tight">{dog.name}</h2>
          <p className="mt-0.5 text-sm text-fg-muted">{dog.breed}</p>
          <p className="text-sm text-fg-muted">
            {ageInYears(dog.birthDate)} år
            {dog.sex ? ` · ${dog.sex === "HANE" ? "Hane" : "Tik"}` : ""}
          </p>
          <div className="mt-2">
            <Badge tone={dog.status === "ACTIVE" ? "ok" : "neutral"}>
              {(DOG_STATUS_LABELS[dog.status] ?? dog.status).toUpperCase()}
            </Badge>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <SectionHeader title="Ekipage" />
        <DetailList>
          <DetailRow icon={<UserIcon className="h-[18px] w-[18px]" />} label="Hundförare">
            {team.handler.name}
          </DetailRow>
          <DetailRow label="Region">{team.region.name}</DetailRow>
          <DetailRow label="Stationering">
            {team.handler.handlerProfile?.baseLocation ?? "—"}
          </DetailRow>
          <DetailRow label="Ekipage sedan">
            {formatDate(team.startedAt)}
          </DetailRow>
          {dog.chipNumber ? (
            <DetailRow label="Chipnummer">{dog.chipNumber}</DetailRow>
          ) : null}
        </DetailList>
      </section>

      {dog.disciplines.length > 0 ? (
        <section className="mb-5">
          <SectionHeader title="Sökinriktningar" />
          <div className="card flex flex-wrap gap-2 p-4">
            {dog.disciplines.map((d) => (
              <Chip key={d.id}>
                {d.discipline.name}
                {d.level ? (
                  <span className="text-fg-dim">
                    {d.level === "SPECIALIST" ? "· Specialist" : "· Grund"}
                  </span>
                ) : null}
              </Chip>
            ))}
          </div>
        </section>
      ) : null}

      {dog.educations.length > 0 ? (
        <section className="mb-5">
          <SectionHeader title="Utbildningar" />
          <DetailList>
            {dog.educations.map((e) => (
              <DetailRow key={e.id} label={e.name}>
                {e.completedAt ? formatShortDate(e.completedAt) : "Pågående"}
              </DetailRow>
            ))}
          </DetailList>
        </section>
      ) : null}

      <section className="mb-5">
        <SectionHeader title="Certifikat och behörigheter" href="/certifikat" />
        {certs.length === 0 ? (
          <p className="card px-4 py-5 text-sm text-fg-muted">
            Inga registrerade certifikat.
          </p>
        ) : (
          <div className="card divide-y divide-line-soft">
            {certs.map((cert) => {
              const status = certStatus(cert.expiresAt);
              return (
                <div key={cert.id} className="flex items-center gap-3 px-4 py-3">
                  <CertificateIcon
                    className={`h-5 w-5 shrink-0 ${CERT_ICON_CLASSES[status]}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {cert.type.name}
                    </p>
                    <p className="truncate text-xs text-fg-muted">
                      {certValidityText(cert.expiresAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-5">
        <SectionHeader title="Senaste träningen" href="/traning" />
        {team.trainingSessions.length === 0 ? (
          <p className="card px-4 py-5 text-sm text-fg-muted">
            Inga registrerade träningspass.
          </p>
        ) : (
          <div className="space-y-2.5">
            {team.trainingSessions.map((session) => (
              <LinkCard key={session.id} href={`/traning/${session.id}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-fg-dim">
                    <TrainingIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-fg-muted">
                      {formatShortDate(session.startAt)}
                    </p>
                    <p className="truncate text-sm font-semibold">
                      {session.trainingArea} – {session.environment}
                    </p>
                    <p className="text-xs text-brand">
                      {session.foundCount}/{session.hideCount} markeringar
                    </p>
                  </div>
                  <Badge tone={session.status === "APPROVED" ? "ok" : "neutral"}>
                    {SESSION_STATUS_LABELS[session.status] ?? session.status}
                  </Badge>
                </div>
              </LinkCard>
            ))}
          </div>
        )}
      </section>

      <div className="flex gap-2.5">
        <Link href="/traning/nytt" className="btn btn-primary flex-1">
          Rapportera träning
        </Link>
        {can(user, "dog:create") ? (
          <Link href={`/hundar/${dog.id}/redigera`} className="btn btn-secondary">
            Redigera
          </Link>
        ) : null}
      </div>
    </AppShell>
  );
}
