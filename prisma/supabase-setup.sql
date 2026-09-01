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
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
    "profileUserId" text
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
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
    "updatedAt" timestamp(3) without time zone NOT NULL
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

INSERT INTO public."AuditLog" VALUES ('cmtim55q3000cgv7d1w6c1uw5', 'cmtim3i06000j2m7dimg2alyk', 'LOGIN', 'User', 'cmtim3i06000j2m7dimg2alyk', NULL, '2026-09-01 11:58:01.275');
INSERT INTO public."AuditLog" VALUES ('cmtim56ji000dgv7d0icadx8c', 'cmtim3i00000h2m7dtebiy6zb', 'LOGIN', 'User', 'cmtim3i00000h2m7dtebiy6zb', NULL, '2026-09-01 11:58:02.334');
INSERT INTO public."AuditLog" VALUES ('cmtim580l000egv7d4g9nsxvn', 'cmtim3i06000j2m7dimg2alyk', 'LOGIN', 'User', 'cmtim3i06000j2m7dimg2alyk', NULL, '2026-09-01 11:58:04.245');
INSERT INTO public."AuditLog" VALUES ('cmtim58qk000fgv7dzouyn11i', 'cmtim3i00000h2m7dtebiy6zb', 'LOGIN', 'User', 'cmtim3i00000h2m7dtebiy6zb', NULL, '2026-09-01 11:58:05.18');
INSERT INTO public."AuditLog" VALUES ('cmtim59r1000ggv7da48zjzl1', 'cmtim3i0g000o2m7dhlh9w1ar', 'LOGIN', 'User', 'cmtim3i0g000o2m7dhlh9w1ar', NULL, '2026-09-01 11:58:06.493');
INSERT INTO public."AuditLog" VALUES ('cmtim5ak2000hgv7d08paqcdy', 'cmtim3i0e000n2m7ds08y9fyi', 'LOGIN', 'User', 'cmtim3i0e000n2m7ds08y9fyi', NULL, '2026-09-01 11:58:07.538');
INSERT INTO public."AuditLog" VALUES ('cmtim5c2i000igv7dsruavaw6', 'cmtim3i00000h2m7dtebiy6zb', 'LOGIN', 'User', 'cmtim3i00000h2m7dtebiy6zb', NULL, '2026-09-01 11:58:09.498');
INSERT INTO public."AuditLog" VALUES ('cmtim5cai000jgv7dyhbisevd', 'cmtim3i00000h2m7dtebiy6zb', 'DENIED', 'MediaAsset', 'finns-inte', 'Försök att hämta fil utanför behörighet', '2026-09-01 11:58:09.786');
INSERT INTO public."AuditLog" VALUES ('cmtim5cx3000kgv7dithzbe3s', 'cmtim3i00000h2m7dtebiy6zb', 'LOGIN', 'User', 'cmtim3i00000h2m7dtebiy6zb', NULL, '2026-09-01 11:58:10.599');
INSERT INTO public."AuditLog" VALUES ('cmtim5dy6000lgv7dned2c9kh', 'cmtim3i0e000n2m7ds08y9fyi', 'LOGIN', 'User', 'cmtim3i0e000n2m7ds08y9fyi', NULL, '2026-09-01 11:58:11.934');
INSERT INTO public."AuditLog" VALUES ('cmtim5f0d000mgv7dqtjebuq4', 'cmtim3i00000h2m7dtebiy6zb', 'LOGIN', 'User', 'cmtim3i00000h2m7dtebiy6zb', NULL, '2026-09-01 11:58:13.309');
INSERT INTO public."AuditLog" VALUES ('cmtim5fmw000ngv7dpcx67uqe', 'cmtim3i00000h2m7dtebiy6zb', 'DENIED', 'User', 'cmtim3i00000h2m7dtebiy6zb', 'Fel nuvarande lösenord vid byte', '2026-09-01 11:58:14.12');
INSERT INTO public."AuditLog" VALUES ('cmtim5g7q000ogv7dksi0s0e7', 'cmtim3i00000h2m7dtebiy6zb', 'LOGIN', 'User', 'cmtim3i00000h2m7dtebiy6zb', NULL, '2026-09-01 11:58:14.87');
INSERT INTO public."AuditLog" VALUES ('cmtim5hkx000pgv7dwhasyhpg', 'cmtim3i06000j2m7dimg2alyk', 'LOGIN', 'User', 'cmtim3i06000j2m7dimg2alyk', NULL, '2026-09-01 11:58:16.641');
INSERT INTO public."AuditLog" VALUES ('cmtim5ic0000qgv7dik8tokuz', 'cmtim3i00000h2m7dtebiy6zb', 'LOGIN', 'User', 'cmtim3i00000h2m7dtebiy6zb', NULL, '2026-09-01 11:58:17.616');
INSERT INTO public."AuditLog" VALUES ('cmtim5jd2000rgv7dltlzg9km', 'cmtim3i00000h2m7dtebiy6zb', 'LOGIN', 'User', 'cmtim3i00000h2m7dtebiy6zb', NULL, '2026-09-01 11:58:18.95');
INSERT INTO public."AuditLog" VALUES ('cmtim5ju4000sgv7dxalqvev1', 'cmtim3i00000h2m7dtebiy6zb', 'READ', 'TrainingSession', 'cmtim3i6o003w2m7dws4i7dso', NULL, '2026-09-01 11:58:19.564');
INSERT INTO public."AuditLog" VALUES ('cmtim5k6o000ugv7daxbhn5kq', 'cmtim3i00000h2m7dtebiy6zb', 'READ', 'TrainingSession', 'cmtim3i6o003w2m7dws4i7dso', NULL, '2026-09-01 11:58:20.017');
INSERT INTO public."AuditLog" VALUES ('cmtim5kly000vgv7daxue1gst', 'cmtim3i06000j2m7dimg2alyk', 'LOGIN', 'User', 'cmtim3i06000j2m7dimg2alyk', NULL, '2026-09-01 11:58:20.567');
INSERT INTO public."AuditLog" VALUES ('cmtim5ktv000wgv7d6zgiu5ur', 'cmtim3i06000j2m7dimg2alyk', 'DENIED', 'MediaAsset', 'cmtim5k4z000tgv7dr3x8k5q6', 'Försök att hämta fil utanför behörighet', '2026-09-01 11:58:20.851');
INSERT INTO public."AuditLog" VALUES ('cmtim5lps000xgv7d6ot5axr8', 'cmtim3i00000h2m7dtebiy6zb', 'DENIED', 'Login', NULL, 'Fel lösenord', '2026-09-01 11:58:22');
INSERT INTO public."AuditLog" VALUES ('cmtim5m9r000ygv7dklhnm6b6', 'cmtim3i00000h2m7dtebiy6zb', 'LOGIN', 'User', 'cmtim3i00000h2m7dtebiy6zb', NULL, '2026-09-01 11:58:22.719');
INSERT INTO public."AuditLog" VALUES ('cmtim5o7u000zgv7drjmsml5y', 'cmtim3i00000h2m7dtebiy6zb', 'LOGIN', 'User', 'cmtim3i00000h2m7dtebiy6zb', NULL, '2026-09-01 11:58:25.242');
INSERT INTO public."AuditLog" VALUES ('cmtim5po00010gv7d58ioagf4', 'cmtim3i0e000n2m7ds08y9fyi', 'LOGIN', 'User', 'cmtim3i0e000n2m7ds08y9fyi', NULL, '2026-09-01 11:58:27.12');
INSERT INTO public."AuditLog" VALUES ('cmtim5r360011gv7d2cqirjb2', 'cmtim3i0i000p2m7d6sj9j0qz', 'LOGIN', 'User', 'cmtim3i0i000p2m7d6sj9j0qz', NULL, '2026-09-01 11:58:28.962');
INSERT INTO public."AuditLog" VALUES ('cmtim5sdd0012gv7dvzq5yezs', 'cmtim3i0q000r2m7dzd23f518', 'LOGIN', 'User', 'cmtim3i0q000r2m7dzd23f518', NULL, '2026-09-01 11:58:30.625');
INSERT INTO public."AuditLog" VALUES ('cmtim5tcr0013gv7doksco4qw', 'cmtim3i0m000q2m7d9hs7ruus', 'LOGIN', 'User', 'cmtim3i0m000q2m7d9hs7ruus', NULL, '2026-09-01 11:58:31.9');
INSERT INTO public."AuditLog" VALUES ('cmtim7jhj0014gv7deg5nn6fo', 'cmtim3i0e000n2m7ds08y9fyi', 'LOGIN', 'User', 'cmtim3i0e000n2m7ds08y9fyi', NULL, '2026-09-01 11:59:52.423');
INSERT INTO public."AuditLog" VALUES ('cmtim7m3x0015gv7dl6kkhu7h', 'cmtim3i00000h2m7dtebiy6zb', 'LOGIN', 'User', 'cmtim3i00000h2m7dtebiy6zb', NULL, '2026-09-01 11:59:55.821');

--
-- Data for Name: Certification; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Certification" VALUES ('cmtim3i47002n2m7dbd2tcmmy', 'cmtim3hzm000b2m7dv9tjsm82', NULL, NULL, 'cmtim3i1p00142m7dz2maaw9l', 'Svenska Brukshundklubben', 'NHPR-1335', '2026-05-01 11:56:43.531', '2027-05-01 11:56:43.531', NULL, '2026-09-01 11:56:44.023');
INSERT INTO public."Certification" VALUES ('cmtim3i4a002o2m7du91mz123', 'cmtim3hzo000c2m7dje5s4p5v', NULL, NULL, 'cmtim3i1p00142m7dz2maaw9l', 'Avarn Security', 'EKIPAGE-5622', '2026-01-01 11:56:43.531', '2028-01-01 11:56:43.531', NULL, '2026-09-01 11:56:44.026');
INSERT INTO public."Certification" VALUES ('cmtim3i4f002p2m7ddcmd5vlg', 'cmtim3hzq000d2m7d0nizcuw3', 'cmtim3i1j000y2m7diingtr9w', NULL, NULL, 'Avarn Security', 'NARK_CERT-6720', '2025-10-01 11:56:43.531', '2026-10-01 11:56:43.531', NULL, '2026-09-01 11:56:44.031');
INSERT INTO public."Certification" VALUES ('cmtim3i4h002q2m7dsx6e74tw', 'cmtim3hzm000b2m7dv9tjsm82', NULL, NULL, 'cmtim3i2100192m7dp5czanwe', 'Svenska Brukshundklubben', 'NHPR-1469', '2025-11-01 11:56:43.531', '2026-11-01 11:56:43.531', NULL, '2026-09-01 11:56:44.033');
INSERT INTO public."Certification" VALUES ('cmtim3i4j002r2m7dxai1bl0u', 'cmtim3hzo000c2m7dje5s4p5v', NULL, NULL, 'cmtim3i2100192m7dp5czanwe', 'Avarn Security', 'EKIPAGE-5735', '2026-03-01 11:56:43.531', '2028-03-01 11:56:43.531', NULL, '2026-09-01 11:56:44.035');
INSERT INTO public."Certification" VALUES ('cmtim3i4n002s2m7dgnuuadpy', 'cmtim3hzo000c2m7dje5s4p5v', NULL, NULL, 'cmtim3i2d001f2m7dn0fx2j6m', 'Avarn Security', 'EKIPAGE-4161', '2024-09-01 11:56:43.531', '2026-09-03 12:00:00', NULL, '2026-09-01 11:56:44.039');
INSERT INTO public."Certification" VALUES ('cmtim3i4p002t2m7ddbhzfdhj', 'cmtim3hzm000b2m7dv9tjsm82', NULL, NULL, 'cmtim3i2d001f2m7dn0fx2j6m', 'Avarn Security', 'NHPR-6957', '2026-06-01 11:56:43.531', '2027-06-01 11:56:43.531', NULL, '2026-09-01 11:56:44.041');
INSERT INTO public."Certification" VALUES ('cmtim3i4s002u2m7d5ft0wvv5', 'cmtim3hzm000b2m7dv9tjsm82', NULL, NULL, 'cmtim3i2j001k2m7dmijd4zah', 'Avarn Security', 'NHPR-5434', '2026-07-01 11:56:43.531', '2027-07-01 11:56:43.531', NULL, '2026-09-01 11:56:44.044');
INSERT INTO public."Certification" VALUES ('cmtim3i4t002v2m7dgwdjvq0t', 'cmtim3hzo000c2m7dje5s4p5v', NULL, NULL, 'cmtim3i2j001k2m7dmijd4zah', 'Avarn Security', 'EKIPAGE-2337', '2025-09-01 11:56:43.531', '2027-09-01 11:56:43.531', NULL, '2026-09-01 11:56:44.045');
INSERT INTO public."Certification" VALUES ('cmtim3i4v002w2m7dtd48wyyk', 'cmtim3hzs000e2m7dh9s3htat', 'cmtim3i2l001l2m7du6ingg8i', NULL, NULL, 'Avarn Security', 'SPRANG_CERT-3549', '2025-12-01 11:56:43.531', '2026-12-01 11:56:43.531', NULL, '2026-09-01 11:56:44.047');
INSERT INTO public."Certification" VALUES ('cmtim3i4x002x2m7d2byl86jb', 'cmtim3hzo000c2m7dje5s4p5v', NULL, NULL, 'cmtim3i2p001q2m7dwvnpdm30', 'Avarn Security', 'EKIPAGE-4821', '2026-04-01 11:56:43.531', '2028-04-01 11:56:43.531', NULL, '2026-09-01 11:56:44.049');
INSERT INTO public."Certification" VALUES ('cmtim3i4z002y2m7dmk34o5kd', 'cmtim3hzm000b2m7dv9tjsm82', NULL, NULL, 'cmtim3i2v001v2m7ddejxrabe', 'Avarn Security', 'NHPR-3423', '2026-08-01 11:56:43.531', '2027-08-01 11:56:43.531', NULL, '2026-09-01 11:56:44.051');
INSERT INTO public."Certification" VALUES ('cmtim3i50002z2m7dvh06l1j4', 'cmtim3hzo000c2m7dje5s4p5v', NULL, NULL, 'cmtim3i3200202m7dfpiop4kp', 'Avarn Security', 'EKIPAGE-4066', '2024-10-01 11:56:43.531', '2026-10-01 11:56:43.531', NULL, '2026-09-01 11:56:44.052');
INSERT INTO public."Certification" VALUES ('cmtim3i5200302m7dan6w7f1m', 'cmtim3hzq000d2m7d0nizcuw3', 'cmtim3i2z001w2m7dicy4j9bo', NULL, NULL, 'Avarn Security', 'NARK_CERT-5439', '2025-08-01 11:56:43.531', '2026-08-01 11:56:43.531', NULL, '2026-09-01 11:56:44.054');
INSERT INTO public."Certification" VALUES ('cmtim3i5400312m7dp28h8epz', 'cmtim3hzm000b2m7dv9tjsm82', NULL, NULL, 'cmtim3i3800252m7djl5rcpfg', 'Avarn Security', 'NHPR-9177', '2026-02-01 11:56:43.531', '2027-02-01 11:56:43.531', NULL, '2026-09-01 11:56:44.056');
INSERT INTO public."Certification" VALUES ('cmtim3i5700322m7dpt8fnv6p', 'cmtim3hzt000f2m7dac6qn0d0', NULL, 'cmtim3i00000h2m7dtebiy6zb', NULL, 'Avarn Security', 'SKYDDSVAKT-3195', '2025-01-01 11:56:43.531', '2028-01-01 11:56:43.531', NULL, '2026-09-01 11:56:44.059');
INSERT INTO public."Certification" VALUES ('cmtim3i5800332m7dbo3eldea', 'cmtim3hzv000g2m7d2u8hvvya', NULL, 'cmtim3i00000h2m7dtebiy6zb', NULL, 'Avarn Security', 'HLR-1105', '2024-11-01 11:56:43.531', '2026-11-01 11:56:43.531', NULL, '2026-09-01 11:56:44.06');
INSERT INTO public."Certification" VALUES ('cmtim3i5a00342m7d5dz5bm4q', 'cmtim3hzt000f2m7dac6qn0d0', NULL, 'cmtim3i04000i2m7d6zz9qkt7', NULL, 'Avarn Security', 'SKYDDSVAKT-5411', '2024-03-01 11:56:43.531', '2027-03-01 11:56:43.531', NULL, '2026-09-01 11:56:44.063');
INSERT INTO public."Certification" VALUES ('cmtim3i5c00352m7d5gv85h6d', 'cmtim3hzv000g2m7d2u8hvvya', NULL, 'cmtim3i06000j2m7dimg2alyk', NULL, 'Avarn Security', 'HLR-8015', '2024-10-01 11:56:43.531', '2026-10-01 11:56:43.531', NULL, '2026-09-01 11:56:44.064');
INSERT INTO public."Certification" VALUES ('cmtim3i5e00362m7d7g4svmol', 'cmtim3hzt000f2m7dac6qn0d0', NULL, 'cmtim3i08000k2m7dpmyknu78', NULL, 'Avarn Security', 'SKYDDSVAKT-1666', '2025-09-01 11:56:43.531', '2028-09-01 11:56:43.531', NULL, '2026-09-01 11:56:44.066');

--
-- Data for Name: CertificationType; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."CertificationType" VALUES ('cmtim3hzm000b2m7dv9tjsm82', 'NHPR', 'NHPR Godkänd', 12, 'TEAM', 'Nationellt hundprov för räddning och sök.');
INSERT INTO public."CertificationType" VALUES ('cmtim3hzo000c2m7dje5s4p5v', 'EKIPAGE', 'Auktoriserat ekipage', 24, 'TEAM', 'Behörighet att arbeta operativt som ekipage.');
INSERT INTO public."CertificationType" VALUES ('cmtim3hzq000d2m7d0nizcuw3', 'NARK_CERT', 'Certifikat narkotikasök', 12, 'DOG', NULL);
INSERT INTO public."CertificationType" VALUES ('cmtim3hzs000e2m7dh9s3htat', 'SPRANG_CERT', 'Certifikat sprängämnessök', 12, 'DOG', NULL);
INSERT INTO public."CertificationType" VALUES ('cmtim3hzt000f2m7dac6qn0d0', 'SKYDDSVAKT', 'Skyddsvaktsförordnande', 36, 'HANDLER', NULL);
INSERT INTO public."CertificationType" VALUES ('cmtim3hzv000g2m7d2u8hvvya', 'HLR', 'HLR och första hjälpen', 24, 'HANDLER', NULL);

--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Comment" VALUES ('cmtim3ico00732m7d1oow1jvi', 'cmtim3i0e000n2m7ds08y9fyi', 'Bra jobbat! Fortsätt nöta på uthålligheten.', '2026-08-24 09:15:00', 'cmtim3i60003e2m7d438h0kvz', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmtim3icq00742m7dozca0wri', 'cmtim3i0e000n2m7ds08y9fyi', 'Lägg in fler höga gömmor kommande veckor, gärna 180–220 cm.', '2026-08-10 14:00:00', 'cmtim3i6h003r2m7dipxy7gx9', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmtim3ics00752m7d1ig89aih', 'cmtim3i0g000o2m7dhlh9w1ar', 'Helt rätt tänkt att korta passen. Bygg på fem minuter i taget.', '2026-08-25 11:30:00', 'cmtim3i7l004o2m7dc7tzza91', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmtim3iel007u2m7dcq24z6w1', 'cmtim3i0i000p2m7d6sj9j0qz', 'Tydlig rapport. Bra att kvittonummer finns med.', '2026-08-23 09:35:00', NULL, 'cmtim3ie5007o2m7dqdamlvrp', NULL);

--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Customer" VALUES ('cmtim3icv00762m7dzb1lxasg', 'Swedavia AB', '556797-0818', 'Lars Holmberg', '010-109 00 00', 'sakerhet@swedavia.se', NULL);
INSERT INTO public."Customer" VALUES ('cmtim3icw00772m7dus4aajh6', 'Friends Arena', '556768-2942', 'Nina Ek', '08-500 300 00', 'drift@friendsarena.se', NULL);
INSERT INTO public."Customer" VALUES ('cmtim3icy00782m7d3z42e290', 'Jordbro Logistik AB', '556123-4567', 'Tomas Ek', '08-555 12 00', 'lager@jordbrologistik.se', NULL);
INSERT INTO public."Customer" VALUES ('cmtim3id100792m7dgc79qm2c', 'Uppsalahem', '556137-3589', 'Petra Lund', '018-727 30 00', 'trygghet@uppsalahem.se', NULL);

--
-- Data for Name: Dog; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Dog" VALUES ('cmtim3i1j000y2m7diingtr9w', 'Nova', 'Belgisk vallhund (Malinois)', '2022-04-12 00:00:00', 'TIK', '752098100123456', NULL, 'ACTIVE', NULL, '2026-09-01 11:56:43.927');
INSERT INTO public."Dog" VALUES ('cmtim3i1x00152m7dod5fa9ox', 'Rex', 'Labrador Retriever', '2020-04-12 00:00:00', 'HANE', '752098100234567', NULL, 'ACTIVE', NULL, '2026-09-01 11:56:43.941');
INSERT INTO public."Dog" VALUES ('cmtim3i28001a2m7d5zhcc3q0', 'Balder', 'Schäfer', '2021-04-12 00:00:00', 'HANE', '752098100345678', NULL, 'ACTIVE', NULL, '2026-09-01 11:56:43.952');
INSERT INTO public."Dog" VALUES ('cmtim3i2f001g2m7dhzo5gqlf', 'Mira', 'Springer Spaniel', '2023-04-12 00:00:00', 'TIK', '752098100456789', NULL, 'ACTIVE', NULL, '2026-09-01 11:56:43.959');
INSERT INTO public."Dog" VALUES ('cmtim3i2l001l2m7du6ingg8i', 'Sigge', 'Labrador Retriever', '2019-04-12 00:00:00', 'HANE', '752098100567890', NULL, 'ACTIVE', NULL, '2026-09-01 11:56:43.965');
INSERT INTO public."Dog" VALUES ('cmtim3i2r001r2m7diyri6wnd', 'Iris', 'Belgisk vallhund (Malinois)', '2024-04-12 00:00:00', 'TIK', '752098100678901', NULL, 'ACTIVE', NULL, '2026-09-01 11:56:43.971');
INSERT INTO public."Dog" VALUES ('cmtim3i2z001w2m7dicy4j9bo', 'Zeb', 'Schäfer', '2018-04-12 00:00:00', 'HANE', '752098100789012', NULL, 'ACTIVE', NULL, '2026-09-01 11:56:43.979');
INSERT INTO public."Dog" VALUES ('cmtim3i3500212m7dc160uas9', 'Tira', 'Springer Spaniel', '2022-04-12 00:00:00', 'TIK', '752098100890123', NULL, 'ACTIVE', NULL, '2026-09-01 11:56:43.985');

--
-- Data for Name: DogDiscipline; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."DogDiscipline" VALUES ('cmtim3i1k000z2m7du1gufz93', 'cmtim3i1j000y2m7diingtr9w', 'cmtim3hze00082m7dtcl3bsag', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i1k00102m7d686b6jo9', 'cmtim3i1j000y2m7diingtr9w', 'cmtim3hzg00092m7ddmio5min', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i1k00112m7drdt752h9', 'cmtim3i1j000y2m7diingtr9w', 'cmtim3hzi000a2m7d8x4g2vr6', 'GRUND', '2025-09-26 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i1x00162m7df0e88b08', 'cmtim3i1x00152m7dod5fa9ox', 'cmtim3hze00082m7dtcl3bsag', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i1x00172m7dty4sbkrb', 'cmtim3i1x00152m7dod5fa9ox', 'cmtim3hzc00072m7da0ifizgx', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i29001b2m7dmrshgt9k', 'cmtim3i28001a2m7d5zhcc3q0', 'cmtim3hz800052m7dc4oq9xy6', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i29001c2m7d920rkin6', 'cmtim3i28001a2m7d5zhcc3q0', 'cmtim3hza00062m7d60a65ce8', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i2g001h2m7dfh6mijku', 'cmtim3i2f001g2m7dhzo5gqlf', 'cmtim3hze00082m7dtcl3bsag', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i2g001i2m7d5kmrea7f', 'cmtim3i2f001g2m7dhzo5gqlf', 'cmtim3hzc00072m7da0ifizgx', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i2l001m2m7dleuzlg8m', 'cmtim3i2l001l2m7du6ingg8i', 'cmtim3hzg00092m7ddmio5min', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i2l001n2m7d28yqy62b', 'cmtim3i2l001l2m7du6ingg8i', 'cmtim3hzc00072m7da0ifizgx', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i2s001s2m7d893ek7xp', 'cmtim3i2r001r2m7diyri6wnd', 'cmtim3hz800052m7dc4oq9xy6', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i2s001t2m7dkbnsd8g9', 'cmtim3i2r001r2m7diyri6wnd', 'cmtim3hza00062m7d60a65ce8', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i30001x2m7dfhwo0i5y', 'cmtim3i2z001w2m7dicy4j9bo', 'cmtim3hze00082m7dtcl3bsag', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i3500222m7dxx210l6t', 'cmtim3i3500212m7dc160uas9', 'cmtim3hze00082m7dtcl3bsag', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtim3i3500232m7dttanceuk', 'cmtim3i3500212m7dc160uas9', 'cmtim3hzi000a2m7d8x4g2vr6', 'GRUND', '2025-08-27 08:00:00');

--
-- Data for Name: DogEducation; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."DogEducation" VALUES ('cmtim3i1l00122m7dgo5sskle', 'cmtim3i1j000y2m7diingtr9w', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-09 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtim3i1l00132m7ddor92mjh', 'cmtim3i1j000y2m7diingtr9w', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-07-08 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtim3i1y00182m7dqim2oga4', 'cmtim3i1x00152m7dod5fa9ox', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-09 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtim3i2a001d2m7dser0fvol', 'cmtim3i28001a2m7d5zhcc3q0', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-09 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtim3i2a001e2m7dd6tdw4tl', 'cmtim3i28001a2m7d5zhcc3q0', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-07-08 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtim3i2g001j2m7dv5n5v5zn', 'cmtim3i2f001g2m7dhzo5gqlf', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-09 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtim3i2m001o2m7dnhkno93t', 'cmtim3i2l001l2m7du6ingg8i', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-09 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtim3i2m001p2m7ddrahyoth', 'cmtim3i2l001l2m7du6ingg8i', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-07-08 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtim3i2t001u2m7djxh63pku', 'cmtim3i2r001r2m7diyri6wnd', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-09 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtim3i30001y2m7dik4aerwj', 'cmtim3i2z001w2m7dicy4j9bo', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-09 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtim3i30001z2m7doccynov6', 'cmtim3i2z001w2m7dicy4j9bo', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-07-08 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtim3i3600242m7d4efd0en5', 'cmtim3i3500212m7dc160uas9', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-09 08:00:00');

--
-- Data for Name: FollowUp; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."FollowUp" VALUES ('cmtim3ieo007v2m7dof723mkb', 'cmtim3i1p00142m7dz2maaw9l', 'cmtim3i0e000n2m7ds08y9fyi', 'Uppföljning höga gömmor', 'Vi tar ett gemensamt pass på höga gömmor innan certifieringen. Hör av dig med tid som passar.', '2026-09-10 08:00:00', 'OPEN', '2026-09-01 11:56:44.4');

--
-- Data for Name: HandlerProfile; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."HandlerProfile" VALUES ('cmtim3i0t000s2m7djbk2rg8h', 'cmtim3i00000h2m7dtebiy6zb', 'AV-1000', 'Stockholm', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtim3i0v000t2m7d1knc3knr', 'cmtim3i04000i2m7d6zz9qkt7', 'AV-1001', 'Södertälje', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtim3i0w000u2m7d1dquyuhb', 'cmtim3i06000j2m7dimg2alyk', 'AV-1002', 'Göteborg', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtim3i0y000v2m7die2812jl', 'cmtim3i08000k2m7dpmyknu78', 'AV-1003', 'Malmö', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtim3i0z000w2m7dy4lvlok3', 'cmtim3i0a000l2m7dgpss565s', 'AV-1004', 'Umeå', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtim3i11000x2m7d1f5vi0a0', 'cmtim3i0c000m2m7di7i3fk3t', 'AV-1005', 'Örebro', 'Operativ hundförare inom Avarn Security.', NULL);

--
-- Data for Name: Hide; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Hide" VALUES ('cmtim3i62003f2m7dom8kpas3', 'cmtim3i60003e2m7d438h0kvz', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtim3i62003g2m7djmf7dk8g', 'cmtim3i60003e2m7d438h0kvz', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtim3i62003h2m7dh9eefwpx', 'cmtim3i60003e2m7d438h0kvz', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtim3i62003i2m7d4b0acgye', 'cmtim3i60003e2m7d438h0kvz', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtim3i62003j2m7dwvxruk24', 'cmtim3i60003e2m7d438h0kvz', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'MISSED', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtim3i6b003l2m7dpcp49z3l', 'cmtim3i6a003k2m7d6lwe9a5q', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtim3i6b003m2m7dq0ra0t96', 'cmtim3i6a003k2m7d6lwe9a5q', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtim3i6b003n2m7d27bluof8', 'cmtim3i6a003k2m7d6lwe9a5q', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtim3i6b003o2m7dfcu8ao69', 'cmtim3i6a003k2m7d6lwe9a5q', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtim3i6b003p2m7di91e71qv', 'cmtim3i6a003k2m7d6lwe9a5q', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtim3i6b003q2m7dztsrjdmb', 'cmtim3i6a003k2m7d6lwe9a5q', 'Gömma 6', 'Under pall', 15, 'SVAR', 'FOUND', 235, NULL, 6);
INSERT INTO public."Hide" VALUES ('cmtim3i6i003s2m7d2kywp4uc', 'cmtim3i6h003r2m7dipxy7gx9', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtim3i6i003t2m7d7d4f13xt', 'cmtim3i6h003r2m7dipxy7gx9', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtim3i6i003u2m7djf5jlxxe', 'cmtim3i6h003r2m7dipxy7gx9', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtim3i6i003v2m7dr04ryflm', 'cmtim3i6h003r2m7dipxy7gx9', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'MISSED', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtim3i6p003x2m7dvezs0s5q', 'cmtim3i6o003w2m7dws4i7dso', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtim3i6p003y2m7dxqan1yek', 'cmtim3i6o003w2m7dws4i7dso', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtim3i6p003z2m7dcfnuan6g', 'cmtim3i6o003w2m7dws4i7dso', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtim3i6p00402m7d440qqi4b', 'cmtim3i6o003w2m7dws4i7dso', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtim3i6p00412m7dvhn2x4ql', 'cmtim3i6o003w2m7dws4i7dso', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtim3i6w00432m7d11hwfo1n', 'cmtim3i6v00422m7dmlofnx62', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtim3i6w00442m7ddu6ijnib', 'cmtim3i6v00422m7dmlofnx62', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtim3i6w00452m7d8ehzab9z', 'cmtim3i6v00422m7dmlofnx62', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtim3i6w00462m7d3jev9xsm', 'cmtim3i6v00422m7dmlofnx62', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtim3i7300482m7d4gwmtzdu', 'cmtim3i7200472m7dpqlsyzyv', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtim3i7300492m7dkzkv2ev3', 'cmtim3i7200472m7dpqlsyzyv', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtim3i73004a2m7dt5v4hxo8', 'cmtim3i7200472m7dpqlsyzyv', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtim3i78004c2m7ddudgn7xl', 'cmtim3i77004b2m7doqfoamxh', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtim3i78004d2m7dzmyi7vrn', 'cmtim3i77004b2m7doqfoamxh', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtim3i78004e2m7db5bvlz2q', 'cmtim3i77004b2m7doqfoamxh', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtim3i78004f2m7dbiw9ckzm', 'cmtim3i77004b2m7doqfoamxh', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtim3i78004g2m7dnfrlmny2', 'cmtim3i77004b2m7doqfoamxh', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'MISSED', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtim3i7f004i2m7dh48d8hl4', 'cmtim3i7e004h2m7dbeig7178', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtim3i7f004j2m7dqsu9u499', 'cmtim3i7e004h2m7dbeig7178', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtim3i7f004k2m7dav2qdtmj', 'cmtim3i7e004h2m7dbeig7178', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtim3i7f004l2m7dvuiubalx', 'cmtim3i7e004h2m7dbeig7178', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtim3i7f004m2m7dzh9hvhin', 'cmtim3i7e004h2m7dbeig7178', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtim3i7f004n2m7dsryjf4cq', 'cmtim3i7e004h2m7dbeig7178', 'Gömma 6', 'Under pall', 15, 'SVAR', 'MISSED', 235, NULL, 6);
INSERT INTO public."Hide" VALUES ('cmtim3i7m004p2m7dwrgw4rkx', 'cmtim3i7l004o2m7dc7tzza91', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtim3i7m004q2m7djd30lxup', 'cmtim3i7l004o2m7dc7tzza91', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtim3i7m004r2m7dmvcsslgb', 'cmtim3i7l004o2m7dc7tzza91', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'MISSED', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtim3i7t004t2m7dnllq028o', 'cmtim3i7s004s2m7d0v0hf24z', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtim3i7t004u2m7d3xpxm0qu', 'cmtim3i7s004s2m7d0v0hf24z', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtim3i7t004v2m7ddp2r2doi', 'cmtim3i7s004s2m7d0v0hf24z', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtim3i7t004w2m7dufcxatkd', 'cmtim3i7s004s2m7d0v0hf24z', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtim3i7t004x2m7dr4xfsy0r', 'cmtim3i7s004s2m7d0v0hf24z', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtim3i7z004z2m7den4a3nuq', 'cmtim3i7y004y2m7dmn35h7at', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtim3i7z00502m7dp7lzt1um', 'cmtim3i7y004y2m7dmn35h7at', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtim3i7z00512m7d4moqmp6b', 'cmtim3i7y004y2m7dmn35h7at', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtim3i7z00522m7dv4n8tx7d', 'cmtim3i7y004y2m7dmn35h7at', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'MISSED', 165, NULL, 4);

--
-- Data for Name: Indication; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Indication" VALUES ('cmtim3ie6007p2m7d71gqcv24', 'cmtim3ie5007o2m7dqdamlvrp', 'Bagageband 3, kolli 18', 'Tydlig och kvarstående markering på resväska.', 'FIND', 'Polis, region Stockholm', 1);
INSERT INTO public."Indication" VALUES ('cmtim3ie6007q2m7di94rhhi3', 'cmtim3ie5007o2m7dqdamlvrp', 'Lastpall vid port 2', 'Markering utan fynd vid kontroll.', 'NO_FIND', NULL, 2);
INSERT INTO public."Indication" VALUES ('cmtim3ieg007t2m7dbdslkyxu', 'cmtim3ief007s2m7dj3oxde9n', 'Container 9, bakre vänstra hörnet', 'Markering på pallkrage.', 'FIND', 'Tullverket', 1);

--
-- Data for Name: InstructorAssignment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."InstructorAssignment" VALUES ('cmtim3i3a00262m7dkwbup4um', 'cmtim3i0e000n2m7ds08y9fyi', 'cmtim3i1p00142m7dz2maaw9l', '2026-09-01 11:56:43.99');
INSERT INTO public."InstructorAssignment" VALUES ('cmtim3i3c00272m7d8kpqgea8', 'cmtim3i0e000n2m7ds08y9fyi', 'cmtim3i2100192m7dp5czanwe', '2026-09-01 11:56:43.992');
INSERT INTO public."InstructorAssignment" VALUES ('cmtim3i3e00282m7dl5fs0ehc', 'cmtim3i0e000n2m7ds08y9fyi', 'cmtim3i2p001q2m7dwvnpdm30', '2026-09-01 11:56:43.994');
INSERT INTO public."InstructorAssignment" VALUES ('cmtim3i3g00292m7dvxi6r3pv', 'cmtim3i0e000n2m7ds08y9fyi', 'cmtim3i3800252m7djl5rcpfg', '2026-09-01 11:56:43.996');
INSERT INTO public."InstructorAssignment" VALUES ('cmtim3i3h002a2m7dt1s3yjrj', 'cmtim3i0e000n2m7ds08y9fyi', 'cmtim3i2j001k2m7dmijd4zah', '2026-09-01 11:56:43.997');
INSERT INTO public."InstructorAssignment" VALUES ('cmtim3i3k002b2m7dwzfi9rvn', 'cmtim3i0g000o2m7dhlh9w1ar', 'cmtim3i2d001f2m7dn0fx2j6m', '2026-09-01 11:56:44');
INSERT INTO public."InstructorAssignment" VALUES ('cmtim3i3l002c2m7duw6ifsmk', 'cmtim3i0g000o2m7dhlh9w1ar', 'cmtim3i2v001v2m7ddejxrabe', '2026-09-01 11:56:44.001');
INSERT INTO public."InstructorAssignment" VALUES ('cmtim3i3n002d2m7ds3c01tc1', 'cmtim3i0g000o2m7dhlh9w1ar', 'cmtim3i3200202m7dfpiop4kp', '2026-09-01 11:56:44.003');

--
-- Data for Name: MediaAsset; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MediaAsset" VALUES ('cmtim5k4z000tgv7dr3x8k5q6', 'IMAGE', 'testbild.png', 'f39542ec-baa8-433c-a476-55956378bb76.png', 'image/png', 88, 'cmtim3i00000h2m7dtebiy6zb', '2026-09-01 11:58:19.955', 'cmtim3i6o003w2m7dws4i7dso', NULL, NULL, NULL, NULL);

--
-- Data for Name: Mission; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Mission" VALUES ('cmtim3id3007a2m7dxycub4vg', 'UPP-2451', 'Flygplatskontroll', 'Flygplatskontroll', 'cmtim3icv00762m7dzb1lxasg', 'Lars Holmberg', '010-109 00 00', '2026-09-04 08:00:00', '2026-09-04 10:00:00', 'Terminal 5, bagagehall', 'Arlanda, Stockholm', 'cmtim3hyv00022m7dicbkhjtu', 'cmtim3hz800052m7dc4oq9xy6', 'Anmälan i säkerhetskontrollen senast 07:45. ID-handling och förordnande ska medföras. Sök sker i bagagehall och angränsande lastutrymme.', 'ASSIGNED', 'cmtim3i0i000p2m7d6sj9j0qz', '2026-09-01 11:56:44.344');
INSERT INTO public."Mission" VALUES ('cmtim3ida007c2m7drvm5ueyl', 'UPP-2452', 'Evenemangssök', 'Evenemangssök', 'cmtim3icw00772m7dus4aajh6', 'Nina Ek', '08-500 300 00', '2026-09-05 14:30:00', '2026-09-05 17:30:00', 'Friends Arena, entré C', 'Solna', 'cmtim3hyv00022m7dicbkhjtu', 'cmtim3hza00062m7d60a65ce8', 'Genomsökning av läktarsektion A–D före publikinsläpp. Klart senast 17:30.', 'ASSIGNED', 'cmtim3i0i000p2m7d6sj9j0qz', '2026-09-01 11:56:44.35');
INSERT INTO public."Mission" VALUES ('cmtim3idf007e2m7d3ex6nx94', 'UPP-2453', 'Lagerkontroll', 'Lagerkontroll', 'cmtim3icy00782m7d3z42e290', 'Tomas Ek', '08-555 12 00', '2026-09-06 10:00:00', '2026-09-06 14:00:00', 'Lagerväg 12', 'Jordbro, Haninge', 'cmtim3hyv00022m7dicbkhjtu', 'cmtim3hzc00072m7da0ifizgx', 'Samordnas med lagerchef på plats. Truckar stoppas under sök.', 'PLANNED', 'cmtim3i0i000p2m7d6sj9j0qz', '2026-09-01 11:56:44.355');
INSERT INTO public."Mission" VALUES ('cmtim3idi007f2m7d9pnl1hli', 'UPP-2454', 'Bostadssök', 'Bostadssök', 'cmtim3id100792m7dgc79qm2c', 'Petra Lund', '018-727 30 00', '2026-09-08 09:30:00', '2026-09-08 12:30:00', 'Gränbyvägen 8', 'Uppsala', 'cmtim3hyv00022m7dicbkhjtu', 'cmtim3hz800052m7dc4oq9xy6', 'Polis närvarar. Invänta klartecken innan sök påbörjas.', 'PLANNED', 'cmtim3i0i000p2m7d6sj9j0qz', '2026-09-01 11:56:44.358');
INSERT INTO public."Mission" VALUES ('cmtim3idm007g2m7dwr24mdag', 'UPP-2448', 'Objektsbevakning hamnen', 'Objektsbevakning', 'cmtim3icy00782m7d3z42e290', 'Tomas Ek', '031-555 00 12', '2026-09-07 20:00:00', '2026-09-08 02:00:00', 'Skandiahamnen, port 4', 'Göteborg', 'cmtim3hyy00032m7dgu1ctwz4', 'cmtim3hza00062m7d60a65ce8', 'Nattpass. Rapportering till larmcentral varannan timme.', 'ASSIGNED', 'cmtim3i0i000p2m7d6sj9j0qz', '2026-09-01 11:56:44.362');
INSERT INTO public."Mission" VALUES ('cmtim3idq007i2m7d8v2h0hak', 'UPP-2431', 'Flygplatskontroll', 'Flygplatskontroll', 'cmtim3icv00762m7dzb1lxasg', 'Lars Holmberg', '010-109 00 00', '2026-08-22 08:00:00', '2026-08-22 10:00:00', 'Terminal 5, bagagehall', 'Arlanda, Stockholm', 'cmtim3hyv00022m7dicbkhjtu', 'cmtim3hz800052m7dc4oq9xy6', 'Rutinkontroll enligt avtal.', 'COMPLETED', 'cmtim3i0i000p2m7d6sj9j0qz', '2026-09-01 11:56:44.366');
INSERT INTO public."Mission" VALUES ('cmtim3idu007k2m7dsaf3tcu2', 'UPP-2427', 'Lagerkontroll', 'Lagerkontroll', 'cmtim3icy00782m7d3z42e290', 'Tomas Ek', '08-555 12 00', '2026-08-15 13:00:00', '2026-08-15 16:00:00', 'Lagerväg 12', 'Jordbro, Haninge', 'cmtim3hyv00022m7dicbkhjtu', 'cmtim3hzc00072m7da0ifizgx', 'Kvartalskontroll.', 'COMPLETED', 'cmtim3i0i000p2m7d6sj9j0qz', '2026-09-01 11:56:44.37');
INSERT INTO public."Mission" VALUES ('cmtim3idy007m2m7ddkbzp40r', 'UPP-2422', 'Godskontroll', 'Lagerkontroll', 'cmtim3icy00782m7d3z42e290', 'Tomas Ek', '040-555 00 20', '2026-08-11 09:00:00', '2026-08-11 13:00:00', 'Terminalgatan 3', 'Malmö', 'cmtim3hyz00042m7dqcgwkrvy', 'cmtim3hzc00072m7da0ifizgx', 'Sök av inkommande gods från hamnen.', 'COMPLETED', 'cmtim3i0i000p2m7d6sj9j0qz', '2026-09-01 11:56:44.374');

--
-- Data for Name: MissionAssignment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MissionAssignment" VALUES ('cmtim3id7007b2m7dmzzcugk4', 'cmtim3id3007a2m7dxycub4vg', 'cmtim3i1p00142m7dz2maaw9l', 'cmtim3i0i000p2m7d6sj9j0qz', 'ACCEPTED', NULL, '2026-09-03 16:00:00', '2026-09-01 11:56:44.347');
INSERT INTO public."MissionAssignment" VALUES ('cmtim3idd007d2m7d5ummnfw2', 'cmtim3ida007c2m7drvm5ueyl', 'cmtim3i1p00142m7dz2maaw9l', 'cmtim3i0i000p2m7d6sj9j0qz', 'OFFERED', NULL, NULL, '2026-09-01 11:56:44.353');
INSERT INTO public."MissionAssignment" VALUES ('cmtim3ido007h2m7dsbbof0y1', 'cmtim3idm007g2m7dwr24mdag', 'cmtim3i2d001f2m7dn0fx2j6m', 'cmtim3i0i000p2m7d6sj9j0qz', 'ACCEPTED', NULL, '2026-09-06 16:00:00', '2026-09-01 11:56:44.364');
INSERT INTO public."MissionAssignment" VALUES ('cmtim3ids007j2m7dix6v2fpc', 'cmtim3idq007i2m7d8v2h0hak', 'cmtim3i1p00142m7dz2maaw9l', 'cmtim3i0i000p2m7d6sj9j0qz', 'COMPLETED', NULL, '2026-08-21 16:00:00', '2026-09-01 11:56:44.368');
INSERT INTO public."MissionAssignment" VALUES ('cmtim3idw007l2m7d6v72vi1j', 'cmtim3idu007k2m7dsaf3tcu2', 'cmtim3i2100192m7dp5czanwe', 'cmtim3i0i000p2m7d6sj9j0qz', 'COMPLETED', NULL, '2026-08-14 16:00:00', '2026-09-01 11:56:44.372');
INSERT INTO public."MissionAssignment" VALUES ('cmtim3ie0007n2m7di5icrz8r', 'cmtim3idy007m2m7ddkbzp40r', 'cmtim3i2j001k2m7dmijd4zah', 'cmtim3i0i000p2m7d6sj9j0qz', 'COMPLETED', NULL, '2026-08-10 16:00:00', '2026-09-01 11:56:44.376');

--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Notification" VALUES ('cmtim3ier007w2m7d85gbinek', 'cmtim3i00000h2m7dtebiy6zb', 'MISSION_ASSIGNED', 'Nytt uppdrag: Evenemangssök', 'Friends Arena, Solna – 14:30. Svara ja eller nej i uppdragsvyn.', '/uppdrag/cmtim3ida007c2m7drvm5ueyl', NULL, '2026-08-31 15:20:00');
INSERT INTO public."Notification" VALUES ('cmtim3iet007x2m7d2apr6bmj', 'cmtim3i00000h2m7dtebiy6zb', 'COMMENT', 'Anna Karlsson kommenterade din träning', 'Bra jobbat! Fortsätt nöta på uthålligheten.', '/traning/cmtim3i60003e2m7d438h0kvz', NULL, '2026-08-24 09:15:00');
INSERT INTO public."Notification" VALUES ('cmtim3iev007y2m7d8wrglhvf', 'cmtim3i00000h2m7dtebiy6zb', 'FOLLOW_UP', 'Kallelse till uppföljning', 'Anna Karlsson vill följa upp höga gömmor.', '/traning', NULL, '2026-08-30 10:00:00');
INSERT INTO public."Notification" VALUES ('cmtim3iex007z2m7dzi017wnc', 'cmtim3i00000h2m7dtebiy6zb', 'SESSION_APPROVED', 'Träning godkänd', 'Områdessök – Skog, Tyresta är godkänt.', '/traning/cmtim3i60003e2m7d438h0kvz', '2026-08-25 08:00:00', '2026-08-24 12:00:00');
INSERT INTO public."Notification" VALUES ('cmtim3iez00802m7dj2864qne', 'cmtim3i06000j2m7dimg2alyk', 'CERT_EXPIRING', 'Behörighet löper ut', 'Auktoriserat ekipage för Balder går ut om 2 dagar.', '/certifikat', NULL, '2026-08-31 07:00:00');
INSERT INTO public."Notification" VALUES ('cmtim3if100812m7dowllz6ea', 'cmtim3i0e000n2m7ds08y9fyi', 'COMMENT', 'Nytt träningspass att granska', 'Erik Andersson har skickat in Fordonssök – Fordon.', '/instruktor', NULL, '2026-08-29 18:40:00');
INSERT INTO public."Notification" VALUES ('cmtim3if200822m7db038trzg', 'cmtim3i0i000p2m7d6sj9j0qz', 'COMMENT', 'Ny rapport inskickad', 'Sofie Holm har skickat in rapport för UPP-2422.', '/rapporter', NULL, '2026-08-11 13:15:00');

--
-- Data for Name: OperationalReport; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."OperationalReport" VALUES ('cmtim3ie5007o2m7dqdamlvrp', 'cmtim3idq007i2m7d8v2h0hak', 'cmtim3i1p00142m7dz2maaw9l', 'cmtim3i00000h2m7dtebiy6zb', 'Terminal 5, bagagehall samt angränsande lastutrymme.', '1 paket – Narkotika (Cannabis), cirka 400 gram.', 'Inga', 'Överlämnat till polis på plats. Kvitto nummer 41221 erhållet.', '2026-08-22 08:00:00', '2026-08-22 10:20:00', 'APPROVED', '2026-08-22 11:00:00', 'cmtim3i0i000p2m7d6sj9j0qz', '2026-08-23 09:30:00', '2026-08-22 10:45:00', '2026-09-01 11:56:44.381');
INSERT INTO public."OperationalReport" VALUES ('cmtim3iea007r2m7djgzoj6aa', 'cmtim3idu007k2m7dsaf3tcu2', 'cmtim3i2100192m7dp5czanwe', 'cmtim3i00000h2m7dtebiy6zb', 'Lagerhall A och B, samtliga ställage samt lastkaj.', 'Inga fynd.', 'Port 4 gick inte att öppna, avsnittet kunde inte genomsökas.', 'Avvikelsen rapporterad till lagerchef Tomas Ek.', '2026-08-15 13:00:00', '2026-08-15 15:45:00', 'APPROVED', '2026-08-15 16:30:00', 'cmtim3i0i000p2m7d6sj9j0qz', '2026-08-16 08:15:00', '2026-08-15 16:20:00', '2026-09-01 11:56:44.386');
INSERT INTO public."OperationalReport" VALUES ('cmtim3ief007s2m7dj3oxde9n', 'cmtim3idy007m2m7ddkbzp40r', 'cmtim3i2j001k2m7dmijd4zah', 'cmtim3i08000k2m7dpmyknu78', 'Inkommande gods, container 1–14.', '1 fynd – misstänkt narkotika i container 9.', 'Inga', 'Godset avskilt och överlämnat till Tullverket.', '2026-08-11 09:00:00', '2026-08-11 12:30:00', 'SUBMITTED', '2026-08-11 13:10:00', NULL, NULL, '2026-08-11 12:55:00', '2026-09-01 11:56:44.391');

--
-- Data for Name: PlannedExercise; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."PlannedExercise" VALUES ('cmtim3i5n00392m7dmqqo7ojz', 'cmtim3i5l00372m7dbbufuaka', 'Höga gömmor i lagermiljö', 'Placera gömmor på 150–220 cm. Belöna först vid tydlig och kvarstående markering.', 'cmtim3hze00082m7dtcl3bsag', 'Narkotika', 'Lagerlokal', '2026-09-14 08:00:00', 2, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtim3i5n003a2m7d4yjsy4na', 'cmtim3i5l00372m7dbbufuaka', 'Fordonssök under tidspress', 'Sex fordon, max 12 minuter totalt. Syftet är att hålla noggrannheten uppe när tempot ökar.', 'cmtim3hzc00072m7da0ifizgx', 'Narkotika', 'Fordon', '2026-09-21 08:00:00', 3, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtim3i5u003c2m7d14bbqb82', 'cmtim3i5t003b2m7dw9u8zy0p', 'Vinkelspår 600 meter', 'Tre räta vinklar, 45 minuter gammalt spår.', 'cmtim3hz800052m7dc4oq9xy6', 'Människa', 'Stadsmiljö', '2026-09-05 08:00:00', 1, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtim3i5u003d2m7dfrgjw6ro', 'cmtim3i5t003b2m7dw9u8zy0p', 'Ytsök öppen mark 30 minuter', 'Två figuranter, växlande vindriktning.', 'cmtim3hza00062m7d60a65ce8', 'Människa', 'Öppen mark', '2026-09-12 08:00:00', 2, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtim3i5n00382m7dzad1ur7j', 'cmtim3i5l00372m7dbbufuaka', 'Områdessök 45 minuter i kuperad skog', 'Två pass om 45 minuter med minst fem gömmor. Fokus på systematiskt sökmönster och att hunden håller tempot hela passet.', 'cmtim3hze00082m7dtcl3bsag', 'Narkotika', 'Skog', '2026-09-07 08:00:00', 1, 'COMPLETED');

--
-- Data for Name: Region; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Region" VALUES ('cmtim3hyn00002m7dbp3pxgbd', 'NORD', 'Region Nord', 1);
INSERT INTO public."Region" VALUES ('cmtim3hyt00012m7d31rwdmgk', 'MITT', 'Region Mitt', 2);
INSERT INTO public."Region" VALUES ('cmtim3hyv00022m7dicbkhjtu', 'OST', 'Region Öst', 3);
INSERT INTO public."Region" VALUES ('cmtim3hyy00032m7dgu1ctwz4', 'VAST', 'Region Väst', 4);
INSERT INTO public."Region" VALUES ('cmtim3hyz00042m7dqcgwkrvy', 'SYD', 'Region Syd', 5);

--
-- Data for Name: SearchDiscipline; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."SearchDiscipline" VALUES ('cmtim3hz800052m7dc4oq9xy6', 'SPAR', 'Spårsök', 'SÖK – SPÅR', 'Spårsök efter person eller föremål.', 1);
INSERT INTO public."SearchDiscipline" VALUES ('cmtim3hza00062m7d60a65ce8', 'YTA', 'Ytsök', 'SÖK – YTA', 'Ytsök över öppna och bebyggda områden.', 2);
INSERT INTO public."SearchDiscipline" VALUES ('cmtim3hzc00072m7da0ifizgx', 'GODS', 'Godssök', 'SÖK – GODS', 'Sök i gods, bagage och fordon.', 3);
INSERT INTO public."SearchDiscipline" VALUES ('cmtim3hze00082m7dtcl3bsag', 'NARKOTIKA', 'Narkotika', 'NARKOTIKA', 'Sök efter narkotiska preparat.', 4);
INSERT INTO public."SearchDiscipline" VALUES ('cmtim3hzg00092m7ddmio5min', 'SPRANG', 'Sprängämnen', 'SPRÄNGÄMNEN', 'Sök efter explosiva ämnen.', 5);
INSERT INTO public."SearchDiscipline" VALUES ('cmtim3hzi000a2m7d8x4g2vr6', 'VAPEN', 'Vapen', 'VAPEN', 'Sök efter vapen och ammunition.', 6);

--
-- Data for Name: Team; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Team" VALUES ('cmtim3i1p00142m7dz2maaw9l', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i1j000y2m7diingtr9w', 'cmtim3hyv00022m7dicbkhjtu', '2024-06-23 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtim3i2100192m7dp5czanwe', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i1x00152m7dod5fa9ox', 'cmtim3hyv00022m7dicbkhjtu', '2023-05-20 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtim3i2d001f2m7dn0fx2j6m', 'cmtim3i06000j2m7dimg2alyk', 'cmtim3i28001a2m7d5zhcc3q0', 'cmtim3hyy00032m7dgu1ctwz4', '2023-12-06 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtim3i2j001k2m7dmijd4zah', 'cmtim3i08000k2m7dpmyknu78', 'cmtim3i2f001g2m7dhzo5gqlf', 'cmtim3hyz00042m7dqcgwkrvy', '2025-01-09 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtim3i2p001q2m7dwvnpdm30', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i2l001l2m7du6ingg8i', 'cmtim3hyv00022m7dicbkhjtu', '2022-11-01 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtim3i2v001v2m7ddejxrabe', 'cmtim3i0a000l2m7dgpss565s', 'cmtim3i2r001r2m7diyri6wnd', 'cmtim3hyn00002m7dbp3pxgbd', '2025-07-28 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtim3i3200202m7dfpiop4kp', 'cmtim3i0c000m2m7di7i3fk3t', 'cmtim3i2z001w2m7dicy4j9bo', 'cmtim3hyt00012m7d31rwdmgk', '2022-04-15 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtim3i3800252m7djl5rcpfg', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i3500212m7dc160uas9', 'cmtim3hyv00022m7dicbkhjtu', '2024-06-23 08:00:00', NULL, 'ACTIVE');

--
-- Data for Name: TeamAvailability; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TeamAvailability" VALUES ('cmtim3i3p002e2m7dqyozlyqg', 'cmtim3i1p00142m7dz2maaw9l', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtim3i3s002f2m7dpwd4ptun', 'cmtim3i2100192m7dp5czanwe', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtim3i3t002g2m7das0e09rq', 'cmtim3i2d001f2m7dn0fx2j6m', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtim3i3v002h2m7dgracjl08', 'cmtim3i2j001k2m7dmijd4zah', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtim3i3x002i2m7dhirfcy78', 'cmtim3i2p001q2m7dwvnpdm30', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtim3i3y002j2m7dp39jvujz', 'cmtim3i2v001v2m7ddejxrabe', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtim3i40002k2m7d482j40zr', 'cmtim3i3200202m7dfpiop4kp', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtim3i42002l2m7drtfwxybu', 'cmtim3i3800252m7djl5rcpfg', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtim3i44002m2m7dp5qh0pb9', 'cmtim3i3200202m7dfpiop4kp', '2026-09-03 00:00:00', '2026-09-10 23:00:00', 'UNAVAILABLE', 'Semester');

--
-- Data for Name: TrainingPlan; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TrainingPlan" VALUES ('cmtim3i5l00372m7dbbufuaka', 'cmtim3i1p00142m7dz2maaw9l', 'cmtim3i0e000n2m7ds08y9fyi', 'Uthållighet i svår terräng', 'Bygga uthållighet över längre sök och stabilisera markering vid stenrösen och rotvältor.', '2026-08-11 08:00:00', '2026-10-06 08:00:00', 'ACTIVE', '2026-09-01 11:56:44.073');
INSERT INTO public."TrainingPlan" VALUES ('cmtim3i5t003b2m7dw9u8zy0p', 'cmtim3i2d001f2m7dn0fx2j6m', 'cmtim3i0g000o2m7dhlh9w1ar', 'Spårsäkerhet på hårt underlag', 'Öka spårsäkerheten på asfalt och grus samt vid vinkelspår.', '2026-08-18 08:00:00', '2026-10-13 08:00:00', 'ACTIVE', '2026-09-01 11:56:44.081');

--
-- Data for Name: TrainingSession; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TrainingSession" VALUES ('cmtim3i6a003k2m7d6lwe9a5q', 'cmtim3i1p00142m7dz2maaw9l', NULL, '2026-08-16 13:30:00', '2026-08-16 15:00:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 6, 6, 'Felfritt pass. Hög arbetsglädje genom hela söket.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-08-17 12:00:00', '2026-09-01 11:56:44.098', '2026-09-01 11:56:44.098');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i6h003r2m7dipxy7gx9', 'cmtim3i1p00142m7dz2maaw9l', NULL, '2026-08-09 08:00:00', '2026-08-09 09:45:00', 'Arlanda, hangar 4', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtim3hzg00092m7ddmio5min', 4, 3, 'Tveksam vid höga gömmor. Behöver mer träning över 180 cm.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-08-10 12:00:00', '2026-09-01 11:56:44.105', '2026-09-01 11:56:44.105');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i6o003w2m7dws4i7dso', 'cmtim3i1p00142m7dz2maaw9l', NULL, '2026-08-29 17:00:00', '2026-08-29 18:30:00', 'Farsta industriområde', 'Fordonssök', 'Fordon', 'Narkotika', 'cmtim3hzc00072m7da0ifizgx', 5, 5, 'Snabbt och rent sök på sex fordon.', 'SUBMITTED', 'cmtim3i00000h2m7dtebiy6zb', NULL, NULL, '2026-09-01 11:56:44.112', '2026-09-01 11:56:44.112');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i6v00422m7dmlofnx62', 'cmtim3i2100192m7dp5czanwe', NULL, '2026-08-27 10:00:00', '2026-08-27 11:30:00', 'Södertälje hamn', 'Bagagesök', 'Lagerlokal', 'Narkotika', 'cmtim3hzc00072m7da0ifizgx', 4, 4, 'Stabilt. Rex arbetar lugnt och metodiskt.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-08-28 12:00:00', '2026-09-01 11:56:44.119', '2026-09-01 11:56:44.119');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i7200472m7dpqlsyzyv', 'cmtim3i2d001f2m7dn0fx2j6m', NULL, '2026-08-30 07:30:00', '2026-08-30 09:00:00', 'Slottsskogen, Göteborg', 'Spårarbete', 'Öppen mark', 'Människa', 'cmtim3hz800052m7dc4oq9xy6', 3, 3, 'Höll spåret genom samtliga vinklar.', 'SUBMITTED', 'cmtim3i06000j2m7dimg2alyk', NULL, NULL, '2026-09-01 11:56:44.126', '2026-09-01 11:56:44.126');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i77004b2m7doqfoamxh', 'cmtim3i2j001k2m7dmijd4zah', NULL, '2026-08-28 14:00:00', '2026-08-28 15:30:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 4, 'En falsk markering vid tomt kolli.', 'APPROVED', 'cmtim3i08000k2m7dpmyknu78', 'cmtim3i0e000n2m7ds08y9fyi', '2026-08-29 12:00:00', '2026-09-01 11:56:44.131', '2026-09-01 11:56:44.131');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i7e004h2m7dbeig7178', 'cmtim3i2p001q2m7dwvnpdm30', NULL, '2026-08-26 09:00:00', '2026-08-26 10:45:00', 'Arlanda terminal 5', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtim3hzg00092m7ddmio5min', 6, 5, 'Bra tempo, tappade fokus mot slutet av passet.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-08-27 12:00:00', '2026-09-01 11:56:44.138', '2026-09-01 11:56:44.138');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i7l004o2m7dc7tzza91', 'cmtim3i2v001v2m7ddejxrabe', NULL, '2026-08-24 11:00:00', '2026-08-24 12:15:00', 'Umeå, Nydalaområdet', 'Områdessök', 'Skog', 'Människa', 'cmtim3hza00062m7d60a65ce8', 3, 2, 'Ung hund, behöver kortare pass tills uthålligheten byggts upp.', 'APPROVED', 'cmtim3i0a000l2m7dgpss565s', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-08-25 12:00:00', '2026-09-01 11:56:44.145', '2026-09-01 11:56:44.145');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i7s004s2m7d0v0hf24z', 'cmtim3i3200202m7dfpiop4kp', NULL, '2026-08-20 08:30:00', '2026-08-20 10:00:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 5, 'Rutinerat och effektivt.', 'APPROVED', 'cmtim3i0c000m2m7di7i3fk3t', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-08-21 12:00:00', '2026-09-01 11:56:44.152', '2026-09-01 11:56:44.152');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i7y004y2m7dmn35h7at', 'cmtim3i3800252m7djl5rcpfg', NULL, '2026-08-25 15:00:00', '2026-08-25 16:20:00', 'Södertälje, Ronna', 'Personsök', 'Stadsmiljö', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 4, 3, 'Störningsträning i folkvimmel. God kontakt med föraren.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-08-26 12:00:00', '2026-09-01 11:56:44.158', '2026-09-01 11:56:44.158');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8300532m7dnrzzcpu3', 'cmtim3i1p00142m7dz2maaw9l', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-27 12:00:00', '2026-09-01 11:56:44.163', '2026-09-01 11:56:44.163');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8500542m7d6lg854bs', 'cmtim3i1p00142m7dz2maaw9l', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-14 12:00:00', '2026-09-01 11:56:44.165', '2026-09-01 11:56:44.165');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8800552m7dp9oz8i8r', 'cmtim3i1p00142m7dz2maaw9l', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-01 12:00:00', '2026-09-01 11:56:44.168', '2026-09-01 11:56:44.168');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8a00562m7dh43qr9gp', 'cmtim3i1p00142m7dz2maaw9l', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-06-15 12:00:00', '2026-09-01 11:56:44.17', '2026-09-01 11:56:44.17');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8e00572m7de2y4y9f8', 'cmtim3i1p00142m7dz2maaw9l', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-06-02 12:00:00', '2026-09-01 11:56:44.174', '2026-09-01 11:56:44.174');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i60003e2m7d438h0kvz', 'cmtim3i1p00142m7dz2maaw9l', 'cmtim3i5n00382m7dzad1ur7j', '2026-08-23 09:00:00', '2026-08-23 11:15:00', 'Tyresta, Stockholm', 'Områdessök', 'Skog', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 4, 'Bra genomförande. Stabilt sök i svår terräng. Missade en gömma vid stenröse.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-08-24 12:00:00', '2026-09-01 11:56:44.088', '2026-09-01 11:56:44.322');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8g00582m7dwt71p1n7', 'cmtim3i1p00142m7dz2maaw9l', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-05-20 12:00:00', '2026-09-01 11:56:44.176', '2026-09-01 11:56:44.176');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8i00592m7d9vxvepea', 'cmtim3i1p00142m7dz2maaw9l', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-05-04 12:00:00', '2026-09-01 11:56:44.178', '2026-09-01 11:56:44.178');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8k005a2m7d8g9g86q9', 'cmtim3i1p00142m7dz2maaw9l', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-04-21 12:00:00', '2026-09-01 11:56:44.18', '2026-09-01 11:56:44.18');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8m005b2m7dqabksmay', 'cmtim3i1p00142m7dz2maaw9l', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-04-08 12:00:00', '2026-09-01 11:56:44.182', '2026-09-01 11:56:44.182');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8o005c2m7dkm2biraf', 'cmtim3i2100192m7dp5czanwe', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hzc00072m7da0ifizgx', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-27 12:00:00', '2026-09-01 11:56:44.184', '2026-09-01 11:56:44.184');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8q005d2m7dyq3imunt', 'cmtim3i2100192m7dp5czanwe', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hzc00072m7da0ifizgx', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-14 12:00:00', '2026-09-01 11:56:44.186', '2026-09-01 11:56:44.186');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8r005e2m7djabakz9f', 'cmtim3i2100192m7dp5czanwe', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hzc00072m7da0ifizgx', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-01 12:00:00', '2026-09-01 11:56:44.187', '2026-09-01 11:56:44.187');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8t005f2m7dscb4t6va', 'cmtim3i2100192m7dp5czanwe', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hzc00072m7da0ifizgx', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-06-15 12:00:00', '2026-09-01 11:56:44.189', '2026-09-01 11:56:44.189');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8v005g2m7dhhbj1s7t', 'cmtim3i2100192m7dp5czanwe', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hzc00072m7da0ifizgx', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-06-02 12:00:00', '2026-09-01 11:56:44.191', '2026-09-01 11:56:44.191');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i8x005h2m7dq657dbxl', 'cmtim3i2100192m7dp5czanwe', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hzc00072m7da0ifizgx', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-05-20 12:00:00', '2026-09-01 11:56:44.193', '2026-09-01 11:56:44.193');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i90005i2m7dg54cmaq5', 'cmtim3i2100192m7dp5czanwe', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hzc00072m7da0ifizgx', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-05-04 12:00:00', '2026-09-01 11:56:44.196', '2026-09-01 11:56:44.196');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i92005j2m7d03a1qa0h', 'cmtim3i2100192m7dp5czanwe', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hzc00072m7da0ifizgx', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-04-21 12:00:00', '2026-09-01 11:56:44.198', '2026-09-01 11:56:44.198');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i94005k2m7d297tepaq', 'cmtim3i2100192m7dp5czanwe', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hzc00072m7da0ifizgx', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i00000h2m7dtebiy6zb', 'cmtim3i0e000n2m7ds08y9fyi', '2026-04-08 12:00:00', '2026-09-01 11:56:44.2', '2026-09-01 11:56:44.2');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i96005l2m7d6hjkyvha', 'cmtim3i2d001f2m7dn0fx2j6m', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtim3hz800052m7dc4oq9xy6', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i06000j2m7dimg2alyk', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-07-27 12:00:00', '2026-09-01 11:56:44.202', '2026-09-01 11:56:44.202');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i98005m2m7d6u0h93wp', 'cmtim3i2d001f2m7dn0fx2j6m', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Människa', 'cmtim3hz800052m7dc4oq9xy6', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i06000j2m7dimg2alyk', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-07-14 12:00:00', '2026-09-01 11:56:44.204', '2026-09-01 11:56:44.204');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i99005n2m7dc4yvi6e8', 'cmtim3i2d001f2m7dn0fx2j6m', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtim3hz800052m7dc4oq9xy6', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i06000j2m7dimg2alyk', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-07-01 12:00:00', '2026-09-01 11:56:44.205', '2026-09-01 11:56:44.205');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i9b005o2m7df6jhvyk1', 'cmtim3i2d001f2m7dn0fx2j6m', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtim3hz800052m7dc4oq9xy6', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i06000j2m7dimg2alyk', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-06-15 12:00:00', '2026-09-01 11:56:44.207', '2026-09-01 11:56:44.207');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i9d005p2m7dwrbl8h03', 'cmtim3i2d001f2m7dn0fx2j6m', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtim3hz800052m7dc4oq9xy6', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i06000j2m7dimg2alyk', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-06-02 12:00:00', '2026-09-01 11:56:44.209', '2026-09-01 11:56:44.209');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i9h005q2m7dni6pkcgw', 'cmtim3i2d001f2m7dn0fx2j6m', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtim3hz800052m7dc4oq9xy6', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i06000j2m7dimg2alyk', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-05-20 12:00:00', '2026-09-01 11:56:44.213', '2026-09-01 11:56:44.213');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i9j005r2m7daev3rvlt', 'cmtim3i2d001f2m7dn0fx2j6m', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtim3hz800052m7dc4oq9xy6', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i06000j2m7dimg2alyk', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-05-04 12:00:00', '2026-09-01 11:56:44.215', '2026-09-01 11:56:44.215');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i9l005s2m7dgil4z3z2', 'cmtim3i2d001f2m7dn0fx2j6m', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Människa', 'cmtim3hz800052m7dc4oq9xy6', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i06000j2m7dimg2alyk', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-04-21 12:00:00', '2026-09-01 11:56:44.217', '2026-09-01 11:56:44.217');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i9m005t2m7dh32j3yvk', 'cmtim3i2d001f2m7dn0fx2j6m', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtim3hz800052m7dc4oq9xy6', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i06000j2m7dimg2alyk', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-04-08 12:00:00', '2026-09-01 11:56:44.218', '2026-09-01 11:56:44.218');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i9p005u2m7d5uxkwgop', 'cmtim3i2j001k2m7dmijd4zah', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i08000k2m7dpmyknu78', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-27 12:00:00', '2026-09-01 11:56:44.221', '2026-09-01 11:56:44.221');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i9r005v2m7d03s7qq81', 'cmtim3i2j001k2m7dmijd4zah', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i08000k2m7dpmyknu78', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-14 12:00:00', '2026-09-01 11:56:44.223', '2026-09-01 11:56:44.223');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i9t005w2m7drlwp2ueq', 'cmtim3i2j001k2m7dmijd4zah', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i08000k2m7dpmyknu78', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-01 12:00:00', '2026-09-01 11:56:44.225', '2026-09-01 11:56:44.225');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i9v005x2m7d31wimnk0', 'cmtim3i2j001k2m7dmijd4zah', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i08000k2m7dpmyknu78', 'cmtim3i0e000n2m7ds08y9fyi', '2026-06-15 12:00:00', '2026-09-01 11:56:44.227', '2026-09-01 11:56:44.227');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i9x005y2m7dfenoz995', 'cmtim3i2j001k2m7dmijd4zah', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i08000k2m7dpmyknu78', 'cmtim3i0e000n2m7ds08y9fyi', '2026-06-02 12:00:00', '2026-09-01 11:56:44.229', '2026-09-01 11:56:44.229');
INSERT INTO public."TrainingSession" VALUES ('cmtim3i9z005z2m7doqwemp6z', 'cmtim3i2j001k2m7dmijd4zah', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i08000k2m7dpmyknu78', 'cmtim3i0e000n2m7ds08y9fyi', '2026-05-20 12:00:00', '2026-09-01 11:56:44.231', '2026-09-01 11:56:44.231');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ia100602m7d2adiovjy', 'cmtim3i2j001k2m7dmijd4zah', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i08000k2m7dpmyknu78', 'cmtim3i0e000n2m7ds08y9fyi', '2026-05-04 12:00:00', '2026-09-01 11:56:44.233', '2026-09-01 11:56:44.233');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ia300612m7d81np4tk5', 'cmtim3i2j001k2m7dmijd4zah', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i08000k2m7dpmyknu78', 'cmtim3i0e000n2m7ds08y9fyi', '2026-04-21 12:00:00', '2026-09-01 11:56:44.235', '2026-09-01 11:56:44.235');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ia500622m7dxu9wsgz7', 'cmtim3i2j001k2m7dmijd4zah', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i08000k2m7dpmyknu78', 'cmtim3i0e000n2m7ds08y9fyi', '2026-04-08 12:00:00', '2026-09-01 11:56:44.237', '2026-09-01 11:56:44.237');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ia700632m7do9exc67z', 'cmtim3i2p001q2m7dwvnpdm30', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtim3hzg00092m7ddmio5min', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-27 12:00:00', '2026-09-01 11:56:44.239', '2026-09-01 11:56:44.239');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ia800642m7di4i1lm5z', 'cmtim3i2p001q2m7dwvnpdm30', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtim3hzg00092m7ddmio5min', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-14 12:00:00', '2026-09-01 11:56:44.24', '2026-09-01 11:56:44.24');
INSERT INTO public."TrainingSession" VALUES ('cmtim3iaa00652m7dmwztc00x', 'cmtim3i2p001q2m7dwvnpdm30', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtim3hzg00092m7ddmio5min', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-01 12:00:00', '2026-09-01 11:56:44.242', '2026-09-01 11:56:44.242');
INSERT INTO public."TrainingSession" VALUES ('cmtim3iac00662m7du1kpsx28', 'cmtim3i2p001q2m7dwvnpdm30', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtim3hzg00092m7ddmio5min', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-06-15 12:00:00', '2026-09-01 11:56:44.244', '2026-09-01 11:56:44.244');
INSERT INTO public."TrainingSession" VALUES ('cmtim3iae00672m7dngz08trg', 'cmtim3i2p001q2m7dwvnpdm30', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtim3hzg00092m7ddmio5min', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-06-02 12:00:00', '2026-09-01 11:56:44.246', '2026-09-01 11:56:44.246');
INSERT INTO public."TrainingSession" VALUES ('cmtim3iag00682m7dyxm8rjn8', 'cmtim3i2p001q2m7dwvnpdm30', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtim3hzg00092m7ddmio5min', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-05-20 12:00:00', '2026-09-01 11:56:44.248', '2026-09-01 11:56:44.248');
INSERT INTO public."TrainingSession" VALUES ('cmtim3iai00692m7dd74l2acc', 'cmtim3i2p001q2m7dwvnpdm30', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtim3hzg00092m7ddmio5min', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-05-04 12:00:00', '2026-09-01 11:56:44.25', '2026-09-01 11:56:44.25');
INSERT INTO public."TrainingSession" VALUES ('cmtim3iak006a2m7du7zn2ufn', 'cmtim3i2p001q2m7dwvnpdm30', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtim3hzg00092m7ddmio5min', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-04-21 12:00:00', '2026-09-01 11:56:44.252', '2026-09-01 11:56:44.252');
INSERT INTO public."TrainingSession" VALUES ('cmtim3iam006b2m7dfudq261s', 'cmtim3i2p001q2m7dwvnpdm30', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtim3hzg00092m7ddmio5min', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-04-08 12:00:00', '2026-09-01 11:56:44.254', '2026-09-01 11:56:44.254');
INSERT INTO public."TrainingSession" VALUES ('cmtim3iap006c2m7dsuug3vcy', 'cmtim3i2v001v2m7ddejxrabe', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtim3hza00062m7d60a65ce8', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0a000l2m7dgpss565s', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-07-27 12:00:00', '2026-09-01 11:56:44.257', '2026-09-01 11:56:44.257');
INSERT INTO public."TrainingSession" VALUES ('cmtim3iar006d2m7d44sl21tq', 'cmtim3i2v001v2m7ddejxrabe', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Människa', 'cmtim3hza00062m7d60a65ce8', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0a000l2m7dgpss565s', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-07-14 12:00:00', '2026-09-01 11:56:44.259', '2026-09-01 11:56:44.259');
INSERT INTO public."TrainingSession" VALUES ('cmtim3iat006e2m7dflwjg7w1', 'cmtim3i2v001v2m7ddejxrabe', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtim3hza00062m7d60a65ce8', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0a000l2m7dgpss565s', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-07-01 12:00:00', '2026-09-01 11:56:44.262', '2026-09-01 11:56:44.262');
INSERT INTO public."TrainingSession" VALUES ('cmtim3iaw006f2m7dyi932ldy', 'cmtim3i2v001v2m7ddejxrabe', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtim3hza00062m7d60a65ce8', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0a000l2m7dgpss565s', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-06-15 12:00:00', '2026-09-01 11:56:44.264', '2026-09-01 11:56:44.264');
INSERT INTO public."TrainingSession" VALUES ('cmtim3iay006g2m7ddpvaihll', 'cmtim3i2v001v2m7ddejxrabe', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtim3hza00062m7d60a65ce8', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0a000l2m7dgpss565s', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-06-02 12:00:00', '2026-09-01 11:56:44.266', '2026-09-01 11:56:44.266');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ib0006h2m7dbg6hgkxm', 'cmtim3i2v001v2m7ddejxrabe', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtim3hza00062m7d60a65ce8', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0a000l2m7dgpss565s', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-05-20 12:00:00', '2026-09-01 11:56:44.269', '2026-09-01 11:56:44.269');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ib3006i2m7du2e6rd29', 'cmtim3i2v001v2m7ddejxrabe', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtim3hza00062m7d60a65ce8', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0a000l2m7dgpss565s', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-05-04 12:00:00', '2026-09-01 11:56:44.271', '2026-09-01 11:56:44.271');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ib5006j2m7d1rdbiuya', 'cmtim3i2v001v2m7ddejxrabe', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Människa', 'cmtim3hza00062m7d60a65ce8', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0a000l2m7dgpss565s', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-04-21 12:00:00', '2026-09-01 11:56:44.273', '2026-09-01 11:56:44.273');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ib7006k2m7dmixjxj34', 'cmtim3i2v001v2m7ddejxrabe', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtim3hza00062m7d60a65ce8', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0a000l2m7dgpss565s', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-04-08 12:00:00', '2026-09-01 11:56:44.275', '2026-09-01 11:56:44.275');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ib9006l2m7ddv126avj', 'cmtim3i3200202m7dfpiop4kp', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0c000m2m7di7i3fk3t', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-07-27 12:00:00', '2026-09-01 11:56:44.277', '2026-09-01 11:56:44.277');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ibc006m2m7d61vle2ym', 'cmtim3i3200202m7dfpiop4kp', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0c000m2m7di7i3fk3t', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-07-14 12:00:00', '2026-09-01 11:56:44.28', '2026-09-01 11:56:44.28');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ibe006n2m7de27av701', 'cmtim3i3200202m7dfpiop4kp', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0c000m2m7di7i3fk3t', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-07-01 12:00:00', '2026-09-01 11:56:44.282', '2026-09-01 11:56:44.282');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ibh006o2m7dudyv88ki', 'cmtim3i3200202m7dfpiop4kp', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0c000m2m7di7i3fk3t', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-06-15 12:00:00', '2026-09-01 11:56:44.285', '2026-09-01 11:56:44.285');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ibj006p2m7dohp4tdvj', 'cmtim3i3200202m7dfpiop4kp', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0c000m2m7di7i3fk3t', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-06-02 12:00:00', '2026-09-01 11:56:44.287', '2026-09-01 11:56:44.287');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ibl006q2m7ddyj1rg6a', 'cmtim3i3200202m7dfpiop4kp', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0c000m2m7di7i3fk3t', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-05-20 12:00:00', '2026-09-01 11:56:44.289', '2026-09-01 11:56:44.289');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ibn006r2m7dt6u2y6qt', 'cmtim3i3200202m7dfpiop4kp', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0c000m2m7di7i3fk3t', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-05-04 12:00:00', '2026-09-01 11:56:44.291', '2026-09-01 11:56:44.291');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ibp006s2m7dzo0ftkvh', 'cmtim3i3200202m7dfpiop4kp', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0c000m2m7di7i3fk3t', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-04-21 12:00:00', '2026-09-01 11:56:44.293', '2026-09-01 11:56:44.293');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ibs006t2m7daahuk72v', 'cmtim3i3200202m7dfpiop4kp', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i0c000m2m7di7i3fk3t', 'cmtim3i0g000o2m7dhlh9w1ar', '2026-04-08 12:00:00', '2026-09-01 11:56:44.296', '2026-09-01 11:56:44.296');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ibu006u2m7deodsl6dz', 'cmtim3i3800252m7djl5rcpfg', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-27 12:00:00', '2026-09-01 11:56:44.298', '2026-09-01 11:56:44.298');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ibw006v2m7dqsykquky', 'cmtim3i3800252m7djl5rcpfg', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-14 12:00:00', '2026-09-01 11:56:44.3', '2026-09-01 11:56:44.3');
INSERT INTO public."TrainingSession" VALUES ('cmtim3iby006w2m7d6la8nwyl', 'cmtim3i3800252m7djl5rcpfg', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-07-01 12:00:00', '2026-09-01 11:56:44.302', '2026-09-01 11:56:44.302');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ic1006x2m7dzskuf1ex', 'cmtim3i3800252m7djl5rcpfg', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-06-15 12:00:00', '2026-09-01 11:56:44.305', '2026-09-01 11:56:44.305');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ic3006y2m7dhb6kv8i5', 'cmtim3i3800252m7djl5rcpfg', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-06-02 12:00:00', '2026-09-01 11:56:44.307', '2026-09-01 11:56:44.307');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ic6006z2m7dwmmw7imu', 'cmtim3i3800252m7djl5rcpfg', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-05-20 12:00:00', '2026-09-01 11:56:44.31', '2026-09-01 11:56:44.31');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ic800702m7dx3n6l7m6', 'cmtim3i3800252m7djl5rcpfg', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-05-04 12:00:00', '2026-09-01 11:56:44.312', '2026-09-01 11:56:44.312');
INSERT INTO public."TrainingSession" VALUES ('cmtim3ica00712m7dq64zszgf', 'cmtim3i3800252m7djl5rcpfg', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-04-21 12:00:00', '2026-09-01 11:56:44.314', '2026-09-01 11:56:44.314');
INSERT INTO public."TrainingSession" VALUES ('cmtim3icc00722m7d8zw8zpzk', 'cmtim3i3800252m7djl5rcpfg', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtim3hze00082m7dtcl3bsag', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtim3i04000i2m7d6zz9qkt7', 'cmtim3i0e000n2m7ds08y9fyi', '2026-04-08 12:00:00', '2026-09-01 11:56:44.316', '2026-09-01 11:56:44.316');

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."User" VALUES ('cmtim3i0g000o2m7dhlh9w1ar', 'peter.nyman@avarn.se', 'Peter Nyman', '$2b$10$RvUPXoheNyUl2iN2x8ht/eTF5F7KpNPtmIce.kIKKxH9iqF3KHnp.', 'INSTRUCTOR', '070-890 12 34', true, '2026-09-01 11:58:06.489', '2026-09-01 11:56:43.888', 'cmtim3hyy00032m7dgu1ctwz4');
INSERT INTO public."User" VALUES ('cmtim3i04000i2m7d6zz9qkt7', 'maria.svensson@avarn.se', 'Maria Svensson', '$2b$10$RvUPXoheNyUl2iN2x8ht/eTF5F7KpNPtmIce.kIKKxH9iqF3KHnp.', 'HANDLER', '070-234 56 78', true, NULL, '2026-09-01 11:56:43.876', 'cmtim3hyv00022m7dicbkhjtu');
INSERT INTO public."User" VALUES ('cmtim3i08000k2m7dpmyknu78', 'sofie.holm@avarn.se', 'Sofie Holm', '$2b$10$RvUPXoheNyUl2iN2x8ht/eTF5F7KpNPtmIce.kIKKxH9iqF3KHnp.', 'HANDLER', '070-456 78 90', true, NULL, '2026-09-01 11:56:43.88', 'cmtim3hyz00042m7dqcgwkrvy');
INSERT INTO public."User" VALUES ('cmtim3i0a000l2m7dgpss565s', 'anders.berg@avarn.se', 'Anders Berg', '$2b$10$RvUPXoheNyUl2iN2x8ht/eTF5F7KpNPtmIce.kIKKxH9iqF3KHnp.', 'HANDLER', '070-567 89 01', true, NULL, '2026-09-01 11:56:43.882', 'cmtim3hyn00002m7dbp3pxgbd');
INSERT INTO public."User" VALUES ('cmtim3i0c000m2m7di7i3fk3t', 'lisa.ek@avarn.se', 'Lisa Ek', '$2b$10$RvUPXoheNyUl2iN2x8ht/eTF5F7KpNPtmIce.kIKKxH9iqF3KHnp.', 'HANDLER', '070-678 90 12', true, NULL, '2026-09-01 11:56:43.884', 'cmtim3hyt00012m7d31rwdmgk');
INSERT INTO public."User" VALUES ('cmtim3i06000j2m7dimg2alyk', 'johan.larsson@avarn.se', 'Johan Larsson', '$2b$10$RvUPXoheNyUl2iN2x8ht/eTF5F7KpNPtmIce.kIKKxH9iqF3KHnp.', 'HANDLER', '070-345 67 89', true, '2026-09-01 11:58:20.563', '2026-09-01 11:56:43.878', 'cmtim3hyy00032m7dgu1ctwz4');
INSERT INTO public."User" VALUES ('cmtim3i0i000p2m7d6sj9j0qz', 'karin.dahl@avarn.se', 'Karin Dahl', '$2b$10$RvUPXoheNyUl2iN2x8ht/eTF5F7KpNPtmIce.kIKKxH9iqF3KHnp.', 'REGIONAL_MANAGER', '070-901 23 45', true, '2026-09-01 11:58:28.959', '2026-09-01 11:56:43.89', 'cmtim3hyv00022m7dicbkhjtu');
INSERT INTO public."User" VALUES ('cmtim3i0q000r2m7dzd23f518', 'admin@avarn.se', 'Systemadministratör', '$2b$10$RvUPXoheNyUl2iN2x8ht/eTF5F7KpNPtmIce.kIKKxH9iqF3KHnp.', 'ADMIN', NULL, true, '2026-09-01 11:58:30.621', '2026-09-01 11:56:43.898', NULL);
INSERT INTO public."User" VALUES ('cmtim3i0m000q2m7d9hs7ruus', 'magnus.oberg@avarn.se', 'Magnus Öberg', '$2b$10$RvUPXoheNyUl2iN2x8ht/eTF5F7KpNPtmIce.kIKKxH9iqF3KHnp.', 'NATIONAL_MANAGER', '070-012 34 56', true, '2026-09-01 11:58:31.893', '2026-09-01 11:56:43.894', NULL);
INSERT INTO public."User" VALUES ('cmtim3i0e000n2m7ds08y9fyi', 'anna.karlsson@avarn.se', 'Anna Karlsson', '$2b$10$RvUPXoheNyUl2iN2x8ht/eTF5F7KpNPtmIce.kIKKxH9iqF3KHnp.', 'INSTRUCTOR', '070-789 01 23', true, '2026-09-01 11:59:52.419', '2026-09-01 11:56:43.886', 'cmtim3hyv00022m7dicbkhjtu');
INSERT INTO public."User" VALUES ('cmtim3i00000h2m7dtebiy6zb', 'erik.andersson@avarn.se', 'Erik Andersson', '$2b$10$RvUPXoheNyUl2iN2x8ht/eTF5F7KpNPtmIce.kIKKxH9iqF3KHnp.', 'HANDLER', '070-123 45 67', true, '2026-09-01 11:59:55.817', '2026-09-01 11:56:43.872', 'cmtim3hyv00022m7dicbkhjtu');

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations VALUES ('b4a08b03-3687-430e-9f5f-9c34b0c01b36', 'e67474ddd6e107de2df8cefbeb5f9cb6e3a15399718d0cd8c3a6d8d78a9d0c8c', '2026-08-31 12:57:11.315391+00', '20260831113658_init', NULL, NULL, '2026-08-31 12:57:11.093046+00', 1);
INSERT INTO public._prisma_migrations VALUES ('3d7aae2b-ae08-4fb0-91bb-7633c03f7cbe', '46e8787317de3b806f47ed777efef5ecb3002350aaaeeca5455f5bf036fa9468', '2026-09-01 11:49:55.942159+00', '20260901114955_media_dog_and_profile_photos', NULL, NULL, '2026-09-01 11:49:55.928359+00', 1);

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
ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OperationalReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PlannedExercise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Region" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SearchDiscipline" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Team" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TeamAvailability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TrainingPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TrainingSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
