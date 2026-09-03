import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import {
  Avatar,
  Badge,
  DisciplineTag,
  EmptyState,
  LinkCard,
} from "@/components/ui";
import { CERT_ICON_CLASSES } from "@/components/cert-styles";
import {
  CertificateIcon,
  ChevronRightIcon,
  SearchIcon,
  XIcon,
} from "@/components/icons";
import { SenasteSokningar, Sokfalt } from "@/components/Sok";
import { currentUserRecord, unreadNotificationCount } from "@/lib/auth";
import {
  PER_GRUPP,
  SOKGRUPPER,
  arSokgrupp,
  antalTraffar,
  sok,
  type Sokgrupp,
} from "@/lib/sok";
import {
  CERT_STATUS_LABELS,
  CERT_STATUS_TONES,
  certStatus,
  certValidityText,
} from "@/lib/certifications";
import {
  ageInYears,
  durationMinutes,
  formatDayNumber,
  formatMonthShort,
  formatShortDate,
  formatTime,
  formatTimeRange,
} from "@/lib/format";
import {
  DOG_STATUS_LABELS,
  REPORT_STATUS_LABELS,
  SESSION_STATUS_LABELS,
  reportTone,
} from "@/lib/domain";
import type { Role } from "@/lib/domain";
import type { SessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sök" };

/**
 * Sökningen över hela systemet.
 *
 * Träffarna ritas exakt som raderna ser ut i sin egen modul – en hund
 * som på hundlistan, ett pass som i dagboken – så att man känner igen
 * det man letade efter utan att först behöva läsa rubriken.
 *
 * Sökningen visar bara det användaren redan får se. Avgränsningen görs i
 * frågorna, i src/lib/sok.ts, och inte här.
 */
export default async function SokPage({ searchParams }: PageProps<"/sok">) {
  const record = await currentUserRecord();
  const user: SessionUser = {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role as Role,
    regionId: record.regionId,
  };
  const unread = await unreadNotificationCount(user.id);

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const typ = arSokgrupp(params.typ) ? params.typ : undefined;

  const resultat = await sok(user, q, typ);
  const traffar = antalTraffar(resultat);

  const href = (nyTyp?: Sokgrupp) =>
    `/sok?q=${encodeURIComponent(q)}${nyTyp ? `&typ=${nyTyp}` : ""}`;

  return (
    <AppShell title="Sök" backHref="/mer" role={user.role} unread={unread}>
      <Sokfalt varde={q} typ={typ} />

      {q.length < 2 ? (
        <Tomtlage />
      ) : traffar === 0 ? (
        <EmptyState
          icon={<SearchIcon className="h-7 w-7" />}
          title="Inga träffar"
          description={`Ingenting matchar "${q}" bland det du har behörighet att se.`}
        />
      ) : (
        <>
          {typ ? (
            <div className="mb-4 flex items-center gap-2">
              <Link href={href()} className="chip text-brand">
                <XIcon className="h-3.5 w-3.5" />
                {SOKGRUPPER.find((g) => g.value === typ)?.label}
              </Link>
              <span className="text-xs text-fg-dim">
                {traffar} {traffar === 1 ? "träff" : "träffar"}
              </span>
            </div>
          ) : null}

          <Grupp
            titel="Hundar"
            poster={resultat.hundar}
            typ="hundar"
            visaAlla={typ === undefined}
            href={href}
            rad={(hund) => <Hundrad key={hund.id} hund={hund} />}
          />
          <Grupp
            titel="Ekipage"
            poster={resultat.ekipage}
            typ="ekipage"
            visaAlla={typ === undefined}
            href={href}
            rad={(team) => <Ekipagerad key={team.id} team={team} />}
          />
          <Grupp
            titel="Uppdrag"
            poster={resultat.uppdrag}
            typ="uppdrag"
            visaAlla={typ === undefined}
            href={href}
            rad={(uppdrag) => <Uppdragsrad key={uppdrag.id} uppdrag={uppdrag} />}
          />
          <Grupp
            titel="Träning"
            poster={resultat.traning}
            typ="traning"
            visaAlla={typ === undefined}
            href={href}
            rad={(pass) => <Traningsrad key={pass.id} pass={pass} />}
          />
          <Grupp
            titel="Rapporter"
            poster={resultat.rapporter}
            typ="rapporter"
            visaAlla={typ === undefined}
            href={href}
            rad={(rapport) => <Rapportrad key={rapport.id} rapport={rapport} />}
          />
          <Grupp
            titel="Certifikat"
            poster={resultat.certifikat}
            typ="certifikat"
            visaAlla={typ === undefined}
            href={href}
            rad={(cert) => <Certifikatrad key={cert.id} cert={cert} />}
          />
        </>
      )}

      <p className="mt-6 text-center text-xs text-fg-dim">
        Sökningen visar bara det du själv har behörighet att se.
      </p>
    </AppShell>
  );
}

/* ------------------------------------------------------------ Tomt läge */

function Tomtlage() {
  return (
    <>
      <SenasteSokningar />

      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="section-label">Snabbfilter</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {SOKGRUPPER.map((grupp) => (
          <Link key={grupp.value} href={`/${vagFor(grupp.value)}`} className="chip">
            {grupp.label}
          </Link>
        ))}
      </div>

      <p className="mt-6 text-sm text-fg-muted">
        Sök på uppdragsnummer, ort, hundnamn, förare, sökinriktning eller
        något ur en rapport. Minst två tecken.
      </p>
    </>
  );
}

/** Modulen en snabbfiltersgrupp hör hemma i. */
function vagFor(grupp: Sokgrupp) {
  switch (grupp) {
    case "hundar":
    case "ekipage":
      return "hundar";
    case "traning":
      return "traning";
    case "rapporter":
      return "rapporter";
    case "certifikat":
      return "certifikat";
    default:
      return "uppdrag";
  }
}

/* -------------------------------------------------------------- Grupper */

/**
 * En grupp träffar med sin rubrik.
 *
 * I översikten visas tre rader och "Visa alla"; den extra raden ur
 * frågan är bara till för att avgöra om länken behövs.
 */
function Grupp<T>({
  titel,
  poster,
  typ,
  visaAlla,
  href,
  rad,
}: {
  titel: string;
  poster: T[];
  typ: Sokgrupp;
  visaAlla: boolean;
  href: (typ?: Sokgrupp) => string;
  rad: (post: T) => React.ReactNode;
}) {
  if (poster.length === 0) return null;
  const visade = visaAlla ? poster.slice(0, PER_GRUPP) : poster;

  return (
    <section className="mb-5">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="section-label">{titel}</h2>
        {visaAlla && poster.length > PER_GRUPP ? (
          <Link href={href(typ)} className="text-xs font-medium text-brand">
            Visa alla
          </Link>
        ) : null}
      </div>
      <div className="space-y-2.5">{visade.map(rad)}</div>
    </section>
  );
}

/* ---------------------------------------------------------------- Rader */

/** Som på hundlistan. */
function Hundrad({
  hund,
}: {
  hund: {
    id: string;
    name: string;
    breed: string;
    birthDate: Date;
    status: string;
    photoUrl: string | null;
    teams: { handler: { name: string }; region: { name: string } }[];
  };
}) {
  const ekipage = hund.teams[0];
  return (
    <Link
      href={`/hundar/${hund.id}`}
      className="card flex items-start gap-4 p-4 transition-colors hover:bg-surface-2"
    >
      <Avatar name={hund.name} photoUrl={hund.photoUrl} size={64} />
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold leading-tight">{hund.name}</h3>
        <p className="mt-0.5 truncate text-sm text-fg-muted">{hund.breed}</p>
        <p className="mt-0.5 text-sm text-fg-muted">
          {ageInYears(hund.birthDate)} år
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge tone={hund.status === "ACTIVE" ? "ok" : "neutral"}>
            {(DOG_STATUS_LABELS[hund.status] ?? hund.status).toUpperCase()}
          </Badge>
          {ekipage ? (
            <span className="text-xs text-fg-dim">
              {ekipage.handler.name} · {ekipage.region.name}
            </span>
          ) : null}
        </div>
      </div>
      <ChevronRightIcon className="mt-1 h-[18px] w-[18px] shrink-0 text-fg-dim" />
    </Link>
  );
}

function Ekipagerad({
  team,
}: {
  team: {
    id: string;
    dog: { id: string; name: string; photoUrl: string | null };
    handler: { name: string };
    region: { name: string };
    status: string;
  };
}) {
  return (
    <Link
      href={`/hundar/${team.dog.id}`}
      className="card flex items-center gap-3.5 p-3.5 transition-colors hover:bg-surface-2"
    >
      <Avatar name={team.dog.name} photoUrl={team.dog.photoUrl} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">
          {team.handler.name} &amp; {team.dog.name}
        </p>
        <p className="truncate text-xs text-fg-muted">
          {team.region.name} ·{" "}
          {team.status === "ACTIVE" ? "Aktivt ekipage" : "Vilande"}
        </p>
      </div>
      <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
    </Link>
  );
}

/** Som i uppdragslistan: datumbricka, tid, rubrik, ort och tagg. */
function Uppdragsrad({
  uppdrag,
}: {
  uppdrag: {
    id: string;
    title: string;
    locality: string;
    startAt: Date;
    discipline: { shortLabel: string } | null;
  };
}) {
  return (
    <Link
      href={`/uppdrag/${uppdrag.id}`}
      className="card flex items-center gap-3 p-3.5 transition-colors hover:bg-surface-2"
    >
      <div className="flex w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-2 py-1.5">
        <span className="text-lg font-semibold leading-none">
          {formatDayNumber(uppdrag.startAt)}
        </span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-fg-dim">
          {formatMonthShort(uppdrag.startAt)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-fg-muted">{formatTime(uppdrag.startAt)}</p>
        <p className="truncate text-sm font-semibold">{uppdrag.title}</p>
        <p className="truncate text-xs text-fg-muted">{uppdrag.locality}</p>
      </div>
      {uppdrag.discipline ? (
        <DisciplineTag label={uppdrag.discipline.shortLabel} />
      ) : null}
      <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
    </Link>
  );
}

/** Som i träningsdagboken. */
function Traningsrad({
  pass,
}: {
  pass: {
    id: string;
    startAt: Date;
    endAt: Date | null;
    trainingArea: string;
    environment: string;
    location: string;
    status: string;
    hideCount: number;
    foundCount: number;
    team: { dog: { name: string } };
  };
}) {
  const minuter = durationMinutes(pass.startAt, pass.endAt);
  return (
    <LinkCard href={`/traning/${pass.id}`}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <p className="text-xs text-fg-muted">
          {formatShortDate(pass.startAt)} ·{" "}
          {formatTimeRange(pass.startAt, pass.endAt)}
        </p>
        <Badge tone={pass.status === "APPROVED" ? "ok" : "neutral"}>
          {SESSION_STATUS_LABELS[pass.status] ?? pass.status}
        </Badge>
      </div>
      <p className="truncate text-[15px] font-semibold">
        {pass.trainingArea} – {pass.environment}
      </p>
      <p className="truncate text-xs text-fg-muted">
        {pass.location} · {pass.team.dog.name}
      </p>
      <div className="mt-1.5 flex items-center gap-3 text-xs">
        <span className="text-brand">
          {pass.foundCount}/{pass.hideCount} markeringar
        </span>
        {minuter > 0 ? (
          <span className="text-fg-dim">{minuter} min</span>
        ) : null}
      </div>
    </LinkCard>
  );
}

/** Som i rapportlistan. */
function Rapportrad({
  rapport,
}: {
  rapport: {
    id: string;
    status: string;
    findings: string | null;
    mission: { reference: string; title: string; locality: string; startAt: Date };
    team: { dog: { name: string } };
    author: { name: string };
  };
}) {
  return (
    <LinkCard href={`/rapporter/${rapport.id}`}>
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="text-xs text-fg-muted">
          {rapport.mission.reference} ·{" "}
          {formatShortDate(rapport.mission.startAt)}
        </p>
        <Badge tone={reportTone(rapport.status)}>
          {REPORT_STATUS_LABELS[rapport.status] ?? rapport.status}
        </Badge>
      </div>
      <p className="truncate text-[15px] font-semibold">
        {rapport.mission.title}
      </p>
      <p className="truncate text-xs text-fg-muted">
        {rapport.mission.locality} · {rapport.team.dog.name} ·{" "}
        {rapport.author.name}
      </p>
      {rapport.findings ? (
        <p className="mt-1 truncate text-xs text-fg-dim">{rapport.findings}</p>
      ) : null}
    </LinkCard>
  );
}

/** Som i certifikatlistan. */
function Certifikatrad({
  cert,
}: {
  cert: {
    id: string;
    expiresAt: Date;
    type: { name: string };
    dog: { name: string } | null;
    user: { name: string } | null;
    team: { dog: { name: string }; handler: { name: string } } | null;
  };
}) {
  const status = certStatus(cert.expiresAt);
  const gäller =
    cert.team
      ? `${cert.team.handler.name} & ${cert.team.dog.name}`
      : (cert.dog?.name ?? cert.user?.name ?? "");

  return (
    <Link
      href="/certifikat"
      className="card flex items-center gap-3 p-3.5 transition-colors hover:bg-surface-2"
    >
      <CertificateIcon
        className={`h-5 w-5 shrink-0 ${CERT_ICON_CLASSES[status]}`}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{cert.type.name}</p>
        <p className="truncate text-xs text-fg-muted">
          {gäller ? `${gäller} · ` : ""}
          {certValidityText(cert.expiresAt)}
        </p>
      </div>
      <Badge tone={CERT_STATUS_TONES[status]}>
        {CERT_STATUS_LABELS[status]}
      </Badge>
    </Link>
  );
}
