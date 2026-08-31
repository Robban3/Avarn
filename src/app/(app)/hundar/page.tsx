import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Avatar,
  Badge,
  Chip,
  EmptyState,
  SectionHeader,
} from "@/components/ui";
import { CertificateIcon, ChevronRightIcon, PawIcon } from "@/components/icons";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { can } from "@/lib/authz";
import { db } from "@/lib/db";
import { teamScope } from "@/lib/authz";
import { ageInYears } from "@/lib/format";
import { DOG_STATUS_LABELS } from "@/lib/domain";
import { certStatus, certValidityText } from "@/lib/certifications";
import { CERT_ICON_CLASSES } from "@/components/cert-styles";

export const metadata: Metadata = { title: "Hundar" };

export default async function DogsPage() {
  const user = await requireUser();
  const unread = await unreadNotificationCount(user.id);
  const showsOthers = can(user, "team:viewOthers");

  // Ekipagen användaren får se – hunden nås alltid via sitt ekipage, så att
  // ingen hund kan visas utanför behörigheten.
  const teams = await db.team.findMany({
    where: teamScope(user),
    include: {
      handler: true,
      region: true,
      dog: {
        include: {
          disciplines: { include: { discipline: true }, orderBy: { id: "asc" } },
          educations: { orderBy: { completedAt: "asc" } },
          certifications: { include: { type: true } },
        },
      },
      certifications: { include: { type: true }, orderBy: { expiresAt: "asc" } },
    },
    orderBy: [{ status: "asc" }, { dog: { name: "asc" } }],
  });

  return (
    <AppShell
      title={showsOthers ? "Ekipage" : "Mina hundar"}
      unread={unread}
      role={user.role}
    >
      {teams.length === 0 ? (
        <EmptyState
          icon={<PawIcon className="h-7 w-7" />}
          title="Inga hundar registrerade"
          description={
            showsOthers
              ? "Det finns inga ekipage inom din behörighet ännu."
              : "Din regionalt ansvariga kopplar dig till en eller flera hundar."
          }
        />
      ) : (
        <div className="space-y-4">
          {teams.map((team) => {
            const { dog } = team;
            // Ekipagets och hundens certifikat visas tillsammans – för
            // föraren är det samma sak: vad får vi arbeta med?
            const certs = [...team.certifications, ...dog.certifications].sort(
              (a, b) => a.expiresAt.getTime() - b.expiresAt.getTime(),
            );

            return (
              <article key={team.id} className="card overflow-hidden">
                <Link
                  href={`/hundar/${dog.id}`}
                  className="flex items-start gap-4 p-4 transition-colors hover:bg-surface-2"
                >
                  <Avatar name={dog.name} photoUrl={dog.photoUrl} size={72} />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold leading-tight">
                      {dog.name}
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-fg-muted">
                      {dog.breed}
                    </p>
                    <p className="mt-0.5 text-sm text-fg-muted">
                      {ageInYears(dog.birthDate)} år
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone={dog.status === "ACTIVE" ? "ok" : "neutral"}>
                        {(
                          DOG_STATUS_LABELS[dog.status] ?? dog.status
                        ).toUpperCase()}
                      </Badge>
                      {showsOthers ? (
                        <span className="text-xs text-fg-dim">
                          {team.handler.name} · {team.region.name}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <ChevronRightIcon className="mt-1 h-[18px] w-[18px] shrink-0 text-fg-dim" />
                </Link>

                {dog.disciplines.length > 0 ? (
                  <div className="border-t border-line-soft px-4 py-3.5">
                    <SectionHeader title="Sökinriktningar" className="mb-2" />
                    <div className="flex flex-wrap gap-2">
                      {dog.disciplines.map((d) => (
                        <Chip key={d.id}>{d.discipline.name}</Chip>
                      ))}
                    </div>
                  </div>
                ) : null}

                {dog.educations.length > 0 ? (
                  <div className="border-t border-line-soft px-4 py-3.5">
                    <SectionHeader title="Utbildningar" className="mb-2" />
                    <div className="flex flex-wrap gap-2">
                      {dog.educations.map((e) => (
                        <Chip key={e.id}>{e.name}</Chip>
                      ))}
                    </div>
                  </div>
                ) : null}

                {certs.length > 0 ? (
                  <div className="border-t border-line-soft px-4 py-3.5">
                    <SectionHeader title="Certifikat" className="mb-2" />
                    <ul className="divide-y divide-line-soft">
                      {certs.slice(0, 3).map((cert) => {
                        const status = certStatus(cert.expiresAt);
                        return (
                          <li key={cert.id}>
                            <Link
                              href="/certifikat"
                              className="flex items-center gap-3 py-2.5"
                            >
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
                              <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
