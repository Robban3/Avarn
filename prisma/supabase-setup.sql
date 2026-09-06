--
-- Avarn Hundtjänst – komplett uppsättning av databasen
--
-- Klistra in hela den här filen i Supabase: SQL Editor > New query > Run.
-- Filen skapar samtliga tabeller, lägger in exempeldata och slår på
-- radsäkerhet.
--
-- ENDAST FÖR EN TOM DATABAS. Har databasen redan tabellerna avbryts filen
-- med "relation ... already exists". Kör då i stället filerna i
-- prisma/supabase/, som applicerar en migrering i taget och är ofarliga att
-- köra om.
--
-- Genererad av scripts/generate-supabase-sql.mjs – ändra inte här, utan i
-- prisma/schema.prisma och prisma/seed.ts, och generera om.
--
-- Inloggning efteråt: erik.andersson@avarn.se / avarn123
-- (samma lösenord för samtliga konton i exempeldatan)
--

--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text,
    detail text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: Certification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Certification" (
    id text NOT NULL,
    "typeId" text NOT NULL,
    "dogId" text,
    "userId" text,
    "teamId" text,
    issuer text,
    reference text,
    "issuedAt" timestamp(3) without time zone NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: CertificationType; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CertificationType" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "validityMonths" integer NOT NULL,
    "appliesTo" text NOT NULL,
    description text
);

--
-- Name: Comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Comment" (
    id text NOT NULL,
    "authorId" text NOT NULL,
    body text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "trainingSessionId" text,
    "reportId" text,
    "teamId" text
);

--
-- Name: Customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Customer" (
    id text NOT NULL,
    name text NOT NULL,
    "orgNumber" text,
    "contactName" text,
    "contactPhone" text,
    "contactEmail" text,
    notes text
);

--
-- Name: Dog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Dog" (
    id text NOT NULL,
    name text NOT NULL,
    breed text NOT NULL,
    "birthDate" timestamp(3) without time zone NOT NULL,
    sex text,
    "chipNumber" text,
    "photoUrl" text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    color text,
    "heightCm" integer,
    "hipsElbows" text,
    "insuranceValidTo" timestamp(3) without time zone,
    insurer text,
    "mentalIndex" text,
    neutered boolean,
    "originCountry" text,
    "registrationNumber" text,
    "weightKg" double precision
);

--
-- Name: DogDiscipline; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DogDiscipline" (
    id text NOT NULL,
    "dogId" text NOT NULL,
    "disciplineId" text NOT NULL,
    level text,
    "certifiedAt" timestamp(3) without time zone
);

--
-- Name: DogEducation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DogEducation" (
    id text NOT NULL,
    "dogId" text NOT NULL,
    name text NOT NULL,
    provider text,
    "completedAt" timestamp(3) without time zone
);

--
-- Name: FollowUp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FollowUp" (
    id text NOT NULL,
    "teamId" text NOT NULL,
    "instructorId" text NOT NULL,
    title text NOT NULL,
    message text,
    "dueDate" timestamp(3) without time zone,
    status text DEFAULT 'OPEN'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: HandlerProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."HandlerProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "employeeNumber" text,
    "baseLocation" text,
    bio text,
    "photoUrl" text
);

--
-- Name: Hide; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Hide" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    label text,
    placement text,
    "heightCm" integer,
    difficulty text,
    outcome text DEFAULT 'FOUND'::text NOT NULL,
    "searchSeconds" integer,
    notes text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);

--
-- Name: Indication; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Indication" (
    id text NOT NULL,
    "reportId" text NOT NULL,
    location text,
    description text,
    outcome text DEFAULT 'FIND'::text NOT NULL,
    "handedOverTo" text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);

--
-- Name: InstructorAssignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InstructorAssignment" (
    id text NOT NULL,
    "instructorId" text NOT NULL,
    "teamId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: MediaAsset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MediaAsset" (
    id text NOT NULL,
    kind text NOT NULL,
    "originalName" text NOT NULL,
    "storedName" text NOT NULL,
    "mimeType" text NOT NULL,
    size integer NOT NULL,
    "uploadedById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "trainingSessionId" text,
    "reportId" text,
    "certificationId" text,
    "dogId" text,
    "profileUserId" text,
    "missionId" text,
    "missionSource" text
);

--
-- Name: Mission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Mission" (
    id text NOT NULL,
    reference text NOT NULL,
    title text NOT NULL,
    "missionType" text NOT NULL,
    "customerId" text,
    "contactName" text,
    "contactPhone" text,
    "startAt" timestamp(3) without time zone NOT NULL,
    "endAt" timestamp(3) without time zone,
    address text,
    locality text NOT NULL,
    "regionId" text NOT NULL,
    "disciplineId" text,
    "specialInstructions" text,
    status text DEFAULT 'PLANNED'::text NOT NULL,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    equipment text,
    latitude double precision,
    longitude double precision,
    "meetingPoint" text,
    "missionArea" text,
    "parkingInfo" text,
    "areaPolygon" text,
    "areaSizeSqm" integer,
    "meetingLat" double precision,
    "meetingLng" double precision,
    "parkingLat" double precision,
    "parkingLng" double precision
);

--
-- Name: MissionAssignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MissionAssignment" (
    id text NOT NULL,
    "missionId" text NOT NULL,
    "teamId" text NOT NULL,
    "assignedById" text NOT NULL,
    status text DEFAULT 'OFFERED'::text NOT NULL,
    note text,
    "respondedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "checklistDone" text,
    "endedAt" timestamp(3) without time zone,
    "progressPercent" integer DEFAULT 0 NOT NULL
);

--
-- Name: MissionEvent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MissionEvent" (
    id text NOT NULL,
    "assignmentId" text NOT NULL,
    kind text NOT NULL,
    note text,
    at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text NOT NULL
);

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text,
    url text,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: OperationalReport; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OperationalReport" (
    id text NOT NULL,
    "missionId" text NOT NULL,
    "teamId" text NOT NULL,
    "authorId" text NOT NULL,
    "areasSearched" text,
    findings text,
    deviations text,
    actions text,
    "startedAt" timestamp(3) without time zone,
    "endedAt" timestamp(3) without time zone,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "submittedAt" timestamp(3) without time zone,
    "approvedById" text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "areaSize" integer,
    comment text
);

--
-- Name: PlannedExercise; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PlannedExercise" (
    id text NOT NULL,
    "planId" text NOT NULL,
    title text NOT NULL,
    instructions text,
    "disciplineId" text,
    "targetOdor" text,
    environment text,
    "dueDate" timestamp(3) without time zone,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'PLANNED'::text NOT NULL
);

--
-- Name: Region; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Region" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);

--
-- Name: SearchDiscipline; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SearchDiscipline" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "shortLabel" text NOT NULL,
    description text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);

--
-- Name: Setting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Setting" (
    key text NOT NULL,
    value text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "updatedById" text
);

--
-- Name: Team; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Team" (
    id text NOT NULL,
    "handlerId" text NOT NULL,
    "dogId" text NOT NULL,
    "regionId" text NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endedAt" timestamp(3) without time zone,
    status text DEFAULT 'ACTIVE'::text NOT NULL
);

--
-- Name: TeamAvailability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeamAvailability" (
    id text NOT NULL,
    "teamId" text NOT NULL,
    "startAt" timestamp(3) without time zone NOT NULL,
    "endAt" timestamp(3) without time zone NOT NULL,
    kind text NOT NULL,
    note text
);

--
-- Name: TrainingPlan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TrainingPlan" (
    id text NOT NULL,
    "teamId" text NOT NULL,
    "instructorId" text NOT NULL,
    title text NOT NULL,
    purpose text,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: TrainingSession; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TrainingSession" (
    id text NOT NULL,
    "teamId" text NOT NULL,
    "plannedExerciseId" text,
    "startAt" timestamp(3) without time zone NOT NULL,
    "endAt" timestamp(3) without time zone,
    location text NOT NULL,
    "trainingArea" text NOT NULL,
    environment text NOT NULL,
    "targetOdor" text NOT NULL,
    "disciplineId" text,
    "hideCount" integer DEFAULT 0 NOT NULL,
    "foundCount" integer DEFAULT 0 NOT NULL,
    comment text,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "createdById" text NOT NULL,
    "approvedById" text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    "passwordHash" text NOT NULL,
    role text NOT NULL,
    phone text,
    active boolean DEFAULT true NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "regionId" text
);

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);

--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Certification; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Certification" VALUES ('cmtpn3bu6002wl57d9imu1xoa', 'cmtpn3bju000bl57dspnvlhqs', NULL, NULL, 'cmtpn3bqv001ml57dd6ogf42u', 'Avarn Security', 'NHPR-7570', '2026-07-06 09:58:55.23', '2027-07-06 09:58:55.23', NULL, '2026-09-06 09:58:58.734');
INSERT INTO public."Certification" VALUES ('cmtpn3bu7002xl57ddil4lxal', 'cmtpn3bjw000cl57dmlzo0abt', NULL, NULL, 'cmtpn3bqv001ml57dd6ogf42u', 'Avarn Security', 'EKIPAGE-2363', '2025-09-06 09:58:55.23', '2027-09-06 09:58:55.23', NULL, '2026-09-06 09:58:58.735');
INSERT INTO public."Certification" VALUES ('cmtpn3bu9002yl57dw1e6ejog', 'cmtpn3bjz000el57d03tyeaul', 'cmtpn3bqz001nl57dsqdn4hf5', NULL, NULL, 'Avarn Security', 'SPRANG_CERT-8073', '2025-12-06 09:58:55.23', '2026-12-06 09:58:55.23', NULL, '2026-09-06 09:58:58.737');
INSERT INTO public."Certification" VALUES ('cmtpn3bub002zl57d2eazxj3c', 'cmtpn3bjw000cl57dmlzo0abt', NULL, NULL, 'cmtpn3br3001sl57dvb5aamnu', 'Avarn Security', 'EKIPAGE-6978', '2026-04-06 09:58:55.23', '2028-04-06 09:58:55.23', NULL, '2026-09-06 09:58:58.739');
INSERT INTO public."Certification" VALUES ('cmtpn3bue0030l57dcisyizjx', 'cmtpn3bju000bl57dspnvlhqs', NULL, NULL, 'cmtpn3brc001xl57ds4dllugc', 'Avarn Security', 'NHPR-6491', '2026-08-06 09:58:55.23', '2027-08-06 09:58:55.23', NULL, '2026-09-06 09:58:58.742');
INSERT INTO public."Certification" VALUES ('cmtpn3buf0031l57d3b97nbh0', 'cmtpn3bjw000cl57dmlzo0abt', NULL, NULL, 'cmtpn3brl0022l57def863woo', 'Avarn Security', 'EKIPAGE-2244', '2024-10-06 09:58:55.23', '2026-10-06 09:58:55.23', NULL, '2026-09-06 09:58:58.743');
INSERT INTO public."Certification" VALUES ('cmtpn3buh0032l57djqtj5q7d', 'cmtpn3bjy000dl57d78mzkhst', 'cmtpn3brg001yl57d1itk022p', NULL, NULL, 'Avarn Security', 'NARK_CERT-4558', '2025-08-06 09:58:55.23', '2026-08-06 09:58:55.23', NULL, '2026-09-06 09:58:58.745');
INSERT INTO public."Certification" VALUES ('cmtpn3buj0033l57df9kpg492', 'cmtpn3bju000bl57dspnvlhqs', NULL, NULL, 'cmtpn3brr0027l57dz5b8wroh', 'Avarn Security', 'NHPR-8024', '2026-02-06 09:58:55.23', '2027-02-06 09:58:55.23', NULL, '2026-09-06 09:58:58.747');
INSERT INTO public."Certification" VALUES ('cmtpn3bul0034l57dui9pv738', 'cmtpn3bk0000fl57dnsn9c5g5', NULL, 'cmtpn3bk5000hl57dakx9yofo', NULL, 'Avarn Security', 'SKYDDSVAKT-2404', '2025-01-06 09:58:55.23', '2028-01-06 09:58:55.23', NULL, '2026-09-06 09:58:58.749');
INSERT INTO public."Certification" VALUES ('cmtpn3bun0035l57ddoqo28un', 'cmtpn3bk0000gl57d556vv3n6', NULL, 'cmtpn3bk5000hl57dakx9yofo', NULL, 'Avarn Security', 'HLR-2459', '2024-11-06 09:58:55.23', '2026-11-06 09:58:55.23', NULL, '2026-09-06 09:58:58.751');
INSERT INTO public."Certification" VALUES ('cmtpn3bup0036l57dwax2z8ou', 'cmtpn3bk0000fl57dnsn9c5g5', NULL, 'cmtpn3bk8000il57d08rsejuc', NULL, 'Avarn Security', 'SKYDDSVAKT-7053', '2024-03-06 09:58:55.23', '2027-03-06 09:58:55.23', NULL, '2026-09-06 09:58:58.753');
INSERT INTO public."Certification" VALUES ('cmtpn3buq0037l57dk4bip00g', 'cmtpn3bk0000gl57d556vv3n6', NULL, 'cmtpn3bka000jl57dk9bd5e1o', NULL, 'Avarn Security', 'HLR-8883', '2024-10-06 09:58:55.23', '2026-10-06 09:58:55.23', NULL, '2026-09-06 09:58:58.754');
INSERT INTO public."Certification" VALUES ('cmtpn3bus0038l57dldala8fp', 'cmtpn3bk0000fl57dnsn9c5g5', NULL, 'cmtpn3bkb000kl57d8g0e4m48', NULL, 'Avarn Security', 'SKYDDSVAKT-8830', '2025-09-06 09:58:55.23', '2028-09-06 09:58:55.23', NULL, '2026-09-06 09:58:58.756');
INSERT INTO public."Certification" VALUES ('cmtpn3bsk002pl57dj4x7fxh9', 'cmtpn3bju000bl57dspnvlhqs', NULL, NULL, 'cmtpn3bq80016l57dr3szf3kd', 'Svenska Brukshundklubben', 'NHPR-9793', '2026-05-06 09:58:55.23', '2027-05-06 09:58:55.23', NULL, '2026-09-06 09:58:58.677');
INSERT INTO public."Certification" VALUES ('cmtpn3btt002ql57dgzem2euf', 'cmtpn3bjw000cl57dmlzo0abt', NULL, NULL, 'cmtpn3bq80016l57dr3szf3kd', 'Avarn Security', 'EKIPAGE-6282', '2026-01-06 09:58:55.23', '2028-01-06 09:58:55.23', NULL, '2026-09-06 09:58:58.721');
INSERT INTO public."Certification" VALUES ('cmtpn3btx002rl57duzjkfijn', 'cmtpn3bjy000dl57d78mzkhst', 'cmtpn3blh000yl57dkuqcfiic', NULL, NULL, 'Avarn Security', 'NARK_CERT-3183', '2025-10-06 09:58:55.23', '2026-10-06 09:58:55.23', NULL, '2026-09-06 09:58:58.725');
INSERT INTO public."Certification" VALUES ('cmtpn3btz002sl57d9pwgx5mc', 'cmtpn3bju000bl57dspnvlhqs', NULL, NULL, 'cmtpn3bqk001bl57dmjmp8l3m', 'Svenska Brukshundklubben', 'NHPR-9053', '2025-11-06 09:58:55.23', '2026-11-06 09:58:55.23', NULL, '2026-09-06 09:58:58.727');
INSERT INTO public."Certification" VALUES ('cmtpn3bu0002tl57dgup7yjz0', 'cmtpn3bjw000cl57dmlzo0abt', NULL, NULL, 'cmtpn3bqk001bl57dmjmp8l3m', 'Avarn Security', 'EKIPAGE-2309', '2026-03-06 09:58:55.23', '2028-03-06 09:58:55.23', NULL, '2026-09-06 09:58:58.728');
INSERT INTO public."Certification" VALUES ('cmtpn3bu2002ul57dqxjhk1a4', 'cmtpn3bjw000cl57dmlzo0abt', NULL, NULL, 'cmtpn3bqr001hl57dd2784qfg', 'Avarn Security', 'EKIPAGE-1600', '2024-09-06 09:58:55.23', '2026-09-08 12:00:00', NULL, '2026-09-06 09:58:58.73');
INSERT INTO public."Certification" VALUES ('cmtpn3bu4002vl57d72ltyjqx', 'cmtpn3bju000bl57dspnvlhqs', NULL, NULL, 'cmtpn3bqr001hl57dd2784qfg', 'Avarn Security', 'NHPR-9992', '2026-06-06 09:58:55.23', '2027-06-06 09:58:55.23', NULL, '2026-09-06 09:58:58.732');

--
-- Data for Name: CertificationType; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."CertificationType" VALUES ('cmtpn3bju000bl57dspnvlhqs', 'NHPR', 'NHPR Godkänd', 12, 'TEAM', 'Nationellt hundprov för räddning och sök.');
INSERT INTO public."CertificationType" VALUES ('cmtpn3bjw000cl57dmlzo0abt', 'EKIPAGE', 'Auktoriserat ekipage', 24, 'TEAM', 'Behörighet att arbeta operativt som ekipage.');
INSERT INTO public."CertificationType" VALUES ('cmtpn3bjy000dl57d78mzkhst', 'NARK_CERT', 'Certifikat narkotikasök', 12, 'DOG', NULL);
INSERT INTO public."CertificationType" VALUES ('cmtpn3bjz000el57d03tyeaul', 'SPRANG_CERT', 'Certifikat sprängämnessök', 12, 'DOG', NULL);
INSERT INTO public."CertificationType" VALUES ('cmtpn3bk0000fl57dnsn9c5g5', 'SKYDDSVAKT', 'Skyddsvaktsförordnande', 36, 'HANDLER', NULL);
INSERT INTO public."CertificationType" VALUES ('cmtpn3bk0000gl57d556vv3n6', 'HLR', 'HLR och första hjälpen', 24, 'HANDLER', NULL);

--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Comment" VALUES ('cmtpn3c4x0075l57dx0vs2m6i', 'cmtpn3bke000nl57dvso2b5x5', 'Bra jobbat! Fortsätt nöta på uthålligheten.', '2026-08-29 09:15:00', 'cmtpn3bys003gl57d63ry9n0p', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmtpn3c4z0076l57d05susdlv', 'cmtpn3bke000nl57dvso2b5x5', 'Lägg in fler höga gömmor kommande veckor, gärna 180–220 cm.', '2026-08-15 14:00:00', 'cmtpn3bzc003tl57db5qxifg5', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmtpn3c500077l57dbwcysji0', 'cmtpn3bkf000ol57d1e4lkyrw', 'Helt rätt tänkt att korta passen. Bygg på fem minuter i taget.', '2026-08-30 11:30:00', 'cmtpn3c0n004ql57dc1orcord', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmtpn3c6d007wl57dffre0499', 'cmtpn3bkg000pl57d5sbkmjyn', 'Tydlig rapport. Bra att kvittonummer finns med.', '2026-08-28 09:35:00', NULL, 'cmtpn3c62007ql57d25uqlhtv', NULL);

--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Customer" VALUES ('cmtpn3c510078l57dky69oi68', 'Swedavia AB', '556797-0818', 'Lars Holmberg', '010-109 00 00', 'sakerhet@swedavia.se', NULL);
INSERT INTO public."Customer" VALUES ('cmtpn3c530079l57dtzim9e29', 'Friends Arena', '556768-2942', 'Nina Ek', '08-500 300 00', 'drift@friendsarena.se', NULL);
INSERT INTO public."Customer" VALUES ('cmtpn3c53007al57d8wwkaf6d', 'Jordbro Logistik AB', '556123-4567', 'Tomas Ek', '08-555 12 00', 'lager@jordbrologistik.se', NULL);
INSERT INTO public."Customer" VALUES ('cmtpn3c54007bl57d17x0q4zw', 'Uppsalahem', '556137-3589', 'Petra Lund', '018-727 30 00', 'trygghet@uppsalahem.se', NULL);

--
-- Data for Name: Dog; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Dog" VALUES ('cmtpn3blh000yl57dkuqcfiic', 'Nova', 'Belgisk vallhund (Malinois)', '2022-04-12 00:00:00', 'TIK', '752098100812345', NULL, 'ACTIVE', NULL, '2026-09-06 09:58:58.421', 'Fawn med svart mask', 62, 'A / 0', '2027-12-31 00:00:00', 'Folksam', '5 / 5', false, 'Sverige', 'SE-AVAR-2020-1127', 28);
INSERT INTO public."Dog" VALUES ('cmtpn3bqg0017l57d0x0cpkub', 'Rex', 'Labrador Retriever', '2020-04-12 00:00:00', 'HANE', '752098100234567', NULL, 'ACTIVE', NULL, '2026-09-06 09:58:58.6', 'Svart', 58, 'B / 0', '2027-06-30 00:00:00', 'Agria', '4 / 5', true, 'Sverige', 'SE-AVAR-2018-0904', 32);
INSERT INTO public."Dog" VALUES ('cmtpn3bqn001cl57d3o2wxuj6', 'Balder', 'Schäfer', '2021-04-12 00:00:00', 'HANE', '752098100345678', NULL, 'ACTIVE', NULL, '2026-09-06 09:58:58.607', 'Svart och tan', 65, 'A / 0', '2027-03-31 00:00:00', 'Agria', '5 / 4', false, 'Tyskland', 'SE-AVAR-2019-0451', 36);
INSERT INTO public."Dog" VALUES ('cmtpn3bqs001il57dr66rzg28', 'Mira', 'Springer Spaniel', '2023-04-12 00:00:00', 'TIK', '752098100456789', NULL, 'ACTIVE', NULL, '2026-09-06 09:58:58.612', 'Brun och vit', 48, 'A / 0', '2026-11-30 00:00:00', 'Folksam', '4 / 4', false, 'Sverige', 'SE-AVAR-2021-1330', 19);
INSERT INTO public."Dog" VALUES ('cmtpn3bqz001nl57dsqdn4hf5', 'Sigge', 'Labrador Retriever', '2019-04-12 00:00:00', 'HANE', '752098100567890', NULL, 'ACTIVE', NULL, '2026-09-06 09:58:58.619', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Dog" VALUES ('cmtpn3br8001tl57d65rsmgo7', 'Iris', 'Belgisk vallhund (Malinois)', '2024-04-12 00:00:00', 'TIK', '752098100678901', NULL, 'ACTIVE', NULL, '2026-09-06 09:58:58.628', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Dog" VALUES ('cmtpn3brg001yl57d1itk022p', 'Zeb', 'Schäfer', '2018-04-12 00:00:00', 'HANE', '752098100789012', NULL, 'ACTIVE', NULL, '2026-09-06 09:58:58.636', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Dog" VALUES ('cmtpn3brn0023l57dbncxk9f3', 'Tira', 'Springer Spaniel', '2022-04-12 00:00:00', 'TIK', '752098100890123', NULL, 'ACTIVE', NULL, '2026-09-06 09:58:58.643', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Data for Name: DogDiscipline; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."DogDiscipline" VALUES ('cmtpn3bmx000zl57dy146jhfy', 'cmtpn3blh000yl57dkuqcfiic', 'cmtpn3bj40008l57dq6joqdrk', 'SPECIALIST', '2025-08-02 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3bmx0010l57dtew1nhrs', 'cmtpn3blh000yl57dkuqcfiic', 'cmtpn3bjp0009l57dk6rkc8z6', 'GRUND', '2025-09-01 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3bmx0011l57dqw0evusj', 'cmtpn3blh000yl57dkuqcfiic', 'cmtpn3bjr000al57d62hh26lr', 'GRUND', '2025-10-01 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3bqh0018l57do5dxojiy', 'cmtpn3bqg0017l57d0x0cpkub', 'cmtpn3bj40008l57dq6joqdrk', 'SPECIALIST', '2025-08-02 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3bqh0019l57d2wsy6p3k', 'cmtpn3bqg0017l57d0x0cpkub', 'cmtpn3bj30007l57d52wqh4ov', 'GRUND', '2025-09-01 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3bqo001dl57decia7vg1', 'cmtpn3bqn001cl57d3o2wxuj6', 'cmtpn3biz0005l57drjnjn5ht', 'SPECIALIST', '2025-08-02 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3bqo001el57dqw36kmga', 'cmtpn3bqn001cl57d3o2wxuj6', 'cmtpn3bj20006l57dg9x2bh37', 'GRUND', '2025-09-01 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3bqt001jl57dfd1oay72', 'cmtpn3bqs001il57dr66rzg28', 'cmtpn3bj40008l57dq6joqdrk', 'SPECIALIST', '2025-08-02 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3bqt001kl57ddd3d6j7c', 'cmtpn3bqs001il57dr66rzg28', 'cmtpn3bj30007l57d52wqh4ov', 'GRUND', '2025-09-01 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3br0001ol57dpjqx0w8q', 'cmtpn3bqz001nl57dsqdn4hf5', 'cmtpn3bjp0009l57dk6rkc8z6', 'SPECIALIST', '2025-08-02 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3br0001pl57dw814865o', 'cmtpn3bqz001nl57dsqdn4hf5', 'cmtpn3bj30007l57d52wqh4ov', 'GRUND', '2025-09-01 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3br9001ul57d1zsdu4ab', 'cmtpn3br8001tl57d65rsmgo7', 'cmtpn3biz0005l57drjnjn5ht', 'SPECIALIST', '2025-08-02 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3br9001vl57dwmy4x711', 'cmtpn3br8001tl57d65rsmgo7', 'cmtpn3bj20006l57dg9x2bh37', 'GRUND', '2025-09-01 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3brh001zl57d2y8c1jq8', 'cmtpn3brg001yl57d1itk022p', 'cmtpn3bj40008l57dq6joqdrk', 'SPECIALIST', '2025-08-02 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3bro0024l57da5q7cr1d', 'cmtpn3brn0023l57dbncxk9f3', 'cmtpn3bj40008l57dq6joqdrk', 'SPECIALIST', '2025-08-02 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtpn3bro0025l57djhi4wp4x', 'cmtpn3brn0023l57dbncxk9f3', 'cmtpn3bjr000al57d62hh26lr', 'GRUND', '2025-09-01 08:00:00');

--
-- Data for Name: DogEducation; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."DogEducation" VALUES ('cmtpn3bq30012l57dmt5bi0yu', 'cmtpn3blh000yl57dkuqcfiic', 'Grundutbildning', 'Avarn Security Hundutbildning', '2023-03-06 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtpn3bq30013l57dr7h1ms9e', 'cmtpn3blh000yl57dkuqcfiic', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2024-01-20 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtpn3bq30014l57dhv1k3wsa', 'cmtpn3blh000yl57dkuqcfiic', 'Specialistutbildning Narkotika', 'Avarn Security Hundutbildning', '2024-12-05 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtpn3bq40015l57d9f8o8ybm', 'cmtpn3blh000yl57dkuqcfiic', 'Vidareutbildning Sök & Markering', 'Avarn Security Hundutbildning', '2025-10-21 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtpn3bqi001al57dstzc8q0a', 'cmtpn3bqg0017l57d0x0cpkub', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-10-21 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtpn3bqp001fl57dzllao9s8', 'cmtpn3bqn001cl57d3o2wxuj6', 'Grundutbildning', 'Avarn Security Hundutbildning', '2024-12-05 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtpn3bqp001gl57d5sbwezoo', 'cmtpn3bqn001cl57d3o2wxuj6', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-10-21 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtpn3bqt001ll57djruaz8i8', 'cmtpn3bqs001il57dr66rzg28', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-10-21 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtpn3br1001ql57dy9ogvorm', 'cmtpn3bqz001nl57dsqdn4hf5', 'Grundutbildning', 'Avarn Security Hundutbildning', '2024-12-05 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtpn3br1001rl57depityuho', 'cmtpn3bqz001nl57dsqdn4hf5', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-10-21 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtpn3br9001wl57dw8ip9m2i', 'cmtpn3br8001tl57d65rsmgo7', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-10-21 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtpn3bri0020l57dow77grgv', 'cmtpn3brg001yl57d1itk022p', 'Grundutbildning', 'Avarn Security Hundutbildning', '2024-12-05 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtpn3bri0021l57de2jpkp8n', 'cmtpn3brg001yl57d1itk022p', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-10-21 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtpn3brp0026l57duqdmhdh9', 'cmtpn3brn0023l57dbncxk9f3', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-10-21 08:00:00');

--
-- Data for Name: FollowUp; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."FollowUp" VALUES ('cmtpn3c6e007xl57dtq44pcrh', 'cmtpn3bq80016l57dr3szf3kd', 'cmtpn3bke000nl57dvso2b5x5', 'Uppföljning höga gömmor', 'Vi tar ett gemensamt pass på höga gömmor innan certifieringen. Hör av dig med tid som passar.', '2026-09-15 08:00:00', 'OPEN', '2026-09-06 09:58:59.174');

--
-- Data for Name: HandlerProfile; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."HandlerProfile" VALUES ('cmtpn3bkl000sl57dnfl6ckbv', 'cmtpn3bk5000hl57dakx9yofo', 'AV-1000', 'Stockholm', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtpn3bkn000tl57dvmzl5s3g', 'cmtpn3bk8000il57d08rsejuc', 'AV-1001', 'Södertälje', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtpn3bko000ul57di6xlcjk6', 'cmtpn3bka000jl57dk9bd5e1o', 'AV-1002', 'Göteborg', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtpn3bkp000vl57d6ll0e5iu', 'cmtpn3bkb000kl57d8g0e4m48', 'AV-1003', 'Malmö', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtpn3bkq000wl57djg8kjefc', 'cmtpn3bkc000ll57dynohvult', 'AV-1004', 'Umeå', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtpn3bkr000xl57dzz5codpv', 'cmtpn3bkd000ml57dh0p8va3f', 'AV-1005', 'Örebro', 'Operativ hundförare inom Avarn Security.', NULL);

--
-- Data for Name: Hide; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Hide" VALUES ('cmtpn3byu003hl57dgp2gutq2', 'cmtpn3bys003gl57d63ry9n0p', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtpn3byu003il57dh06zlfp4', 'cmtpn3bys003gl57d63ry9n0p', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtpn3byu003jl57dt57labo5', 'cmtpn3bys003gl57d63ry9n0p', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtpn3byu003kl57dqxyljsqh', 'cmtpn3bys003gl57d63ry9n0p', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtpn3byu003ll57dyflcgwcu', 'cmtpn3bys003gl57d63ry9n0p', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'MISSED', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtpn3bz5003nl57dq7z822z5', 'cmtpn3bz3003ml57duv635zrq', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtpn3bz5003ol57dznpjhtmf', 'cmtpn3bz3003ml57duv635zrq', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtpn3bz5003pl57d6o2rvq1t', 'cmtpn3bz3003ml57duv635zrq', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtpn3bz5003ql57dbkh6finu', 'cmtpn3bz3003ml57duv635zrq', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtpn3bz5003rl57dvhcogiho', 'cmtpn3bz3003ml57duv635zrq', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtpn3bz5003sl57doczxyaud', 'cmtpn3bz3003ml57duv635zrq', 'Gömma 6', 'Under pall', 15, 'SVAR', 'FOUND', 235, NULL, 6);
INSERT INTO public."Hide" VALUES ('cmtpn3bzd003ul57d6nvltvhg', 'cmtpn3bzc003tl57db5qxifg5', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtpn3bzd003vl57dqgrka808', 'cmtpn3bzc003tl57db5qxifg5', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtpn3bzd003wl57d2jzgkqbe', 'cmtpn3bzc003tl57db5qxifg5', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtpn3bzd003xl57dg5qpyi5k', 'cmtpn3bzc003tl57db5qxifg5', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'MISSED', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtpn3bzm003zl57dmrrfetzy', 'cmtpn3bzk003yl57d3k4wyskz', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtpn3bzm0040l57d43m9n7yg', 'cmtpn3bzk003yl57d3k4wyskz', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtpn3bzm0041l57d62ig6ojz', 'cmtpn3bzk003yl57d3k4wyskz', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtpn3bzm0042l57d4kabdyze', 'cmtpn3bzk003yl57d3k4wyskz', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtpn3bzm0043l57dlqnpm4c3', 'cmtpn3bzk003yl57d3k4wyskz', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtpn3bzu0045l57dl6nrdxo9', 'cmtpn3bzs0044l57dpn5fv4ms', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtpn3bzu0046l57dwl2745ph', 'cmtpn3bzs0044l57dpn5fv4ms', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtpn3bzu0047l57dortmxd1p', 'cmtpn3bzs0044l57dpn5fv4ms', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtpn3bzu0048l57d3fjihc9f', 'cmtpn3bzs0044l57dpn5fv4ms', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtpn3c02004al57dpsoxdbpk', 'cmtpn3c000049l57dlg52k4hm', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtpn3c02004bl57d8hetgol1', 'cmtpn3c000049l57dlg52k4hm', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtpn3c02004cl57d6apywal0', 'cmtpn3c000049l57dlg52k4hm', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtpn3c07004el57d8lrsji1e', 'cmtpn3c06004dl57daf1o2jdd', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtpn3c07004fl57dri7a4vcc', 'cmtpn3c06004dl57daf1o2jdd', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtpn3c07004gl57dk3pezyvn', 'cmtpn3c06004dl57daf1o2jdd', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtpn3c07004hl57drxjxsle2', 'cmtpn3c06004dl57daf1o2jdd', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtpn3c07004il57d58jqwp7x', 'cmtpn3c06004dl57daf1o2jdd', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'MISSED', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtpn3c0g004kl57djf68977y', 'cmtpn3c0f004jl57d4pycoe5x', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtpn3c0g004ll57drs1ilygc', 'cmtpn3c0f004jl57d4pycoe5x', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtpn3c0g004ml57dal9uxq7e', 'cmtpn3c0f004jl57d4pycoe5x', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtpn3c0g004nl57dm30f9ro7', 'cmtpn3c0f004jl57d4pycoe5x', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtpn3c0g004ol57daeuom2uk', 'cmtpn3c0f004jl57d4pycoe5x', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtpn3c0g004pl57dytkym410', 'cmtpn3c0f004jl57d4pycoe5x', 'Gömma 6', 'Under pall', 15, 'SVAR', 'MISSED', 235, NULL, 6);
INSERT INTO public."Hide" VALUES ('cmtpn3c0o004rl57dhg06h7z7', 'cmtpn3c0n004ql57dc1orcord', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtpn3c0o004sl57d5lxhsx69', 'cmtpn3c0n004ql57dc1orcord', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtpn3c0o004tl57dmaw5hkar', 'cmtpn3c0n004ql57dc1orcord', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'MISSED', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtpn3c0w004vl57dg436a6yg', 'cmtpn3c0v004ul57dzm3l08tf', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtpn3c0w004wl57dldd3b84v', 'cmtpn3c0v004ul57dzm3l08tf', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtpn3c0w004xl57d7o3y9ra5', 'cmtpn3c0v004ul57dzm3l08tf', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtpn3c0w004yl57d0s0ou7y0', 'cmtpn3c0v004ul57dzm3l08tf', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtpn3c0w004zl57divb71y11', 'cmtpn3c0v004ul57dzm3l08tf', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtpn3c110051l57d3tuq3md5', 'cmtpn3c100050l57dromrs6i8', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtpn3c110052l57dywagrqch', 'cmtpn3c100050l57dromrs6i8', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtpn3c110053l57dy076aful', 'cmtpn3c100050l57dromrs6i8', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtpn3c110054l57dkajr4bvm', 'cmtpn3c100050l57dromrs6i8', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'MISSED', 165, NULL, 4);

--
-- Data for Name: Indication; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Indication" VALUES ('cmtpn3c64007rl57dmho4bp6y', 'cmtpn3c62007ql57d25uqlhtv', 'Bagageband 3, kolli 18', 'Tydlig och kvarstående markering på resväska.', 'FIND', 'Polis, region Stockholm', 1);
INSERT INTO public."Indication" VALUES ('cmtpn3c64007sl57ddak46arg', 'cmtpn3c62007ql57d25uqlhtv', 'Lastpall vid port 2', 'Markering utan fynd vid kontroll.', 'NO_FIND', NULL, 2);
INSERT INTO public."Indication" VALUES ('cmtpn3c6b007vl57ds0vkmel8', 'cmtpn3c6a007ul57dpgfytnnh', 'Container 9, bakre vänstra hörnet', 'Markering på pallkrage.', 'FIND', 'Tullverket', 1);

--
-- Data for Name: InstructorAssignment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."InstructorAssignment" VALUES ('cmtpn3brt0028l57dw39rajuz', 'cmtpn3bke000nl57dvso2b5x5', 'cmtpn3bq80016l57dr3szf3kd', '2026-09-06 09:58:58.649');
INSERT INTO public."InstructorAssignment" VALUES ('cmtpn3brv0029l57dwmxymp1u', 'cmtpn3bke000nl57dvso2b5x5', 'cmtpn3bqk001bl57dmjmp8l3m', '2026-09-06 09:58:58.651');
INSERT INTO public."InstructorAssignment" VALUES ('cmtpn3brx002al57dv02z27zi', 'cmtpn3bke000nl57dvso2b5x5', 'cmtpn3br3001sl57dvb5aamnu', '2026-09-06 09:58:58.653');
INSERT INTO public."InstructorAssignment" VALUES ('cmtpn3bry002bl57dx02papm4', 'cmtpn3bke000nl57dvso2b5x5', 'cmtpn3brr0027l57dz5b8wroh', '2026-09-06 09:58:58.654');
INSERT INTO public."InstructorAssignment" VALUES ('cmtpn3brz002cl57dy47apizr', 'cmtpn3bke000nl57dvso2b5x5', 'cmtpn3bqv001ml57dd6ogf42u', '2026-09-06 09:58:58.655');
INSERT INTO public."InstructorAssignment" VALUES ('cmtpn3bs1002dl57da112d2aa', 'cmtpn3bkf000ol57d1e4lkyrw', 'cmtpn3bqr001hl57dd2784qfg', '2026-09-06 09:58:58.657');
INSERT INTO public."InstructorAssignment" VALUES ('cmtpn3bs2002el57du5eaav0y', 'cmtpn3bkf000ol57d1e4lkyrw', 'cmtpn3brc001xl57ds4dllugc', '2026-09-06 09:58:58.658');
INSERT INTO public."InstructorAssignment" VALUES ('cmtpn3bs4002fl57d21jle7xy', 'cmtpn3bkf000ol57d1e4lkyrw', 'cmtpn3brl0022l57def863woo', '2026-09-06 09:58:58.66');

--
-- Data for Name: MediaAsset; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Mission; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Mission" VALUES ('cmtpn3c56007cl57di8j9ravh', 'UPP-2451', 'Flygplatskontroll', 'Flygplatskontroll', 'cmtpn3c510078l57dky69oi68', 'Lars Holmberg', '010-109 00 00', '2026-09-09 08:00:00', '2026-09-09 10:00:00', 'Terminal 5, bagagehall', 'Arlanda, Stockholm', 'cmtpn3bip0002l57dsh43azpg', 'cmtpn3biz0005l57drjnjn5ht', 'Anmälan i säkerhetskontrollen senast 07:45. ID-handling och förordnande ska medföras. Sök sker i bagagehall och angränsande lastutrymme.', 'ASSIGNED', 'cmtpn3bkg000pl57d5sbkmjyn', '2026-09-06 09:58:59.13', 'Väst
ID-kort
Ficklampa
Väderkläder', 59.6498, 17.9239, 'P5, Personalentré', 'Terminal 5, Bagagehall', 'Parkering P5. Passerkort krävs vid bom.', '59.6510, 17.9210
59.6512, 17.9268
59.6488, 17.9280
59.6480, 17.9236
59.6493, 17.9202', 25000, 59.6505, 17.9256, 59.6512, 17.922);
INSERT INTO public."Mission" VALUES ('cmtpn3c5c007el57dvylqhhbz', 'UPP-2452', 'Evenemangssök', 'Evenemangssök', 'cmtpn3c530079l57dtzim9e29', 'Nina Ek', '08-500 300 00', '2026-09-10 14:30:00', '2026-09-10 17:30:00', 'Friends Arena, entré C', 'Solna', 'cmtpn3bip0002l57dsh43azpg', 'cmtpn3bj20006l57dg9x2bh37', 'Genomsökning av läktarsektion A–D före publikinsläpp. Klart senast 17:30.', 'ASSIGNED', 'cmtpn3bkg000pl57d5sbkmjyn', '2026-09-06 09:58:59.136', 'Väst
ID-kort
Ficklampa', 59.3729, 18.0009, 'Entré C, vaktkuren', 'Läktarsektion A–D', 'Arenagaraget plan 2, avsatta platser för utryckningsfordon.', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Mission" VALUES ('cmtpn3c5g007gl57ddg62feq5', 'UPP-2453', 'Lagerkontroll', 'Lagerkontroll', 'cmtpn3c53007al57d8wwkaf6d', 'Tomas Ek', '08-555 12 00', '2026-09-11 10:00:00', '2026-09-11 14:00:00', 'Lagerväg 12', 'Jordbro, Haninge', 'cmtpn3bip0002l57dsh43azpg', 'cmtpn3bj30007l57d52wqh4ov', 'Samordnas med lagerchef på plats. Truckar stoppas under sök.', 'PLANNED', 'cmtpn3bkg000pl57d5sbkmjyn', '2026-09-06 09:58:59.14', 'Väst
ID-kort
Skyddsskor
Hörselskydd', 59.1447, 18.1247, 'Lastkaj 3, receptionen', 'Lagerhall B och lastzon', 'Besöksparkering utanför grind 1.', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Mission" VALUES ('cmtpn3c5j007hl57dtwmapvgi', 'UPP-2454', 'Bostadssök', 'Bostadssök', 'cmtpn3c54007bl57d17x0q4zw', 'Petra Lund', '018-727 30 00', '2026-09-13 09:30:00', '2026-09-13 12:30:00', 'Gränbyvägen 8', 'Uppsala', 'cmtpn3bip0002l57dsh43azpg', 'cmtpn3biz0005l57drjnjn5ht', 'Polis närvarar. Invänta klartecken innan sök påbörjas.', 'PLANNED', 'cmtpn3bkg000pl57d5sbkmjyn', '2026-09-06 09:58:59.143', 'Väst
ID-kort
Ficklampa', 59.8767, 17.6656, 'Gatan utanför port B', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Mission" VALUES ('cmtpn3c5m007il57d58qymf4k', 'UPP-2448', 'Objektsbevakning hamnen', 'Objektsbevakning', 'cmtpn3c53007al57d8wwkaf6d', 'Tomas Ek', '031-555 00 12', '2026-09-12 20:00:00', '2026-09-13 02:00:00', 'Skandiahamnen, port 4', 'Göteborg', 'cmtpn3bir0003l57d86mkv4d2', 'cmtpn3bj20006l57dg9x2bh37', 'Nattpass. Rapportering till larmcentral varannan timme.', 'ASSIGNED', 'cmtpn3bkg000pl57d5sbkmjyn', '2026-09-06 09:58:59.146', 'Väst
ID-kort
Ficklampa
Väderkläder
Radio', 57.7089, 11.8874, 'Port 4, terminalkontoret', 'Kajplan och containerupplag', 'Parkering innanför port 4, anmäl fordonet i porten.', NULL, 40000, NULL, NULL, NULL, NULL);
INSERT INTO public."Mission" VALUES ('cmtpn3c5q007kl57d54vw8sxb', 'UPP-2431', 'Flygplatskontroll', 'Flygplatskontroll', 'cmtpn3c510078l57dky69oi68', 'Lars Holmberg', '010-109 00 00', '2026-08-27 08:00:00', '2026-08-27 10:00:00', 'Terminal 5, bagagehall', 'Arlanda, Stockholm', 'cmtpn3bip0002l57dsh43azpg', 'cmtpn3biz0005l57drjnjn5ht', 'Rutinkontroll enligt avtal.', 'COMPLETED', 'cmtpn3bkg000pl57d5sbkmjyn', '2026-09-06 09:58:59.15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Mission" VALUES ('cmtpn3c5t007ml57dgtgfzfyr', 'UPP-2427', 'Lagerkontroll', 'Lagerkontroll', 'cmtpn3c53007al57d8wwkaf6d', 'Tomas Ek', '08-555 12 00', '2026-08-20 13:00:00', '2026-08-20 16:00:00', 'Lagerväg 12', 'Jordbro, Haninge', 'cmtpn3bip0002l57dsh43azpg', 'cmtpn3bj30007l57d52wqh4ov', 'Kvartalskontroll.', 'COMPLETED', 'cmtpn3bkg000pl57d5sbkmjyn', '2026-09-06 09:58:59.153', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Mission" VALUES ('cmtpn3c5x007ol57dwv38iz4n', 'UPP-2422', 'Godskontroll', 'Lagerkontroll', 'cmtpn3c53007al57d8wwkaf6d', 'Tomas Ek', '040-555 00 20', '2026-08-16 09:00:00', '2026-08-16 13:00:00', 'Terminalgatan 3', 'Malmö', 'cmtpn3bis0004l57djowe60um', 'cmtpn3bj30007l57d52wqh4ov', 'Sök av inkommande gods från hamnen.', 'COMPLETED', 'cmtpn3bkg000pl57d5sbkmjyn', '2026-09-06 09:58:59.157', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Data for Name: MissionAssignment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MissionAssignment" VALUES ('cmtpn3c5a007dl57dlq302q9w', 'cmtpn3c56007cl57di8j9ravh', 'cmtpn3bq80016l57dr3szf3kd', 'cmtpn3bkg000pl57d5sbkmjyn', 'ACCEPTED', NULL, '2026-09-08 16:00:00', '2026-09-06 09:58:59.134', NULL, NULL, NULL, 0);
INSERT INTO public."MissionAssignment" VALUES ('cmtpn3c5e007fl57dbsqfnqeu', 'cmtpn3c5c007el57dvylqhhbz', 'cmtpn3bq80016l57dr3szf3kd', 'cmtpn3bkg000pl57d5sbkmjyn', 'OFFERED', NULL, NULL, '2026-09-06 09:58:59.138', NULL, NULL, NULL, 0);
INSERT INTO public."MissionAssignment" VALUES ('cmtpn3c5o007jl57dry39ciip', 'cmtpn3c5m007il57d58qymf4k', 'cmtpn3bqr001hl57dd2784qfg', 'cmtpn3bkg000pl57d5sbkmjyn', 'ACCEPTED', NULL, '2026-09-11 16:00:00', '2026-09-06 09:58:59.148', NULL, NULL, NULL, 0);
INSERT INTO public."MissionAssignment" VALUES ('cmtpn3c5s007ll57dyynt43r5', 'cmtpn3c5q007kl57d54vw8sxb', 'cmtpn3bq80016l57dr3szf3kd', 'cmtpn3bkg000pl57d5sbkmjyn', 'COMPLETED', NULL, '2026-08-26 16:00:00', '2026-09-06 09:58:59.152', NULL, NULL, NULL, 0);
INSERT INTO public."MissionAssignment" VALUES ('cmtpn3c5u007nl57dhdxg9hqm', 'cmtpn3c5t007ml57dgtgfzfyr', 'cmtpn3bqk001bl57dmjmp8l3m', 'cmtpn3bkg000pl57d5sbkmjyn', 'COMPLETED', NULL, '2026-08-19 16:00:00', '2026-09-06 09:58:59.154', NULL, NULL, NULL, 0);
INSERT INTO public."MissionAssignment" VALUES ('cmtpn3c5z007pl57duqd0i4n8', 'cmtpn3c5x007ol57dwv38iz4n', 'cmtpn3bqv001ml57dd6ogf42u', 'cmtpn3bkg000pl57d5sbkmjyn', 'COMPLETED', NULL, '2026-08-15 16:00:00', '2026-09-06 09:58:59.159', NULL, NULL, NULL, 0);

--
-- Data for Name: MissionEvent; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Notification" VALUES ('cmtpn3c6h007yl57dy7mpxdjc', 'cmtpn3bk5000hl57dakx9yofo', 'MISSION_ASSIGNED', 'Nytt uppdrag: Evenemangssök', 'Friends Arena, Solna – 14:30. Svara ja eller nej i uppdragsvyn.', '/uppdrag/cmtpn3c5c007el57dvylqhhbz', NULL, '2026-09-05 15:20:00');
INSERT INTO public."Notification" VALUES ('cmtpn3c6i007zl57dvwo1d61z', 'cmtpn3bk5000hl57dakx9yofo', 'COMMENT', 'Anna Karlsson kommenterade din träning', 'Bra jobbat! Fortsätt nöta på uthålligheten.', '/traning/cmtpn3bys003gl57d63ry9n0p', NULL, '2026-08-29 09:15:00');
INSERT INTO public."Notification" VALUES ('cmtpn3c6j0080l57dlukz93v3', 'cmtpn3bk5000hl57dakx9yofo', 'FOLLOW_UP', 'Kallelse till uppföljning', 'Anna Karlsson vill följa upp höga gömmor.', '/traning', NULL, '2026-09-04 10:00:00');
INSERT INTO public."Notification" VALUES ('cmtpn3c6k0081l57dj7hae0m4', 'cmtpn3bk5000hl57dakx9yofo', 'SESSION_APPROVED', 'Träning godkänd', 'Områdessök – Skog, Tyresta är godkänt.', '/traning/cmtpn3bys003gl57d63ry9n0p', '2026-08-30 08:00:00', '2026-08-29 12:00:00');
INSERT INTO public."Notification" VALUES ('cmtpn3c6l0082l57dz47jo9f1', 'cmtpn3bka000jl57dk9bd5e1o', 'CERT_EXPIRING', 'Behörighet löper ut', 'Auktoriserat ekipage för Balder går ut om 2 dagar.', '/certifikat', NULL, '2026-09-05 07:00:00');
INSERT INTO public."Notification" VALUES ('cmtpn3c6m0083l57d3ocy4y2u', 'cmtpn3bke000nl57dvso2b5x5', 'COMMENT', 'Nytt träningspass att granska', 'Erik Andersson har skickat in Fordonssök – Fordon.', '/instruktor', NULL, '2026-09-03 18:40:00');
INSERT INTO public."Notification" VALUES ('cmtpn3c6o0084l57dqxpmp1ab', 'cmtpn3bkg000pl57d5sbkmjyn', 'COMMENT', 'Ny rapport inskickad', 'Sofie Holm har skickat in rapport för UPP-2422.', '/rapporter', NULL, '2026-08-16 13:15:00');

--
-- Data for Name: OperationalReport; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."OperationalReport" VALUES ('cmtpn3c62007ql57d25uqlhtv', 'cmtpn3c5q007kl57d54vw8sxb', 'cmtpn3bq80016l57dr3szf3kd', 'cmtpn3bk5000hl57dakx9yofo', 'Terminal 5, bagagehall samt angränsande lastutrymme.', '1 paket – Narkotika (Cannabis), cirka 400 gram.', 'Inga', 'Överlämnat till polis på plats. Kvitto nummer 41221 erhållet.', '2026-08-27 08:00:00', '2026-08-27 10:20:00', 'APPROVED', '2026-08-27 11:00:00', 'cmtpn3bkg000pl57d5sbkmjyn', '2026-08-28 09:30:00', '2026-08-27 10:45:00', '2026-09-06 09:58:59.162', 25000, 'Bra samarbete. Hunden visade tydligt intresse vid bagageband 7. Markering bekräftad av kontrollant.');
INSERT INTO public."OperationalReport" VALUES ('cmtpn3c67007tl57dlgnptzk3', 'cmtpn3c5t007ml57dgtgfzfyr', 'cmtpn3bqk001bl57dmjmp8l3m', 'cmtpn3bk5000hl57dakx9yofo', 'Lagerhall A och B, samtliga ställage samt lastkaj.', 'Inga fynd.', 'Port 4 gick inte att öppna, avsnittet kunde inte genomsökas.', 'Avvikelsen rapporterad till lagerchef Tomas Ek.', '2026-08-20 13:00:00', '2026-08-20 15:45:00', 'APPROVED', '2026-08-20 16:30:00', 'cmtpn3bkg000pl57d5sbkmjyn', '2026-08-21 08:15:00', '2026-08-20 16:20:00', '2026-09-06 09:58:59.167', 4200, 'Jämnt arbetstempo genom hela passet. Ny genomsökning av port 4 bokas.');
INSERT INTO public."OperationalReport" VALUES ('cmtpn3c6a007ul57dpgfytnnh', 'cmtpn3c5x007ol57dwv38iz4n', 'cmtpn3bqv001ml57dd6ogf42u', 'cmtpn3bkb000kl57d8g0e4m48', 'Inkommande gods, container 1–14.', '1 fynd – misstänkt narkotika i container 9.', 'Inga', 'Godset avskilt och överlämnat till Tullverket.', '2026-08-16 09:00:00', '2026-08-16 12:30:00', 'SUBMITTED', '2026-08-16 13:10:00', NULL, NULL, '2026-08-16 12:55:00', '2026-09-06 09:58:59.17', 1800, 'Hunden markerade tidigt på container 9. Tullverket på plats inom en timme.');

--
-- Data for Name: PlannedExercise; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."PlannedExercise" VALUES ('cmtpn3bwr003al57dxno8xzb7', 'cmtpn3bv10039l57d6tvns8to', 'Områdessök 45 minuter i kuperad skog', 'Två pass om 45 minuter med minst fem gömmor. Fokus på systematiskt sökmönster och att hunden håller tempot hela passet.', 'cmtpn3bj40008l57dq6joqdrk', 'Narkotika', 'Skog', '2026-09-12 08:00:00', 1, 'COMPLETED');
INSERT INTO public."PlannedExercise" VALUES ('cmtpn3bwr003bl57d04q233xu', 'cmtpn3bv10039l57d6tvns8to', 'Höga gömmor i lagermiljö', 'Placera gömmor på 150–220 cm. Belöna först vid tydlig och kvarstående markering.', 'cmtpn3bj40008l57dq6joqdrk', 'Narkotika', 'Lagerlokal', '2026-09-19 08:00:00', 2, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtpn3bwr003cl57d9cgyu8ex', 'cmtpn3bv10039l57d6tvns8to', 'Fordonssök under tidspress', 'Sex fordon, max 12 minuter totalt. Syftet är att hålla noggrannheten uppe när tempot ökar.', 'cmtpn3bj30007l57d52wqh4ov', 'Narkotika', 'Fordon', '2026-09-26 08:00:00', 3, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtpn3byk003el57dmmflicov', 'cmtpn3byi003dl57daj7p5icd', 'Vinkelspår 600 meter', 'Tre räta vinklar, 45 minuter gammalt spår.', 'cmtpn3biz0005l57drjnjn5ht', 'Människa', 'Stadsmiljö', '2026-09-10 08:00:00', 1, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtpn3byk003fl57dv3k6fb0d', 'cmtpn3byi003dl57daj7p5icd', 'Ytsök öppen mark 30 minuter', 'Två figuranter, växlande vindriktning.', 'cmtpn3bj20006l57dg9x2bh37', 'Människa', 'Öppen mark', '2026-09-17 08:00:00', 2, 'PLANNED');

--
-- Data for Name: Region; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Region" VALUES ('cmtpn3bej0000l57dpra7958t', 'NORD', 'Region Nord', 1);
INSERT INTO public."Region" VALUES ('cmtpn3bio0001l57dbyl0soo3', 'MITT', 'Region Mitt', 2);
INSERT INTO public."Region" VALUES ('cmtpn3bip0002l57dsh43azpg', 'OST', 'Region Öst', 3);
INSERT INTO public."Region" VALUES ('cmtpn3bir0003l57d86mkv4d2', 'VAST', 'Region Väst', 4);
INSERT INTO public."Region" VALUES ('cmtpn3bis0004l57djowe60um', 'SYD', 'Region Syd', 5);

--
-- Data for Name: SearchDiscipline; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."SearchDiscipline" VALUES ('cmtpn3biz0005l57drjnjn5ht', 'SPAR', 'Spårsök', 'SÖK – SPÅR', 'Spårsök efter person eller föremål.', 1);
INSERT INTO public."SearchDiscipline" VALUES ('cmtpn3bj20006l57dg9x2bh37', 'YTA', 'Ytsök', 'SÖK – YTA', 'Ytsök över öppna och bebyggda områden.', 2);
INSERT INTO public."SearchDiscipline" VALUES ('cmtpn3bj30007l57d52wqh4ov', 'GODS', 'Godssök', 'SÖK – GODS', 'Sök i gods, bagage och fordon.', 3);
INSERT INTO public."SearchDiscipline" VALUES ('cmtpn3bj40008l57dq6joqdrk', 'NARKOTIKA', 'Narkotika', 'NARKOTIKA', 'Sök efter narkotiska preparat.', 4);
INSERT INTO public."SearchDiscipline" VALUES ('cmtpn3bjp0009l57dk6rkc8z6', 'SPRANG', 'Sprängämnen', 'SPRÄNGÄMNEN', 'Sök efter explosiva ämnen.', 5);
INSERT INTO public."SearchDiscipline" VALUES ('cmtpn3bjr000al57d62hh26lr', 'VAPEN', 'Vapen', 'VAPEN', 'Sök efter vapen och ammunition.', 6);

--
-- Data for Name: Setting; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Team; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Team" VALUES ('cmtpn3bq80016l57dr3szf3kd', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3blh000yl57dkuqcfiic', 'cmtpn3bip0002l57dsh43azpg', '2024-06-28 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtpn3bqk001bl57dmjmp8l3m', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bqg0017l57d0x0cpkub', 'cmtpn3bip0002l57dsh43azpg', '2023-05-25 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtpn3bqr001hl57dd2784qfg', 'cmtpn3bka000jl57dk9bd5e1o', 'cmtpn3bqn001cl57d3o2wxuj6', 'cmtpn3bir0003l57d86mkv4d2', '2023-12-11 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtpn3bqv001ml57dd6ogf42u', 'cmtpn3bkb000kl57d8g0e4m48', 'cmtpn3bqs001il57dr66rzg28', 'cmtpn3bis0004l57djowe60um', '2025-01-14 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtpn3br3001sl57dvb5aamnu', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bqz001nl57dsqdn4hf5', 'cmtpn3bip0002l57dsh43azpg', '2022-11-06 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtpn3brc001xl57ds4dllugc', 'cmtpn3bkc000ll57dynohvult', 'cmtpn3br8001tl57d65rsmgo7', 'cmtpn3bej0000l57dpra7958t', '2025-08-02 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtpn3brl0022l57def863woo', 'cmtpn3bkd000ml57dh0p8va3f', 'cmtpn3brg001yl57d1itk022p', 'cmtpn3bio0001l57dbyl0soo3', '2022-04-20 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtpn3brr0027l57dz5b8wroh', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3brn0023l57dbncxk9f3', 'cmtpn3bip0002l57dsh43azpg', '2024-06-28 08:00:00', NULL, 'ACTIVE');

--
-- Data for Name: TeamAvailability; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TeamAvailability" VALUES ('cmtpn3bs6002gl57dnudkm4lr', 'cmtpn3bq80016l57dr3szf3kd', '2026-09-06 06:00:00', '2026-10-06 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtpn3bs8002hl57de8h1rj4p', 'cmtpn3bqk001bl57dmjmp8l3m', '2026-09-06 06:00:00', '2026-10-06 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtpn3bs9002il57dp76wq8tf', 'cmtpn3bqr001hl57dd2784qfg', '2026-09-06 06:00:00', '2026-10-06 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtpn3bsb002jl57diimdh10t', 'cmtpn3bqv001ml57dd6ogf42u', '2026-09-06 06:00:00', '2026-10-06 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtpn3bsc002kl57dn6r1qcy9', 'cmtpn3br3001sl57dvb5aamnu', '2026-09-06 06:00:00', '2026-10-06 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtpn3bse002ll57dxlxfcjql', 'cmtpn3brc001xl57ds4dllugc', '2026-09-06 06:00:00', '2026-10-06 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtpn3bsf002ml57d8eg0mr4m', 'cmtpn3brl0022l57def863woo', '2026-09-06 06:00:00', '2026-10-06 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtpn3bsg002nl57dpdsafl69', 'cmtpn3brr0027l57dz5b8wroh', '2026-09-06 06:00:00', '2026-10-06 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtpn3bsi002ol57dp3l360cg', 'cmtpn3brl0022l57def863woo', '2026-09-08 00:00:00', '2026-09-15 23:00:00', 'UNAVAILABLE', 'Semester');

--
-- Data for Name: TrainingPlan; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TrainingPlan" VALUES ('cmtpn3bv10039l57d6tvns8to', 'cmtpn3bq80016l57dr3szf3kd', 'cmtpn3bke000nl57dvso2b5x5', 'Uthållighet i svår terräng', 'Bygga uthållighet över längre sök och stabilisera markering vid stenrösen och rotvältor.', '2026-08-16 08:00:00', '2026-10-11 08:00:00', 'ACTIVE', '2026-09-06 09:58:58.765');
INSERT INTO public."TrainingPlan" VALUES ('cmtpn3byi003dl57daj7p5icd', 'cmtpn3bqr001hl57dd2784qfg', 'cmtpn3bkf000ol57d1e4lkyrw', 'Spårsäkerhet på hårt underlag', 'Öka spårsäkerheten på asfalt och grus samt vid vinkelspår.', '2026-08-23 08:00:00', '2026-10-18 08:00:00', 'ACTIVE', '2026-09-06 09:58:58.89');

--
-- Data for Name: TrainingSession; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TrainingSession" VALUES ('cmtpn3bz3003ml57duv635zrq', 'cmtpn3bq80016l57dr3szf3kd', NULL, '2026-08-21 13:30:00', '2026-08-21 15:00:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 6, 6, 'Felfritt pass. Hög arbetsglädje genom hela söket.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-08-22 12:00:00', '2026-09-06 09:58:58.911', '2026-09-06 09:58:58.911');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3bzc003tl57db5qxifg5', 'cmtpn3bq80016l57dr3szf3kd', NULL, '2026-08-14 08:00:00', '2026-08-14 09:45:00', 'Arlanda, hangar 4', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtpn3bjp0009l57dk6rkc8z6', 4, 3, 'Tveksam vid höga gömmor. Behöver mer träning över 180 cm.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-08-15 12:00:00', '2026-09-06 09:58:58.92', '2026-09-06 09:58:58.92');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3bzk003yl57d3k4wyskz', 'cmtpn3bq80016l57dr3szf3kd', NULL, '2026-09-03 17:00:00', '2026-09-03 18:30:00', 'Farsta industriområde', 'Fordonssök', 'Fordon', 'Narkotika', 'cmtpn3bj30007l57d52wqh4ov', 5, 5, 'Snabbt och rent sök på sex fordon.', 'SUBMITTED', 'cmtpn3bk5000hl57dakx9yofo', NULL, NULL, '2026-09-06 09:58:58.928', '2026-09-06 09:58:58.928');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3bzs0044l57dpn5fv4ms', 'cmtpn3bqk001bl57dmjmp8l3m', NULL, '2026-09-01 10:00:00', '2026-09-01 11:30:00', 'Södertälje hamn', 'Bagagesök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj30007l57d52wqh4ov', 4, 4, 'Stabilt. Rex arbetar lugnt och metodiskt.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-09-02 12:00:00', '2026-09-06 09:58:58.936', '2026-09-06 09:58:58.936');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c000049l57dlg52k4hm', 'cmtpn3bqr001hl57dd2784qfg', NULL, '2026-09-04 07:30:00', '2026-09-04 09:00:00', 'Slottsskogen, Göteborg', 'Spårarbete', 'Öppen mark', 'Människa', 'cmtpn3biz0005l57drjnjn5ht', 3, 3, 'Höll spåret genom samtliga vinklar.', 'SUBMITTED', 'cmtpn3bka000jl57dk9bd5e1o', NULL, NULL, '2026-09-06 09:58:58.944', '2026-09-06 09:58:58.944');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c06004dl57daf1o2jdd', 'cmtpn3bqv001ml57dd6ogf42u', NULL, '2026-09-02 14:00:00', '2026-09-02 15:30:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 4, 'En falsk markering vid tomt kolli.', 'APPROVED', 'cmtpn3bkb000kl57d8g0e4m48', 'cmtpn3bke000nl57dvso2b5x5', '2026-09-03 12:00:00', '2026-09-06 09:58:58.95', '2026-09-06 09:58:58.95');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c0f004jl57d4pycoe5x', 'cmtpn3br3001sl57dvb5aamnu', NULL, '2026-08-31 09:00:00', '2026-08-31 10:45:00', 'Arlanda terminal 5', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtpn3bjp0009l57dk6rkc8z6', 6, 5, 'Bra tempo, tappade fokus mot slutet av passet.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-09-01 12:00:00', '2026-09-06 09:58:58.959', '2026-09-06 09:58:58.959');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c0n004ql57dc1orcord', 'cmtpn3brc001xl57ds4dllugc', NULL, '2026-08-29 11:00:00', '2026-08-29 12:15:00', 'Umeå, Nydalaområdet', 'Områdessök', 'Skog', 'Människa', 'cmtpn3bj20006l57dg9x2bh37', 3, 2, 'Ung hund, behöver kortare pass tills uthålligheten byggts upp.', 'APPROVED', 'cmtpn3bkc000ll57dynohvult', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-08-30 12:00:00', '2026-09-06 09:58:58.967', '2026-09-06 09:58:58.967');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c0v004ul57dzm3l08tf', 'cmtpn3brl0022l57def863woo', NULL, '2026-08-25 08:30:00', '2026-08-25 10:00:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 5, 'Rutinerat och effektivt.', 'APPROVED', 'cmtpn3bkd000ml57dh0p8va3f', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-08-26 12:00:00', '2026-09-06 09:58:58.975', '2026-09-06 09:58:58.975');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c100050l57dromrs6i8', 'cmtpn3brr0027l57dz5b8wroh', NULL, '2026-08-30 15:00:00', '2026-08-30 16:20:00', 'Södertälje, Ronna', 'Personsök', 'Stadsmiljö', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 4, 3, 'Störningsträning i folkvimmel. God kontakt med föraren.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-08-31 12:00:00', '2026-09-06 09:58:58.98', '2026-09-06 09:58:58.98');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c150055l57dlm1gobz1', 'cmtpn3bq80016l57dr3szf3kd', NULL, '2026-07-31 09:00:00', '2026-07-31 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-08-01 12:00:00', '2026-09-06 09:58:58.985', '2026-09-06 09:58:58.985');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c180056l57dzqonmobd', 'cmtpn3bq80016l57dr3szf3kd', NULL, '2026-07-18 09:00:00', '2026-07-18 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-07-19 12:00:00', '2026-09-06 09:58:58.988', '2026-09-06 09:58:58.988');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c1b0057l57d749q4bha', 'cmtpn3bq80016l57dr3szf3kd', NULL, '2026-07-05 09:00:00', '2026-07-05 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-07-06 12:00:00', '2026-09-06 09:58:58.991', '2026-09-06 09:58:58.991');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c1d0058l57dnymcgph8', 'cmtpn3bq80016l57dr3szf3kd', NULL, '2026-06-19 09:00:00', '2026-06-19 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-06-20 12:00:00', '2026-09-06 09:58:58.993', '2026-09-06 09:58:58.993');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c1f0059l57dfy2i9jjs', 'cmtpn3bq80016l57dr3szf3kd', NULL, '2026-06-06 09:00:00', '2026-06-06 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-06-07 12:00:00', '2026-09-06 09:58:58.995', '2026-09-06 09:58:58.995');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c1h005al57dps1jybjy', 'cmtpn3bq80016l57dr3szf3kd', NULL, '2026-05-24 09:00:00', '2026-05-24 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-05-25 12:00:00', '2026-09-06 09:58:58.997', '2026-09-06 09:58:58.997');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c1j005bl57dodraw574', 'cmtpn3bq80016l57dr3szf3kd', NULL, '2026-05-08 09:00:00', '2026-05-08 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-05-09 12:00:00', '2026-09-06 09:58:58.999', '2026-09-06 09:58:58.999');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c1l005cl57dg8t55yxn', 'cmtpn3bq80016l57dr3szf3kd', NULL, '2026-04-25 09:00:00', '2026-04-25 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-04-26 12:00:00', '2026-09-06 09:58:59.001', '2026-09-06 09:58:59.001');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c1n005dl57d83zhrj7t', 'cmtpn3bq80016l57dr3szf3kd', NULL, '2026-04-12 09:00:00', '2026-04-12 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-04-13 12:00:00', '2026-09-06 09:58:59.003', '2026-09-06 09:58:59.003');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c1p005el57dktk0brj4', 'cmtpn3bqk001bl57dmjmp8l3m', NULL, '2026-07-31 09:00:00', '2026-07-31 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj30007l57d52wqh4ov', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-08-01 12:00:00', '2026-09-06 09:58:59.005', '2026-09-06 09:58:59.005');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c1s005fl57dgc9zv3vl', 'cmtpn3bqk001bl57dmjmp8l3m', NULL, '2026-07-18 09:00:00', '2026-07-18 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj30007l57d52wqh4ov', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-07-19 12:00:00', '2026-09-06 09:58:59.008', '2026-09-06 09:58:59.008');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c1u005gl57dcq8d1ac1', 'cmtpn3bqk001bl57dmjmp8l3m', NULL, '2026-07-05 09:00:00', '2026-07-05 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj30007l57d52wqh4ov', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-07-06 12:00:00', '2026-09-06 09:58:59.01', '2026-09-06 09:58:59.01');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c1w005hl57dgjvq6x15', 'cmtpn3bqk001bl57dmjmp8l3m', NULL, '2026-06-19 09:00:00', '2026-06-19 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj30007l57d52wqh4ov', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-06-20 12:00:00', '2026-09-06 09:58:59.012', '2026-09-06 09:58:59.012');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3bys003gl57d63ry9n0p', 'cmtpn3bq80016l57dr3szf3kd', 'cmtpn3bwr003al57dxno8xzb7', '2026-08-28 09:00:00', '2026-08-28 11:15:00', 'Tyresta, Stockholm', 'Områdessök', 'Skog', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 4, 'Bra genomförande. Stabilt sök i svår terräng. Missade en gömma vid stenröse.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-08-29 12:00:00', '2026-09-06 09:58:58.9', '2026-09-06 09:58:59.119');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c1y005il57d6e7mfycx', 'cmtpn3bqk001bl57dmjmp8l3m', NULL, '2026-06-06 09:00:00', '2026-06-06 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj30007l57d52wqh4ov', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-06-07 12:00:00', '2026-09-06 09:58:59.014', '2026-09-06 09:58:59.014');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c20005jl57dayg4c5vw', 'cmtpn3bqk001bl57dmjmp8l3m', NULL, '2026-05-24 09:00:00', '2026-05-24 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj30007l57d52wqh4ov', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-05-25 12:00:00', '2026-09-06 09:58:59.016', '2026-09-06 09:58:59.016');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c22005kl57dclwypb67', 'cmtpn3bqk001bl57dmjmp8l3m', NULL, '2026-05-08 09:00:00', '2026-05-08 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj30007l57d52wqh4ov', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-05-09 12:00:00', '2026-09-06 09:58:59.018', '2026-09-06 09:58:59.018');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c24005ll57dh1s75t2q', 'cmtpn3bqk001bl57dmjmp8l3m', NULL, '2026-04-25 09:00:00', '2026-04-25 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj30007l57d52wqh4ov', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-04-26 12:00:00', '2026-09-06 09:58:59.02', '2026-09-06 09:58:59.02');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c26005ml57dlpo5n96e', 'cmtpn3bqk001bl57dmjmp8l3m', NULL, '2026-04-12 09:00:00', '2026-04-12 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj30007l57d52wqh4ov', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk5000hl57dakx9yofo', 'cmtpn3bke000nl57dvso2b5x5', '2026-04-13 12:00:00', '2026-09-06 09:58:59.022', '2026-09-06 09:58:59.022');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c28005nl57dqvb1gw4s', 'cmtpn3bqr001hl57dd2784qfg', NULL, '2026-07-31 09:00:00', '2026-07-31 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtpn3biz0005l57drjnjn5ht', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bka000jl57dk9bd5e1o', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-08-01 12:00:00', '2026-09-06 09:58:59.024', '2026-09-06 09:58:59.024');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c2a005ol57d4m6wlaiz', 'cmtpn3bqr001hl57dd2784qfg', NULL, '2026-07-18 09:00:00', '2026-07-18 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Människa', 'cmtpn3biz0005l57drjnjn5ht', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bka000jl57dk9bd5e1o', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-07-19 12:00:00', '2026-09-06 09:58:59.026', '2026-09-06 09:58:59.026');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c2c005pl57dseyujqd6', 'cmtpn3bqr001hl57dd2784qfg', NULL, '2026-07-05 09:00:00', '2026-07-05 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtpn3biz0005l57drjnjn5ht', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bka000jl57dk9bd5e1o', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-07-06 12:00:00', '2026-09-06 09:58:59.028', '2026-09-06 09:58:59.028');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c2e005ql57dg54djjys', 'cmtpn3bqr001hl57dd2784qfg', NULL, '2026-06-19 09:00:00', '2026-06-19 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtpn3biz0005l57drjnjn5ht', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bka000jl57dk9bd5e1o', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-06-20 12:00:00', '2026-09-06 09:58:59.03', '2026-09-06 09:58:59.03');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c2g005rl57d27dslthw', 'cmtpn3bqr001hl57dd2784qfg', NULL, '2026-06-06 09:00:00', '2026-06-06 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtpn3biz0005l57drjnjn5ht', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bka000jl57dk9bd5e1o', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-06-07 12:00:00', '2026-09-06 09:58:59.032', '2026-09-06 09:58:59.032');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c2i005sl57dnhlrivmh', 'cmtpn3bqr001hl57dd2784qfg', NULL, '2026-05-24 09:00:00', '2026-05-24 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtpn3biz0005l57drjnjn5ht', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bka000jl57dk9bd5e1o', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-05-25 12:00:00', '2026-09-06 09:58:59.034', '2026-09-06 09:58:59.034');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c2k005tl57ddiebgsnd', 'cmtpn3bqr001hl57dd2784qfg', NULL, '2026-05-08 09:00:00', '2026-05-08 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtpn3biz0005l57drjnjn5ht', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bka000jl57dk9bd5e1o', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-05-09 12:00:00', '2026-09-06 09:58:59.036', '2026-09-06 09:58:59.036');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c2m005ul57dvsbwowlq', 'cmtpn3bqr001hl57dd2784qfg', NULL, '2026-04-25 09:00:00', '2026-04-25 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Människa', 'cmtpn3biz0005l57drjnjn5ht', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bka000jl57dk9bd5e1o', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-04-26 12:00:00', '2026-09-06 09:58:59.038', '2026-09-06 09:58:59.038');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c2o005vl57dvcooa6p9', 'cmtpn3bqr001hl57dd2784qfg', NULL, '2026-04-12 09:00:00', '2026-04-12 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtpn3biz0005l57drjnjn5ht', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bka000jl57dk9bd5e1o', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-04-13 12:00:00', '2026-09-06 09:58:59.04', '2026-09-06 09:58:59.04');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c2p005wl57d6nzdzyzv', 'cmtpn3bqv001ml57dd6ogf42u', NULL, '2026-07-31 09:00:00', '2026-07-31 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkb000kl57d8g0e4m48', 'cmtpn3bke000nl57dvso2b5x5', '2026-08-01 12:00:00', '2026-09-06 09:58:59.041', '2026-09-06 09:58:59.041');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c2r005xl57dqqjgrdt1', 'cmtpn3bqv001ml57dd6ogf42u', NULL, '2026-07-18 09:00:00', '2026-07-18 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkb000kl57d8g0e4m48', 'cmtpn3bke000nl57dvso2b5x5', '2026-07-19 12:00:00', '2026-09-06 09:58:59.043', '2026-09-06 09:58:59.043');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c2t005yl57djwx208ul', 'cmtpn3bqv001ml57dd6ogf42u', NULL, '2026-07-05 09:00:00', '2026-07-05 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkb000kl57d8g0e4m48', 'cmtpn3bke000nl57dvso2b5x5', '2026-07-06 12:00:00', '2026-09-06 09:58:59.046', '2026-09-06 09:58:59.046');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c2w005zl57d6eo0sris', 'cmtpn3bqv001ml57dd6ogf42u', NULL, '2026-06-19 09:00:00', '2026-06-19 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkb000kl57d8g0e4m48', 'cmtpn3bke000nl57dvso2b5x5', '2026-06-20 12:00:00', '2026-09-06 09:58:59.048', '2026-09-06 09:58:59.048');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c2y0060l57dxxwtxerh', 'cmtpn3bqv001ml57dd6ogf42u', NULL, '2026-06-06 09:00:00', '2026-06-06 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkb000kl57d8g0e4m48', 'cmtpn3bke000nl57dvso2b5x5', '2026-06-07 12:00:00', '2026-09-06 09:58:59.05', '2026-09-06 09:58:59.05');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c300061l57drpjuw0b3', 'cmtpn3bqv001ml57dd6ogf42u', NULL, '2026-05-24 09:00:00', '2026-05-24 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkb000kl57d8g0e4m48', 'cmtpn3bke000nl57dvso2b5x5', '2026-05-25 12:00:00', '2026-09-06 09:58:59.052', '2026-09-06 09:58:59.052');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c320062l57d6nf65k5o', 'cmtpn3bqv001ml57dd6ogf42u', NULL, '2026-05-08 09:00:00', '2026-05-08 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkb000kl57d8g0e4m48', 'cmtpn3bke000nl57dvso2b5x5', '2026-05-09 12:00:00', '2026-09-06 09:58:59.054', '2026-09-06 09:58:59.054');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c340063l57d1tesb3gk', 'cmtpn3bqv001ml57dd6ogf42u', NULL, '2026-04-25 09:00:00', '2026-04-25 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkb000kl57d8g0e4m48', 'cmtpn3bke000nl57dvso2b5x5', '2026-04-26 12:00:00', '2026-09-06 09:58:59.056', '2026-09-06 09:58:59.056');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c360064l57dd01r9yk3', 'cmtpn3bqv001ml57dd6ogf42u', NULL, '2026-04-12 09:00:00', '2026-04-12 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkb000kl57d8g0e4m48', 'cmtpn3bke000nl57dvso2b5x5', '2026-04-13 12:00:00', '2026-09-06 09:58:59.058', '2026-09-06 09:58:59.058');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c380065l57dsfnxlkir', 'cmtpn3br3001sl57dvb5aamnu', NULL, '2026-07-31 09:00:00', '2026-07-31 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtpn3bjp0009l57dk6rkc8z6', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-08-01 12:00:00', '2026-09-06 09:58:59.06', '2026-09-06 09:58:59.06');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c390066l57d67nz9lqd', 'cmtpn3br3001sl57dvb5aamnu', NULL, '2026-07-18 09:00:00', '2026-07-18 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtpn3bjp0009l57dk6rkc8z6', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-07-19 12:00:00', '2026-09-06 09:58:59.061', '2026-09-06 09:58:59.061');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c3b0067l57d66w1bfmu', 'cmtpn3br3001sl57dvb5aamnu', NULL, '2026-07-05 09:00:00', '2026-07-05 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtpn3bjp0009l57dk6rkc8z6', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-07-06 12:00:00', '2026-09-06 09:58:59.063', '2026-09-06 09:58:59.063');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c3d0068l57d9xnkxqbs', 'cmtpn3br3001sl57dvb5aamnu', NULL, '2026-06-19 09:00:00', '2026-06-19 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtpn3bjp0009l57dk6rkc8z6', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-06-20 12:00:00', '2026-09-06 09:58:59.065', '2026-09-06 09:58:59.065');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c3f0069l57dk5rhvw2a', 'cmtpn3br3001sl57dvb5aamnu', NULL, '2026-06-06 09:00:00', '2026-06-06 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtpn3bjp0009l57dk6rkc8z6', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-06-07 12:00:00', '2026-09-06 09:58:59.067', '2026-09-06 09:58:59.067');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c3i006al57dbmv3z50e', 'cmtpn3br3001sl57dvb5aamnu', NULL, '2026-05-24 09:00:00', '2026-05-24 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtpn3bjp0009l57dk6rkc8z6', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-05-25 12:00:00', '2026-09-06 09:58:59.07', '2026-09-06 09:58:59.07');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c3k006bl57d0y2f4uv1', 'cmtpn3br3001sl57dvb5aamnu', NULL, '2026-05-08 09:00:00', '2026-05-08 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtpn3bjp0009l57dk6rkc8z6', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-05-09 12:00:00', '2026-09-06 09:58:59.072', '2026-09-06 09:58:59.072');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c3m006cl57db3hnqkq6', 'cmtpn3br3001sl57dvb5aamnu', NULL, '2026-04-25 09:00:00', '2026-04-25 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtpn3bjp0009l57dk6rkc8z6', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-04-26 12:00:00', '2026-09-06 09:58:59.074', '2026-09-06 09:58:59.074');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c3o006dl57dyxm3zp4j', 'cmtpn3br3001sl57dvb5aamnu', NULL, '2026-04-12 09:00:00', '2026-04-12 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtpn3bjp0009l57dk6rkc8z6', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-04-13 12:00:00', '2026-09-06 09:58:59.076', '2026-09-06 09:58:59.076');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c3q006el57de4nh4oyd', 'cmtpn3brc001xl57ds4dllugc', NULL, '2026-07-31 09:00:00', '2026-07-31 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtpn3bj20006l57dg9x2bh37', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkc000ll57dynohvult', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-08-01 12:00:00', '2026-09-06 09:58:59.078', '2026-09-06 09:58:59.078');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c3u006fl57df046azdu', 'cmtpn3brc001xl57ds4dllugc', NULL, '2026-07-18 09:00:00', '2026-07-18 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Människa', 'cmtpn3bj20006l57dg9x2bh37', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkc000ll57dynohvult', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-07-19 12:00:00', '2026-09-06 09:58:59.082', '2026-09-06 09:58:59.082');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c3w006gl57dxqb6shwy', 'cmtpn3brc001xl57ds4dllugc', NULL, '2026-07-05 09:00:00', '2026-07-05 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtpn3bj20006l57dg9x2bh37', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkc000ll57dynohvult', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-07-06 12:00:00', '2026-09-06 09:58:59.084', '2026-09-06 09:58:59.084');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c3x006hl57d4udtgr7u', 'cmtpn3brc001xl57ds4dllugc', NULL, '2026-06-19 09:00:00', '2026-06-19 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtpn3bj20006l57dg9x2bh37', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkc000ll57dynohvult', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-06-20 12:00:00', '2026-09-06 09:58:59.085', '2026-09-06 09:58:59.085');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c3y006il57dynxmro5n', 'cmtpn3brc001xl57ds4dllugc', NULL, '2026-06-06 09:00:00', '2026-06-06 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtpn3bj20006l57dg9x2bh37', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkc000ll57dynohvult', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-06-07 12:00:00', '2026-09-06 09:58:59.086', '2026-09-06 09:58:59.086');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c3z006jl57d4gparnu9', 'cmtpn3brc001xl57ds4dllugc', NULL, '2026-05-24 09:00:00', '2026-05-24 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtpn3bj20006l57dg9x2bh37', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkc000ll57dynohvult', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-05-25 12:00:00', '2026-09-06 09:58:59.087', '2026-09-06 09:58:59.087');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c40006kl57djcemzonx', 'cmtpn3brc001xl57ds4dllugc', NULL, '2026-05-08 09:00:00', '2026-05-08 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtpn3bj20006l57dg9x2bh37', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkc000ll57dynohvult', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-05-09 12:00:00', '2026-09-06 09:58:59.088', '2026-09-06 09:58:59.088');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c42006ll57duase47bt', 'cmtpn3brc001xl57ds4dllugc', NULL, '2026-04-25 09:00:00', '2026-04-25 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Människa', 'cmtpn3bj20006l57dg9x2bh37', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkc000ll57dynohvult', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-04-26 12:00:00', '2026-09-06 09:58:59.09', '2026-09-06 09:58:59.09');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c43006ml57d85blrauv', 'cmtpn3brc001xl57ds4dllugc', NULL, '2026-04-12 09:00:00', '2026-04-12 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtpn3bj20006l57dg9x2bh37', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkc000ll57dynohvult', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-04-13 12:00:00', '2026-09-06 09:58:59.091', '2026-09-06 09:58:59.091');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c44006nl57dj3y5celm', 'cmtpn3brl0022l57def863woo', NULL, '2026-07-31 09:00:00', '2026-07-31 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkd000ml57dh0p8va3f', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-08-01 12:00:00', '2026-09-06 09:58:59.092', '2026-09-06 09:58:59.092');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c45006ol57d6ac0dkg6', 'cmtpn3brl0022l57def863woo', NULL, '2026-07-18 09:00:00', '2026-07-18 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkd000ml57dh0p8va3f', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-07-19 12:00:00', '2026-09-06 09:58:59.093', '2026-09-06 09:58:59.093');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c46006pl57djpt3ed7r', 'cmtpn3brl0022l57def863woo', NULL, '2026-07-05 09:00:00', '2026-07-05 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkd000ml57dh0p8va3f', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-07-06 12:00:00', '2026-09-06 09:58:59.095', '2026-09-06 09:58:59.095');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c48006ql57d8yhoahkt', 'cmtpn3brl0022l57def863woo', NULL, '2026-06-19 09:00:00', '2026-06-19 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkd000ml57dh0p8va3f', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-06-20 12:00:00', '2026-09-06 09:58:59.096', '2026-09-06 09:58:59.096');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c49006rl57dlevrrmwp', 'cmtpn3brl0022l57def863woo', NULL, '2026-06-06 09:00:00', '2026-06-06 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkd000ml57dh0p8va3f', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-06-07 12:00:00', '2026-09-06 09:58:59.097', '2026-09-06 09:58:59.097');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c4a006sl57dhdhvwbb2', 'cmtpn3brl0022l57def863woo', NULL, '2026-05-24 09:00:00', '2026-05-24 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkd000ml57dh0p8va3f', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-05-25 12:00:00', '2026-09-06 09:58:59.098', '2026-09-06 09:58:59.098');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c4b006tl57dqwo0wo9t', 'cmtpn3brl0022l57def863woo', NULL, '2026-05-08 09:00:00', '2026-05-08 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkd000ml57dh0p8va3f', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-05-09 12:00:00', '2026-09-06 09:58:59.099', '2026-09-06 09:58:59.099');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c4c006ul57d4to5devj', 'cmtpn3brl0022l57def863woo', NULL, '2026-04-25 09:00:00', '2026-04-25 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkd000ml57dh0p8va3f', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-04-26 12:00:00', '2026-09-06 09:58:59.1', '2026-09-06 09:58:59.1');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c4d006vl57dq2o7evy9', 'cmtpn3brl0022l57def863woo', NULL, '2026-04-12 09:00:00', '2026-04-12 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bkd000ml57dh0p8va3f', 'cmtpn3bkf000ol57d1e4lkyrw', '2026-04-13 12:00:00', '2026-09-06 09:58:59.101', '2026-09-06 09:58:59.101');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c4e006wl57ddhdp5cnr', 'cmtpn3brr0027l57dz5b8wroh', NULL, '2026-07-31 09:00:00', '2026-07-31 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-08-01 12:00:00', '2026-09-06 09:58:59.102', '2026-09-06 09:58:59.102');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c4g006xl57d6ajg6bmh', 'cmtpn3brr0027l57dz5b8wroh', NULL, '2026-07-18 09:00:00', '2026-07-18 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-07-19 12:00:00', '2026-09-06 09:58:59.104', '2026-09-06 09:58:59.104');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c4h006yl57dvmr485d4', 'cmtpn3brr0027l57dz5b8wroh', NULL, '2026-07-05 09:00:00', '2026-07-05 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-07-06 12:00:00', '2026-09-06 09:58:59.105', '2026-09-06 09:58:59.105');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c4j006zl57dsvcncupk', 'cmtpn3brr0027l57dz5b8wroh', NULL, '2026-06-19 09:00:00', '2026-06-19 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-06-20 12:00:00', '2026-09-06 09:58:59.107', '2026-09-06 09:58:59.107');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c4k0070l57dn7u7iuv5', 'cmtpn3brr0027l57dz5b8wroh', NULL, '2026-06-06 09:00:00', '2026-06-06 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-06-07 12:00:00', '2026-09-06 09:58:59.108', '2026-09-06 09:58:59.108');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c4l0071l57dkdp08gnj', 'cmtpn3brr0027l57dz5b8wroh', NULL, '2026-05-24 09:00:00', '2026-05-24 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-05-25 12:00:00', '2026-09-06 09:58:59.109', '2026-09-06 09:58:59.109');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c4n0072l57d9suwsnjc', 'cmtpn3brr0027l57dz5b8wroh', NULL, '2026-05-08 09:00:00', '2026-05-08 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-05-09 12:00:00', '2026-09-06 09:58:59.111', '2026-09-06 09:58:59.111');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c4o0073l57dbgbiwbez', 'cmtpn3brr0027l57dz5b8wroh', NULL, '2026-04-25 09:00:00', '2026-04-25 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-04-26 12:00:00', '2026-09-06 09:58:59.112', '2026-09-06 09:58:59.112');
INSERT INTO public."TrainingSession" VALUES ('cmtpn3c4p0074l57dbpvijavz', 'cmtpn3brr0027l57dz5b8wroh', NULL, '2026-04-12 09:00:00', '2026-04-12 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtpn3bj40008l57dq6joqdrk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtpn3bk8000il57d08rsejuc', 'cmtpn3bke000nl57dvso2b5x5', '2026-04-13 12:00:00', '2026-09-06 09:58:59.113', '2026-09-06 09:58:59.113');

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."User" VALUES ('cmtpn3bkd000ml57dh0p8va3f', 'lisa.ek@avarn.se', 'Lisa Ek', '$2b$10$VsXWQ5jf3bp9bNkDnLd/mOrkHeNm8iLDfqPrhi39NX4rIMQYQRx9S', 'HANDLER', '070-678 90 12', true, NULL, '2026-09-06 09:58:58.381', 'cmtpn3bio0001l57dbyl0soo3');
INSERT INTO public."User" VALUES ('cmtpn3bke000nl57dvso2b5x5', 'anna.karlsson@avarn.se', 'Anna Karlsson', '$2b$10$VsXWQ5jf3bp9bNkDnLd/mOrkHeNm8iLDfqPrhi39NX4rIMQYQRx9S', 'INSTRUCTOR', '070-789 01 23', true, NULL, '2026-09-06 09:58:58.382', 'cmtpn3bip0002l57dsh43azpg');
INSERT INTO public."User" VALUES ('cmtpn3bkf000ol57d1e4lkyrw', 'peter.nyman@avarn.se', 'Peter Nyman', '$2b$10$VsXWQ5jf3bp9bNkDnLd/mOrkHeNm8iLDfqPrhi39NX4rIMQYQRx9S', 'INSTRUCTOR', '070-890 12 34', true, NULL, '2026-09-06 09:58:58.383', 'cmtpn3bir0003l57d86mkv4d2');
INSERT INTO public."User" VALUES ('cmtpn3bkg000pl57d5sbkmjyn', 'karin.dahl@avarn.se', 'Karin Dahl', '$2b$10$VsXWQ5jf3bp9bNkDnLd/mOrkHeNm8iLDfqPrhi39NX4rIMQYQRx9S', 'REGIONAL_MANAGER', '070-901 23 45', true, NULL, '2026-09-06 09:58:58.384', 'cmtpn3bip0002l57dsh43azpg');
INSERT INTO public."User" VALUES ('cmtpn3bki000ql57dt2mmzwah', 'magnus.oberg@avarn.se', 'Magnus Öberg', '$2b$10$VsXWQ5jf3bp9bNkDnLd/mOrkHeNm8iLDfqPrhi39NX4rIMQYQRx9S', 'NATIONAL_MANAGER', '070-012 34 56', true, NULL, '2026-09-06 09:58:58.386', NULL);
INSERT INTO public."User" VALUES ('cmtpn3bkj000rl57dn0gv398h', 'admin@avarn.se', 'Systemadministratör', '$2b$10$VsXWQ5jf3bp9bNkDnLd/mOrkHeNm8iLDfqPrhi39NX4rIMQYQRx9S', 'ADMIN', NULL, true, NULL, '2026-09-06 09:58:58.387', NULL);
INSERT INTO public."User" VALUES ('cmtpn3bk5000hl57dakx9yofo', 'erik.andersson@avarn.se', 'Erik Andersson', '$2b$10$VsXWQ5jf3bp9bNkDnLd/mOrkHeNm8iLDfqPrhi39NX4rIMQYQRx9S', 'HANDLER', '070-123 45 67', true, NULL, '2026-09-06 09:58:58.373', 'cmtpn3bip0002l57dsh43azpg');
INSERT INTO public."User" VALUES ('cmtpn3bk8000il57d08rsejuc', 'maria.svensson@avarn.se', 'Maria Svensson', '$2b$10$VsXWQ5jf3bp9bNkDnLd/mOrkHeNm8iLDfqPrhi39NX4rIMQYQRx9S', 'HANDLER', '070-234 56 78', true, NULL, '2026-09-06 09:58:58.376', 'cmtpn3bip0002l57dsh43azpg');
INSERT INTO public."User" VALUES ('cmtpn3bka000jl57dk9bd5e1o', 'johan.larsson@avarn.se', 'Johan Larsson', '$2b$10$VsXWQ5jf3bp9bNkDnLd/mOrkHeNm8iLDfqPrhi39NX4rIMQYQRx9S', 'HANDLER', '070-345 67 89', true, NULL, '2026-09-06 09:58:58.378', 'cmtpn3bir0003l57d86mkv4d2');
INSERT INTO public."User" VALUES ('cmtpn3bkb000kl57d8g0e4m48', 'sofie.holm@avarn.se', 'Sofie Holm', '$2b$10$VsXWQ5jf3bp9bNkDnLd/mOrkHeNm8iLDfqPrhi39NX4rIMQYQRx9S', 'HANDLER', '070-456 78 90', true, NULL, '2026-09-06 09:58:58.379', 'cmtpn3bis0004l57djowe60um');
INSERT INTO public."User" VALUES ('cmtpn3bkc000ll57dynohvult', 'anders.berg@avarn.se', 'Anders Berg', '$2b$10$VsXWQ5jf3bp9bNkDnLd/mOrkHeNm8iLDfqPrhi39NX4rIMQYQRx9S', 'HANDLER', '070-567 89 01', true, NULL, '2026-09-06 09:58:58.38', 'cmtpn3bej0000l57dpra7958t');

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations VALUES ('b4a08b03-3687-430e-9f5f-9c34b0c01b36', 'e67474ddd6e107de2df8cefbeb5f9cb6e3a15399718d0cd8c3a6d8d78a9d0c8c', '2026-08-31 12:57:11.315391+00', '20260831113658_init', NULL, NULL, '2026-08-31 12:57:11.093046+00', 1);
INSERT INTO public._prisma_migrations VALUES ('3d7aae2b-ae08-4fb0-91bb-7633c03f7cbe', '46e8787317de3b806f47ed777efef5ecb3002350aaaeeca5455f5bf036fa9468', '2026-09-01 11:49:55.942159+00', '20260901114955_media_dog_and_profile_photos', NULL, NULL, '2026-09-01 11:49:55.928359+00', 1);
INSERT INTO public._prisma_migrations VALUES ('4f1dd06b-cae0-4b7e-949a-b34da3490b65', '7a3e00b28b340daabfe9ce8d318466bfd08fbb6db1fd6513568939d204259f1f', '2026-09-01 16:58:16.970172+00', '20260901165816_dog_profile_details', NULL, NULL, '2026-09-01 16:58:16.964336+00', 1);
INSERT INTO public._prisma_migrations VALUES ('1afa96e2-f54f-46ff-ac1b-30358f821560', '5f24f7491ade4c94c0ffaa58a4fa92900e31cc4321a8eb8ec49f7eb961c21039', '2026-09-02 06:45:43.388074+00', '20260902064543_settings', NULL, NULL, '2026-09-02 06:45:43.378536+00', 1);
INSERT INTO public._prisma_migrations VALUES ('04cdb278-5f0d-4875-acf4-130b8f7344ff', '0f60de1173bb33eb8606226b1b31ba175ab7ff5047ef7269a42e3fe92990d10a', '2026-09-03 03:36:05.527646+00', '20260903033605_uppdragsdetaljer', NULL, NULL, '2026-09-03 03:36:05.522958+00', 1);
INSERT INTO public._prisma_migrations VALUES ('1f9ddd60-99a3-47c9-ba27-4cb62f58b79f', '2a35890bcbee5b27200a93e31c692c32cf42683d330b07f17e2f2674055f4e63', '2026-09-03 05:10:22.053763+00', '20260903051022_pagaende_uppdrag', NULL, NULL, '2026-09-03 05:10:22.041672+00', 1);
INSERT INTO public._prisma_migrations VALUES ('2cc2c1f4-eda4-48c1-a012-7f43308dacdb', '066e6693b0405f4b2b4d8e49c52e4f9c2f54a36195a973ad2e9c60d9875d0a24', '2026-09-03 05:38:33.626133+00', '20260903053833_uppdragsomrade', NULL, NULL, '2026-09-03 05:38:33.622748+00', 1);
INSERT INTO public._prisma_migrations VALUES ('f03227ef-db94-40fe-9607-fe459ee5b46d', 'd11c877c7f844d119a12863500a7334caeba78202f3507982e3012962a948f62', '2026-09-03 17:46:16.700049+00', '20260903174616_uppdragsdokument', NULL, NULL, '2026-09-03 17:46:16.687502+00', 1);

--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);

--
-- Name: CertificationType CertificationType_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CertificationType"
    ADD CONSTRAINT "CertificationType_pkey" PRIMARY KEY (id);

--
-- Name: Certification Certification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Certification"
    ADD CONSTRAINT "Certification_pkey" PRIMARY KEY (id);

--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);

--
-- Name: Customer Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);

--
-- Name: DogDiscipline DogDiscipline_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DogDiscipline"
    ADD CONSTRAINT "DogDiscipline_pkey" PRIMARY KEY (id);

--
-- Name: DogEducation DogEducation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DogEducation"
    ADD CONSTRAINT "DogEducation_pkey" PRIMARY KEY (id);

--
-- Name: Dog Dog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Dog"
    ADD CONSTRAINT "Dog_pkey" PRIMARY KEY (id);

--
-- Name: FollowUp FollowUp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FollowUp"
    ADD CONSTRAINT "FollowUp_pkey" PRIMARY KEY (id);

--
-- Name: HandlerProfile HandlerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."HandlerProfile"
    ADD CONSTRAINT "HandlerProfile_pkey" PRIMARY KEY (id);

--
-- Name: Hide Hide_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Hide"
    ADD CONSTRAINT "Hide_pkey" PRIMARY KEY (id);

--
-- Name: Indication Indication_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Indication"
    ADD CONSTRAINT "Indication_pkey" PRIMARY KEY (id);

--
-- Name: InstructorAssignment InstructorAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InstructorAssignment"
    ADD CONSTRAINT "InstructorAssignment_pkey" PRIMARY KEY (id);

--
-- Name: MediaAsset MediaAsset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_pkey" PRIMARY KEY (id);

--
-- Name: MissionAssignment MissionAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MissionAssignment"
    ADD CONSTRAINT "MissionAssignment_pkey" PRIMARY KEY (id);

--
-- Name: MissionEvent MissionEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MissionEvent"
    ADD CONSTRAINT "MissionEvent_pkey" PRIMARY KEY (id);

--
-- Name: Mission Mission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mission"
    ADD CONSTRAINT "Mission_pkey" PRIMARY KEY (id);

--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);

--
-- Name: OperationalReport OperationalReport_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OperationalReport"
    ADD CONSTRAINT "OperationalReport_pkey" PRIMARY KEY (id);

--
-- Name: PlannedExercise PlannedExercise_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PlannedExercise"
    ADD CONSTRAINT "PlannedExercise_pkey" PRIMARY KEY (id);

--
-- Name: Region Region_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Region"
    ADD CONSTRAINT "Region_pkey" PRIMARY KEY (id);

--
-- Name: SearchDiscipline SearchDiscipline_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SearchDiscipline"
    ADD CONSTRAINT "SearchDiscipline_pkey" PRIMARY KEY (id);

--
-- Name: Setting Setting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_pkey" PRIMARY KEY (key);

--
-- Name: TeamAvailability TeamAvailability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamAvailability"
    ADD CONSTRAINT "TeamAvailability_pkey" PRIMARY KEY (id);

--
-- Name: Team Team_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_pkey" PRIMARY KEY (id);

--
-- Name: TrainingPlan TrainingPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingPlan"
    ADD CONSTRAINT "TrainingPlan_pkey" PRIMARY KEY (id);

--
-- Name: TrainingSession TrainingSession_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingSession"
    ADD CONSTRAINT "TrainingSession_pkey" PRIMARY KEY (id);

--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);

--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);

--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");

--
-- Name: AuditLog_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_entityType_entityId_idx" ON public."AuditLog" USING btree ("entityType", "entityId");

--
-- Name: CertificationType_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CertificationType_code_key" ON public."CertificationType" USING btree (code);

--
-- Name: Certification_dogId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Certification_dogId_idx" ON public."Certification" USING btree ("dogId");

--
-- Name: Certification_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Certification_expiresAt_idx" ON public."Certification" USING btree ("expiresAt");

--
-- Name: Certification_teamId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Certification_teamId_idx" ON public."Certification" USING btree ("teamId");

--
-- Name: Comment_reportId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Comment_reportId_idx" ON public."Comment" USING btree ("reportId");

--
-- Name: Comment_trainingSessionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Comment_trainingSessionId_idx" ON public."Comment" USING btree ("trainingSessionId");

--
-- Name: DogDiscipline_dogId_disciplineId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DogDiscipline_dogId_disciplineId_key" ON public."DogDiscipline" USING btree ("dogId", "disciplineId");

--
-- Name: FollowUp_teamId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FollowUp_teamId_idx" ON public."FollowUp" USING btree ("teamId");

--
-- Name: HandlerProfile_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "HandlerProfile_userId_key" ON public."HandlerProfile" USING btree ("userId");

--
-- Name: Hide_sessionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Hide_sessionId_idx" ON public."Hide" USING btree ("sessionId");

--
-- Name: Indication_reportId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Indication_reportId_idx" ON public."Indication" USING btree ("reportId");

--
-- Name: InstructorAssignment_instructorId_teamId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "InstructorAssignment_instructorId_teamId_key" ON public."InstructorAssignment" USING btree ("instructorId", "teamId");

--
-- Name: InstructorAssignment_teamId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InstructorAssignment_teamId_idx" ON public."InstructorAssignment" USING btree ("teamId");

--
-- Name: MediaAsset_dogId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MediaAsset_dogId_idx" ON public."MediaAsset" USING btree ("dogId");

--
-- Name: MediaAsset_missionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MediaAsset_missionId_idx" ON public."MediaAsset" USING btree ("missionId");

--
-- Name: MediaAsset_reportId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MediaAsset_reportId_idx" ON public."MediaAsset" USING btree ("reportId");

--
-- Name: MediaAsset_storedName_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MediaAsset_storedName_key" ON public."MediaAsset" USING btree ("storedName");

--
-- Name: MediaAsset_trainingSessionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MediaAsset_trainingSessionId_idx" ON public."MediaAsset" USING btree ("trainingSessionId");

--
-- Name: MissionAssignment_missionId_teamId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MissionAssignment_missionId_teamId_key" ON public."MissionAssignment" USING btree ("missionId", "teamId");

--
-- Name: MissionAssignment_teamId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MissionAssignment_teamId_idx" ON public."MissionAssignment" USING btree ("teamId");

--
-- Name: MissionEvent_assignmentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MissionEvent_assignmentId_idx" ON public."MissionEvent" USING btree ("assignmentId");

--
-- Name: Mission_reference_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Mission_reference_key" ON public."Mission" USING btree (reference);

--
-- Name: Mission_regionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Mission_regionId_idx" ON public."Mission" USING btree ("regionId");

--
-- Name: Mission_startAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Mission_startAt_idx" ON public."Mission" USING btree ("startAt");

--
-- Name: Mission_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Mission_status_idx" ON public."Mission" USING btree (status);

--
-- Name: Notification_userId_readAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_userId_readAt_idx" ON public."Notification" USING btree ("userId", "readAt");

--
-- Name: OperationalReport_missionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OperationalReport_missionId_idx" ON public."OperationalReport" USING btree ("missionId");

--
-- Name: OperationalReport_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OperationalReport_status_idx" ON public."OperationalReport" USING btree (status);

--
-- Name: OperationalReport_teamId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OperationalReport_teamId_idx" ON public."OperationalReport" USING btree ("teamId");

--
-- Name: PlannedExercise_planId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PlannedExercise_planId_idx" ON public."PlannedExercise" USING btree ("planId");

--
-- Name: Region_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Region_code_key" ON public."Region" USING btree (code);

--
-- Name: SearchDiscipline_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SearchDiscipline_code_key" ON public."SearchDiscipline" USING btree (code);

--
-- Name: TeamAvailability_teamId_startAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeamAvailability_teamId_startAt_idx" ON public."TeamAvailability" USING btree ("teamId", "startAt");

--
-- Name: Team_handlerId_dogId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Team_handlerId_dogId_key" ON public."Team" USING btree ("handlerId", "dogId");

--
-- Name: Team_regionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Team_regionId_idx" ON public."Team" USING btree ("regionId");

--
-- Name: TrainingPlan_teamId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TrainingPlan_teamId_idx" ON public."TrainingPlan" USING btree ("teamId");

--
-- Name: TrainingSession_plannedExerciseId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TrainingSession_plannedExerciseId_key" ON public."TrainingSession" USING btree ("plannedExerciseId");

--
-- Name: TrainingSession_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TrainingSession_status_idx" ON public."TrainingSession" USING btree (status);

--
-- Name: TrainingSession_teamId_startAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TrainingSession_teamId_startAt_idx" ON public."TrainingSession" USING btree ("teamId", "startAt");

--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);

--
-- Name: User_regionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_regionId_idx" ON public."User" USING btree ("regionId");

--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);

--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: Certification Certification_dogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Certification"
    ADD CONSTRAINT "Certification_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES public."Dog"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: Certification Certification_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Certification"
    ADD CONSTRAINT "Certification_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: Certification Certification_typeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Certification"
    ADD CONSTRAINT "Certification_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES public."CertificationType"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: Certification Certification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Certification"
    ADD CONSTRAINT "Certification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: Comment Comment_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: Comment Comment_reportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES public."OperationalReport"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: Comment Comment_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: Comment Comment_trainingSessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_trainingSessionId_fkey" FOREIGN KEY ("trainingSessionId") REFERENCES public."TrainingSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: DogDiscipline DogDiscipline_disciplineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DogDiscipline"
    ADD CONSTRAINT "DogDiscipline_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES public."SearchDiscipline"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: DogDiscipline DogDiscipline_dogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DogDiscipline"
    ADD CONSTRAINT "DogDiscipline_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES public."Dog"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: DogEducation DogEducation_dogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DogEducation"
    ADD CONSTRAINT "DogEducation_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES public."Dog"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: FollowUp FollowUp_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FollowUp"
    ADD CONSTRAINT "FollowUp_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: FollowUp FollowUp_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FollowUp"
    ADD CONSTRAINT "FollowUp_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: HandlerProfile HandlerProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."HandlerProfile"
    ADD CONSTRAINT "HandlerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: Hide Hide_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Hide"
    ADD CONSTRAINT "Hide_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."TrainingSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: Indication Indication_reportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Indication"
    ADD CONSTRAINT "Indication_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES public."OperationalReport"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: InstructorAssignment InstructorAssignment_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InstructorAssignment"
    ADD CONSTRAINT "InstructorAssignment_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: InstructorAssignment InstructorAssignment_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InstructorAssignment"
    ADD CONSTRAINT "InstructorAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: MediaAsset MediaAsset_certificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES public."Certification"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: MediaAsset MediaAsset_dogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES public."Dog"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: MediaAsset MediaAsset_missionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES public."Mission"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: MediaAsset MediaAsset_profileUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_profileUserId_fkey" FOREIGN KEY ("profileUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: MediaAsset MediaAsset_reportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES public."OperationalReport"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: MediaAsset MediaAsset_trainingSessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_trainingSessionId_fkey" FOREIGN KEY ("trainingSessionId") REFERENCES public."TrainingSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: MediaAsset MediaAsset_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: MissionAssignment MissionAssignment_assignedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MissionAssignment"
    ADD CONSTRAINT "MissionAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: MissionAssignment MissionAssignment_missionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MissionAssignment"
    ADD CONSTRAINT "MissionAssignment_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES public."Mission"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: MissionAssignment MissionAssignment_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MissionAssignment"
    ADD CONSTRAINT "MissionAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: MissionEvent MissionEvent_assignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MissionEvent"
    ADD CONSTRAINT "MissionEvent_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES public."MissionAssignment"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: MissionEvent MissionEvent_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MissionEvent"
    ADD CONSTRAINT "MissionEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: Mission Mission_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mission"
    ADD CONSTRAINT "Mission_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: Mission Mission_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mission"
    ADD CONSTRAINT "Mission_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: Mission Mission_disciplineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mission"
    ADD CONSTRAINT "Mission_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES public."SearchDiscipline"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: Mission Mission_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mission"
    ADD CONSTRAINT "Mission_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public."Region"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: OperationalReport OperationalReport_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OperationalReport"
    ADD CONSTRAINT "OperationalReport_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: OperationalReport OperationalReport_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OperationalReport"
    ADD CONSTRAINT "OperationalReport_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: OperationalReport OperationalReport_missionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OperationalReport"
    ADD CONSTRAINT "OperationalReport_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES public."Mission"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: OperationalReport OperationalReport_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OperationalReport"
    ADD CONSTRAINT "OperationalReport_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: PlannedExercise PlannedExercise_disciplineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PlannedExercise"
    ADD CONSTRAINT "PlannedExercise_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES public."SearchDiscipline"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: PlannedExercise PlannedExercise_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PlannedExercise"
    ADD CONSTRAINT "PlannedExercise_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."TrainingPlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: Setting Setting_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: TeamAvailability TeamAvailability_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamAvailability"
    ADD CONSTRAINT "TeamAvailability_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: Team Team_dogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES public."Dog"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: Team Team_handlerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_handlerId_fkey" FOREIGN KEY ("handlerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: Team Team_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public."Region"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: TrainingPlan TrainingPlan_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingPlan"
    ADD CONSTRAINT "TrainingPlan_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: TrainingPlan TrainingPlan_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingPlan"
    ADD CONSTRAINT "TrainingPlan_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: TrainingSession TrainingSession_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingSession"
    ADD CONSTRAINT "TrainingSession_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: TrainingSession TrainingSession_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingSession"
    ADD CONSTRAINT "TrainingSession_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: TrainingSession TrainingSession_disciplineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingSession"
    ADD CONSTRAINT "TrainingSession_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES public."SearchDiscipline"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: TrainingSession TrainingSession_plannedExerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingSession"
    ADD CONSTRAINT "TrainingSession_plannedExerciseId_fkey" FOREIGN KEY ("plannedExerciseId") REFERENCES public."PlannedExercise"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: TrainingSession TrainingSession_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingSession"
    ADD CONSTRAINT "TrainingSession_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: User User_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public."Region"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- PostgreSQL database dump complete
--

--
-- Radsäkerhet
--
-- Supabase publicerar schemat public genom sitt REST-API, och anon-nyckeln
-- är gjord för att ligga öppet i en webbklient. Utan radsäkerhet skulle
-- vem som helst med den nyckeln kunna läsa operativa rapporter och fynd.
--
-- Radsäkerhet slås därför på utan några policyer: anon och authenticated
-- nekas allt. Appen påverkas inte, eftersom den ansluter som rollen
-- postgres som äger tabellerna. Behörigheten mellan roller styrs i appen,
-- i src/lib/authz.ts.
--

ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Certification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CertificationType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Dog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DogDiscipline" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DogEducation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FollowUp" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."HandlerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Hide" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Indication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."InstructorAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MediaAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Mission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MissionAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MissionEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OperationalReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PlannedExercise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Region" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SearchDiscipline" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Setting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Team" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TeamAvailability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TrainingPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TrainingSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
