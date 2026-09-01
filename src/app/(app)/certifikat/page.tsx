import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Badge, EmptyState, SectionHeader } from "@/components/ui";
import { CertificateIcon } from "@/components/icons";
import { CERT_ICON_CLASSES } from "@/components/cert-styles";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { can, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { formatDate, daysUntil } from "@/lib/format";
import { CERT_APPLIES_TO_LABELS } from "@/lib/domain";
import {
  CERT_STATUS_LABELS,
  CERT_STATUS_TONES,
  certStatus,
  type CertStatus,
} from "@/lib/certifications";
import { CertForm } from "./cert-form";
import { renewCertification } from "./actions";

export const metadata: Metadata = { title: "Certifikat" };

export default async function CertificationsPage() {
  const user = await requireUser();
  const unread = await unreadNotificationCount(user.id);

  // Alla certifikat som hör till ett ekipage inom behörigheten – på
  // ekipaget, hunden eller föraren.
  const teams = await db.team.findMany({
    where: teamScope(user),
    select: { id: true, dogId: true, handlerId: true },
  });

  const manages = can(user, "cert:manage");

  // Certifikattyper och möjliga mottagare, för registreringsformuläret.
  const [certTypes, scopedTeams] = await Promise.all([
    manages
      ? db.certificationType.findMany({ orderBy: { name: "asc" } })
      : Promise.resolve([]),
    manages
      ? db.team.findMany({
          where: { ...teamScope(user), status: "ACTIVE" },
          include: { dog: true, handler: true },
          orderBy: { dog: { name: "asc" } },
        })
      : Promise.resolve([]),
  ]);

  // En certifikattyp gäller ekipaget, hunden eller föraren – listan hålls
  // isär så att formuläret bara erbjuder rimliga mottagare.
  const subjects = [
    ...scopedTeams.map((t) => ({
      value: `team:${t.id}`,
      label: `${t.dog.name} · ${t.handler.name}`,
      appliesTo: "TEAM",
    })),
    ...scopedTeams.map((t) => ({
      value: `dog:${t.dogId}`,
      label: t.dog.name,
      appliesTo: "DOG",
    })),
    ...Array.from(
      new Map(
        scopedTeams.map((t) => [
          t.handlerId,
          {
            value: `user:${t.handlerId}`,
            label: t.handler.name,
            appliesTo: "HANDLER",
          },
        ]),
      ).values(),
    ),
  ];

  const certifications = await db.certification.findMany({
    where: {
      OR: [
        { teamId: { in: teams.map((t) => t.id) } },
        { dogId: { in: teams.map((t) => t.dogId) } },
        { userId: { in: teams.map((t) => t.handlerId) } },
      ],
    },
    include: {
      type: true,
      dog: true,
      user: true,
      team: { include: { dog: true, handler: true } },
    },
    orderBy: { expiresAt: "asc" },
  });

  const groups: Record<CertStatus, typeof certifications> = {
    EXPIRED: [],
    EXPIRING: [],
    VALID: [],
  };
  for (const cert of certifications) {
    groups[certStatus(cert.expiresAt)].push(cert);
  }

  /** Vem certifikatet gäller: ekipaget, hunden eller föraren. */
  const subject = (cert: (typeof certifications)[number]) => {
    if (cert.team) return `${cert.team.dog.name} · ${cert.team.handler.name}`;
    if (cert.dog) return cert.dog.name;
    if (cert.user) return cert.user.name;
    return "—";
  };

  const sections: { status: CertStatus; title: string }[] = [
    { status: "EXPIRED", title: "Utgångna" },
    { status: "EXPIRING", title: "Går snart ut" },
    { status: "VALID", title: "Giltiga" },
  ];

  return (
    <AppShell
      title="Certifikat"
      backHref="/mer"
      unread={unread}
      role={user.role}
    >
      {manages ? (
        <div className="mb-5">
          <CertForm
            types={certTypes.map((t) => ({
              id: t.id,
              name: t.name,
              validityMonths: t.validityMonths,
              appliesTo: t.appliesTo,
            }))}
            subjects={subjects}
          />
        </div>
      ) : null}

      {certifications.length === 0 ? (
        <EmptyState
          icon={<CertificateIcon className="h-7 w-7" />}
          title="Inga certifikat"
          description="Utbildningar, prov och behörigheter registreras här."
        />
      ) : (
        <>
          <div className="card mb-5 flex divide-x divide-line-soft">
            {sections.map(({ status, title }) => (
              <div
                key={status}
                className="flex flex-1 flex-col items-center px-2 py-4 text-center"
              >
                <span
                  className={`text-2xl font-semibold leading-none ${CERT_ICON_CLASSES[status]}`}
                >
                  {groups[status].length}
                </span>
                <span className="mt-1.5 text-[11px] leading-tight text-fg-muted">
                  {title}
                </span>
              </div>
            ))}
          </div>

          {sections.map(({ status, title }) =>
            groups[status].length === 0 ? null : (
              <section key={status} className="mb-5">
                <SectionHeader title={title} />
                <div className="card divide-y divide-line-soft">
                  {groups[status].map((cert) => {
                    const days = daysUntil(cert.expiresAt);
                    return (
                      <div
                        key={cert.id}
                        className="flex items-start gap-3 px-4 py-3.5"
                      >
                        <CertificateIcon
                          className={`mt-0.5 h-5 w-5 shrink-0 ${CERT_ICON_CLASSES[status]}`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{cert.type.name}</p>
                          <p className="truncate text-xs text-fg-muted">
                            {subject(cert)} ·{" "}
                            {CERT_APPLIES_TO_LABELS[cert.type.appliesTo] ??
                              cert.type.appliesTo}
                          </p>
                          <p className="mt-1 text-xs text-fg-dim">
                            Giltig till {formatDate(cert.expiresAt)}
                            {cert.issuer ? ` · ${cert.issuer}` : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <Badge tone={CERT_STATUS_TONES[status]}>
                            {status === "EXPIRED"
                              ? CERT_STATUS_LABELS[status]
                              : status === "EXPIRING"
                                ? `${days} d kvar`
                                : CERT_STATUS_LABELS[status]}
                          </Badge>
                          {manages && status !== "VALID" ? (
                            <form action={renewCertification}>
                              <input
                                type="hidden"
                                name="certificationId"
                                value={cert.id}
                              />
                              <button
                                type="submit"
                                className="text-xs font-medium text-brand"
                              >
                                Förnya
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ),
          )}
        </>
      )}

      <p className="text-center text-xs text-fg-dim">
        Ansvariga varnas automatiskt när ett certifikat närmar sig sitt
        utgångsdatum.
      </p>
    </AppShell>
  );
}
