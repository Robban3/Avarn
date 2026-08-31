import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Avatar,
  Badge,
  DetailList,
  DetailRow,
  SectionHeader,
} from "@/components/ui";
import { CertificateIcon } from "@/components/icons";
import { CERT_ICON_CLASSES } from "@/components/cert-styles";
import { currentUserRecord, unreadNotificationCount } from "@/lib/auth";
import { db } from "@/lib/db";
import { ageInYears, formatDate } from "@/lib/format";
import { ROLE_LABELS, type Role } from "@/lib/domain";
import { certStatus, certValidityText } from "@/lib/certifications";
import { logout } from "@/app/login/actions";

export const metadata: Metadata = { title: "Min profil" };

export default async function ProfilePage() {
  const record = await currentUserRecord();
  const role = record.role as Role;
  const unread = await unreadNotificationCount(record.id);

  const [teams, certifications] = await Promise.all([
    db.team.findMany({
      where: { handlerId: record.id },
      include: { dog: true, region: true },
      orderBy: { startedAt: "desc" },
    }),
    db.certification.findMany({
      where: { userId: record.id },
      include: { type: true },
      orderBy: { expiresAt: "asc" },
    }),
  ]);

  return (
    <AppShell
      title="Min profil"
      backHref="/mer"
      unread={unread}
      role={role}
    >
      <section className="card mb-5 flex items-center gap-4 p-4">
        <Avatar
          name={record.name}
          photoUrl={record.handlerProfile?.photoUrl}
          size={72}
          ring
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold leading-tight">{record.name}</h2>
          <p className="text-sm text-brand">{ROLE_LABELS[role] ?? role}</p>
          <p className="text-xs text-fg-dim">
            {record.region?.name ?? "Hela landet"}
          </p>
        </div>
      </section>

      <section className="mb-5">
        <SectionHeader title="Kontaktuppgifter" />
        <DetailList>
          <DetailRow label="E-post">{record.email}</DetailRow>
          <DetailRow label="Telefon">{record.phone ?? "—"}</DetailRow>
          {record.handlerProfile?.employeeNumber ? (
            <DetailRow label="Anställningsnummer">
              {record.handlerProfile.employeeNumber}
            </DetailRow>
          ) : null}
          {record.handlerProfile?.baseLocation ? (
            <DetailRow label="Stationering">
              {record.handlerProfile.baseLocation}
            </DetailRow>
          ) : null}
          {record.lastLoginAt ? (
            <DetailRow label="Senaste inloggning">
              {formatDate(record.lastLoginAt)}
            </DetailRow>
          ) : null}
        </DetailList>
      </section>

      {teams.length > 0 ? (
        <section className="mb-5">
          <SectionHeader title="Mina ekipage" href="/hundar" />
          <DetailList>
            {teams.map((team) => (
              <DetailRow key={team.id} label={team.dog.name}>
                {ageInYears(team.dog.birthDate)} år · {team.region.name}
              </DetailRow>
            ))}
          </DetailList>
        </section>
      ) : null}

      {certifications.length > 0 ? (
        <section className="mb-5">
          <SectionHeader title="Mina behörigheter" href="/certifikat" />
          <div className="card divide-y divide-line-soft">
            {certifications.map((cert) => {
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
        </section>
      ) : null}

      <section className="mb-5">
        <SectionHeader title="Behörighet i systemet" />
        <div className="card p-4">
          <Badge tone="brand">{ROLE_LABELS[role] ?? role}</Badge>
          <p className="mt-3 text-sm text-fg-muted">
            {role === "HANDLER"
              ? "Du ser dina egna ekipage, din träningsdagbok och de uppdrag som tilldelats dig."
              : role === "INSTRUCTOR"
                ? "Du ser de ekipage du är instruktör för, deras träning och rapporter."
                : role === "REGIONAL_MANAGER"
                  ? "Du ser ekipage, uppdrag och rapporter inom din region."
                  : role === "NATIONAL_MANAGER"
                    ? "Du ser verksamheten i hela landet."
                    : "Du har full åtkomst och hanterar användare och grunddata."}
          </p>
        </div>
      </section>

      <form action={logout}>
        <button type="submit" className="btn btn-danger w-full">
          Logga ut
        </button>
      </form>
    </AppShell>
  );
}
