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

INSERT INTO public."AuditLog" VALUES ('cmtj8zwq5004dbq7dftvsgvw9', 'cmtj8ynac000hu07dmv8ay4zn', 'READ', 'OperationalReport', 'cmtj8zvl30045bq7d33ky1gaj', 'UPP-2451', '2026-09-01 22:37:47.501');
INSERT INTO public."AuditLog" VALUES ('cmtj8zxgr004ebq7du4lijn2c', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:37:48.459');
INSERT INTO public."AuditLog" VALUES ('cmtj8yv4g002ubq7d5lsfa4vn', 'cmtj8ynac000hu07dmv8ay4zn', 'DENIED', 'MediaAsset', 'finns-inte', 'Försök att hämta fil utanför behörighet', '2026-09-01 22:36:58.768');
INSERT INTO public."AuditLog" VALUES ('cmtj8yvr8002vbq7dchqp37ec', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:36:59.588');
INSERT INTO public."AuditLog" VALUES ('cmtj8z0j80030bq7dssi1z3nw', 'cmtj8ynag000ju07dhecd45ly', 'LOGIN', 'User', 'cmtj8ynag000ju07dhecd45ly', NULL, '2026-09-01 22:37:05.78');
INSERT INTO public."AuditLog" VALUES ('cmtj8z9ks003bbq7dr00cxjnc', 'cmtj8ynap000pu07dk68crsqd', 'LOGIN', 'User', 'cmtj8ynap000pu07dk68crsqd', NULL, '2026-09-01 22:37:17.5');
INSERT INTO public."AuditLog" VALUES ('cmtj8zqvr003lbq7du7em74je', 'cmtj8ynat000ru07d71q34ph0', 'LOGIN', 'User', 'cmtj8ynat000ru07d71q34ph0', NULL, '2026-09-01 22:37:39.928');
INSERT INTO public."AuditLog" VALUES ('cmtj8zvoj0048bq7dk4i305ll', 'cmtj8ynac000hu07dmv8ay4zn', 'READ', 'OperationalReport', 'cmtj8zvl30045bq7d33ky1gaj', 'UPP-2451', '2026-09-01 22:37:46.147');
INSERT INTO public."AuditLog" VALUES ('cmtj8zy88004fbq7dgtpx2ph7', 'cmtj8ynag000ju07dhecd45ly', 'LOGIN', 'User', 'cmtj8ynag000ju07dhecd45ly', NULL, '2026-09-01 22:37:49.448');
INSERT INTO public."AuditLog" VALUES ('cmtj8yxto002xbq7dxemadclk', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:37:02.268');
INSERT INTO public."AuditLog" VALUES ('cmtj8zu6q0041bq7du055yxgo', 'cmtj8ynac000hu07dmv8ay4zn', 'UPDATE', 'TrainingSession', 'cmtj8ztm6003obq7dlnjamv8m', 'Rättat och inskickat', '2026-09-01 22:37:44.21');
INSERT INTO public."AuditLog" VALUES ('cmtj90twd004gbq7diqzha6zn', 'cmtj8ynat000ru07d71q34ph0', 'LOGIN', 'User', 'cmtj8ynat000ru07d71q34ph0', NULL, '2026-09-01 22:38:30.494');
INSERT INTO public."AuditLog" VALUES ('cmtjqed840000gp7d5wg1lhtk', 'cmtj8ynat000ru07d71q34ph0', 'LOGIN', 'User', 'cmtj8ynat000ru07d71q34ph0', NULL, '2026-09-02 06:44:55.54');
INSERT INTO public."AuditLog" VALUES ('cmtj8z3wf0037bq7d9xw7qqwj', 'cmtj8ynag000ju07dhecd45ly', 'DENIED', 'MediaAsset', 'cmtj8z36e0034bq7dbxnkzi3a', 'Försök att hämta fil utanför behörighet', '2026-09-01 22:37:10.143');
INSERT INTO public."AuditLog" VALUES ('cmtj8z4gv0038bq7dahw2z5g6', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:37:10.879');
INSERT INTO public."AuditLog" VALUES ('cmtj90ylv004hbq7dbxf63nz1', 'cmtj8ynal000nu07d18kw9gk4', 'LOGIN', 'User', 'cmtj8ynal000nu07d18kw9gk4', NULL, '2026-09-01 22:38:36.596');
INSERT INTO public."AuditLog" VALUES ('cmtj8ypd5002nbq7dvg0bppd9', 'cmtj8ynag000ju07dhecd45ly', 'LOGIN', 'User', 'cmtj8ynag000ju07dhecd45ly', NULL, '2026-09-01 22:36:51.305');
INSERT INTO public."AuditLog" VALUES ('cmtj8ywra002wbq7da658cr3f', 'cmtj8ynal000nu07d18kw9gk4', 'LOGIN', 'User', 'cmtj8ynal000nu07d18kw9gk4', NULL, '2026-09-01 22:37:00.886');
INSERT INTO public."AuditLog" VALUES ('cmtj8z1b00031bq7d53op8z8u', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:37:06.78');
INSERT INTO public."AuditLog" VALUES ('cmtj8yq66002obq7dctd8mw66', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:36:52.35');
INSERT INTO public."AuditLog" VALUES ('cmtj8zu9g0043bq7dtsahc6qz', 'cmtj8ynac000hu07dmv8ay4zn', 'READ', 'TrainingSession', 'cmtj8ztm6003obq7dlnjamv8m', NULL, '2026-09-01 22:37:44.309');
INSERT INTO public."AuditLog" VALUES ('cmtj8zuwu0044bq7da3and18e', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:37:45.15');
INSERT INTO public."AuditLog" VALUES ('cmtj8zvl70047bq7dpkcdkmxc', 'cmtj8ynac000hu07dmv8ay4zn', 'CREATE', 'OperationalReport', 'cmtj8zvl30045bq7d33ky1gaj', 'UPP-2451', '2026-09-01 22:37:46.027');
INSERT INTO public."AuditLog" VALUES ('cmtj8yr5b002pbq7demutu0c3', 'cmtj8ynag000ju07dhecd45ly', 'LOGIN', 'User', 'cmtj8ynag000ju07dhecd45ly', NULL, '2026-09-01 22:36:53.615');
INSERT INTO public."AuditLog" VALUES ('cmtj8z2uq0033bq7dg5955bbe', 'cmtj8ynac000hu07dmv8ay4zn', 'READ', 'TrainingSession', 'cmtj8ynfp003yu07dk1ovd4tt', NULL, '2026-09-01 22:37:08.786');
INSERT INTO public."AuditLog" VALUES ('cmtj8z5uo0039bq7duc4fu19y', 'cmtj8ynat000ru07d71q34ph0', 'LOGIN', 'User', 'cmtj8ynat000ru07d71q34ph0', NULL, '2026-09-01 22:37:12.672');
INSERT INTO public."AuditLog" VALUES ('cmtj8zbhd003cbq7damyg78ob', 'cmtj8ynat000ru07d71q34ph0', 'LOGIN', 'User', 'cmtj8ynat000ru07d71q34ph0', NULL, '2026-09-01 22:37:19.97');
INSERT INTO public."AuditLog" VALUES ('cmtj8zrya003mbq7dhrbmd383', 'cmtj8ynar000qu07d3jrhk0jf', 'LOGIN', 'User', 'cmtj8ynar000qu07d3jrhk0jf', NULL, '2026-09-01 22:37:41.314');
INSERT INTO public."AuditLog" VALUES ('cmtj8zt12003nbq7dqpcimnam', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:37:42.71');
INSERT INTO public."AuditLog" VALUES ('cmtj8ys34002qbq7dyiamqfhp', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:36:54.832');
INSERT INTO public."AuditLog" VALUES ('cmtj8zhpn003ebq7djns945t2', 'cmtj8ynat000ru07d71q34ph0', 'READ', 'Team', 'export', 'CSV-uttag, 8 ekipage', '2026-09-01 22:37:28.043');
INSERT INTO public."AuditLog" VALUES ('cmtj8zi8b003fbq7dzv1xwljn', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:37:28.715');
INSERT INTO public."AuditLog" VALUES ('cmtj8yt2t002rbq7d98dvqdh2', 'cmtj8ynan000ou07dfxv1u5pr', 'LOGIN', 'User', 'cmtj8ynan000ou07dfxv1u5pr', NULL, '2026-09-01 22:36:56.117');
INSERT INTO public."AuditLog" VALUES ('cmtj8z2bf0032bq7dx86sjpyw', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:37:08.091');
INSERT INTO public."AuditLog" VALUES ('cmtj8z38k0035bq7dg3i31j2e', 'cmtj8ynac000hu07dmv8ay4zn', 'READ', 'TrainingSession', 'cmtj8ynfp003yu07dk1ovd4tt', NULL, '2026-09-01 22:37:09.284');
INSERT INTO public."AuditLog" VALUES ('cmtj8z3ol0036bq7dqvqriq9o', 'cmtj8ynag000ju07dhecd45ly', 'LOGIN', 'User', 'cmtj8ynag000ju07dhecd45ly', NULL, '2026-09-01 22:37:09.861');
INSERT INTO public."AuditLog" VALUES ('cmtj8z7mi003abq7diijgumuj', 'cmtj8ynal000nu07d18kw9gk4', 'LOGIN', 'User', 'cmtj8ynal000nu07d18kw9gk4', NULL, '2026-09-01 22:37:14.97');
INSERT INTO public."AuditLog" VALUES ('cmtj8zhgw003dbq7dc55ju4hu', 'cmtj8ynat000ru07d71q34ph0', 'LOGIN', 'User', 'cmtj8ynat000ru07d71q34ph0', NULL, '2026-09-01 22:37:27.728');
INSERT INTO public."AuditLog" VALUES ('cmtj8zpkl003kbq7d96vd0np2', 'cmtj8ynap000pu07dk68crsqd', 'LOGIN', 'User', 'cmtj8ynap000pu07dk68crsqd', NULL, '2026-09-01 22:37:38.229');
INSERT INTO public."AuditLog" VALUES ('cmtj8ztq8003vbq7d07luml95', 'cmtj8ynac000hu07dmv8ay4zn', 'READ', 'TrainingSession', 'cmtj8ztm6003obq7dlnjamv8m', NULL, '2026-09-01 22:37:43.616');
INSERT INTO public."AuditLog" VALUES ('cmtj8zw3l0049bq7dfjlcojoi', 'cmtj8ynac000hu07dmv8ay4zn', 'READ', 'OperationalReport', 'cmtj8zvl30045bq7d33ky1gaj', 'UPP-2451', '2026-09-01 22:37:46.689');
INSERT INTO public."AuditLog" VALUES ('cmtj8zwme004bbq7dv1t65c4p', 'cmtj8ynac000hu07dmv8ay4zn', 'UPDATE', 'OperationalReport', 'cmtj8zvl30045bq7d33ky1gaj', 'Rättad och inskickad', '2026-09-01 22:37:47.366');
INSERT INTO public."AuditLog" VALUES ('cmtj8ytuk002sbq7dnnxhr3py', 'cmtj8ynal000nu07d18kw9gk4', 'LOGIN', 'User', 'cmtj8ynal000nu07d18kw9gk4', NULL, '2026-09-01 22:36:57.116');
INSERT INTO public."AuditLog" VALUES ('cmtj8zjhp003gbq7d4p9fwejz', 'cmtj8ynac000hu07dmv8ay4zn', 'DENIED', 'Login', NULL, 'Fel lösenord', '2026-09-01 22:37:30.349');
INSERT INTO public."AuditLog" VALUES ('cmtj8zk24003hbq7dbjxbmnh7', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:37:31.084');
INSERT INTO public."AuditLog" VALUES ('cmtj8zmjh003ibq7dj0y1v2sb', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:37:34.301');
INSERT INTO public."AuditLog" VALUES ('cmtj8yuv8002tbq7d2vr2sb5x', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:36:58.436');
INSERT INTO public."AuditLog" VALUES ('cmtj8yyh6002ybq7dt9gg60fm', 'cmtj8ynac000hu07dmv8ay4zn', 'DENIED', 'User', 'cmtj8ynac000hu07dmv8ay4zn', 'Fel nuvarande lösenord vid byte', '2026-09-01 22:37:03.114');
INSERT INTO public."AuditLog" VALUES ('cmtj8yz3q002zbq7dqr7wv6n3', 'cmtj8ynac000hu07dmv8ay4zn', 'LOGIN', 'User', 'cmtj8ynac000hu07dmv8ay4zn', NULL, '2026-09-01 22:37:03.926');
INSERT INTO public."AuditLog" VALUES ('cmtj8zny0003jbq7d6vyxqmsv', 'cmtj8ynal000nu07d18kw9gk4', 'LOGIN', 'User', 'cmtj8ynal000nu07d18kw9gk4', NULL, '2026-09-01 22:37:36.12');
INSERT INTO public."AuditLog" VALUES ('cmtj8ztmc003ubq7dlugb4eot', 'cmtj8ynac000hu07dmv8ay4zn', 'CREATE', 'TrainingSession', 'cmtj8ztm6003obq7dlnjamv8m', NULL, '2026-09-01 22:37:43.476');

--
-- Data for Name: Certification; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Certification" VALUES ('cmtj8yndu002pu07daet2gya4', 'cmtj8yna2000bu07d0lv6hvsc', NULL, NULL, 'cmtj8ynbn0016u07d3u3hwdjv', 'Svenska Brukshundklubben', 'NHPR-2129', '2026-05-01 22:36:48.284', '2027-05-01 22:36:48.284', NULL, '2026-09-01 22:36:48.738');
INSERT INTO public."Certification" VALUES ('cmtj8yndx002qu07delgn37yy', 'cmtj8yna3000cu07d84clvmlw', NULL, NULL, 'cmtj8ynbn0016u07d3u3hwdjv', 'Avarn Security', 'EKIPAGE-2550', '2026-01-01 22:36:48.284', '2028-01-01 22:36:48.284', NULL, '2026-09-01 22:36:48.742');
INSERT INTO public."Certification" VALUES ('cmtj8yndz002ru07d2rmkzyaa', 'cmtj8yna5000du07di1mik4fh', 'cmtj8ynbi000yu07dohnvkyln', NULL, NULL, 'Avarn Security', 'NARK_CERT-7571', '2025-10-01 22:36:48.284', '2026-10-01 22:36:48.284', NULL, '2026-09-01 22:36:48.743');
INSERT INTO public."Certification" VALUES ('cmtj8yne1002su07db51y7yd9', 'cmtj8yna2000bu07d0lv6hvsc', NULL, NULL, 'cmtj8ync4001bu07ddo49zc9z', 'Svenska Brukshundklubben', 'NHPR-8840', '2025-11-01 22:36:48.284', '2026-11-01 22:36:48.284', NULL, '2026-09-01 22:36:48.745');
INSERT INTO public."Certification" VALUES ('cmtj8yne2002tu07dqo61kr6o', 'cmtj8yna3000cu07d84clvmlw', NULL, NULL, 'cmtj8ync4001bu07ddo49zc9z', 'Avarn Security', 'EKIPAGE-9952', '2026-03-01 22:36:48.284', '2028-03-01 22:36:48.284', NULL, '2026-09-01 22:36:48.746');
INSERT INTO public."Certification" VALUES ('cmtj8yne3002uu07dtwdc4lqu', 'cmtj8yna3000cu07d84clvmlw', NULL, NULL, 'cmtj8yncf001hu07da81o7ua5', 'Avarn Security', 'EKIPAGE-4510', '2024-09-01 22:36:48.284', '2026-09-03 12:00:00', NULL, '2026-09-01 22:36:48.747');
INSERT INTO public."Certification" VALUES ('cmtj8yne5002vu07dzxoba4gk', 'cmtj8yna2000bu07d0lv6hvsc', NULL, NULL, 'cmtj8yncf001hu07da81o7ua5', 'Avarn Security', 'NHPR-8096', '2026-06-01 22:36:48.284', '2027-06-01 22:36:48.284', NULL, '2026-09-01 22:36:48.749');
INSERT INTO public."Certification" VALUES ('cmtj8yne6002wu07dypuff9s2', 'cmtj8yna2000bu07d0lv6hvsc', NULL, NULL, 'cmtj8ynck001mu07d7sudegib', 'Avarn Security', 'NHPR-9850', '2026-07-01 22:36:48.284', '2027-07-01 22:36:48.284', NULL, '2026-09-01 22:36:48.75');
INSERT INTO public."Certification" VALUES ('cmtj8yne7002xu07d26idcjdg', 'cmtj8yna3000cu07d84clvmlw', NULL, NULL, 'cmtj8ynck001mu07d7sudegib', 'Avarn Security', 'EKIPAGE-5049', '2025-09-01 22:36:48.284', '2027-09-01 22:36:48.284', NULL, '2026-09-01 22:36:48.751');
INSERT INTO public."Certification" VALUES ('cmtj8yne8002yu07dde5kgkao', 'cmtj8yna6000eu07d08a5jpm3', 'cmtj8ynco001nu07dixx3utd2', NULL, NULL, 'Avarn Security', 'SPRANG_CERT-5407', '2025-12-01 22:36:48.284', '2026-12-01 22:36:48.284', NULL, '2026-09-01 22:36:48.752');
INSERT INTO public."Certification" VALUES ('cmtj8yne9002zu07dbnrnk1fj', 'cmtj8yna3000cu07d84clvmlw', NULL, NULL, 'cmtj8yncr001su07dqnv6odwj', 'Avarn Security', 'EKIPAGE-4015', '2026-04-01 22:36:48.284', '2028-04-01 22:36:48.284', NULL, '2026-09-01 22:36:48.753');
INSERT INTO public."Certification" VALUES ('cmtj8ynea0030u07dt1xwjdow', 'cmtj8yna2000bu07d0lv6hvsc', NULL, NULL, 'cmtj8yncx001xu07db3rvo8za', 'Avarn Security', 'NHPR-9575', '2026-08-01 22:36:48.284', '2027-08-01 22:36:48.284', NULL, '2026-09-01 22:36:48.754');
INSERT INTO public."Certification" VALUES ('cmtj8yneb0031u07d5qw5jhzf', 'cmtj8yna3000cu07d84clvmlw', NULL, NULL, 'cmtj8ynd30022u07doa3e2h33', 'Avarn Security', 'EKIPAGE-7107', '2024-10-01 22:36:48.284', '2026-10-01 22:36:48.284', NULL, '2026-09-01 22:36:48.755');
INSERT INTO public."Certification" VALUES ('cmtj8ynec0032u07d6cneobwy', 'cmtj8yna5000du07di1mik4fh', 'cmtj8ynd0001yu07d4toismn9', NULL, NULL, 'Avarn Security', 'NARK_CERT-9636', '2025-08-01 22:36:48.284', '2026-08-01 22:36:48.284', NULL, '2026-09-01 22:36:48.756');
INSERT INTO public."Certification" VALUES ('cmtj8yned0033u07dopz9ex04', 'cmtj8yna2000bu07d0lv6hvsc', NULL, NULL, 'cmtj8ynd80027u07dbrn7t9qd', 'Avarn Security', 'NHPR-1260', '2026-02-01 22:36:48.284', '2027-02-01 22:36:48.284', NULL, '2026-09-01 22:36:48.757');
INSERT INTO public."Certification" VALUES ('cmtj8ynef0034u07df7a4zmiq', 'cmtj8yna7000fu07dsayrc24m', NULL, 'cmtj8ynac000hu07dmv8ay4zn', NULL, 'Avarn Security', 'SKYDDSVAKT-5194', '2025-01-01 22:36:48.284', '2028-01-01 22:36:48.284', NULL, '2026-09-01 22:36:48.759');
INSERT INTO public."Certification" VALUES ('cmtj8yneg0035u07didz42koa', 'cmtj8yna8000gu07dv2p4ydab', NULL, 'cmtj8ynac000hu07dmv8ay4zn', NULL, 'Avarn Security', 'HLR-5661', '2024-11-01 22:36:48.284', '2026-11-01 22:36:48.284', NULL, '2026-09-01 22:36:48.76');
INSERT INTO public."Certification" VALUES ('cmtj8ynei0036u07drtrl3s18', 'cmtj8yna7000fu07dsayrc24m', NULL, 'cmtj8ynaf000iu07djd69bo4f', NULL, 'Avarn Security', 'SKYDDSVAKT-2863', '2024-03-01 22:36:48.284', '2027-03-01 22:36:48.284', NULL, '2026-09-01 22:36:48.762');
INSERT INTO public."Certification" VALUES ('cmtj8ynej0037u07dh9kfo3lz', 'cmtj8yna8000gu07dv2p4ydab', NULL, 'cmtj8ynag000ju07dhecd45ly', NULL, 'Avarn Security', 'HLR-3437', '2024-10-01 22:36:48.284', '2026-10-01 22:36:48.284', NULL, '2026-09-01 22:36:48.763');
INSERT INTO public."Certification" VALUES ('cmtj8ynek0038u07ddwnfsv1d', 'cmtj8yna7000fu07dsayrc24m', NULL, 'cmtj8ynah000ku07d5vl6a5h8', NULL, 'Avarn Security', 'SKYDDSVAKT-7986', '2025-09-01 22:36:48.284', '2028-09-01 22:36:48.284', NULL, '2026-09-01 22:36:48.764');

--
-- Data for Name: CertificationType; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."CertificationType" VALUES ('cmtj8yna2000bu07d0lv6hvsc', 'NHPR', 'NHPR Godkänd', 12, 'TEAM', 'Nationellt hundprov för räddning och sök.');
INSERT INTO public."CertificationType" VALUES ('cmtj8yna3000cu07d84clvmlw', 'EKIPAGE', 'Auktoriserat ekipage', 24, 'TEAM', 'Behörighet att arbeta operativt som ekipage.');
INSERT INTO public."CertificationType" VALUES ('cmtj8yna5000du07di1mik4fh', 'NARK_CERT', 'Certifikat narkotikasök', 12, 'DOG', NULL);
INSERT INTO public."CertificationType" VALUES ('cmtj8yna6000eu07d08a5jpm3', 'SPRANG_CERT', 'Certifikat sprängämnessök', 12, 'DOG', NULL);
INSERT INTO public."CertificationType" VALUES ('cmtj8yna7000fu07dsayrc24m', 'SKYDDSVAKT', 'Skyddsvaktsförordnande', 36, 'HANDLER', NULL);
INSERT INTO public."CertificationType" VALUES ('cmtj8yna8000gu07dv2p4ydab', 'HLR', 'HLR och första hjälpen', 24, 'HANDLER', NULL);

--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Comment" VALUES ('cmtj8ynjp0075u07dwgccdoqf', 'cmtj8ynal000nu07d18kw9gk4', 'Bra jobbat! Fortsätt nöta på uthålligheten.', '2026-08-24 09:15:00', 'cmtj8ynf5003gu07dtklgi0e8', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmtj8ynjq0076u07djaqwg10d', 'cmtj8ynal000nu07d18kw9gk4', 'Lägg in fler höga gömmor kommande veckor, gärna 180–220 cm.', '2026-08-10 14:00:00', 'cmtj8ynfk003tu07d87sexdp7', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmtj8ynjr0077u07d7ccdb5bo', 'cmtj8ynan000ou07dfxv1u5pr', 'Helt rätt tänkt att korta passen. Bygg på fem minuter i taget.', '2026-08-25 11:30:00', 'cmtj8ynge004qu07dksz8rd4x', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmtj8ynku007wu07d29m1p0h4', 'cmtj8ynap000pu07dk68crsqd', 'Tydlig rapport. Bra att kvittonummer finns med.', '2026-08-23 09:35:00', NULL, 'cmtj8ynkj007qu07dq5a8t7va', NULL);

--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Customer" VALUES ('cmtj8ynjs0078u07dlbivg3t5', 'Swedavia AB', '556797-0818', 'Lars Holmberg', '010-109 00 00', 'sakerhet@swedavia.se', NULL);
INSERT INTO public."Customer" VALUES ('cmtj8ynjt0079u07djl0pod5a', 'Friends Arena', '556768-2942', 'Nina Ek', '08-500 300 00', 'drift@friendsarena.se', NULL);
INSERT INTO public."Customer" VALUES ('cmtj8ynju007au07dayv27t0a', 'Jordbro Logistik AB', '556123-4567', 'Tomas Ek', '08-555 12 00', 'lager@jordbrologistik.se', NULL);
INSERT INTO public."Customer" VALUES ('cmtj8ynjv007bu07d35xiikev', 'Uppsalahem', '556137-3589', 'Petra Lund', '018-727 30 00', 'trygghet@uppsalahem.se', NULL);

--
-- Data for Name: Dog; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Dog" VALUES ('cmtj8ynbi000yu07dohnvkyln', 'Nova', 'Belgisk vallhund (Malinois)', '2022-04-12 00:00:00', 'TIK', '752098100812345', NULL, 'ACTIVE', NULL, '2026-09-01 22:36:48.654', 'Fawn med svart mask', 62, 'A / 0', '2027-12-31 00:00:00', 'Folksam', '5 / 5', false, 'Sverige', 'SE-AVAR-2020-1127', 28);
INSERT INTO public."Dog" VALUES ('cmtj8ynbv0017u07dtympcyyt', 'Rex', 'Labrador Retriever', '2020-04-12 00:00:00', 'HANE', '752098100234567', NULL, 'ACTIVE', NULL, '2026-09-01 22:36:48.667', 'Svart', 58, 'B / 0', '2027-06-30 00:00:00', 'Agria', '4 / 5', true, 'Sverige', 'SE-AVAR-2018-0904', 32);
INSERT INTO public."Dog" VALUES ('cmtj8yncb001cu07dp3dv9xj8', 'Balder', 'Schäfer', '2021-04-12 00:00:00', 'HANE', '752098100345678', NULL, 'ACTIVE', NULL, '2026-09-01 22:36:48.683', 'Svart och tan', 65, 'A / 0', '2027-03-31 00:00:00', 'Agria', '5 / 4', false, 'Tyskland', 'SE-AVAR-2019-0451', 36);
INSERT INTO public."Dog" VALUES ('cmtj8ynch001iu07dhaaeawbs', 'Mira', 'Springer Spaniel', '2023-04-12 00:00:00', 'TIK', '752098100456789', NULL, 'ACTIVE', NULL, '2026-09-01 22:36:48.689', 'Brun och vit', 48, 'A / 0', '2026-11-30 00:00:00', 'Folksam', '4 / 4', false, 'Sverige', 'SE-AVAR-2021-1330', 19);
INSERT INTO public."Dog" VALUES ('cmtj8ynco001nu07dixx3utd2', 'Sigge', 'Labrador Retriever', '2019-04-12 00:00:00', 'HANE', '752098100567890', NULL, 'ACTIVE', NULL, '2026-09-01 22:36:48.696', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Dog" VALUES ('cmtj8yncu001tu07dfs6zpqs1', 'Iris', 'Belgisk vallhund (Malinois)', '2024-04-12 00:00:00', 'TIK', '752098100678901', NULL, 'ACTIVE', NULL, '2026-09-01 22:36:48.702', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Dog" VALUES ('cmtj8ynd0001yu07d4toismn9', 'Zeb', 'Schäfer', '2018-04-12 00:00:00', 'HANE', '752098100789012', NULL, 'ACTIVE', NULL, '2026-09-01 22:36:48.708', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Dog" VALUES ('cmtj8ynd50023u07dr76t1h7d', 'Tira', 'Springer Spaniel', '2022-04-12 00:00:00', 'TIK', '752098100890123', NULL, 'ACTIVE', NULL, '2026-09-01 22:36:48.713', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Data for Name: DogDiscipline; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."DogDiscipline" VALUES ('cmtj8ynbj000zu07d9gfwys80', 'cmtj8ynbi000yu07dohnvkyln', 'cmtj8yn9x0008u07dztpicg9s', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8ynbj0010u07dkojca4li', 'cmtj8ynbi000yu07dohnvkyln', 'cmtj8yn9y0009u07d3v33bp41', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8ynbj0011u07dgqtdlcbr', 'cmtj8ynbi000yu07dohnvkyln', 'cmtj8yn9z000au07dglt6r36o', 'GRUND', '2025-09-26 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8ync10018u07dteb559fr', 'cmtj8ynbv0017u07dtympcyyt', 'cmtj8yn9x0008u07dztpicg9s', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8ync10019u07dpv8pgp2y', 'cmtj8ynbv0017u07dtympcyyt', 'cmtj8yn9v0007u07dtdnd22hi', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8yncc001du07d4lm0wery', 'cmtj8yncb001cu07dp3dv9xj8', 'cmtj8yn9s0005u07dcrdgafm9', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8yncc001eu07doywq8soe', 'cmtj8yncb001cu07dp3dv9xj8', 'cmtj8yn9t0006u07d898ien6b', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8ynci001ju07d7e62mpmi', 'cmtj8ynch001iu07dhaaeawbs', 'cmtj8yn9x0008u07dztpicg9s', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8ynci001ku07d8apdafob', 'cmtj8ynch001iu07dhaaeawbs', 'cmtj8yn9v0007u07dtdnd22hi', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8ynco001ou07djd4ouzef', 'cmtj8ynco001nu07dixx3utd2', 'cmtj8yn9y0009u07d3v33bp41', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8ynco001pu07dnhqzqt0p', 'cmtj8ynco001nu07dixx3utd2', 'cmtj8yn9v0007u07dtdnd22hi', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8yncu001uu07d8vds6yhc', 'cmtj8yncu001tu07dfs6zpqs1', 'cmtj8yn9s0005u07dcrdgafm9', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8yncu001vu07dxryabmid', 'cmtj8yncu001tu07dfs6zpqs1', 'cmtj8yn9t0006u07d898ien6b', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8ynd1001zu07dplhauksi', 'cmtj8ynd0001yu07d4toismn9', 'cmtj8yn9x0008u07dztpicg9s', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8ynd60024u07djcpgds6p', 'cmtj8ynd50023u07dr76t1h7d', 'cmtj8yn9x0008u07dztpicg9s', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtj8ynd60025u07de09tpqr7', 'cmtj8ynd50023u07dr76t1h7d', 'cmtj8yn9z000au07dglt6r36o', 'GRUND', '2025-08-27 08:00:00');

--
-- Data for Name: DogEducation; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."DogEducation" VALUES ('cmtj8ynbk0012u07d5yzzrp4m', 'cmtj8ynbi000yu07dohnvkyln', 'Grundutbildning', 'Avarn Security Hundutbildning', '2023-03-01 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtj8ynbk0013u07d9cxxf1wh', 'cmtj8ynbi000yu07dohnvkyln', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2024-01-15 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtj8ynbk0014u07dlzlkyawc', 'cmtj8ynbi000yu07dohnvkyln', 'Specialistutbildning Narkotika', 'Avarn Security Hundutbildning', '2024-11-30 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtj8ynbk0015u07d6z6xwgzh', 'cmtj8ynbi000yu07dohnvkyln', 'Vidareutbildning Sök & Markering', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtj8ync2001au07dfz975ffb', 'cmtj8ynbv0017u07dtympcyyt', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtj8yncc001fu07d7zw7xyle', 'cmtj8yncb001cu07dp3dv9xj8', 'Grundutbildning', 'Avarn Security Hundutbildning', '2024-11-30 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtj8yncc001gu07d00imf08g', 'cmtj8yncb001cu07dp3dv9xj8', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtj8ynci001lu07dthv4b8o9', 'cmtj8ynch001iu07dhaaeawbs', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtj8yncp001qu07da1mk2zl1', 'cmtj8ynco001nu07dixx3utd2', 'Grundutbildning', 'Avarn Security Hundutbildning', '2024-11-30 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtj8yncp001ru07dldz3dz11', 'cmtj8ynco001nu07dixx3utd2', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtj8yncv001wu07drs17zwav', 'cmtj8yncu001tu07dfs6zpqs1', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtj8ynd10020u07diva3lqu0', 'cmtj8ynd0001yu07d4toismn9', 'Grundutbildning', 'Avarn Security Hundutbildning', '2024-11-30 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtj8ynd10021u07ds1vp3jtg', 'cmtj8ynd0001yu07d4toismn9', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtj8ynd60026u07dr53etl4p', 'cmtj8ynd50023u07dr76t1h7d', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');

--
-- Data for Name: FollowUp; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."FollowUp" VALUES ('cmtj8ynkw007xu07d7x439c2c', 'cmtj8ynbn0016u07d3u3hwdjv', 'cmtj8ynal000nu07d18kw9gk4', 'Uppföljning höga gömmor', 'Vi tar ett gemensamt pass på höga gömmor innan certifieringen. Hör av dig med tid som passar.', '2026-09-10 08:00:00', 'OPEN', '2026-09-01 22:36:48.992');

--
-- Data for Name: HandlerProfile; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."HandlerProfile" VALUES ('cmtj8ynav000su07dc3he05dk', 'cmtj8ynac000hu07dmv8ay4zn', 'AV-1000', 'Stockholm', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtj8ynaw000tu07dpeu67rlo', 'cmtj8ynaf000iu07djd69bo4f', 'AV-1001', 'Södertälje', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtj8ynax000uu07d4qbtbt2r', 'cmtj8ynag000ju07dhecd45ly', 'AV-1002', 'Göteborg', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtj8ynaz000vu07d6hi3bekx', 'cmtj8ynah000ku07d5vl6a5h8', 'AV-1003', 'Malmö', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtj8ynaz000wu07dsxeopbn3', 'cmtj8ynaj000lu07dmx1v38h5', 'AV-1004', 'Umeå', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtj8ynb0000xu07d209ig4j3', 'cmtj8ynak000mu07d5v4jt4cl', 'AV-1005', 'Örebro', 'Operativ hundförare inom Avarn Security.', NULL);

--
-- Data for Name: Hide; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Hide" VALUES ('cmtj8yng4004fu07d2k980o8t', 'cmtj8yng3004du07dwlmwjdn4', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtj8yng4004gu07d1gu4gkhy', 'cmtj8yng3004du07dwlmwjdn4', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtj8yng4004hu07de7j0bzx8', 'cmtj8yng3004du07dwlmwjdn4', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtj8yng4004iu07de5t7d4f3', 'cmtj8yng3004du07dwlmwjdn4', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'MISSED', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtj8ynga004ku07d1tx3qatf', 'cmtj8yng9004ju07d6i1yr8kb', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtj8ynga004lu07dvne1ph3m', 'cmtj8yng9004ju07d6i1yr8kb', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtj8ynga004mu07dmbwl59hd', 'cmtj8yng9004ju07d6i1yr8kb', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtj8ynga004nu07da6tpabfw', 'cmtj8yng9004ju07d6i1yr8kb', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtj8ynga004ou07d3tma0b2r', 'cmtj8yng9004ju07d6i1yr8kb', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtj8ynga004pu07d71c9q0m6', 'cmtj8yng9004ju07d6i1yr8kb', 'Gömma 6', 'Under pall', 15, 'SVAR', 'MISSED', 235, NULL, 6);
INSERT INTO public."Hide" VALUES ('cmtj8ynge004ru07dgflannio', 'cmtj8ynge004qu07dksz8rd4x', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtj8ynge004su07d0ui84ex0', 'cmtj8ynge004qu07dksz8rd4x', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtj8ynge004tu07dl545fw2l', 'cmtj8ynge004qu07dksz8rd4x', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'MISSED', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtj8yngj004vu07d5lhnnde9', 'cmtj8yngj004uu07dus6she37', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtj8yngj004wu07dze0nty3u', 'cmtj8yngj004uu07dus6she37', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtj8yngj004xu07dx0gu0y96', 'cmtj8yngj004uu07dus6she37', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtj8yngj004yu07de51qmig1', 'cmtj8yngj004uu07dus6she37', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtj8yngj004zu07d2donb235', 'cmtj8yngj004uu07dus6she37', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtj8yngm0051u07d6plvqc30', 'cmtj8yngm0050u07dzgbj97d5', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtj8yngm0052u07d06deekc5', 'cmtj8yngm0050u07dzgbj97d5', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtj8yngm0053u07dpspkxxyd', 'cmtj8yngm0050u07dzgbj97d5', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtj8yngn0054u07dij166m08', 'cmtj8yngm0050u07dzgbj97d5', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'MISSED', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtj8zu6p003wbq7d76t2v55z', 'cmtj8ztm6003obq7dlnjamv8m', 'Gömma 1', NULL, NULL, NULL, 'FOUND', NULL, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtj8zu6p003xbq7d2a6sf4tj', 'cmtj8ztm6003obq7dlnjamv8m', 'Gömma 2', NULL, NULL, NULL, 'FOUND', NULL, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtj8zu6p003ybq7dk5z1ujb9', 'cmtj8ztm6003obq7dlnjamv8m', 'Gömma 3', NULL, NULL, NULL, 'FOUND', NULL, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtj8zu6p003zbq7d9xi8b6p8', 'cmtj8ztm6003obq7dlnjamv8m', 'Gömma 4', NULL, NULL, NULL, 'FOUND', NULL, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtj8zu6p0040bq7db58duugq', 'cmtj8ztm6003obq7dlnjamv8m', 'Gömma 5', NULL, NULL, NULL, 'FOUND', NULL, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtj8ynf6003hu07d2jod7xim', 'cmtj8ynf5003gu07dtklgi0e8', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtj8ynf6003iu07dpat5k29s', 'cmtj8ynf5003gu07dtklgi0e8', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtj8ynf6003ju07dgs4tjm9s', 'cmtj8ynf5003gu07dtklgi0e8', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtj8ynf6003ku07d4xsmdt73', 'cmtj8ynf5003gu07dtklgi0e8', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtj8ynf6003lu07dt77azw70', 'cmtj8ynf5003gu07dtklgi0e8', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'MISSED', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtj8ynff003nu07dw3s44dn6', 'cmtj8ynfe003mu07dbgg1wutu', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtj8ynff003ou07dgkcsb11j', 'cmtj8ynfe003mu07dbgg1wutu', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtj8ynff003pu07d9tgahwe2', 'cmtj8ynfe003mu07dbgg1wutu', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtj8ynff003qu07dbr33hxys', 'cmtj8ynfe003mu07dbgg1wutu', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtj8ynff003ru07dm3cymvwa', 'cmtj8ynfe003mu07dbgg1wutu', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtj8ynff003su07ddw5rwv5c', 'cmtj8ynfe003mu07dbgg1wutu', 'Gömma 6', 'Under pall', 15, 'SVAR', 'FOUND', 235, NULL, 6);
INSERT INTO public."Hide" VALUES ('cmtj8ynfl003uu07dc96jv0dq', 'cmtj8ynfk003tu07d87sexdp7', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtj8ynfl003vu07d2iyu1ulr', 'cmtj8ynfk003tu07d87sexdp7', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtj8ynfl003wu07dxo6co6go', 'cmtj8ynfk003tu07d87sexdp7', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtj8ynfl003xu07dku3n70y6', 'cmtj8ynfk003tu07d87sexdp7', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'MISSED', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtj8ynfq003zu07dhk6rtjl0', 'cmtj8ynfp003yu07dk1ovd4tt', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtj8ynfq0040u07d62wikt30', 'cmtj8ynfp003yu07dk1ovd4tt', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtj8ynfq0041u07drxek29st', 'cmtj8ynfp003yu07dk1ovd4tt', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtj8ynfq0042u07dd8kn4i87', 'cmtj8ynfp003yu07dk1ovd4tt', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtj8ynfq0043u07dedh9zfhk', 'cmtj8ynfp003yu07dk1ovd4tt', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtj8ynfv0045u07d7knq3ue0', 'cmtj8ynfu0044u07dnjqzbws2', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtj8ynfv0046u07d9u5oxu8x', 'cmtj8ynfu0044u07dnjqzbws2', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtj8ynfv0047u07dex5204x6', 'cmtj8ynfu0044u07dnjqzbws2', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtj8ynfv0048u07dhirzta15', 'cmtj8ynfu0044u07dnjqzbws2', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtj8yng0004au07dzwipnrsn', 'cmtj8ynfz0049u07d2ooa966d', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtj8yng0004bu07dp738g0v3', 'cmtj8ynfz0049u07d2ooa966d', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtj8yng0004cu07dc333ss0y', 'cmtj8ynfz0049u07d2ooa966d', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtj8yng4004eu07dah7j30ld', 'cmtj8yng3004du07dwlmwjdn4', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);

--
-- Data for Name: Indication; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Indication" VALUES ('cmtj8ynkj007ru07docm58v8j', 'cmtj8ynkj007qu07dq5a8t7va', 'Bagageband 3, kolli 18', 'Tydlig och kvarstående markering på resväska.', 'FIND', 'Polis, region Stockholm', 1);
INSERT INTO public."Indication" VALUES ('cmtj8ynkj007su07dzxxspqmx', 'cmtj8ynkj007qu07dq5a8t7va', 'Lastpall vid port 2', 'Markering utan fynd vid kontroll.', 'NO_FIND', NULL, 2);
INSERT INTO public."Indication" VALUES ('cmtj8ynks007vu07d6bzmj2fq', 'cmtj8ynkr007uu07dg1ah1gla', 'Container 9, bakre vänstra hörnet', 'Markering på pallkrage.', 'FIND', 'Tullverket', 1);
INSERT INTO public."Indication" VALUES ('cmtj8zwmc004abq7dbir60hnv', 'cmtj8zvl30045bq7d33ky1gaj', 'Bagageband 1', NULL, 'FIND', NULL, 1);

--
-- Data for Name: InstructorAssignment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."InstructorAssignment" VALUES ('cmtj8ynd90028u07d6ibpzes6', 'cmtj8ynal000nu07d18kw9gk4', 'cmtj8ynbn0016u07d3u3hwdjv', '2026-09-01 22:36:48.717');
INSERT INTO public."InstructorAssignment" VALUES ('cmtj8yndb0029u07d0n81zgw2', 'cmtj8ynal000nu07d18kw9gk4', 'cmtj8ync4001bu07ddo49zc9z', '2026-09-01 22:36:48.719');
INSERT INTO public."InstructorAssignment" VALUES ('cmtj8yndc002au07dv1xh1rq6', 'cmtj8ynal000nu07d18kw9gk4', 'cmtj8yncr001su07dqnv6odwj', '2026-09-01 22:36:48.72');
INSERT INTO public."InstructorAssignment" VALUES ('cmtj8yndd002bu07d3fhnzcb9', 'cmtj8ynal000nu07d18kw9gk4', 'cmtj8ynd80027u07dbrn7t9qd', '2026-09-01 22:36:48.721');
INSERT INTO public."InstructorAssignment" VALUES ('cmtj8yndf002cu07dcoqum80h', 'cmtj8ynal000nu07d18kw9gk4', 'cmtj8ynck001mu07d7sudegib', '2026-09-01 22:36:48.723');
INSERT INTO public."InstructorAssignment" VALUES ('cmtj8yndg002du07dllsk3yeu', 'cmtj8ynan000ou07dfxv1u5pr', 'cmtj8yncf001hu07da81o7ua5', '2026-09-01 22:36:48.724');
INSERT INTO public."InstructorAssignment" VALUES ('cmtj8yndh002eu07deas2owqd', 'cmtj8ynan000ou07dfxv1u5pr', 'cmtj8yncx001xu07db3rvo8za', '2026-09-01 22:36:48.725');
INSERT INTO public."InstructorAssignment" VALUES ('cmtj8yndi002fu07d6ej0o78p', 'cmtj8ynan000ou07dfxv1u5pr', 'cmtj8ynd30022u07doa3e2h33', '2026-09-01 22:36:48.726');

--
-- Data for Name: MediaAsset; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MediaAsset" VALUES ('cmtj8z36e0034bq7dbxnkzi3a', 'IMAGE', 'testbild.png', 'e269e140-226e-4485-9fb1-f5155c311ed3.png', 'image/png', 88, 'cmtj8ynac000hu07dmv8ay4zn', '2026-09-01 22:37:09.206', 'cmtj8ynfp003yu07dk1ovd4tt', NULL, NULL, NULL, NULL);

--
-- Data for Name: Mission; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Mission" VALUES ('cmtj8ynjx007cu07dr5ia35y1', 'UPP-2451', 'Flygplatskontroll', 'Flygplatskontroll', 'cmtj8ynjs0078u07dlbivg3t5', 'Lars Holmberg', '010-109 00 00', '2026-09-04 08:00:00', '2026-09-04 10:00:00', 'Terminal 5, bagagehall', 'Arlanda, Stockholm', 'cmtj8yn9h0002u07dpur0skg3', 'cmtj8yn9s0005u07dcrdgafm9', 'Anmälan i säkerhetskontrollen senast 07:45. ID-handling och förordnande ska medföras. Sök sker i bagagehall och angränsande lastutrymme.', 'ASSIGNED', 'cmtj8ynap000pu07dk68crsqd', '2026-09-01 22:36:48.957');
INSERT INTO public."Mission" VALUES ('cmtj8ynk0007eu07dpz52igab', 'UPP-2452', 'Evenemangssök', 'Evenemangssök', 'cmtj8ynjt0079u07djl0pod5a', 'Nina Ek', '08-500 300 00', '2026-09-05 14:30:00', '2026-09-05 17:30:00', 'Friends Arena, entré C', 'Solna', 'cmtj8yn9h0002u07dpur0skg3', 'cmtj8yn9t0006u07d898ien6b', 'Genomsökning av läktarsektion A–D före publikinsläpp. Klart senast 17:30.', 'ASSIGNED', 'cmtj8ynap000pu07dk68crsqd', '2026-09-01 22:36:48.96');
INSERT INTO public."Mission" VALUES ('cmtj8ynk3007gu07dfm8guu73', 'UPP-2453', 'Lagerkontroll', 'Lagerkontroll', 'cmtj8ynju007au07dayv27t0a', 'Tomas Ek', '08-555 12 00', '2026-09-06 10:00:00', '2026-09-06 14:00:00', 'Lagerväg 12', 'Jordbro, Haninge', 'cmtj8yn9h0002u07dpur0skg3', 'cmtj8yn9v0007u07dtdnd22hi', 'Samordnas med lagerchef på plats. Truckar stoppas under sök.', 'PLANNED', 'cmtj8ynap000pu07dk68crsqd', '2026-09-01 22:36:48.963');
INSERT INTO public."Mission" VALUES ('cmtj8ynk4007hu07d8ydvk6u0', 'UPP-2454', 'Bostadssök', 'Bostadssök', 'cmtj8ynjv007bu07d35xiikev', 'Petra Lund', '018-727 30 00', '2026-09-08 09:30:00', '2026-09-08 12:30:00', 'Gränbyvägen 8', 'Uppsala', 'cmtj8yn9h0002u07dpur0skg3', 'cmtj8yn9s0005u07dcrdgafm9', 'Polis närvarar. Invänta klartecken innan sök påbörjas.', 'PLANNED', 'cmtj8ynap000pu07dk68crsqd', '2026-09-01 22:36:48.964');
INSERT INTO public."Mission" VALUES ('cmtj8ynk6007iu07dv28o1jit', 'UPP-2448', 'Objektsbevakning hamnen', 'Objektsbevakning', 'cmtj8ynju007au07dayv27t0a', 'Tomas Ek', '031-555 00 12', '2026-09-07 20:00:00', '2026-09-08 02:00:00', 'Skandiahamnen, port 4', 'Göteborg', 'cmtj8yn9i0003u07d7grp4r4p', 'cmtj8yn9t0006u07d898ien6b', 'Nattpass. Rapportering till larmcentral varannan timme.', 'ASSIGNED', 'cmtj8ynap000pu07dk68crsqd', '2026-09-01 22:36:48.966');
INSERT INTO public."Mission" VALUES ('cmtj8ynk9007ku07dimeqwyna', 'UPP-2431', 'Flygplatskontroll', 'Flygplatskontroll', 'cmtj8ynjs0078u07dlbivg3t5', 'Lars Holmberg', '010-109 00 00', '2026-08-22 08:00:00', '2026-08-22 10:00:00', 'Terminal 5, bagagehall', 'Arlanda, Stockholm', 'cmtj8yn9h0002u07dpur0skg3', 'cmtj8yn9s0005u07dcrdgafm9', 'Rutinkontroll enligt avtal.', 'COMPLETED', 'cmtj8ynap000pu07dk68crsqd', '2026-09-01 22:36:48.969');
INSERT INTO public."Mission" VALUES ('cmtj8ynkc007mu07dsmalw6zu', 'UPP-2427', 'Lagerkontroll', 'Lagerkontroll', 'cmtj8ynju007au07dayv27t0a', 'Tomas Ek', '08-555 12 00', '2026-08-15 13:00:00', '2026-08-15 16:00:00', 'Lagerväg 12', 'Jordbro, Haninge', 'cmtj8yn9h0002u07dpur0skg3', 'cmtj8yn9v0007u07dtdnd22hi', 'Kvartalskontroll.', 'COMPLETED', 'cmtj8ynap000pu07dk68crsqd', '2026-09-01 22:36:48.972');
INSERT INTO public."Mission" VALUES ('cmtj8ynke007ou07dz17u9oia', 'UPP-2422', 'Godskontroll', 'Lagerkontroll', 'cmtj8ynju007au07dayv27t0a', 'Tomas Ek', '040-555 00 20', '2026-08-11 09:00:00', '2026-08-11 13:00:00', 'Terminalgatan 3', 'Malmö', 'cmtj8yn9j0004u07dgknx28o4', 'cmtj8yn9v0007u07dtdnd22hi', 'Sök av inkommande gods från hamnen.', 'COMPLETED', 'cmtj8ynap000pu07dk68crsqd', '2026-09-01 22:36:48.974');

--
-- Data for Name: MissionAssignment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MissionAssignment" VALUES ('cmtj8ynk2007fu07dwfdrl1gs', 'cmtj8ynk0007eu07dpz52igab', 'cmtj8ynbn0016u07d3u3hwdjv', 'cmtj8ynap000pu07dk68crsqd', 'OFFERED', NULL, NULL, '2026-09-01 22:36:48.962');
INSERT INTO public."MissionAssignment" VALUES ('cmtj8ynk8007ju07dsks997wr', 'cmtj8ynk6007iu07dv28o1jit', 'cmtj8yncf001hu07da81o7ua5', 'cmtj8ynap000pu07dk68crsqd', 'ACCEPTED', NULL, '2026-09-06 16:00:00', '2026-09-01 22:36:48.968');
INSERT INTO public."MissionAssignment" VALUES ('cmtj8ynka007lu07dhm9e97nn', 'cmtj8ynk9007ku07dimeqwyna', 'cmtj8ynbn0016u07d3u3hwdjv', 'cmtj8ynap000pu07dk68crsqd', 'COMPLETED', NULL, '2026-08-21 16:00:00', '2026-09-01 22:36:48.97');
INSERT INTO public."MissionAssignment" VALUES ('cmtj8ynkd007nu07dt0ks4fms', 'cmtj8ynkc007mu07dsmalw6zu', 'cmtj8ync4001bu07ddo49zc9z', 'cmtj8ynap000pu07dk68crsqd', 'COMPLETED', NULL, '2026-08-14 16:00:00', '2026-09-01 22:36:48.973');
INSERT INTO public."MissionAssignment" VALUES ('cmtj8ynkf007pu07d2dgut8cu', 'cmtj8ynke007ou07dz17u9oia', 'cmtj8ynck001mu07d7sudegib', 'cmtj8ynap000pu07dk68crsqd', 'COMPLETED', NULL, '2026-08-10 16:00:00', '2026-09-01 22:36:48.975');
INSERT INTO public."MissionAssignment" VALUES ('cmtj8ynjz007du07d2loj2nt3', 'cmtj8ynjx007cu07dr5ia35y1', 'cmtj8ynbn0016u07d3u3hwdjv', 'cmtj8ynap000pu07dk68crsqd', 'COMPLETED', NULL, '2026-09-03 16:00:00', '2026-09-01 22:36:48.959');

--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Notification" VALUES ('cmtj8ynky007yu07dkg3ovmhe', 'cmtj8ynac000hu07dmv8ay4zn', 'MISSION_ASSIGNED', 'Nytt uppdrag: Evenemangssök', 'Friends Arena, Solna – 14:30. Svara ja eller nej i uppdragsvyn.', '/uppdrag/cmtj8ynk0007eu07dpz52igab', NULL, '2026-08-31 15:20:00');
INSERT INTO public."Notification" VALUES ('cmtj8ynkz007zu07dm85qcucw', 'cmtj8ynac000hu07dmv8ay4zn', 'COMMENT', 'Anna Karlsson kommenterade din träning', 'Bra jobbat! Fortsätt nöta på uthålligheten.', '/traning/cmtj8ynf5003gu07dtklgi0e8', NULL, '2026-08-24 09:15:00');
INSERT INTO public."Notification" VALUES ('cmtj8ynkz0080u07dhvtin3ya', 'cmtj8ynac000hu07dmv8ay4zn', 'FOLLOW_UP', 'Kallelse till uppföljning', 'Anna Karlsson vill följa upp höga gömmor.', '/traning', NULL, '2026-08-30 10:00:00');
INSERT INTO public."Notification" VALUES ('cmtj8ynl10081u07dmvnikeaf', 'cmtj8ynac000hu07dmv8ay4zn', 'SESSION_APPROVED', 'Träning godkänd', 'Områdessök – Skog, Tyresta är godkänt.', '/traning/cmtj8ynf5003gu07dtklgi0e8', '2026-08-25 08:00:00', '2026-08-24 12:00:00');
INSERT INTO public."Notification" VALUES ('cmtj8ynl20082u07d5ovwc39o', 'cmtj8ynag000ju07dhecd45ly', 'CERT_EXPIRING', 'Behörighet löper ut', 'Auktoriserat ekipage för Balder går ut om 2 dagar.', '/certifikat', NULL, '2026-08-31 07:00:00');
INSERT INTO public."Notification" VALUES ('cmtj8ynl20083u07dfuvgsz7f', 'cmtj8ynal000nu07d18kw9gk4', 'COMMENT', 'Nytt träningspass att granska', 'Erik Andersson har skickat in Fordonssök – Fordon.', '/instruktor', NULL, '2026-08-29 18:40:00');
INSERT INTO public."Notification" VALUES ('cmtj8ynl30084u07d15x921a4', 'cmtj8ynap000pu07dk68crsqd', 'COMMENT', 'Ny rapport inskickad', 'Sofie Holm har skickat in rapport för UPP-2422.', '/rapporter', NULL, '2026-08-11 13:15:00');
INSERT INTO public."Notification" VALUES ('cmtj8zwmf004cbq7d4rsyampn', 'cmtj8ynap000pu07dk68crsqd', 'COMMENT', 'Rapport för UPP-2451', 'Erik Andersson har skickat in en operativ rapport.', '/rapporter/cmtj8zvl30045bq7d33ky1gaj', NULL, '2026-09-01 22:37:47.367');
INSERT INTO public."Notification" VALUES ('cmtj8zu6s0042bq7d7igfde01', 'cmtj8ynal000nu07d18kw9gk4', 'COMMENT', 'Träningspass att granska', 'Erik Andersson har skickat in Områdessök – Skog.', '/traning/cmtj8ztm6003obq7dlnjamv8m', NULL, '2026-09-01 22:37:44.212');

--
-- Data for Name: OperationalReport; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."OperationalReport" VALUES ('cmtj8ynkj007qu07dq5a8t7va', 'cmtj8ynk9007ku07dimeqwyna', 'cmtj8ynbn0016u07d3u3hwdjv', 'cmtj8ynac000hu07dmv8ay4zn', 'Terminal 5, bagagehall samt angränsande lastutrymme.', '1 paket – Narkotika (Cannabis), cirka 400 gram.', 'Inga', 'Överlämnat till polis på plats. Kvitto nummer 41221 erhållet.', '2026-08-22 08:00:00', '2026-08-22 10:20:00', 'APPROVED', '2026-08-22 11:00:00', 'cmtj8ynap000pu07dk68crsqd', '2026-08-23 09:30:00', '2026-08-22 10:45:00', '2026-09-01 22:36:48.979');
INSERT INTO public."OperationalReport" VALUES ('cmtj8ynko007tu07dvar8k3ui', 'cmtj8ynkc007mu07dsmalw6zu', 'cmtj8ync4001bu07ddo49zc9z', 'cmtj8ynac000hu07dmv8ay4zn', 'Lagerhall A och B, samtliga ställage samt lastkaj.', 'Inga fynd.', 'Port 4 gick inte att öppna, avsnittet kunde inte genomsökas.', 'Avvikelsen rapporterad till lagerchef Tomas Ek.', '2026-08-15 13:00:00', '2026-08-15 15:45:00', 'APPROVED', '2026-08-15 16:30:00', 'cmtj8ynap000pu07dk68crsqd', '2026-08-16 08:15:00', '2026-08-15 16:20:00', '2026-09-01 22:36:48.984');
INSERT INTO public."OperationalReport" VALUES ('cmtj8ynkr007uu07dg1ah1gla', 'cmtj8ynke007ou07dz17u9oia', 'cmtj8ynck001mu07d7sudegib', 'cmtj8ynah000ku07d5vl6a5h8', 'Inkommande gods, container 1–14.', '1 fynd – misstänkt narkotika i container 9.', 'Inga', 'Godset avskilt och överlämnat till Tullverket.', '2026-08-11 09:00:00', '2026-08-11 12:30:00', 'SUBMITTED', '2026-08-11 13:10:00', NULL, NULL, '2026-08-11 12:55:00', '2026-09-01 22:36:48.987');
INSERT INTO public."OperationalReport" VALUES ('cmtj8zvl30045bq7d33ky1gaj', 'cmtj8ynjx007cu07dr5ia35y1', 'cmtj8ynbn0016u07d3u3hwdjv', 'cmtj8ynac000hu07dmv8ay4zn', NULL, 'Inga fynd. Söket avslutat.', NULL, NULL, '2026-09-04 08:00:00', '2026-09-04 10:00:00', 'SUBMITTED', '2026-09-01 22:37:47.36', NULL, NULL, '2026-09-01 22:37:46.023', '2026-09-01 22:37:47.361');

--
-- Data for Name: PlannedExercise; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."PlannedExercise" VALUES ('cmtj8yner003bu07dlagpxc0t', 'cmtj8yneq0039u07df0yp9fa8', 'Höga gömmor i lagermiljö', 'Placera gömmor på 150–220 cm. Belöna först vid tydlig och kvarstående markering.', 'cmtj8yn9x0008u07dztpicg9s', 'Narkotika', 'Lagerlokal', '2026-09-14 08:00:00', 2, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtj8yner003cu07dht4voayl', 'cmtj8yneq0039u07df0yp9fa8', 'Fordonssök under tidspress', 'Sex fordon, max 12 minuter totalt. Syftet är att hålla noggrannheten uppe när tempot ökar.', 'cmtj8yn9v0007u07dtdnd22hi', 'Narkotika', 'Fordon', '2026-09-21 08:00:00', 3, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtj8yney003eu07df8f5j3ds', 'cmtj8ynex003du07dnyyblmdo', 'Vinkelspår 600 meter', 'Tre räta vinklar, 45 minuter gammalt spår.', 'cmtj8yn9s0005u07dcrdgafm9', 'Människa', 'Stadsmiljö', '2026-09-05 08:00:00', 1, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtj8yney003fu07dsjb60bv5', 'cmtj8ynex003du07dnyyblmdo', 'Ytsök öppen mark 30 minuter', 'Två figuranter, växlande vindriktning.', 'cmtj8yn9t0006u07d898ien6b', 'Människa', 'Öppen mark', '2026-09-12 08:00:00', 2, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtj8yner003au07d2b1pls7b', 'cmtj8yneq0039u07df0yp9fa8', 'Områdessök 45 minuter i kuperad skog', 'Två pass om 45 minuter med minst fem gömmor. Fokus på systematiskt sökmönster och att hunden håller tempot hela passet.', 'cmtj8yn9x0008u07dztpicg9s', 'Narkotika', 'Skog', '2026-09-07 08:00:00', 1, 'COMPLETED');

--
-- Data for Name: Region; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Region" VALUES ('cmtj8yn9a0000u07d9gi9k3fp', 'NORD', 'Region Nord', 1);
INSERT INTO public."Region" VALUES ('cmtj8yn9f0001u07dpq3et0ty', 'MITT', 'Region Mitt', 2);
INSERT INTO public."Region" VALUES ('cmtj8yn9h0002u07dpur0skg3', 'OST', 'Region Öst', 3);
INSERT INTO public."Region" VALUES ('cmtj8yn9i0003u07d7grp4r4p', 'VAST', 'Region Väst', 4);
INSERT INTO public."Region" VALUES ('cmtj8yn9j0004u07dgknx28o4', 'SYD', 'Region Syd', 5);

--
-- Data for Name: SearchDiscipline; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."SearchDiscipline" VALUES ('cmtj8yn9s0005u07dcrdgafm9', 'SPAR', 'Spårsök', 'SÖK – SPÅR', 'Spårsök efter person eller föremål.', 1);
INSERT INTO public."SearchDiscipline" VALUES ('cmtj8yn9t0006u07d898ien6b', 'YTA', 'Ytsök', 'SÖK – YTA', 'Ytsök över öppna och bebyggda områden.', 2);
INSERT INTO public."SearchDiscipline" VALUES ('cmtj8yn9v0007u07dtdnd22hi', 'GODS', 'Godssök', 'SÖK – GODS', 'Sök i gods, bagage och fordon.', 3);
INSERT INTO public."SearchDiscipline" VALUES ('cmtj8yn9x0008u07dztpicg9s', 'NARKOTIKA', 'Narkotika', 'NARKOTIKA', 'Sök efter narkotiska preparat.', 4);
INSERT INTO public."SearchDiscipline" VALUES ('cmtj8yn9y0009u07d3v33bp41', 'SPRANG', 'Sprängämnen', 'SPRÄNGÄMNEN', 'Sök efter explosiva ämnen.', 5);
INSERT INTO public."SearchDiscipline" VALUES ('cmtj8yn9z000au07dglt6r36o', 'VAPEN', 'Vapen', 'VAPEN', 'Sök efter vapen och ammunition.', 6);

--
-- Data for Name: Setting; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Team; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Team" VALUES ('cmtj8ynbn0016u07d3u3hwdjv', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynbi000yu07dohnvkyln', 'cmtj8yn9h0002u07dpur0skg3', '2024-06-23 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtj8ync4001bu07ddo49zc9z', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynbv0017u07dtympcyyt', 'cmtj8yn9h0002u07dpur0skg3', '2023-05-20 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtj8yncf001hu07da81o7ua5', 'cmtj8ynag000ju07dhecd45ly', 'cmtj8yncb001cu07dp3dv9xj8', 'cmtj8yn9i0003u07d7grp4r4p', '2023-12-06 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtj8ynck001mu07d7sudegib', 'cmtj8ynah000ku07d5vl6a5h8', 'cmtj8ynch001iu07dhaaeawbs', 'cmtj8yn9j0004u07dgknx28o4', '2025-01-09 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtj8yncr001su07dqnv6odwj', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynco001nu07dixx3utd2', 'cmtj8yn9h0002u07dpur0skg3', '2022-11-01 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtj8yncx001xu07db3rvo8za', 'cmtj8ynaj000lu07dmx1v38h5', 'cmtj8yncu001tu07dfs6zpqs1', 'cmtj8yn9a0000u07d9gi9k3fp', '2025-07-28 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtj8ynd30022u07doa3e2h33', 'cmtj8ynak000mu07d5v4jt4cl', 'cmtj8ynd0001yu07d4toismn9', 'cmtj8yn9f0001u07dpq3et0ty', '2022-04-15 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtj8ynd80027u07dbrn7t9qd', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynd50023u07dr76t1h7d', 'cmtj8yn9h0002u07dpur0skg3', '2024-06-23 08:00:00', NULL, 'ACTIVE');

--
-- Data for Name: TeamAvailability; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TeamAvailability" VALUES ('cmtj8yndj002gu07ds18ty48t', 'cmtj8ynbn0016u07d3u3hwdjv', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtj8yndk002hu07dyjwf18ux', 'cmtj8ync4001bu07ddo49zc9z', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtj8yndm002iu07dangdang0', 'cmtj8yncf001hu07da81o7ua5', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtj8yndn002ju07d69yivt7b', 'cmtj8ynck001mu07d7sudegib', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtj8yndn002ku07dfo4dxuva', 'cmtj8yncr001su07dqnv6odwj', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtj8yndo002lu07d1voph473', 'cmtj8yncx001xu07db3rvo8za', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtj8yndq002mu07dhrjlu58u', 'cmtj8ynd30022u07doa3e2h33', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtj8yndr002nu07deocfsqei', 'cmtj8ynd80027u07dbrn7t9qd', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtj8ynds002ou07dn2d8s583', 'cmtj8ynd30022u07doa3e2h33', '2026-09-03 00:00:00', '2026-09-10 23:00:00', 'UNAVAILABLE', 'Semester');

--
-- Data for Name: TrainingPlan; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TrainingPlan" VALUES ('cmtj8yneq0039u07df0yp9fa8', 'cmtj8ynbn0016u07d3u3hwdjv', 'cmtj8ynal000nu07d18kw9gk4', 'Uthållighet i svår terräng', 'Bygga uthållighet över längre sök och stabilisera markering vid stenrösen och rotvältor.', '2026-08-11 08:00:00', '2026-10-06 08:00:00', 'ACTIVE', '2026-09-01 22:36:48.77');
INSERT INTO public."TrainingPlan" VALUES ('cmtj8ynex003du07dnyyblmdo', 'cmtj8yncf001hu07da81o7ua5', 'cmtj8ynan000ou07dfxv1u5pr', 'Spårsäkerhet på hårt underlag', 'Öka spårsäkerheten på asfalt och grus samt vid vinkelspår.', '2026-08-18 08:00:00', '2026-10-13 08:00:00', 'ACTIVE', '2026-09-01 22:36:48.777');

--
-- Data for Name: TrainingSession; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TrainingSession" VALUES ('cmtj8yniv006ou07d712m4jz6', 'cmtj8ynd30022u07doa3e2h33', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynak000mu07d5v4jt4cl', 'cmtj8ynan000ou07dfxv1u5pr', '2026-07-14 12:00:00', '2026-09-01 22:36:48.919', '2026-09-01 22:36:48.919');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yniw006pu07daqlauilu', 'cmtj8ynd30022u07doa3e2h33', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynak000mu07d5v4jt4cl', 'cmtj8ynan000ou07dfxv1u5pr', '2026-07-01 12:00:00', '2026-09-01 22:36:48.92', '2026-09-01 22:36:48.92');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynix006qu07dcmry9dxk', 'cmtj8ynd30022u07doa3e2h33', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynak000mu07d5v4jt4cl', 'cmtj8ynan000ou07dfxv1u5pr', '2026-06-15 12:00:00', '2026-09-01 22:36:48.921', '2026-09-01 22:36:48.921');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yniz006ru07dnajg0855', 'cmtj8ynd30022u07doa3e2h33', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynak000mu07d5v4jt4cl', 'cmtj8ynan000ou07dfxv1u5pr', '2026-06-02 12:00:00', '2026-09-01 22:36:48.923', '2026-09-01 22:36:48.923');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynj0006su07d6r32awsq', 'cmtj8ynd30022u07doa3e2h33', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynak000mu07d5v4jt4cl', 'cmtj8ynan000ou07dfxv1u5pr', '2026-05-20 12:00:00', '2026-09-01 22:36:48.924', '2026-09-01 22:36:48.924');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynj1006tu07dp58l83oo', 'cmtj8ynd30022u07doa3e2h33', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynak000mu07d5v4jt4cl', 'cmtj8ynan000ou07dfxv1u5pr', '2026-05-04 12:00:00', '2026-09-01 22:36:48.925', '2026-09-01 22:36:48.925');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynj3006uu07dap17rwet', 'cmtj8ynd30022u07doa3e2h33', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynak000mu07d5v4jt4cl', 'cmtj8ynan000ou07dfxv1u5pr', '2026-04-21 12:00:00', '2026-09-01 22:36:48.927', '2026-09-01 22:36:48.927');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynj4006vu07dqg9d9dwf', 'cmtj8ynd30022u07doa3e2h33', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynak000mu07d5v4jt4cl', 'cmtj8ynan000ou07dfxv1u5pr', '2026-04-08 12:00:00', '2026-09-01 22:36:48.928', '2026-09-01 22:36:48.928');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynj5006wu07di9az0ytr', 'cmtj8ynd80027u07dbrn7t9qd', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-27 12:00:00', '2026-09-01 22:36:48.929', '2026-09-01 22:36:48.929');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynj7006xu07dj38iykbo', 'cmtj8ynd80027u07dbrn7t9qd', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-14 12:00:00', '2026-09-01 22:36:48.931', '2026-09-01 22:36:48.931');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynj8006yu07d6pwigj1p', 'cmtj8ynd80027u07dbrn7t9qd', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-01 12:00:00', '2026-09-01 22:36:48.932', '2026-09-01 22:36:48.932');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynja006zu07dinh48hu3', 'cmtj8ynd80027u07dbrn7t9qd', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-06-15 12:00:00', '2026-09-01 22:36:48.934', '2026-09-01 22:36:48.934');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynjb0070u07dqb1b2vfa', 'cmtj8ynd80027u07dbrn7t9qd', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-06-02 12:00:00', '2026-09-01 22:36:48.935', '2026-09-01 22:36:48.935');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynjd0071u07dtf4lkzvd', 'cmtj8ynd80027u07dbrn7t9qd', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-05-20 12:00:00', '2026-09-01 22:36:48.937', '2026-09-01 22:36:48.937');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynje0072u07diai9hj5k', 'cmtj8ynd80027u07dbrn7t9qd', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-05-04 12:00:00', '2026-09-01 22:36:48.938', '2026-09-01 22:36:48.938');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynjg0073u07dp8r1l5av', 'cmtj8ynd80027u07dbrn7t9qd', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-04-21 12:00:00', '2026-09-01 22:36:48.94', '2026-09-01 22:36:48.94');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynjh0074u07dxspcdo3a', 'cmtj8ynd80027u07dbrn7t9qd', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-04-08 12:00:00', '2026-09-01 22:36:48.941', '2026-09-01 22:36:48.941');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynf5003gu07dtklgi0e8', 'cmtj8ynbn0016u07d3u3hwdjv', 'cmtj8yner003au07d2b1pls7b', '2026-08-23 09:00:00', '2026-08-23 11:15:00', 'Tyresta, Stockholm', 'Områdessök', 'Skog', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 4, 'Bra genomförande. Stabilt sök i svår terräng. Missade en gömma vid stenröse.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-08-24 12:00:00', '2026-09-01 22:36:48.785', '2026-09-01 22:36:48.946');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynfe003mu07dbgg1wutu', 'cmtj8ynbn0016u07d3u3hwdjv', NULL, '2026-08-16 13:30:00', '2026-08-16 15:00:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 6, 6, 'Felfritt pass. Hög arbetsglädje genom hela söket.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-08-17 12:00:00', '2026-09-01 22:36:48.794', '2026-09-01 22:36:48.794');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynfk003tu07d87sexdp7', 'cmtj8ynbn0016u07d3u3hwdjv', NULL, '2026-08-09 08:00:00', '2026-08-09 09:45:00', 'Arlanda, hangar 4', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtj8yn9y0009u07d3v33bp41', 4, 3, 'Tveksam vid höga gömmor. Behöver mer träning över 180 cm.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-08-10 12:00:00', '2026-09-01 22:36:48.8', '2026-09-01 22:36:48.8');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynfp003yu07dk1ovd4tt', 'cmtj8ynbn0016u07d3u3hwdjv', NULL, '2026-08-29 17:00:00', '2026-08-29 18:30:00', 'Farsta industriområde', 'Fordonssök', 'Fordon', 'Narkotika', 'cmtj8yn9v0007u07dtdnd22hi', 5, 5, 'Snabbt och rent sök på sex fordon.', 'SUBMITTED', 'cmtj8ynac000hu07dmv8ay4zn', NULL, NULL, '2026-09-01 22:36:48.805', '2026-09-01 22:36:48.805');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynfu0044u07dnjqzbws2', 'cmtj8ync4001bu07ddo49zc9z', NULL, '2026-08-27 10:00:00', '2026-08-27 11:30:00', 'Södertälje hamn', 'Bagagesök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9v0007u07dtdnd22hi', 4, 4, 'Stabilt. Rex arbetar lugnt och metodiskt.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-08-28 12:00:00', '2026-09-01 22:36:48.81', '2026-09-01 22:36:48.81');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynfz0049u07d2ooa966d', 'cmtj8yncf001hu07da81o7ua5', NULL, '2026-08-30 07:30:00', '2026-08-30 09:00:00', 'Slottsskogen, Göteborg', 'Spårarbete', 'Öppen mark', 'Människa', 'cmtj8yn9s0005u07dcrdgafm9', 3, 3, 'Höll spåret genom samtliga vinklar.', 'SUBMITTED', 'cmtj8ynag000ju07dhecd45ly', NULL, NULL, '2026-09-01 22:36:48.815', '2026-09-01 22:36:48.815');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yng3004du07dwlmwjdn4', 'cmtj8ynck001mu07d7sudegib', NULL, '2026-08-28 14:00:00', '2026-08-28 15:30:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 4, 'En falsk markering vid tomt kolli.', 'APPROVED', 'cmtj8ynah000ku07d5vl6a5h8', 'cmtj8ynal000nu07d18kw9gk4', '2026-08-29 12:00:00', '2026-09-01 22:36:48.819', '2026-09-01 22:36:48.819');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yng9004ju07d6i1yr8kb', 'cmtj8yncr001su07dqnv6odwj', NULL, '2026-08-26 09:00:00', '2026-08-26 10:45:00', 'Arlanda terminal 5', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtj8yn9y0009u07d3v33bp41', 6, 5, 'Bra tempo, tappade fokus mot slutet av passet.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-08-27 12:00:00', '2026-09-01 22:36:48.825', '2026-09-01 22:36:48.825');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynge004qu07dksz8rd4x', 'cmtj8yncx001xu07db3rvo8za', NULL, '2026-08-24 11:00:00', '2026-08-24 12:15:00', 'Umeå, Nydalaområdet', 'Områdessök', 'Skog', 'Människa', 'cmtj8yn9t0006u07d898ien6b', 3, 2, 'Ung hund, behöver kortare pass tills uthålligheten byggts upp.', 'APPROVED', 'cmtj8ynaj000lu07dmx1v38h5', 'cmtj8ynan000ou07dfxv1u5pr', '2026-08-25 12:00:00', '2026-09-01 22:36:48.83', '2026-09-01 22:36:48.83');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yngj004uu07dus6she37', 'cmtj8ynd30022u07doa3e2h33', NULL, '2026-08-20 08:30:00', '2026-08-20 10:00:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 5, 'Rutinerat och effektivt.', 'APPROVED', 'cmtj8ynak000mu07d5v4jt4cl', 'cmtj8ynan000ou07dfxv1u5pr', '2026-08-21 12:00:00', '2026-09-01 22:36:48.835', '2026-09-01 22:36:48.835');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yngm0050u07dzgbj97d5', 'cmtj8ynd80027u07dbrn7t9qd', NULL, '2026-08-25 15:00:00', '2026-08-25 16:20:00', 'Södertälje, Ronna', 'Personsök', 'Stadsmiljö', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 4, 3, 'Störningsträning i folkvimmel. God kontakt med föraren.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-08-26 12:00:00', '2026-09-01 22:36:48.838', '2026-09-01 22:36:48.838');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yngp0055u07dz94gjq0m', 'cmtj8ynbn0016u07d3u3hwdjv', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-27 12:00:00', '2026-09-01 22:36:48.841', '2026-09-01 22:36:48.841');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yngu0056u07do2q6tkq3', 'cmtj8ynbn0016u07d3u3hwdjv', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-14 12:00:00', '2026-09-01 22:36:48.846', '2026-09-01 22:36:48.846');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yngx0057u07de8ccldjo', 'cmtj8ynbn0016u07d3u3hwdjv', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-01 12:00:00', '2026-09-01 22:36:48.849', '2026-09-01 22:36:48.849');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yngy0058u07dhw9fjhat', 'cmtj8ynbn0016u07d3u3hwdjv', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-06-15 12:00:00', '2026-09-01 22:36:48.85', '2026-09-01 22:36:48.85');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yngz0059u07dri4f0ynf', 'cmtj8ynbn0016u07d3u3hwdjv', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-06-02 12:00:00', '2026-09-01 22:36:48.851', '2026-09-01 22:36:48.851');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynh0005au07dru5sljw9', 'cmtj8ynbn0016u07d3u3hwdjv', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-05-20 12:00:00', '2026-09-01 22:36:48.852', '2026-09-01 22:36:48.852');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynh2005bu07dwhhhvq0d', 'cmtj8ynbn0016u07d3u3hwdjv', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-05-04 12:00:00', '2026-09-01 22:36:48.854', '2026-09-01 22:36:48.854');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynh4005cu07d11d5pxcf', 'cmtj8ynbn0016u07d3u3hwdjv', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-04-21 12:00:00', '2026-09-01 22:36:48.856', '2026-09-01 22:36:48.856');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynh5005du07dvpc5gfvs', 'cmtj8ynbn0016u07d3u3hwdjv', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-04-08 12:00:00', '2026-09-01 22:36:48.857', '2026-09-01 22:36:48.857');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynh6005eu07dczq200rp', 'cmtj8ync4001bu07ddo49zc9z', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9v0007u07dtdnd22hi', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-27 12:00:00', '2026-09-01 22:36:48.858', '2026-09-01 22:36:48.858');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynh7005fu07d8e7psc33', 'cmtj8ync4001bu07ddo49zc9z', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9v0007u07dtdnd22hi', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-14 12:00:00', '2026-09-01 22:36:48.859', '2026-09-01 22:36:48.859');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynh8005gu07df8r6l7a9', 'cmtj8ync4001bu07ddo49zc9z', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9v0007u07dtdnd22hi', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-01 12:00:00', '2026-09-01 22:36:48.86', '2026-09-01 22:36:48.86');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynha005hu07d8yelv7yg', 'cmtj8ync4001bu07ddo49zc9z', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9v0007u07dtdnd22hi', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-06-15 12:00:00', '2026-09-01 22:36:48.862', '2026-09-01 22:36:48.862');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhb005iu07dlqyz05jz', 'cmtj8ync4001bu07ddo49zc9z', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9v0007u07dtdnd22hi', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-06-02 12:00:00', '2026-09-01 22:36:48.863', '2026-09-01 22:36:48.863');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ztm6003obq7dlnjamv8m', 'cmtj8ynbn0016u07d3u3hwdjv', NULL, '2026-09-01 22:00:00', '2026-09-02 22:00:00', 'Rättad plats', 'Områdessök', 'Skog', 'Narkotika', NULL, 5, 5, NULL, 'SUBMITTED', 'cmtj8ynac000hu07dmv8ay4zn', NULL, NULL, '2026-09-01 22:37:43.47', '2026-09-01 22:37:44.203');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhd005ju07dkojptevz', 'cmtj8ync4001bu07ddo49zc9z', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9v0007u07dtdnd22hi', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-05-20 12:00:00', '2026-09-01 22:36:48.865', '2026-09-01 22:36:48.865');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhe005ku07d5amochry', 'cmtj8ync4001bu07ddo49zc9z', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9v0007u07dtdnd22hi', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-05-04 12:00:00', '2026-09-01 22:36:48.866', '2026-09-01 22:36:48.866');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhf005lu07d255xnh2r', 'cmtj8ync4001bu07ddo49zc9z', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9v0007u07dtdnd22hi', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-04-21 12:00:00', '2026-09-01 22:36:48.867', '2026-09-01 22:36:48.867');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhh005mu07dbx9egwuc', 'cmtj8ync4001bu07ddo49zc9z', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9v0007u07dtdnd22hi', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynac000hu07dmv8ay4zn', 'cmtj8ynal000nu07d18kw9gk4', '2026-04-08 12:00:00', '2026-09-01 22:36:48.869', '2026-09-01 22:36:48.869');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhi005nu07dkrzqkg5u', 'cmtj8yncf001hu07da81o7ua5', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtj8yn9s0005u07dcrdgafm9', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynag000ju07dhecd45ly', 'cmtj8ynan000ou07dfxv1u5pr', '2026-07-27 12:00:00', '2026-09-01 22:36:48.87', '2026-09-01 22:36:48.87');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhj005ou07doptqh0sz', 'cmtj8yncf001hu07da81o7ua5', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Människa', 'cmtj8yn9s0005u07dcrdgafm9', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynag000ju07dhecd45ly', 'cmtj8ynan000ou07dfxv1u5pr', '2026-07-14 12:00:00', '2026-09-01 22:36:48.871', '2026-09-01 22:36:48.871');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhk005pu07diktq2me8', 'cmtj8yncf001hu07da81o7ua5', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtj8yn9s0005u07dcrdgafm9', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynag000ju07dhecd45ly', 'cmtj8ynan000ou07dfxv1u5pr', '2026-07-01 12:00:00', '2026-09-01 22:36:48.872', '2026-09-01 22:36:48.872');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhm005qu07d8w1zrfgq', 'cmtj8yncf001hu07da81o7ua5', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtj8yn9s0005u07dcrdgafm9', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynag000ju07dhecd45ly', 'cmtj8ynan000ou07dfxv1u5pr', '2026-06-15 12:00:00', '2026-09-01 22:36:48.874', '2026-09-01 22:36:48.874');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhn005ru07d6ux0tkb3', 'cmtj8yncf001hu07da81o7ua5', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtj8yn9s0005u07dcrdgafm9', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynag000ju07dhecd45ly', 'cmtj8ynan000ou07dfxv1u5pr', '2026-06-02 12:00:00', '2026-09-01 22:36:48.875', '2026-09-01 22:36:48.875');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhp005su07daydc4o31', 'cmtj8yncf001hu07da81o7ua5', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtj8yn9s0005u07dcrdgafm9', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynag000ju07dhecd45ly', 'cmtj8ynan000ou07dfxv1u5pr', '2026-05-20 12:00:00', '2026-09-01 22:36:48.877', '2026-09-01 22:36:48.877');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhq005tu07dlhhtdfme', 'cmtj8yncf001hu07da81o7ua5', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtj8yn9s0005u07dcrdgafm9', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynag000ju07dhecd45ly', 'cmtj8ynan000ou07dfxv1u5pr', '2026-05-04 12:00:00', '2026-09-01 22:36:48.878', '2026-09-01 22:36:48.878');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhs005uu07dlpbuys39', 'cmtj8yncf001hu07da81o7ua5', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Människa', 'cmtj8yn9s0005u07dcrdgafm9', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynag000ju07dhecd45ly', 'cmtj8ynan000ou07dfxv1u5pr', '2026-04-21 12:00:00', '2026-09-01 22:36:48.88', '2026-09-01 22:36:48.88');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynht005vu07dngmcn06e', 'cmtj8yncf001hu07da81o7ua5', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtj8yn9s0005u07dcrdgafm9', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynag000ju07dhecd45ly', 'cmtj8ynan000ou07dfxv1u5pr', '2026-04-08 12:00:00', '2026-09-01 22:36:48.881', '2026-09-01 22:36:48.881');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhv005wu07dyrp10sn1', 'cmtj8ynck001mu07d7sudegib', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynah000ku07d5vl6a5h8', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-27 12:00:00', '2026-09-01 22:36:48.883', '2026-09-01 22:36:48.883');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhw005xu07dzgi7xd0h', 'cmtj8ynck001mu07d7sudegib', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynah000ku07d5vl6a5h8', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-14 12:00:00', '2026-09-01 22:36:48.884', '2026-09-01 22:36:48.884');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhx005yu07ddygl0x5n', 'cmtj8ynck001mu07d7sudegib', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynah000ku07d5vl6a5h8', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-01 12:00:00', '2026-09-01 22:36:48.885', '2026-09-01 22:36:48.885');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynhz005zu07dfeeljuls', 'cmtj8ynck001mu07d7sudegib', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynah000ku07d5vl6a5h8', 'cmtj8ynal000nu07d18kw9gk4', '2026-06-15 12:00:00', '2026-09-01 22:36:48.887', '2026-09-01 22:36:48.887');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yni00060u07dx2y7t2lw', 'cmtj8ynck001mu07d7sudegib', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynah000ku07d5vl6a5h8', 'cmtj8ynal000nu07d18kw9gk4', '2026-06-02 12:00:00', '2026-09-01 22:36:48.888', '2026-09-01 22:36:48.888');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yni20061u07dihr76b47', 'cmtj8ynck001mu07d7sudegib', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynah000ku07d5vl6a5h8', 'cmtj8ynal000nu07d18kw9gk4', '2026-05-20 12:00:00', '2026-09-01 22:36:48.89', '2026-09-01 22:36:48.89');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yni30062u07dbas7css0', 'cmtj8ynck001mu07d7sudegib', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynah000ku07d5vl6a5h8', 'cmtj8ynal000nu07d18kw9gk4', '2026-05-04 12:00:00', '2026-09-01 22:36:48.891', '2026-09-01 22:36:48.891');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yni40063u07d90lltfwf', 'cmtj8ynck001mu07d7sudegib', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynah000ku07d5vl6a5h8', 'cmtj8ynal000nu07d18kw9gk4', '2026-04-21 12:00:00', '2026-09-01 22:36:48.892', '2026-09-01 22:36:48.892');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yni60064u07di6indzzw', 'cmtj8ynck001mu07d7sudegib', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynah000ku07d5vl6a5h8', 'cmtj8ynal000nu07d18kw9gk4', '2026-04-08 12:00:00', '2026-09-01 22:36:48.894', '2026-09-01 22:36:48.894');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yni70065u07dh9ssiuhi', 'cmtj8yncr001su07dqnv6odwj', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtj8yn9y0009u07d3v33bp41', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-27 12:00:00', '2026-09-01 22:36:48.895', '2026-09-01 22:36:48.895');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yni80066u07denrb55km', 'cmtj8yncr001su07dqnv6odwj', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtj8yn9y0009u07d3v33bp41', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-14 12:00:00', '2026-09-01 22:36:48.896', '2026-09-01 22:36:48.896');
INSERT INTO public."TrainingSession" VALUES ('cmtj8yni90067u07dqmy9i9yc', 'cmtj8yncr001su07dqnv6odwj', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtj8yn9y0009u07d3v33bp41', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-07-01 12:00:00', '2026-09-01 22:36:48.897', '2026-09-01 22:36:48.897');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynia0068u07ddlgquay8', 'cmtj8yncr001su07dqnv6odwj', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtj8yn9y0009u07d3v33bp41', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-06-15 12:00:00', '2026-09-01 22:36:48.898', '2026-09-01 22:36:48.898');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynib0069u07d5fk5sovp', 'cmtj8yncr001su07dqnv6odwj', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtj8yn9y0009u07d3v33bp41', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-06-02 12:00:00', '2026-09-01 22:36:48.899', '2026-09-01 22:36:48.899');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynic006au07dq4jac039', 'cmtj8yncr001su07dqnv6odwj', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtj8yn9y0009u07d3v33bp41', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-05-20 12:00:00', '2026-09-01 22:36:48.9', '2026-09-01 22:36:48.9');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynie006bu07dbnzv37r1', 'cmtj8yncr001su07dqnv6odwj', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtj8yn9y0009u07d3v33bp41', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-05-04 12:00:00', '2026-09-01 22:36:48.902', '2026-09-01 22:36:48.902');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynif006cu07dar2b6j9v', 'cmtj8yncr001su07dqnv6odwj', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtj8yn9y0009u07d3v33bp41', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-04-21 12:00:00', '2026-09-01 22:36:48.903', '2026-09-01 22:36:48.903');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynig006du07d977t3hln', 'cmtj8yncr001su07dqnv6odwj', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtj8yn9y0009u07d3v33bp41', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaf000iu07djd69bo4f', 'cmtj8ynal000nu07d18kw9gk4', '2026-04-08 12:00:00', '2026-09-01 22:36:48.904', '2026-09-01 22:36:48.904');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynih006eu07dt4sakow9', 'cmtj8yncx001xu07db3rvo8za', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtj8yn9t0006u07d898ien6b', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaj000lu07dmx1v38h5', 'cmtj8ynan000ou07dfxv1u5pr', '2026-07-27 12:00:00', '2026-09-01 22:36:48.905', '2026-09-01 22:36:48.905');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynij006fu07d994t1ibc', 'cmtj8yncx001xu07db3rvo8za', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Människa', 'cmtj8yn9t0006u07d898ien6b', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaj000lu07dmx1v38h5', 'cmtj8ynan000ou07dfxv1u5pr', '2026-07-14 12:00:00', '2026-09-01 22:36:48.907', '2026-09-01 22:36:48.907');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynik006gu07d9036lp1u', 'cmtj8yncx001xu07db3rvo8za', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtj8yn9t0006u07d898ien6b', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaj000lu07dmx1v38h5', 'cmtj8ynan000ou07dfxv1u5pr', '2026-07-01 12:00:00', '2026-09-01 22:36:48.908', '2026-09-01 22:36:48.908');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynil006hu07d483es8hr', 'cmtj8yncx001xu07db3rvo8za', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtj8yn9t0006u07d898ien6b', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaj000lu07dmx1v38h5', 'cmtj8ynan000ou07dfxv1u5pr', '2026-06-15 12:00:00', '2026-09-01 22:36:48.909', '2026-09-01 22:36:48.909');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynin006iu07dpms244ii', 'cmtj8yncx001xu07db3rvo8za', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtj8yn9t0006u07d898ien6b', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaj000lu07dmx1v38h5', 'cmtj8ynan000ou07dfxv1u5pr', '2026-06-02 12:00:00', '2026-09-01 22:36:48.911', '2026-09-01 22:36:48.911');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynio006ju07db9x2ef3e', 'cmtj8yncx001xu07db3rvo8za', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtj8yn9t0006u07d898ien6b', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaj000lu07dmx1v38h5', 'cmtj8ynan000ou07dfxv1u5pr', '2026-05-20 12:00:00', '2026-09-01 22:36:48.912', '2026-09-01 22:36:48.912');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynip006ku07ds3qbct5p', 'cmtj8yncx001xu07db3rvo8za', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtj8yn9t0006u07d898ien6b', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaj000lu07dmx1v38h5', 'cmtj8ynan000ou07dfxv1u5pr', '2026-05-04 12:00:00', '2026-09-01 22:36:48.913', '2026-09-01 22:36:48.913');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynir006lu07dek2a4mg6', 'cmtj8yncx001xu07db3rvo8za', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Människa', 'cmtj8yn9t0006u07d898ien6b', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaj000lu07dmx1v38h5', 'cmtj8ynan000ou07dfxv1u5pr', '2026-04-21 12:00:00', '2026-09-01 22:36:48.915', '2026-09-01 22:36:48.915');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynis006mu07d7e8ejnyl', 'cmtj8yncx001xu07db3rvo8za', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtj8yn9t0006u07d898ien6b', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynaj000lu07dmx1v38h5', 'cmtj8ynan000ou07dfxv1u5pr', '2026-04-08 12:00:00', '2026-09-01 22:36:48.916', '2026-09-01 22:36:48.916');
INSERT INTO public."TrainingSession" VALUES ('cmtj8ynit006nu07d04j6ljxs', 'cmtj8ynd30022u07doa3e2h33', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtj8yn9x0008u07dztpicg9s', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtj8ynak000mu07d5v4jt4cl', 'cmtj8ynan000ou07dfxv1u5pr', '2026-07-27 12:00:00', '2026-09-01 22:36:48.917', '2026-09-01 22:36:48.917');

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."User" VALUES ('cmtj8ynag000ju07dhecd45ly', 'johan.larsson@avarn.se', 'Johan Larsson', '$2b$10$ZlAxSPnqE00o7fHDT86rvuoqiNlPF6WR8uJF1hqyLFufuH8ZYPQna', 'HANDLER', '070-345 67 89', true, '2026-09-01 22:37:49.445', '2026-09-01 22:36:48.616', 'cmtj8yn9i0003u07d7grp4r4p');
INSERT INTO public."User" VALUES ('cmtj8ynaf000iu07djd69bo4f', 'maria.svensson@avarn.se', 'Maria Svensson', '$2b$10$ZlAxSPnqE00o7fHDT86rvuoqiNlPF6WR8uJF1hqyLFufuH8ZYPQna', 'HANDLER', '070-234 56 78', true, NULL, '2026-09-01 22:36:48.615', 'cmtj8yn9h0002u07dpur0skg3');
INSERT INTO public."User" VALUES ('cmtj8ynah000ku07d5vl6a5h8', 'sofie.holm@avarn.se', 'Sofie Holm', '$2b$10$ZlAxSPnqE00o7fHDT86rvuoqiNlPF6WR8uJF1hqyLFufuH8ZYPQna', 'HANDLER', '070-456 78 90', true, NULL, '2026-09-01 22:36:48.617', 'cmtj8yn9j0004u07dgknx28o4');
INSERT INTO public."User" VALUES ('cmtj8ynaj000lu07dmx1v38h5', 'anders.berg@avarn.se', 'Anders Berg', '$2b$10$ZlAxSPnqE00o7fHDT86rvuoqiNlPF6WR8uJF1hqyLFufuH8ZYPQna', 'HANDLER', '070-567 89 01', true, NULL, '2026-09-01 22:36:48.619', 'cmtj8yn9a0000u07d9gi9k3fp');
INSERT INTO public."User" VALUES ('cmtj8ynak000mu07d5v4jt4cl', 'lisa.ek@avarn.se', 'Lisa Ek', '$2b$10$ZlAxSPnqE00o7fHDT86rvuoqiNlPF6WR8uJF1hqyLFufuH8ZYPQna', 'HANDLER', '070-678 90 12', true, NULL, '2026-09-01 22:36:48.62', 'cmtj8yn9f0001u07dpq3et0ty');
INSERT INTO public."User" VALUES ('cmtj8ynal000nu07d18kw9gk4', 'anna.karlsson@avarn.se', 'Anna Karlsson', '$2b$10$ZlAxSPnqE00o7fHDT86rvuoqiNlPF6WR8uJF1hqyLFufuH8ZYPQna', 'INSTRUCTOR', '070-789 01 23', true, '2026-09-01 22:38:36.592', '2026-09-01 22:36:48.621', 'cmtj8yn9h0002u07dpur0skg3');
INSERT INTO public."User" VALUES ('cmtj8ynat000ru07d71q34ph0', 'admin@avarn.se', 'Systemadministratör', '$2b$10$ZlAxSPnqE00o7fHDT86rvuoqiNlPF6WR8uJF1hqyLFufuH8ZYPQna', 'ADMIN', NULL, true, '2026-09-02 06:44:55.522', '2026-09-01 22:36:48.629', NULL);
INSERT INTO public."User" VALUES ('cmtj8ynan000ou07dfxv1u5pr', 'peter.nyman@avarn.se', 'Peter Nyman', '$2b$10$ZlAxSPnqE00o7fHDT86rvuoqiNlPF6WR8uJF1hqyLFufuH8ZYPQna', 'INSTRUCTOR', '070-890 12 34', true, '2026-09-01 22:36:56.114', '2026-09-01 22:36:48.623', 'cmtj8yn9i0003u07d7grp4r4p');
INSERT INTO public."User" VALUES ('cmtj8ynap000pu07dk68crsqd', 'karin.dahl@avarn.se', 'Karin Dahl', '$2b$10$ZlAxSPnqE00o7fHDT86rvuoqiNlPF6WR8uJF1hqyLFufuH8ZYPQna', 'REGIONAL_MANAGER', '070-901 23 45', true, '2026-09-01 22:37:38.226', '2026-09-01 22:36:48.625', 'cmtj8yn9h0002u07dpur0skg3');
INSERT INTO public."User" VALUES ('cmtj8ynar000qu07d3jrhk0jf', 'magnus.oberg@avarn.se', 'Magnus Öberg', '$2b$10$ZlAxSPnqE00o7fHDT86rvuoqiNlPF6WR8uJF1hqyLFufuH8ZYPQna', 'NATIONAL_MANAGER', '070-012 34 56', true, '2026-09-01 22:37:41.312', '2026-09-01 22:36:48.627', NULL);
INSERT INTO public."User" VALUES ('cmtj8ynac000hu07dmv8ay4zn', 'erik.andersson@avarn.se', 'Erik Andersson', '$2b$10$ZlAxSPnqE00o7fHDT86rvuoqiNlPF6WR8uJF1hqyLFufuH8ZYPQna', 'HANDLER', '070-123 45 67', true, '2026-09-01 22:37:48.456', '2026-09-01 22:36:48.612', 'cmtj8yn9h0002u07dpur0skg3');

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations VALUES ('b4a08b03-3687-430e-9f5f-9c34b0c01b36', 'e67474ddd6e107de2df8cefbeb5f9cb6e3a15399718d0cd8c3a6d8d78a9d0c8c', '2026-08-31 12:57:11.315391+00', '20260831113658_init', NULL, NULL, '2026-08-31 12:57:11.093046+00', 1);
INSERT INTO public._prisma_migrations VALUES ('3d7aae2b-ae08-4fb0-91bb-7633c03f7cbe', '46e8787317de3b806f47ed777efef5ecb3002350aaaeeca5455f5bf036fa9468', '2026-09-01 11:49:55.942159+00', '20260901114955_media_dog_and_profile_photos', NULL, NULL, '2026-09-01 11:49:55.928359+00', 1);
INSERT INTO public._prisma_migrations VALUES ('4f1dd06b-cae0-4b7e-949a-b34da3490b65', '7a3e00b28b340daabfe9ce8d318466bfd08fbb6db1fd6513568939d204259f1f', '2026-09-01 16:58:16.970172+00', '20260901165816_dog_profile_details', NULL, NULL, '2026-09-01 16:58:16.964336+00', 1);
INSERT INTO public._prisma_migrations VALUES ('1afa96e2-f54f-46ff-ac1b-30358f821560', '5f24f7491ade4c94c0ffaa58a4fa92900e31cc4321a8eb8ec49f7eb961c21039', '2026-09-02 06:45:43.388074+00', '20260902064543_settings', NULL, NULL, '2026-09-02 06:45:43.378536+00', 1);

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
