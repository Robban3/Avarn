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

INSERT INTO public."Certification" VALUES ('cmtix5vy3002pad7dx5t16mfc', 'cmtix5vua000bad7dwfstnfi3', NULL, NULL, 'cmtix5vw40016ad7d5csui4jp', 'Svenska Brukshundklubben', 'NHPR-2855', '2026-05-01 17:06:30.563', '2027-05-01 17:06:30.563', NULL, '2026-09-01 17:06:31.035');
INSERT INTO public."Certification" VALUES ('cmtix5vy5002qad7d1q3107ei', 'cmtix5vub000cad7dbeq8cvbg', NULL, NULL, 'cmtix5vw40016ad7d5csui4jp', 'Avarn Security', 'EKIPAGE-4330', '2026-01-01 17:06:30.563', '2028-01-01 17:06:30.563', NULL, '2026-09-01 17:06:31.037');
INSERT INTO public."Certification" VALUES ('cmtix5vy7002rad7djx2e285a', 'cmtix5vud000dad7dsbijgu2o', 'cmtix5vvx000yad7dzle8o0xx', NULL, NULL, 'Avarn Security', 'NARK_CERT-1893', '2025-10-01 17:06:30.563', '2026-10-01 17:06:30.563', NULL, '2026-09-01 17:06:31.039');
INSERT INTO public."Certification" VALUES ('cmtix5vy8002sad7d5nzzxaq1', 'cmtix5vua000bad7dwfstnfi3', NULL, NULL, 'cmtix5vwi001bad7dx4xwyvit', 'Svenska Brukshundklubben', 'NHPR-6422', '2025-11-01 17:06:30.563', '2026-11-01 17:06:30.563', NULL, '2026-09-01 17:06:31.04');
INSERT INTO public."Certification" VALUES ('cmtix5vya002tad7drcapdsr0', 'cmtix5vub000cad7dbeq8cvbg', NULL, NULL, 'cmtix5vwi001bad7dx4xwyvit', 'Avarn Security', 'EKIPAGE-7192', '2026-03-01 17:06:30.563', '2028-03-01 17:06:30.563', NULL, '2026-09-01 17:06:31.042');
INSERT INTO public."Certification" VALUES ('cmtix5vyb002uad7dfmmd39go', 'cmtix5vub000cad7dbeq8cvbg', NULL, NULL, 'cmtix5vwq001had7dvclu7edo', 'Avarn Security', 'EKIPAGE-1665', '2024-09-01 17:06:30.563', '2026-09-03 12:00:00', NULL, '2026-09-01 17:06:31.043');
INSERT INTO public."Certification" VALUES ('cmtix5vyd002vad7d86q2glv7', 'cmtix5vua000bad7dwfstnfi3', NULL, NULL, 'cmtix5vwq001had7dvclu7edo', 'Avarn Security', 'NHPR-8678', '2026-06-01 17:06:30.563', '2027-06-01 17:06:30.563', NULL, '2026-09-01 17:06:31.045');
INSERT INTO public."Certification" VALUES ('cmtix5vye002wad7domoajgmd', 'cmtix5vua000bad7dwfstnfi3', NULL, NULL, 'cmtix5vwv001mad7d1dscjvl8', 'Avarn Security', 'NHPR-6215', '2026-07-01 17:06:30.563', '2027-07-01 17:06:30.563', NULL, '2026-09-01 17:06:31.046');
INSERT INTO public."Certification" VALUES ('cmtix5vyf002xad7df0qvv2o1', 'cmtix5vub000cad7dbeq8cvbg', NULL, NULL, 'cmtix5vwv001mad7d1dscjvl8', 'Avarn Security', 'EKIPAGE-6310', '2025-09-01 17:06:30.563', '2027-09-01 17:06:30.563', NULL, '2026-09-01 17:06:31.047');
INSERT INTO public."Certification" VALUES ('cmtix5vyh002yad7d3fyv589p', 'cmtix5vuf000ead7dr8rbwk3b', 'cmtix5vwz001nad7d3ud9et2b', NULL, NULL, 'Avarn Security', 'SPRANG_CERT-8838', '2025-12-01 17:06:30.563', '2026-12-01 17:06:30.563', NULL, '2026-09-01 17:06:31.049');
INSERT INTO public."Certification" VALUES ('cmtix5vyi002zad7d68gwomrn', 'cmtix5vub000cad7dbeq8cvbg', NULL, NULL, 'cmtix5vx2001sad7dao4t8erm', 'Avarn Security', 'EKIPAGE-6803', '2026-04-01 17:06:30.563', '2028-04-01 17:06:30.563', NULL, '2026-09-01 17:06:31.05');
INSERT INTO public."Certification" VALUES ('cmtix5vyj0030ad7dkksobo25', 'cmtix5vua000bad7dwfstnfi3', NULL, NULL, 'cmtix5vx8001xad7dixg0we98', 'Avarn Security', 'NHPR-6664', '2026-08-01 17:06:30.563', '2027-08-01 17:06:30.563', NULL, '2026-09-01 17:06:31.051');
INSERT INTO public."Certification" VALUES ('cmtix5vyl0031ad7dpwojeptu', 'cmtix5vub000cad7dbeq8cvbg', NULL, NULL, 'cmtix5vxe0022ad7d0zqbldup', 'Avarn Security', 'EKIPAGE-7595', '2024-10-01 17:06:30.563', '2026-10-01 17:06:30.563', NULL, '2026-09-01 17:06:31.053');
INSERT INTO public."Certification" VALUES ('cmtix5vym0032ad7dpgs1dnaa', 'cmtix5vud000dad7dsbijgu2o', 'cmtix5vxb001yad7d9pow87ln', NULL, NULL, 'Avarn Security', 'NARK_CERT-1918', '2025-08-01 17:06:30.563', '2026-08-01 17:06:30.563', NULL, '2026-09-01 17:06:31.054');
INSERT INTO public."Certification" VALUES ('cmtix5vyn0033ad7de146p6ju', 'cmtix5vua000bad7dwfstnfi3', NULL, NULL, 'cmtix5vxi0027ad7du9ius270', 'Avarn Security', 'NHPR-4227', '2026-02-01 17:06:30.563', '2027-02-01 17:06:30.563', NULL, '2026-09-01 17:06:31.055');
INSERT INTO public."Certification" VALUES ('cmtix5vyp0034ad7dpkumly5j', 'cmtix5vug000fad7dnzmf7hus', NULL, 'cmtix5vum000had7dre87cv96', NULL, 'Avarn Security', 'SKYDDSVAKT-8495', '2025-01-01 17:06:30.563', '2028-01-01 17:06:30.563', NULL, '2026-09-01 17:06:31.057');
INSERT INTO public."Certification" VALUES ('cmtix5vyr0035ad7d20wr6f75', 'cmtix5vuh000gad7dhbwxhk44', NULL, 'cmtix5vum000had7dre87cv96', NULL, 'Avarn Security', 'HLR-3304', '2024-11-01 17:06:30.563', '2026-11-01 17:06:30.563', NULL, '2026-09-01 17:06:31.059');
INSERT INTO public."Certification" VALUES ('cmtix5vys0036ad7domfl3fjw', 'cmtix5vug000fad7dnzmf7hus', NULL, 'cmtix5vur000iad7dshlkaw4q', NULL, 'Avarn Security', 'SKYDDSVAKT-5419', '2024-03-01 17:06:30.563', '2027-03-01 17:06:30.563', NULL, '2026-09-01 17:06:31.06');
INSERT INTO public."Certification" VALUES ('cmtix5vyt0037ad7dbh7n5fjc', 'cmtix5vuh000gad7dhbwxhk44', NULL, 'cmtix5vuu000jad7darz2llha', NULL, 'Avarn Security', 'HLR-8894', '2024-10-01 17:06:30.563', '2026-10-01 17:06:30.563', NULL, '2026-09-01 17:06:31.061');
INSERT INTO public."Certification" VALUES ('cmtix5vyv0038ad7dor6wqxhg', 'cmtix5vug000fad7dnzmf7hus', NULL, 'cmtix5vuw000kad7d6orv533c', NULL, 'Avarn Security', 'SKYDDSVAKT-3598', '2025-09-01 17:06:30.563', '2028-09-01 17:06:30.563', NULL, '2026-09-01 17:06:31.063');

--
-- Data for Name: CertificationType; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."CertificationType" VALUES ('cmtix5vua000bad7dwfstnfi3', 'NHPR', 'NHPR Godkänd', 12, 'TEAM', 'Nationellt hundprov för räddning och sök.');
INSERT INTO public."CertificationType" VALUES ('cmtix5vub000cad7dbeq8cvbg', 'EKIPAGE', 'Auktoriserat ekipage', 24, 'TEAM', 'Behörighet att arbeta operativt som ekipage.');
INSERT INTO public."CertificationType" VALUES ('cmtix5vud000dad7dsbijgu2o', 'NARK_CERT', 'Certifikat narkotikasök', 12, 'DOG', NULL);
INSERT INTO public."CertificationType" VALUES ('cmtix5vuf000ead7dr8rbwk3b', 'SPRANG_CERT', 'Certifikat sprängämnessök', 12, 'DOG', NULL);
INSERT INTO public."CertificationType" VALUES ('cmtix5vug000fad7dnzmf7hus', 'SKYDDSVAKT', 'Skyddsvaktsförordnande', 36, 'HANDLER', NULL);
INSERT INTO public."CertificationType" VALUES ('cmtix5vuh000gad7dhbwxhk44', 'HLR', 'HLR och första hjälpen', 24, 'HANDLER', NULL);

--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Comment" VALUES ('cmtix5w520075ad7dfw1tf5hy', 'cmtix5vv1000nad7dz361cpim', 'Bra jobbat! Fortsätt nöta på uthålligheten.', '2026-08-24 09:15:00', 'cmtix5vzj003gad7dkutf3406', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmtix5w540076ad7d9hmvuuhk', 'cmtix5vv1000nad7dz361cpim', 'Lägg in fler höga gömmor kommande veckor, gärna 180–220 cm.', '2026-08-10 14:00:00', 'cmtix5vzz003tad7dvz6awr3f', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmtix5w550077ad7dbnn0bt2s', 'cmtix5vv2000oad7doc3e6u44', 'Helt rätt tänkt att korta passen. Bygg på fem minuter i taget.', '2026-08-25 11:30:00', 'cmtix5w12004qad7d7cenli2b', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmtix5w6h007wad7doij3oobl', 'cmtix5vv4000pad7df6vitzsi', 'Tydlig rapport. Bra att kvittonummer finns med.', '2026-08-23 09:35:00', NULL, 'cmtix5w64007qad7dy33x1vel', NULL);

--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Customer" VALUES ('cmtix5w570078ad7d3zoskou1', 'Swedavia AB', '556797-0818', 'Lars Holmberg', '010-109 00 00', 'sakerhet@swedavia.se', NULL);
INSERT INTO public."Customer" VALUES ('cmtix5w580079ad7dk23o36vz', 'Friends Arena', '556768-2942', 'Nina Ek', '08-500 300 00', 'drift@friendsarena.se', NULL);
INSERT INTO public."Customer" VALUES ('cmtix5w59007aad7dqgyz8wwx', 'Jordbro Logistik AB', '556123-4567', 'Tomas Ek', '08-555 12 00', 'lager@jordbrologistik.se', NULL);
INSERT INTO public."Customer" VALUES ('cmtix5w5a007bad7dco04eb0z', 'Uppsalahem', '556137-3589', 'Petra Lund', '018-727 30 00', 'trygghet@uppsalahem.se', NULL);

--
-- Data for Name: Dog; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Dog" VALUES ('cmtix5vvx000yad7dzle8o0xx', 'Nova', 'Belgisk vallhund (Malinois)', '2022-04-12 00:00:00', 'TIK', '752098100812345', NULL, 'ACTIVE', NULL, '2026-09-01 17:06:30.957', 'Fawn med svart mask', 62, 'A / 0', '2027-12-31 00:00:00', 'Folksam', '5 / 5', false, 'Sverige', 'SE-AVAR-2020-1127', 28);
INSERT INTO public."Dog" VALUES ('cmtix5vwd0017ad7dmqdhnc2a', 'Rex', 'Labrador Retriever', '2020-04-12 00:00:00', 'HANE', '752098100234567', NULL, 'ACTIVE', NULL, '2026-09-01 17:06:30.973', 'Svart', 58, 'B / 0', '2027-06-30 00:00:00', 'Agria', '4 / 5', true, 'Sverige', 'SE-AVAR-2018-0904', 32);
INSERT INTO public."Dog" VALUES ('cmtix5vwm001cad7d3x95besk', 'Balder', 'Schäfer', '2021-04-12 00:00:00', 'HANE', '752098100345678', NULL, 'ACTIVE', NULL, '2026-09-01 17:06:30.982', 'Svart och tan', 65, 'A / 0', '2027-03-31 00:00:00', 'Agria', '5 / 4', false, 'Tyskland', 'SE-AVAR-2019-0451', 36);
INSERT INTO public."Dog" VALUES ('cmtix5vws001iad7dtx5pb735', 'Mira', 'Springer Spaniel', '2023-04-12 00:00:00', 'TIK', '752098100456789', NULL, 'ACTIVE', NULL, '2026-09-01 17:06:30.988', 'Brun och vit', 48, 'A / 0', '2026-11-30 00:00:00', 'Folksam', '4 / 4', false, 'Sverige', 'SE-AVAR-2021-1330', 19);
INSERT INTO public."Dog" VALUES ('cmtix5vwz001nad7d3ud9et2b', 'Sigge', 'Labrador Retriever', '2019-04-12 00:00:00', 'HANE', '752098100567890', NULL, 'ACTIVE', NULL, '2026-09-01 17:06:30.995', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Dog" VALUES ('cmtix5vx5001tad7dpdgaui78', 'Iris', 'Belgisk vallhund (Malinois)', '2024-04-12 00:00:00', 'TIK', '752098100678901', NULL, 'ACTIVE', NULL, '2026-09-01 17:06:31.001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Dog" VALUES ('cmtix5vxb001yad7d9pow87ln', 'Zeb', 'Schäfer', '2018-04-12 00:00:00', 'HANE', '752098100789012', NULL, 'ACTIVE', NULL, '2026-09-01 17:06:31.007', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Dog" VALUES ('cmtix5vxf0023ad7d8ckeewhl', 'Tira', 'Springer Spaniel', '2022-04-12 00:00:00', 'TIK', '752098100890123', NULL, 'ACTIVE', NULL, '2026-09-01 17:06:31.011', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Data for Name: DogDiscipline; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."DogDiscipline" VALUES ('cmtix5vvy000zad7d9g2ybh6a', 'cmtix5vvx000yad7dzle8o0xx', 'cmtix5vu40008ad7doprf5u88', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vvy0010ad7d6ebilgqr', 'cmtix5vvx000yad7dzle8o0xx', 'cmtix5vu50009ad7dj7v69rfg', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vvy0011ad7dffr41mzw', 'cmtix5vvx000yad7dzle8o0xx', 'cmtix5vu6000aad7dqqaam7e5', 'GRUND', '2025-09-26 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vwe0018ad7dw211xfky', 'cmtix5vwd0017ad7dmqdhnc2a', 'cmtix5vu40008ad7doprf5u88', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vwe0019ad7dwkzpstud', 'cmtix5vwd0017ad7dmqdhnc2a', 'cmtix5vu20007ad7d0izn6m5j', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vwm001dad7d7vn259td', 'cmtix5vwm001cad7d3x95besk', 'cmtix5vty0005ad7dwvwckxsk', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vwm001ead7dlboth8qf', 'cmtix5vwm001cad7d3x95besk', 'cmtix5vu00006ad7dy2ny6n3a', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vwt001jad7dpp1ttli6', 'cmtix5vws001iad7dtx5pb735', 'cmtix5vu40008ad7doprf5u88', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vwt001kad7d40vd6v84', 'cmtix5vws001iad7dtx5pb735', 'cmtix5vu20007ad7d0izn6m5j', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vwz001oad7dsb6cdply', 'cmtix5vwz001nad7d3ud9et2b', 'cmtix5vu50009ad7dj7v69rfg', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vwz001pad7dozsidp3x', 'cmtix5vwz001nad7d3ud9et2b', 'cmtix5vu20007ad7d0izn6m5j', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vx5001uad7d2stkhxjr', 'cmtix5vx5001tad7dpdgaui78', 'cmtix5vty0005ad7dwvwckxsk', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vx5001vad7dx73sx116', 'cmtix5vx5001tad7dpdgaui78', 'cmtix5vu00006ad7dy2ny6n3a', 'GRUND', '2025-08-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vxb001zad7df1blb20v', 'cmtix5vxb001yad7d9pow87ln', 'cmtix5vu40008ad7doprf5u88', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vxg0024ad7ds097zwdi', 'cmtix5vxf0023ad7d8ckeewhl', 'cmtix5vu40008ad7doprf5u88', 'SPECIALIST', '2025-07-28 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmtix5vxg0025ad7dfqrsuz5c', 'cmtix5vxf0023ad7d8ckeewhl', 'cmtix5vu6000aad7dqqaam7e5', 'GRUND', '2025-08-27 08:00:00');

--
-- Data for Name: DogEducation; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."DogEducation" VALUES ('cmtix5vvz0012ad7d4cq1dfh6', 'cmtix5vvx000yad7dzle8o0xx', 'Grundutbildning', 'Avarn Security Hundutbildning', '2023-03-01 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtix5vvz0013ad7djnfoitak', 'cmtix5vvx000yad7dzle8o0xx', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2024-01-15 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtix5vvz0014ad7d8sesr6kj', 'cmtix5vvx000yad7dzle8o0xx', 'Specialistutbildning Narkotika', 'Avarn Security Hundutbildning', '2024-11-30 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtix5vvz0015ad7ds6wuls8t', 'cmtix5vvx000yad7dzle8o0xx', 'Vidareutbildning Sök & Markering', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtix5vwf001aad7d18no2qol', 'cmtix5vwd0017ad7dmqdhnc2a', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtix5vwn001fad7dy26tcby5', 'cmtix5vwm001cad7d3x95besk', 'Grundutbildning', 'Avarn Security Hundutbildning', '2024-11-30 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtix5vwn001gad7d6dkcpnaj', 'cmtix5vwm001cad7d3x95besk', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtix5vwt001lad7dh06qtq4k', 'cmtix5vws001iad7dtx5pb735', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtix5vx0001qad7d4p6ei5ls', 'cmtix5vwz001nad7d3ud9et2b', 'Grundutbildning', 'Avarn Security Hundutbildning', '2024-11-30 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtix5vx0001rad7dd2wtbwvk', 'cmtix5vwz001nad7d3ud9et2b', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtix5vx6001wad7d8trugghi', 'cmtix5vx5001tad7dpdgaui78', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtix5vxc0020ad7dnxdqiby2', 'cmtix5vxb001yad7d9pow87ln', 'Grundutbildning', 'Avarn Security Hundutbildning', '2024-11-30 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtix5vxc0021ad7disothyff', 'cmtix5vxb001yad7d9pow87ln', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmtix5vxh0026ad7d8ahzs0ej', 'cmtix5vxf0023ad7d8ckeewhl', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-10-16 08:00:00');

--
-- Data for Name: FollowUp; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."FollowUp" VALUES ('cmtix5w6j007xad7dtenhmyg1', 'cmtix5vw40016ad7d5csui4jp', 'cmtix5vv1000nad7dz361cpim', 'Uppföljning höga gömmor', 'Vi tar ett gemensamt pass på höga gömmor innan certifieringen. Hör av dig med tid som passar.', '2026-09-10 08:00:00', 'OPEN', '2026-09-01 17:06:31.339');

--
-- Data for Name: HandlerProfile; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."HandlerProfile" VALUES ('cmtix5vva000sad7d5h8arqlh', 'cmtix5vum000had7dre87cv96', 'AV-1000', 'Stockholm', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtix5vvc000tad7dlnn1xwaj', 'cmtix5vur000iad7dshlkaw4q', 'AV-1001', 'Södertälje', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtix5vvd000uad7d6vzhauin', 'cmtix5vuu000jad7darz2llha', 'AV-1002', 'Göteborg', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtix5vve000vad7d6i1d5ci2', 'cmtix5vuw000kad7d6orv533c', 'AV-1003', 'Malmö', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtix5vve000wad7dpuvsr91v', 'cmtix5vuy000lad7d0wvtqn46', 'AV-1004', 'Umeå', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmtix5vvf000xad7ddruj8365', 'cmtix5vuz000mad7dwmuuqn9b', 'AV-1005', 'Örebro', 'Operativ hundförare inom Avarn Security.', NULL);

--
-- Data for Name: Hide; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Hide" VALUES ('cmtix5vzk003had7d4343hvaq', 'cmtix5vzj003gad7dkutf3406', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtix5vzk003iad7d51669fy2', 'cmtix5vzj003gad7dkutf3406', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtix5vzk003jad7dbzdxcak8', 'cmtix5vzj003gad7dkutf3406', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtix5vzk003kad7dv9kx77h5', 'cmtix5vzj003gad7dkutf3406', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtix5vzk003lad7d26w1zn3s', 'cmtix5vzj003gad7dkutf3406', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'MISSED', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtix5vzs003nad7da1azx6nd', 'cmtix5vzr003mad7deyhwfjgc', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtix5vzs003oad7drmzfcsqz', 'cmtix5vzr003mad7deyhwfjgc', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtix5vzs003pad7dhquh4y4x', 'cmtix5vzr003mad7deyhwfjgc', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtix5vzs003qad7dqpelmys7', 'cmtix5vzr003mad7deyhwfjgc', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtix5vzs003rad7dx0hgzzcs', 'cmtix5vzr003mad7deyhwfjgc', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtix5vzs003sad7dqe97dk0o', 'cmtix5vzr003mad7deyhwfjgc', 'Gömma 6', 'Under pall', 15, 'SVAR', 'FOUND', 235, NULL, 6);
INSERT INTO public."Hide" VALUES ('cmtix5w00003uad7dug498485', 'cmtix5vzz003tad7dvz6awr3f', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtix5w00003vad7dbkj38ojz', 'cmtix5vzz003tad7dvz6awr3f', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtix5w00003wad7d9lr7bgr8', 'cmtix5vzz003tad7dvz6awr3f', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtix5w00003xad7dvi32oc94', 'cmtix5vzz003tad7dvz6awr3f', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'MISSED', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtix5w08003zad7d06iz1kro', 'cmtix5w07003yad7d3mj79jo5', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtix5w080040ad7dguxqaoup', 'cmtix5w07003yad7d3mj79jo5', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtix5w080041ad7dguvl1344', 'cmtix5w07003yad7d3mj79jo5', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtix5w080042ad7ds4reac89', 'cmtix5w07003yad7d3mj79jo5', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtix5w080043ad7d0k1l3lyl', 'cmtix5w07003yad7d3mj79jo5', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtix5w0f0045ad7d692yofmw', 'cmtix5w0e0044ad7desur0njc', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtix5w0f0046ad7dbbtdhcgu', 'cmtix5w0e0044ad7desur0njc', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtix5w0f0047ad7d70ktuh9g', 'cmtix5w0e0044ad7desur0njc', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtix5w0f0048ad7d5sdp86l3', 'cmtix5w0e0044ad7desur0njc', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtix5w0l004aad7dwaor0b96', 'cmtix5w0k0049ad7d0kziqmji', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtix5w0l004bad7d0f5ildjt', 'cmtix5w0k0049ad7d0kziqmji', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtix5w0l004cad7dx3zt62td', 'cmtix5w0k0049ad7d0kziqmji', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtix5w0q004ead7derdvfzyd', 'cmtix5w0p004dad7dtderuuk2', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtix5w0q004fad7d7yye64mm', 'cmtix5w0p004dad7dtderuuk2', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtix5w0q004gad7d1x4cgjhl', 'cmtix5w0p004dad7dtderuuk2', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtix5w0q004had7d7f4slvf6', 'cmtix5w0p004dad7dtderuuk2', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtix5w0q004iad7dwcyilxj1', 'cmtix5w0p004dad7dtderuuk2', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'MISSED', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtix5w0x004kad7dxo0igfww', 'cmtix5w0w004jad7dfxi2cquz', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtix5w0x004lad7d46bm2oz4', 'cmtix5w0w004jad7dfxi2cquz', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtix5w0x004mad7d6ujqu9s1', 'cmtix5w0w004jad7dfxi2cquz', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtix5w0x004nad7devdx29a4', 'cmtix5w0w004jad7dfxi2cquz', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtix5w0x004oad7d4frpljza', 'cmtix5w0w004jad7dfxi2cquz', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtix5w0x004pad7deqwd2y8j', 'cmtix5w0w004jad7dfxi2cquz', 'Gömma 6', 'Under pall', 15, 'SVAR', 'MISSED', 235, NULL, 6);
INSERT INTO public."Hide" VALUES ('cmtix5w13004rad7do7lrgnd2', 'cmtix5w12004qad7d7cenli2b', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtix5w13004sad7dhh41bty6', 'cmtix5w12004qad7d7cenli2b', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtix5w13004tad7dpipk7qva', 'cmtix5w12004qad7d7cenli2b', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'MISSED', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtix5w18004vad7dp3knskte', 'cmtix5w18004uad7dx2wa9mup', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtix5w18004wad7dluirps8h', 'cmtix5w18004uad7dx2wa9mup', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtix5w18004xad7dxdcld56v', 'cmtix5w18004uad7dx2wa9mup', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtix5w18004yad7dibmtso4k', 'cmtix5w18004uad7dx2wa9mup', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmtix5w18004zad7d1lgdy1r2', 'cmtix5w18004uad7dx2wa9mup', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmtix5w1c0051ad7d5fel93tt', 'cmtix5w1b0050ad7d6skm4yop', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmtix5w1c0052ad7d12jrgy0q', 'cmtix5w1b0050ad7d6skm4yop', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmtix5w1c0053ad7dfulmxlv2', 'cmtix5w1b0050ad7d6skm4yop', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmtix5w1c0054ad7dhk9bf4hb', 'cmtix5w1b0050ad7d6skm4yop', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'MISSED', 165, NULL, 4);

--
-- Data for Name: Indication; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Indication" VALUES ('cmtix5w65007rad7de7c3902r', 'cmtix5w64007qad7dy33x1vel', 'Bagageband 3, kolli 18', 'Tydlig och kvarstående markering på resväska.', 'FIND', 'Polis, region Stockholm', 1);
INSERT INTO public."Indication" VALUES ('cmtix5w65007sad7dkak5efx3', 'cmtix5w64007qad7dy33x1vel', 'Lastpall vid port 2', 'Markering utan fynd vid kontroll.', 'NO_FIND', NULL, 2);
INSERT INTO public."Indication" VALUES ('cmtix5w6e007vad7dext9sv4y', 'cmtix5w6d007uad7dy8e01dck', 'Container 9, bakre vänstra hörnet', 'Markering på pallkrage.', 'FIND', 'Tullverket', 1);

--
-- Data for Name: InstructorAssignment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."InstructorAssignment" VALUES ('cmtix5vxk0028ad7dgo3i3tji', 'cmtix5vv1000nad7dz361cpim', 'cmtix5vw40016ad7d5csui4jp', '2026-09-01 17:06:31.016');
INSERT INTO public."InstructorAssignment" VALUES ('cmtix5vxl0029ad7dg1vmtxwf', 'cmtix5vv1000nad7dz361cpim', 'cmtix5vwi001bad7dx4xwyvit', '2026-09-01 17:06:31.017');
INSERT INTO public."InstructorAssignment" VALUES ('cmtix5vxm002aad7dfih67yzl', 'cmtix5vv1000nad7dz361cpim', 'cmtix5vx2001sad7dao4t8erm', '2026-09-01 17:06:31.018');
INSERT INTO public."InstructorAssignment" VALUES ('cmtix5vxn002bad7d6vq0q65z', 'cmtix5vv1000nad7dz361cpim', 'cmtix5vxi0027ad7du9ius270', '2026-09-01 17:06:31.019');
INSERT INTO public."InstructorAssignment" VALUES ('cmtix5vxo002cad7d1crw3l9f', 'cmtix5vv1000nad7dz361cpim', 'cmtix5vwv001mad7d1dscjvl8', '2026-09-01 17:06:31.02');
INSERT INTO public."InstructorAssignment" VALUES ('cmtix5vxp002dad7du6vg0a8j', 'cmtix5vv2000oad7doc3e6u44', 'cmtix5vwq001had7dvclu7edo', '2026-09-01 17:06:31.021');
INSERT INTO public."InstructorAssignment" VALUES ('cmtix5vxq002ead7dbqy7sb6k', 'cmtix5vv2000oad7doc3e6u44', 'cmtix5vx8001xad7dixg0we98', '2026-09-01 17:06:31.022');
INSERT INTO public."InstructorAssignment" VALUES ('cmtix5vxr002fad7dtaobcw6q', 'cmtix5vv2000oad7doc3e6u44', 'cmtix5vxe0022ad7d0zqbldup', '2026-09-01 17:06:31.023');

--
-- Data for Name: MediaAsset; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Mission; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Mission" VALUES ('cmtix5w5c007cad7dr5gsehjm', 'UPP-2451', 'Flygplatskontroll', 'Flygplatskontroll', 'cmtix5w570078ad7d3zoskou1', 'Lars Holmberg', '010-109 00 00', '2026-09-04 08:00:00', '2026-09-04 10:00:00', 'Terminal 5, bagagehall', 'Arlanda, Stockholm', 'cmtix5vtm0002ad7d0vwmfpdc', 'cmtix5vty0005ad7dwvwckxsk', 'Anmälan i säkerhetskontrollen senast 07:45. ID-handling och förordnande ska medföras. Sök sker i bagagehall och angränsande lastutrymme.', 'ASSIGNED', 'cmtix5vv4000pad7df6vitzsi', '2026-09-01 17:06:31.296');
INSERT INTO public."Mission" VALUES ('cmtix5w5g007ead7d6mut8cat', 'UPP-2452', 'Evenemangssök', 'Evenemangssök', 'cmtix5w580079ad7dk23o36vz', 'Nina Ek', '08-500 300 00', '2026-09-05 14:30:00', '2026-09-05 17:30:00', 'Friends Arena, entré C', 'Solna', 'cmtix5vtm0002ad7d0vwmfpdc', 'cmtix5vu00006ad7dy2ny6n3a', 'Genomsökning av läktarsektion A–D före publikinsläpp. Klart senast 17:30.', 'ASSIGNED', 'cmtix5vv4000pad7df6vitzsi', '2026-09-01 17:06:31.301');
INSERT INTO public."Mission" VALUES ('cmtix5w5k007gad7d2fcj9m16', 'UPP-2453', 'Lagerkontroll', 'Lagerkontroll', 'cmtix5w59007aad7dqgyz8wwx', 'Tomas Ek', '08-555 12 00', '2026-09-06 10:00:00', '2026-09-06 14:00:00', 'Lagerväg 12', 'Jordbro, Haninge', 'cmtix5vtm0002ad7d0vwmfpdc', 'cmtix5vu20007ad7d0izn6m5j', 'Samordnas med lagerchef på plats. Truckar stoppas under sök.', 'PLANNED', 'cmtix5vv4000pad7df6vitzsi', '2026-09-01 17:06:31.304');
INSERT INTO public."Mission" VALUES ('cmtix5w5l007had7d2gyy8710', 'UPP-2454', 'Bostadssök', 'Bostadssök', 'cmtix5w5a007bad7dco04eb0z', 'Petra Lund', '018-727 30 00', '2026-09-08 09:30:00', '2026-09-08 12:30:00', 'Gränbyvägen 8', 'Uppsala', 'cmtix5vtm0002ad7d0vwmfpdc', 'cmtix5vty0005ad7dwvwckxsk', 'Polis närvarar. Invänta klartecken innan sök påbörjas.', 'PLANNED', 'cmtix5vv4000pad7df6vitzsi', '2026-09-01 17:06:31.305');
INSERT INTO public."Mission" VALUES ('cmtix5w5o007iad7dcyawzkg6', 'UPP-2448', 'Objektsbevakning hamnen', 'Objektsbevakning', 'cmtix5w59007aad7dqgyz8wwx', 'Tomas Ek', '031-555 00 12', '2026-09-07 20:00:00', '2026-09-08 02:00:00', 'Skandiahamnen, port 4', 'Göteborg', 'cmtix5vto0003ad7dbf4sykrn', 'cmtix5vu00006ad7dy2ny6n3a', 'Nattpass. Rapportering till larmcentral varannan timme.', 'ASSIGNED', 'cmtix5vv4000pad7df6vitzsi', '2026-09-01 17:06:31.308');
INSERT INTO public."Mission" VALUES ('cmtix5w5r007kad7dspyvwupt', 'UPP-2431', 'Flygplatskontroll', 'Flygplatskontroll', 'cmtix5w570078ad7d3zoskou1', 'Lars Holmberg', '010-109 00 00', '2026-08-22 08:00:00', '2026-08-22 10:00:00', 'Terminal 5, bagagehall', 'Arlanda, Stockholm', 'cmtix5vtm0002ad7d0vwmfpdc', 'cmtix5vty0005ad7dwvwckxsk', 'Rutinkontroll enligt avtal.', 'COMPLETED', 'cmtix5vv4000pad7df6vitzsi', '2026-09-01 17:06:31.311');
INSERT INTO public."Mission" VALUES ('cmtix5w5u007mad7dfig2ibhe', 'UPP-2427', 'Lagerkontroll', 'Lagerkontroll', 'cmtix5w59007aad7dqgyz8wwx', 'Tomas Ek', '08-555 12 00', '2026-08-15 13:00:00', '2026-08-15 16:00:00', 'Lagerväg 12', 'Jordbro, Haninge', 'cmtix5vtm0002ad7d0vwmfpdc', 'cmtix5vu20007ad7d0izn6m5j', 'Kvartalskontroll.', 'COMPLETED', 'cmtix5vv4000pad7df6vitzsi', '2026-09-01 17:06:31.314');
INSERT INTO public."Mission" VALUES ('cmtix5w5x007oad7dn3d37h6g', 'UPP-2422', 'Godskontroll', 'Lagerkontroll', 'cmtix5w59007aad7dqgyz8wwx', 'Tomas Ek', '040-555 00 20', '2026-08-11 09:00:00', '2026-08-11 13:00:00', 'Terminalgatan 3', 'Malmö', 'cmtix5vtp0004ad7dc0g3et45', 'cmtix5vu20007ad7d0izn6m5j', 'Sök av inkommande gods från hamnen.', 'COMPLETED', 'cmtix5vv4000pad7df6vitzsi', '2026-09-01 17:06:31.317');

--
-- Data for Name: MissionAssignment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MissionAssignment" VALUES ('cmtix5w5f007dad7dod9hw4l7', 'cmtix5w5c007cad7dr5gsehjm', 'cmtix5vw40016ad7d5csui4jp', 'cmtix5vv4000pad7df6vitzsi', 'ACCEPTED', NULL, '2026-09-03 16:00:00', '2026-09-01 17:06:31.299');
INSERT INTO public."MissionAssignment" VALUES ('cmtix5w5i007fad7dd2d7kri7', 'cmtix5w5g007ead7d6mut8cat', 'cmtix5vw40016ad7d5csui4jp', 'cmtix5vv4000pad7df6vitzsi', 'OFFERED', NULL, NULL, '2026-09-01 17:06:31.302');
INSERT INTO public."MissionAssignment" VALUES ('cmtix5w5p007jad7d7g0eaizi', 'cmtix5w5o007iad7dcyawzkg6', 'cmtix5vwq001had7dvclu7edo', 'cmtix5vv4000pad7df6vitzsi', 'ACCEPTED', NULL, '2026-09-06 16:00:00', '2026-09-01 17:06:31.309');
INSERT INTO public."MissionAssignment" VALUES ('cmtix5w5s007lad7dst1fh0lu', 'cmtix5w5r007kad7dspyvwupt', 'cmtix5vw40016ad7d5csui4jp', 'cmtix5vv4000pad7df6vitzsi', 'COMPLETED', NULL, '2026-08-21 16:00:00', '2026-09-01 17:06:31.312');
INSERT INTO public."MissionAssignment" VALUES ('cmtix5w5v007nad7d7vblqpnx', 'cmtix5w5u007mad7dfig2ibhe', 'cmtix5vwi001bad7dx4xwyvit', 'cmtix5vv4000pad7df6vitzsi', 'COMPLETED', NULL, '2026-08-14 16:00:00', '2026-09-01 17:06:31.315');
INSERT INTO public."MissionAssignment" VALUES ('cmtix5w5y007pad7dtgb27hp3', 'cmtix5w5x007oad7dn3d37h6g', 'cmtix5vwv001mad7d1dscjvl8', 'cmtix5vv4000pad7df6vitzsi', 'COMPLETED', NULL, '2026-08-10 16:00:00', '2026-09-01 17:06:31.318');

--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Notification" VALUES ('cmtix5w6l007yad7dc38k5ixn', 'cmtix5vum000had7dre87cv96', 'MISSION_ASSIGNED', 'Nytt uppdrag: Evenemangssök', 'Friends Arena, Solna – 14:30. Svara ja eller nej i uppdragsvyn.', '/uppdrag/cmtix5w5g007ead7d6mut8cat', NULL, '2026-08-31 15:20:00');
INSERT INTO public."Notification" VALUES ('cmtix5w6n007zad7d7m5j4s17', 'cmtix5vum000had7dre87cv96', 'COMMENT', 'Anna Karlsson kommenterade din träning', 'Bra jobbat! Fortsätt nöta på uthålligheten.', '/traning/cmtix5vzj003gad7dkutf3406', NULL, '2026-08-24 09:15:00');
INSERT INTO public."Notification" VALUES ('cmtix5w6o0080ad7dzfnwxijk', 'cmtix5vum000had7dre87cv96', 'FOLLOW_UP', 'Kallelse till uppföljning', 'Anna Karlsson vill följa upp höga gömmor.', '/traning', NULL, '2026-08-30 10:00:00');
INSERT INTO public."Notification" VALUES ('cmtix5w6q0081ad7dg7nezpwt', 'cmtix5vum000had7dre87cv96', 'SESSION_APPROVED', 'Träning godkänd', 'Områdessök – Skog, Tyresta är godkänt.', '/traning/cmtix5vzj003gad7dkutf3406', '2026-08-25 08:00:00', '2026-08-24 12:00:00');
INSERT INTO public."Notification" VALUES ('cmtix5w6r0082ad7dtgl2yv6w', 'cmtix5vuu000jad7darz2llha', 'CERT_EXPIRING', 'Behörighet löper ut', 'Auktoriserat ekipage för Balder går ut om 2 dagar.', '/certifikat', NULL, '2026-08-31 07:00:00');
INSERT INTO public."Notification" VALUES ('cmtix5w6s0083ad7dm25j81ky', 'cmtix5vv1000nad7dz361cpim', 'COMMENT', 'Nytt träningspass att granska', 'Erik Andersson har skickat in Fordonssök – Fordon.', '/instruktor', NULL, '2026-08-29 18:40:00');
INSERT INTO public."Notification" VALUES ('cmtix5w6t0084ad7dqlsm4nu9', 'cmtix5vv4000pad7df6vitzsi', 'COMMENT', 'Ny rapport inskickad', 'Sofie Holm har skickat in rapport för UPP-2422.', '/rapporter', NULL, '2026-08-11 13:15:00');

--
-- Data for Name: OperationalReport; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."OperationalReport" VALUES ('cmtix5w64007qad7dy33x1vel', 'cmtix5w5r007kad7dspyvwupt', 'cmtix5vw40016ad7d5csui4jp', 'cmtix5vum000had7dre87cv96', 'Terminal 5, bagagehall samt angränsande lastutrymme.', '1 paket – Narkotika (Cannabis), cirka 400 gram.', 'Inga', 'Överlämnat till polis på plats. Kvitto nummer 41221 erhållet.', '2026-08-22 08:00:00', '2026-08-22 10:20:00', 'APPROVED', '2026-08-22 11:00:00', 'cmtix5vv4000pad7df6vitzsi', '2026-08-23 09:30:00', '2026-08-22 10:45:00', '2026-09-01 17:06:31.324');
INSERT INTO public."OperationalReport" VALUES ('cmtix5w69007tad7dc7lgd64g', 'cmtix5w5u007mad7dfig2ibhe', 'cmtix5vwi001bad7dx4xwyvit', 'cmtix5vum000had7dre87cv96', 'Lagerhall A och B, samtliga ställage samt lastkaj.', 'Inga fynd.', 'Port 4 gick inte att öppna, avsnittet kunde inte genomsökas.', 'Avvikelsen rapporterad till lagerchef Tomas Ek.', '2026-08-15 13:00:00', '2026-08-15 15:45:00', 'APPROVED', '2026-08-15 16:30:00', 'cmtix5vv4000pad7df6vitzsi', '2026-08-16 08:15:00', '2026-08-15 16:20:00', '2026-09-01 17:06:31.329');
INSERT INTO public."OperationalReport" VALUES ('cmtix5w6d007uad7dy8e01dck', 'cmtix5w5x007oad7dn3d37h6g', 'cmtix5vwv001mad7d1dscjvl8', 'cmtix5vuw000kad7d6orv533c', 'Inkommande gods, container 1–14.', '1 fynd – misstänkt narkotika i container 9.', 'Inga', 'Godset avskilt och överlämnat till Tullverket.', '2026-08-11 09:00:00', '2026-08-11 12:30:00', 'SUBMITTED', '2026-08-11 13:10:00', NULL, NULL, '2026-08-11 12:55:00', '2026-09-01 17:06:31.333');

--
-- Data for Name: PlannedExercise; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."PlannedExercise" VALUES ('cmtix5vz4003bad7dcqkxr2dr', 'cmtix5vz20039ad7d6c1rsgv2', 'Höga gömmor i lagermiljö', 'Placera gömmor på 150–220 cm. Belöna först vid tydlig och kvarstående markering.', 'cmtix5vu40008ad7doprf5u88', 'Narkotika', 'Lagerlokal', '2026-09-14 08:00:00', 2, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtix5vz4003cad7d0nberehk', 'cmtix5vz20039ad7d6c1rsgv2', 'Fordonssök under tidspress', 'Sex fordon, max 12 minuter totalt. Syftet är att hålla noggrannheten uppe när tempot ökar.', 'cmtix5vu20007ad7d0izn6m5j', 'Narkotika', 'Fordon', '2026-09-21 08:00:00', 3, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtix5vzb003ead7d03wqxrvl', 'cmtix5vza003dad7dc8t9fb6b', 'Vinkelspår 600 meter', 'Tre räta vinklar, 45 minuter gammalt spår.', 'cmtix5vty0005ad7dwvwckxsk', 'Människa', 'Stadsmiljö', '2026-09-05 08:00:00', 1, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtix5vzb003fad7d93145el3', 'cmtix5vza003dad7dc8t9fb6b', 'Ytsök öppen mark 30 minuter', 'Två figuranter, växlande vindriktning.', 'cmtix5vu00006ad7dy2ny6n3a', 'Människa', 'Öppen mark', '2026-09-12 08:00:00', 2, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmtix5vz4003aad7ddt5hqy0i', 'cmtix5vz20039ad7d6c1rsgv2', 'Områdessök 45 minuter i kuperad skog', 'Två pass om 45 minuter med minst fem gömmor. Fokus på systematiskt sökmönster och att hunden håller tempot hela passet.', 'cmtix5vu40008ad7doprf5u88', 'Narkotika', 'Skog', '2026-09-07 08:00:00', 1, 'COMPLETED');

--
-- Data for Name: Region; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Region" VALUES ('cmtix5vte0000ad7dav28fpyq', 'NORD', 'Region Nord', 1);
INSERT INTO public."Region" VALUES ('cmtix5vtj0001ad7dv3v6fkia', 'MITT', 'Region Mitt', 2);
INSERT INTO public."Region" VALUES ('cmtix5vtm0002ad7d0vwmfpdc', 'OST', 'Region Öst', 3);
INSERT INTO public."Region" VALUES ('cmtix5vto0003ad7dbf4sykrn', 'VAST', 'Region Väst', 4);
INSERT INTO public."Region" VALUES ('cmtix5vtp0004ad7dc0g3et45', 'SYD', 'Region Syd', 5);

--
-- Data for Name: SearchDiscipline; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."SearchDiscipline" VALUES ('cmtix5vty0005ad7dwvwckxsk', 'SPAR', 'Spårsök', 'SÖK – SPÅR', 'Spårsök efter person eller föremål.', 1);
INSERT INTO public."SearchDiscipline" VALUES ('cmtix5vu00006ad7dy2ny6n3a', 'YTA', 'Ytsök', 'SÖK – YTA', 'Ytsök över öppna och bebyggda områden.', 2);
INSERT INTO public."SearchDiscipline" VALUES ('cmtix5vu20007ad7d0izn6m5j', 'GODS', 'Godssök', 'SÖK – GODS', 'Sök i gods, bagage och fordon.', 3);
INSERT INTO public."SearchDiscipline" VALUES ('cmtix5vu40008ad7doprf5u88', 'NARKOTIKA', 'Narkotika', 'NARKOTIKA', 'Sök efter narkotiska preparat.', 4);
INSERT INTO public."SearchDiscipline" VALUES ('cmtix5vu50009ad7dj7v69rfg', 'SPRANG', 'Sprängämnen', 'SPRÄNGÄMNEN', 'Sök efter explosiva ämnen.', 5);
INSERT INTO public."SearchDiscipline" VALUES ('cmtix5vu6000aad7dqqaam7e5', 'VAPEN', 'Vapen', 'VAPEN', 'Sök efter vapen och ammunition.', 6);

--
-- Data for Name: Team; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Team" VALUES ('cmtix5vw40016ad7d5csui4jp', 'cmtix5vum000had7dre87cv96', 'cmtix5vvx000yad7dzle8o0xx', 'cmtix5vtm0002ad7d0vwmfpdc', '2024-06-23 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtix5vwi001bad7dx4xwyvit', 'cmtix5vum000had7dre87cv96', 'cmtix5vwd0017ad7dmqdhnc2a', 'cmtix5vtm0002ad7d0vwmfpdc', '2023-05-20 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtix5vwq001had7dvclu7edo', 'cmtix5vuu000jad7darz2llha', 'cmtix5vwm001cad7d3x95besk', 'cmtix5vto0003ad7dbf4sykrn', '2023-12-06 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtix5vwv001mad7d1dscjvl8', 'cmtix5vuw000kad7d6orv533c', 'cmtix5vws001iad7dtx5pb735', 'cmtix5vtp0004ad7dc0g3et45', '2025-01-09 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtix5vx2001sad7dao4t8erm', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vwz001nad7d3ud9et2b', 'cmtix5vtm0002ad7d0vwmfpdc', '2022-11-01 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtix5vx8001xad7dixg0we98', 'cmtix5vuy000lad7d0wvtqn46', 'cmtix5vx5001tad7dpdgaui78', 'cmtix5vte0000ad7dav28fpyq', '2025-07-28 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtix5vxe0022ad7d0zqbldup', 'cmtix5vuz000mad7dwmuuqn9b', 'cmtix5vxb001yad7d9pow87ln', 'cmtix5vtj0001ad7dv3v6fkia', '2022-04-15 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmtix5vxi0027ad7du9ius270', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vxf0023ad7d8ckeewhl', 'cmtix5vtm0002ad7d0vwmfpdc', '2024-06-23 08:00:00', NULL, 'ACTIVE');

--
-- Data for Name: TeamAvailability; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TeamAvailability" VALUES ('cmtix5vxt002gad7d3vt5pi45', 'cmtix5vw40016ad7d5csui4jp', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtix5vxu002had7d38jfs7l1', 'cmtix5vwi001bad7dx4xwyvit', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtix5vxv002iad7duio01x4b', 'cmtix5vwq001had7dvclu7edo', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtix5vxw002jad7ddl3o9u3d', 'cmtix5vwv001mad7d1dscjvl8', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtix5vxx002kad7d19gptawc', 'cmtix5vx2001sad7dao4t8erm', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtix5vxy002lad7dbwa49t9f', 'cmtix5vx8001xad7dixg0we98', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtix5vxz002mad7d2fs91fgl', 'cmtix5vxe0022ad7d0zqbldup', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtix5vy0002nad7dbpalfy8f', 'cmtix5vxi0027ad7du9ius270', '2026-09-01 06:00:00', '2026-10-01 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmtix5vy1002oad7ditms647m', 'cmtix5vxe0022ad7d0zqbldup', '2026-09-03 00:00:00', '2026-09-10 23:00:00', 'UNAVAILABLE', 'Semester');

--
-- Data for Name: TrainingPlan; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TrainingPlan" VALUES ('cmtix5vz20039ad7d6c1rsgv2', 'cmtix5vw40016ad7d5csui4jp', 'cmtix5vv1000nad7dz361cpim', 'Uthållighet i svår terräng', 'Bygga uthållighet över längre sök och stabilisera markering vid stenrösen och rotvältor.', '2026-08-11 08:00:00', '2026-10-06 08:00:00', 'ACTIVE', '2026-09-01 17:06:31.071');
INSERT INTO public."TrainingPlan" VALUES ('cmtix5vza003dad7dc8t9fb6b', 'cmtix5vwq001had7dvclu7edo', 'cmtix5vv2000oad7doc3e6u44', 'Spårsäkerhet på hårt underlag', 'Öka spårsäkerheten på asfalt och grus samt vid vinkelspår.', '2026-08-18 08:00:00', '2026-10-13 08:00:00', 'ACTIVE', '2026-09-01 17:06:31.078');

--
-- Data for Name: TrainingSession; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TrainingSession" VALUES ('cmtix5vzr003mad7deyhwfjgc', 'cmtix5vw40016ad7d5csui4jp', NULL, '2026-08-16 13:30:00', '2026-08-16 15:00:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 6, 6, 'Felfritt pass. Hög arbetsglädje genom hela söket.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-08-17 12:00:00', '2026-09-01 17:06:31.095', '2026-09-01 17:06:31.095');
INSERT INTO public."TrainingSession" VALUES ('cmtix5vzz003tad7dvz6awr3f', 'cmtix5vw40016ad7d5csui4jp', NULL, '2026-08-09 08:00:00', '2026-08-09 09:45:00', 'Arlanda, hangar 4', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtix5vu50009ad7dj7v69rfg', 4, 3, 'Tveksam vid höga gömmor. Behöver mer träning över 180 cm.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-08-10 12:00:00', '2026-09-01 17:06:31.103', '2026-09-01 17:06:31.103');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w07003yad7d3mj79jo5', 'cmtix5vw40016ad7d5csui4jp', NULL, '2026-08-29 17:00:00', '2026-08-29 18:30:00', 'Farsta industriområde', 'Fordonssök', 'Fordon', 'Narkotika', 'cmtix5vu20007ad7d0izn6m5j', 5, 5, 'Snabbt och rent sök på sex fordon.', 'SUBMITTED', 'cmtix5vum000had7dre87cv96', NULL, NULL, '2026-09-01 17:06:31.111', '2026-09-01 17:06:31.111');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w0e0044ad7desur0njc', 'cmtix5vwi001bad7dx4xwyvit', NULL, '2026-08-27 10:00:00', '2026-08-27 11:30:00', 'Södertälje hamn', 'Bagagesök', 'Lagerlokal', 'Narkotika', 'cmtix5vu20007ad7d0izn6m5j', 4, 4, 'Stabilt. Rex arbetar lugnt och metodiskt.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-08-28 12:00:00', '2026-09-01 17:06:31.118', '2026-09-01 17:06:31.118');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w0k0049ad7d0kziqmji', 'cmtix5vwq001had7dvclu7edo', NULL, '2026-08-30 07:30:00', '2026-08-30 09:00:00', 'Slottsskogen, Göteborg', 'Spårarbete', 'Öppen mark', 'Människa', 'cmtix5vty0005ad7dwvwckxsk', 3, 3, 'Höll spåret genom samtliga vinklar.', 'SUBMITTED', 'cmtix5vuu000jad7darz2llha', NULL, NULL, '2026-09-01 17:06:31.124', '2026-09-01 17:06:31.124');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w0p004dad7dtderuuk2', 'cmtix5vwv001mad7d1dscjvl8', NULL, '2026-08-28 14:00:00', '2026-08-28 15:30:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 4, 'En falsk markering vid tomt kolli.', 'APPROVED', 'cmtix5vuw000kad7d6orv533c', 'cmtix5vv1000nad7dz361cpim', '2026-08-29 12:00:00', '2026-09-01 17:06:31.129', '2026-09-01 17:06:31.129');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w0w004jad7dfxi2cquz', 'cmtix5vx2001sad7dao4t8erm', NULL, '2026-08-26 09:00:00', '2026-08-26 10:45:00', 'Arlanda terminal 5', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtix5vu50009ad7dj7v69rfg', 6, 5, 'Bra tempo, tappade fokus mot slutet av passet.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-08-27 12:00:00', '2026-09-01 17:06:31.136', '2026-09-01 17:06:31.136');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w12004qad7d7cenli2b', 'cmtix5vx8001xad7dixg0we98', NULL, '2026-08-24 11:00:00', '2026-08-24 12:15:00', 'Umeå, Nydalaområdet', 'Områdessök', 'Skog', 'Människa', 'cmtix5vu00006ad7dy2ny6n3a', 3, 2, 'Ung hund, behöver kortare pass tills uthålligheten byggts upp.', 'APPROVED', 'cmtix5vuy000lad7d0wvtqn46', 'cmtix5vv2000oad7doc3e6u44', '2026-08-25 12:00:00', '2026-09-01 17:06:31.142', '2026-09-01 17:06:31.142');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w18004uad7dx2wa9mup', 'cmtix5vxe0022ad7d0zqbldup', NULL, '2026-08-20 08:30:00', '2026-08-20 10:00:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 5, 'Rutinerat och effektivt.', 'APPROVED', 'cmtix5vuz000mad7dwmuuqn9b', 'cmtix5vv2000oad7doc3e6u44', '2026-08-21 12:00:00', '2026-09-01 17:06:31.148', '2026-09-01 17:06:31.148');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w1b0050ad7d6skm4yop', 'cmtix5vxi0027ad7du9ius270', NULL, '2026-08-25 15:00:00', '2026-08-25 16:20:00', 'Södertälje, Ronna', 'Personsök', 'Stadsmiljö', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 4, 3, 'Störningsträning i folkvimmel. God kontakt med föraren.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-08-26 12:00:00', '2026-09-01 17:06:31.151', '2026-09-01 17:06:31.151');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w1f0055ad7d7165eaif', 'cmtix5vw40016ad7d5csui4jp', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-07-27 12:00:00', '2026-09-01 17:06:31.155', '2026-09-01 17:06:31.155');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w1k0056ad7deev3kxif', 'cmtix5vw40016ad7d5csui4jp', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-07-14 12:00:00', '2026-09-01 17:06:31.16', '2026-09-01 17:06:31.16');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w1q0057ad7ddsqbyvty', 'cmtix5vw40016ad7d5csui4jp', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-07-01 12:00:00', '2026-09-01 17:06:31.166', '2026-09-01 17:06:31.166');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w1r0058ad7dumpii8u2', 'cmtix5vw40016ad7d5csui4jp', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-06-15 12:00:00', '2026-09-01 17:06:31.167', '2026-09-01 17:06:31.167');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w1t0059ad7d73qp59dk', 'cmtix5vw40016ad7d5csui4jp', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-06-02 12:00:00', '2026-09-01 17:06:31.169', '2026-09-01 17:06:31.169');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w1u005aad7dpn4wruaf', 'cmtix5vw40016ad7d5csui4jp', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-05-20 12:00:00', '2026-09-01 17:06:31.17', '2026-09-01 17:06:31.17');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w1w005bad7ddapiw5qu', 'cmtix5vw40016ad7d5csui4jp', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-05-04 12:00:00', '2026-09-01 17:06:31.172', '2026-09-01 17:06:31.172');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w1y005cad7dfo43xzrm', 'cmtix5vw40016ad7d5csui4jp', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-04-21 12:00:00', '2026-09-01 17:06:31.174', '2026-09-01 17:06:31.174');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w1z005dad7d3s2fmnu4', 'cmtix5vw40016ad7d5csui4jp', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-04-08 12:00:00', '2026-09-01 17:06:31.175', '2026-09-01 17:06:31.175');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w20005ead7ddb7s920p', 'cmtix5vwi001bad7dx4xwyvit', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu20007ad7d0izn6m5j', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-07-27 12:00:00', '2026-09-01 17:06:31.176', '2026-09-01 17:06:31.176');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w22005fad7dbjnwvtbs', 'cmtix5vwi001bad7dx4xwyvit', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu20007ad7d0izn6m5j', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-07-14 12:00:00', '2026-09-01 17:06:31.178', '2026-09-01 17:06:31.178');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w23005gad7dbw9vuvfp', 'cmtix5vwi001bad7dx4xwyvit', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu20007ad7d0izn6m5j', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-07-01 12:00:00', '2026-09-01 17:06:31.179', '2026-09-01 17:06:31.179');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w24005had7dvqqruj43', 'cmtix5vwi001bad7dx4xwyvit', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu20007ad7d0izn6m5j', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-06-15 12:00:00', '2026-09-01 17:06:31.18', '2026-09-01 17:06:31.18');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w26005iad7dn2r3hcps', 'cmtix5vwi001bad7dx4xwyvit', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu20007ad7d0izn6m5j', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-06-02 12:00:00', '2026-09-01 17:06:31.182', '2026-09-01 17:06:31.182');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w28005jad7dk7a1sxfq', 'cmtix5vwi001bad7dx4xwyvit', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu20007ad7d0izn6m5j', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-05-20 12:00:00', '2026-09-01 17:06:31.184', '2026-09-01 17:06:31.184');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2a005kad7dq6tqitnc', 'cmtix5vwi001bad7dx4xwyvit', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu20007ad7d0izn6m5j', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-05-04 12:00:00', '2026-09-01 17:06:31.186', '2026-09-01 17:06:31.186');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2c005lad7d4k8v0acn', 'cmtix5vwi001bad7dx4xwyvit', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu20007ad7d0izn6m5j', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-04-21 12:00:00', '2026-09-01 17:06:31.188', '2026-09-01 17:06:31.188');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2d005mad7dh7auel4y', 'cmtix5vwi001bad7dx4xwyvit', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu20007ad7d0izn6m5j', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-04-08 12:00:00', '2026-09-01 17:06:31.189', '2026-09-01 17:06:31.189');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2f005nad7d88zv1lo6', 'cmtix5vwq001had7dvclu7edo', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtix5vty0005ad7dwvwckxsk', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuu000jad7darz2llha', 'cmtix5vv2000oad7doc3e6u44', '2026-07-27 12:00:00', '2026-09-01 17:06:31.191', '2026-09-01 17:06:31.191');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2g005oad7dcl48vxy5', 'cmtix5vwq001had7dvclu7edo', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Människa', 'cmtix5vty0005ad7dwvwckxsk', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuu000jad7darz2llha', 'cmtix5vv2000oad7doc3e6u44', '2026-07-14 12:00:00', '2026-09-01 17:06:31.192', '2026-09-01 17:06:31.192');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2i005pad7dhop8qsat', 'cmtix5vwq001had7dvclu7edo', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtix5vty0005ad7dwvwckxsk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuu000jad7darz2llha', 'cmtix5vv2000oad7doc3e6u44', '2026-07-01 12:00:00', '2026-09-01 17:06:31.194', '2026-09-01 17:06:31.194');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2k005qad7dunkcqwhm', 'cmtix5vwq001had7dvclu7edo', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtix5vty0005ad7dwvwckxsk', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuu000jad7darz2llha', 'cmtix5vv2000oad7doc3e6u44', '2026-06-15 12:00:00', '2026-09-01 17:06:31.196', '2026-09-01 17:06:31.196');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2l005rad7d1fyr06k6', 'cmtix5vwq001had7dvclu7edo', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtix5vty0005ad7dwvwckxsk', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuu000jad7darz2llha', 'cmtix5vv2000oad7doc3e6u44', '2026-06-02 12:00:00', '2026-09-01 17:06:31.197', '2026-09-01 17:06:31.197');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2n005sad7dpr860nbj', 'cmtix5vwq001had7dvclu7edo', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtix5vty0005ad7dwvwckxsk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuu000jad7darz2llha', 'cmtix5vv2000oad7doc3e6u44', '2026-05-20 12:00:00', '2026-09-01 17:06:31.199', '2026-09-01 17:06:31.199');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2p005tad7d14v5cmno', 'cmtix5vwq001had7dvclu7edo', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtix5vty0005ad7dwvwckxsk', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuu000jad7darz2llha', 'cmtix5vv2000oad7doc3e6u44', '2026-05-04 12:00:00', '2026-09-01 17:06:31.201', '2026-09-01 17:06:31.201');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2q005uad7df7biflb5', 'cmtix5vwq001had7dvclu7edo', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Människa', 'cmtix5vty0005ad7dwvwckxsk', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuu000jad7darz2llha', 'cmtix5vv2000oad7doc3e6u44', '2026-04-21 12:00:00', '2026-09-01 17:06:31.202', '2026-09-01 17:06:31.202');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2s005vad7dv0ggbcf4', 'cmtix5vwq001had7dvclu7edo', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtix5vty0005ad7dwvwckxsk', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuu000jad7darz2llha', 'cmtix5vv2000oad7doc3e6u44', '2026-04-08 12:00:00', '2026-09-01 17:06:31.204', '2026-09-01 17:06:31.204');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2t005wad7dolxwgh05', 'cmtix5vwv001mad7d1dscjvl8', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuw000kad7d6orv533c', 'cmtix5vv1000nad7dz361cpim', '2026-07-27 12:00:00', '2026-09-01 17:06:31.205', '2026-09-01 17:06:31.205');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2v005xad7drm2cadhq', 'cmtix5vwv001mad7d1dscjvl8', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuw000kad7d6orv533c', 'cmtix5vv1000nad7dz361cpim', '2026-07-14 12:00:00', '2026-09-01 17:06:31.207', '2026-09-01 17:06:31.207');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2x005yad7dfm9k3y2h', 'cmtix5vwv001mad7d1dscjvl8', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuw000kad7d6orv533c', 'cmtix5vv1000nad7dz361cpim', '2026-07-01 12:00:00', '2026-09-01 17:06:31.209', '2026-09-01 17:06:31.209');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w2y005zad7daozbd1dx', 'cmtix5vwv001mad7d1dscjvl8', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuw000kad7d6orv533c', 'cmtix5vv1000nad7dz361cpim', '2026-06-15 12:00:00', '2026-09-01 17:06:31.21', '2026-09-01 17:06:31.21');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w300060ad7d7yyl3s3v', 'cmtix5vwv001mad7d1dscjvl8', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuw000kad7d6orv533c', 'cmtix5vv1000nad7dz361cpim', '2026-06-02 12:00:00', '2026-09-01 17:06:31.212', '2026-09-01 17:06:31.212');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w320061ad7dlnjrbm7h', 'cmtix5vwv001mad7d1dscjvl8', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuw000kad7d6orv533c', 'cmtix5vv1000nad7dz361cpim', '2026-05-20 12:00:00', '2026-09-01 17:06:31.214', '2026-09-01 17:06:31.214');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w330062ad7d7n1n9hng', 'cmtix5vwv001mad7d1dscjvl8', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuw000kad7d6orv533c', 'cmtix5vv1000nad7dz361cpim', '2026-05-04 12:00:00', '2026-09-01 17:06:31.215', '2026-09-01 17:06:31.215');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w350063ad7drqyssxde', 'cmtix5vwv001mad7d1dscjvl8', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuw000kad7d6orv533c', 'cmtix5vv1000nad7dz361cpim', '2026-04-21 12:00:00', '2026-09-01 17:06:31.217', '2026-09-01 17:06:31.217');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w360064ad7dg1jny2o2', 'cmtix5vwv001mad7d1dscjvl8', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuw000kad7d6orv533c', 'cmtix5vv1000nad7dz361cpim', '2026-04-08 12:00:00', '2026-09-01 17:06:31.218', '2026-09-01 17:06:31.218');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w380065ad7dj9cj1iv0', 'cmtix5vx2001sad7dao4t8erm', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtix5vu50009ad7dj7v69rfg', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-07-27 12:00:00', '2026-09-01 17:06:31.22', '2026-09-01 17:06:31.22');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w390066ad7dy6ts8yth', 'cmtix5vx2001sad7dao4t8erm', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtix5vu50009ad7dj7v69rfg', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-07-14 12:00:00', '2026-09-01 17:06:31.221', '2026-09-01 17:06:31.221');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3b0067ad7db5a25gwy', 'cmtix5vx2001sad7dao4t8erm', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtix5vu50009ad7dj7v69rfg', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-07-01 12:00:00', '2026-09-01 17:06:31.223', '2026-09-01 17:06:31.223');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3d0068ad7d1lcpczaz', 'cmtix5vx2001sad7dao4t8erm', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtix5vu50009ad7dj7v69rfg', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-06-15 12:00:00', '2026-09-01 17:06:31.225', '2026-09-01 17:06:31.225');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3f0069ad7dhybjrjc0', 'cmtix5vx2001sad7dao4t8erm', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtix5vu50009ad7dj7v69rfg', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-06-02 12:00:00', '2026-09-01 17:06:31.227', '2026-09-01 17:06:31.227');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3g006aad7dizbjz7p6', 'cmtix5vx2001sad7dao4t8erm', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtix5vu50009ad7dj7v69rfg', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-05-20 12:00:00', '2026-09-01 17:06:31.228', '2026-09-01 17:06:31.228');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3i006bad7d6wmkm239', 'cmtix5vx2001sad7dao4t8erm', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtix5vu50009ad7dj7v69rfg', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-05-04 12:00:00', '2026-09-01 17:06:31.23', '2026-09-01 17:06:31.23');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3k006cad7dwcje2lqv', 'cmtix5vx2001sad7dao4t8erm', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmtix5vu50009ad7dj7v69rfg', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-04-21 12:00:00', '2026-09-01 17:06:31.232', '2026-09-01 17:06:31.232');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3l006dad7dfc9zcwe0', 'cmtix5vx2001sad7dao4t8erm', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmtix5vu50009ad7dj7v69rfg', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-04-08 12:00:00', '2026-09-01 17:06:31.233', '2026-09-01 17:06:31.233');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3n006ead7dtspl13ht', 'cmtix5vx8001xad7dixg0we98', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtix5vu00006ad7dy2ny6n3a', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuy000lad7d0wvtqn46', 'cmtix5vv2000oad7doc3e6u44', '2026-07-27 12:00:00', '2026-09-01 17:06:31.235', '2026-09-01 17:06:31.235');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3o006fad7dwtk8ey15', 'cmtix5vx8001xad7dixg0we98', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Människa', 'cmtix5vu00006ad7dy2ny6n3a', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuy000lad7d0wvtqn46', 'cmtix5vv2000oad7doc3e6u44', '2026-07-14 12:00:00', '2026-09-01 17:06:31.236', '2026-09-01 17:06:31.236');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3q006gad7dfk1o6l1m', 'cmtix5vx8001xad7dixg0we98', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtix5vu00006ad7dy2ny6n3a', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuy000lad7d0wvtqn46', 'cmtix5vv2000oad7doc3e6u44', '2026-07-01 12:00:00', '2026-09-01 17:06:31.238', '2026-09-01 17:06:31.238');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3r006had7d288jx44a', 'cmtix5vx8001xad7dixg0we98', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtix5vu00006ad7dy2ny6n3a', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuy000lad7d0wvtqn46', 'cmtix5vv2000oad7doc3e6u44', '2026-06-15 12:00:00', '2026-09-01 17:06:31.239', '2026-09-01 17:06:31.239');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3t006iad7de06afq1c', 'cmtix5vx8001xad7dixg0we98', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtix5vu00006ad7dy2ny6n3a', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuy000lad7d0wvtqn46', 'cmtix5vv2000oad7doc3e6u44', '2026-06-02 12:00:00', '2026-09-01 17:06:31.241', '2026-09-01 17:06:31.241');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3v006jad7d4dy2duo8', 'cmtix5vx8001xad7dixg0we98', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Människa', 'cmtix5vu00006ad7dy2ny6n3a', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuy000lad7d0wvtqn46', 'cmtix5vv2000oad7doc3e6u44', '2026-05-20 12:00:00', '2026-09-01 17:06:31.243', '2026-09-01 17:06:31.243');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3w006kad7d9hwe7q8u', 'cmtix5vx8001xad7dixg0we98', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtix5vu00006ad7dy2ny6n3a', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuy000lad7d0wvtqn46', 'cmtix5vv2000oad7doc3e6u44', '2026-05-04 12:00:00', '2026-09-01 17:06:31.244', '2026-09-01 17:06:31.244');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3y006lad7dqalwvafe', 'cmtix5vx8001xad7dixg0we98', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Människa', 'cmtix5vu00006ad7dy2ny6n3a', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuy000lad7d0wvtqn46', 'cmtix5vv2000oad7doc3e6u44', '2026-04-21 12:00:00', '2026-09-01 17:06:31.246', '2026-09-01 17:06:31.246');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w3z006mad7d77udcg96', 'cmtix5vx8001xad7dixg0we98', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmtix5vu00006ad7dy2ny6n3a', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuy000lad7d0wvtqn46', 'cmtix5vv2000oad7doc3e6u44', '2026-04-08 12:00:00', '2026-09-01 17:06:31.247', '2026-09-01 17:06:31.247');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w41006nad7dm2u0a6op', 'cmtix5vxe0022ad7d0zqbldup', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuz000mad7dwmuuqn9b', 'cmtix5vv2000oad7doc3e6u44', '2026-07-27 12:00:00', '2026-09-01 17:06:31.249', '2026-09-01 17:06:31.249');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w42006oad7dsbulwc5d', 'cmtix5vxe0022ad7d0zqbldup', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuz000mad7dwmuuqn9b', 'cmtix5vv2000oad7doc3e6u44', '2026-07-14 12:00:00', '2026-09-01 17:06:31.25', '2026-09-01 17:06:31.25');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w44006pad7d3wpe2u6k', 'cmtix5vxe0022ad7d0zqbldup', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuz000mad7dwmuuqn9b', 'cmtix5vv2000oad7doc3e6u44', '2026-07-01 12:00:00', '2026-09-01 17:06:31.252', '2026-09-01 17:06:31.252');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w46006qad7d9kepxlb3', 'cmtix5vxe0022ad7d0zqbldup', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuz000mad7dwmuuqn9b', 'cmtix5vv2000oad7doc3e6u44', '2026-06-15 12:00:00', '2026-09-01 17:06:31.254', '2026-09-01 17:06:31.254');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w47006rad7d5jsdsx2u', 'cmtix5vxe0022ad7d0zqbldup', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuz000mad7dwmuuqn9b', 'cmtix5vv2000oad7doc3e6u44', '2026-06-02 12:00:00', '2026-09-01 17:06:31.255', '2026-09-01 17:06:31.255');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w49006sad7d8dk7p0h4', 'cmtix5vxe0022ad7d0zqbldup', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuz000mad7dwmuuqn9b', 'cmtix5vv2000oad7doc3e6u44', '2026-05-20 12:00:00', '2026-09-01 17:06:31.257', '2026-09-01 17:06:31.257');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w4a006tad7d3xlccwrl', 'cmtix5vxe0022ad7d0zqbldup', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuz000mad7dwmuuqn9b', 'cmtix5vv2000oad7doc3e6u44', '2026-05-04 12:00:00', '2026-09-01 17:06:31.258', '2026-09-01 17:06:31.258');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w4b006uad7difsrjpj6', 'cmtix5vxe0022ad7d0zqbldup', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuz000mad7dwmuuqn9b', 'cmtix5vv2000oad7doc3e6u44', '2026-04-21 12:00:00', '2026-09-01 17:06:31.259', '2026-09-01 17:06:31.259');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w4d006vad7dwwkgpjae', 'cmtix5vxe0022ad7d0zqbldup', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vuz000mad7dwmuuqn9b', 'cmtix5vv2000oad7doc3e6u44', '2026-04-08 12:00:00', '2026-09-01 17:06:31.261', '2026-09-01 17:06:31.261');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w4f006wad7djypdx9fn', 'cmtix5vxi0027ad7du9ius270', NULL, '2026-07-26 09:00:00', '2026-07-26 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-07-27 12:00:00', '2026-09-01 17:06:31.263', '2026-09-01 17:06:31.263');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w4h006xad7dv1vw3req', 'cmtix5vxi0027ad7du9ius270', NULL, '2026-07-13 09:00:00', '2026-07-13 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-07-14 12:00:00', '2026-09-01 17:06:31.265', '2026-09-01 17:06:31.265');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w4j006yad7ddcn0bxko', 'cmtix5vxi0027ad7du9ius270', NULL, '2026-06-30 09:00:00', '2026-06-30 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-07-01 12:00:00', '2026-09-01 17:06:31.267', '2026-09-01 17:06:31.267');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w4l006zad7d1q0yi0xr', 'cmtix5vxi0027ad7du9ius270', NULL, '2026-06-14 09:00:00', '2026-06-14 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-06-15 12:00:00', '2026-09-01 17:06:31.269', '2026-09-01 17:06:31.269');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w4n0070ad7d15zz1ybb', 'cmtix5vxi0027ad7du9ius270', NULL, '2026-06-01 09:00:00', '2026-06-01 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-06-02 12:00:00', '2026-09-01 17:06:31.271', '2026-09-01 17:06:31.271');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w4o0071ad7dt50evar5', 'cmtix5vxi0027ad7du9ius270', NULL, '2026-05-19 09:00:00', '2026-05-19 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-05-20 12:00:00', '2026-09-01 17:06:31.272', '2026-09-01 17:06:31.272');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w4p0072ad7dgpbregjd', 'cmtix5vxi0027ad7du9ius270', NULL, '2026-05-03 09:00:00', '2026-05-03 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-05-04 12:00:00', '2026-09-01 17:06:31.273', '2026-09-01 17:06:31.273');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w4r0073ad7dqq24vjb9', 'cmtix5vxi0027ad7du9ius270', NULL, '2026-04-20 09:00:00', '2026-04-20 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-04-21 12:00:00', '2026-09-01 17:06:31.275', '2026-09-01 17:06:31.275');
INSERT INTO public."TrainingSession" VALUES ('cmtix5w4s0074ad7de8767l1m', 'cmtix5vxi0027ad7du9ius270', NULL, '2026-04-07 09:00:00', '2026-04-07 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmtix5vur000iad7dshlkaw4q', 'cmtix5vv1000nad7dz361cpim', '2026-04-08 12:00:00', '2026-09-01 17:06:31.276', '2026-09-01 17:06:31.276');
INSERT INTO public."TrainingSession" VALUES ('cmtix5vzj003gad7dkutf3406', 'cmtix5vw40016ad7d5csui4jp', 'cmtix5vz4003aad7ddt5hqy0i', '2026-08-23 09:00:00', '2026-08-23 11:15:00', 'Tyresta, Stockholm', 'Områdessök', 'Skog', 'Narkotika', 'cmtix5vu40008ad7doprf5u88', 5, 4, 'Bra genomförande. Stabilt sök i svår terräng. Missade en gömma vid stenröse.', 'APPROVED', 'cmtix5vum000had7dre87cv96', 'cmtix5vv1000nad7dz361cpim', '2026-08-24 12:00:00', '2026-09-01 17:06:31.087', '2026-09-01 17:06:31.282');

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."User" VALUES ('cmtix5vum000had7dre87cv96', 'erik.andersson@avarn.se', 'Erik Andersson', '$2b$10$sAlj9zQ9RdLQNl9uMVwMfuXbSYTmCbF9rhcyf98hx7iUL3iG8U1FW', 'HANDLER', '070-123 45 67', true, NULL, '2026-09-01 17:06:30.911', 'cmtix5vtm0002ad7d0vwmfpdc');
INSERT INTO public."User" VALUES ('cmtix5vur000iad7dshlkaw4q', 'maria.svensson@avarn.se', 'Maria Svensson', '$2b$10$sAlj9zQ9RdLQNl9uMVwMfuXbSYTmCbF9rhcyf98hx7iUL3iG8U1FW', 'HANDLER', '070-234 56 78', true, NULL, '2026-09-01 17:06:30.915', 'cmtix5vtm0002ad7d0vwmfpdc');
INSERT INTO public."User" VALUES ('cmtix5vuu000jad7darz2llha', 'johan.larsson@avarn.se', 'Johan Larsson', '$2b$10$sAlj9zQ9RdLQNl9uMVwMfuXbSYTmCbF9rhcyf98hx7iUL3iG8U1FW', 'HANDLER', '070-345 67 89', true, NULL, '2026-09-01 17:06:30.918', 'cmtix5vto0003ad7dbf4sykrn');
INSERT INTO public."User" VALUES ('cmtix5vuw000kad7d6orv533c', 'sofie.holm@avarn.se', 'Sofie Holm', '$2b$10$sAlj9zQ9RdLQNl9uMVwMfuXbSYTmCbF9rhcyf98hx7iUL3iG8U1FW', 'HANDLER', '070-456 78 90', true, NULL, '2026-09-01 17:06:30.92', 'cmtix5vtp0004ad7dc0g3et45');
INSERT INTO public."User" VALUES ('cmtix5vuy000lad7d0wvtqn46', 'anders.berg@avarn.se', 'Anders Berg', '$2b$10$sAlj9zQ9RdLQNl9uMVwMfuXbSYTmCbF9rhcyf98hx7iUL3iG8U1FW', 'HANDLER', '070-567 89 01', true, NULL, '2026-09-01 17:06:30.922', 'cmtix5vte0000ad7dav28fpyq');
INSERT INTO public."User" VALUES ('cmtix5vuz000mad7dwmuuqn9b', 'lisa.ek@avarn.se', 'Lisa Ek', '$2b$10$sAlj9zQ9RdLQNl9uMVwMfuXbSYTmCbF9rhcyf98hx7iUL3iG8U1FW', 'HANDLER', '070-678 90 12', true, NULL, '2026-09-01 17:06:30.923', 'cmtix5vtj0001ad7dv3v6fkia');
INSERT INTO public."User" VALUES ('cmtix5vv1000nad7dz361cpim', 'anna.karlsson@avarn.se', 'Anna Karlsson', '$2b$10$sAlj9zQ9RdLQNl9uMVwMfuXbSYTmCbF9rhcyf98hx7iUL3iG8U1FW', 'INSTRUCTOR', '070-789 01 23', true, NULL, '2026-09-01 17:06:30.925', 'cmtix5vtm0002ad7d0vwmfpdc');
INSERT INTO public."User" VALUES ('cmtix5vv2000oad7doc3e6u44', 'peter.nyman@avarn.se', 'Peter Nyman', '$2b$10$sAlj9zQ9RdLQNl9uMVwMfuXbSYTmCbF9rhcyf98hx7iUL3iG8U1FW', 'INSTRUCTOR', '070-890 12 34', true, NULL, '2026-09-01 17:06:30.926', 'cmtix5vto0003ad7dbf4sykrn');
INSERT INTO public."User" VALUES ('cmtix5vv4000pad7df6vitzsi', 'karin.dahl@avarn.se', 'Karin Dahl', '$2b$10$sAlj9zQ9RdLQNl9uMVwMfuXbSYTmCbF9rhcyf98hx7iUL3iG8U1FW', 'REGIONAL_MANAGER', '070-901 23 45', true, NULL, '2026-09-01 17:06:30.928', 'cmtix5vtm0002ad7d0vwmfpdc');
INSERT INTO public."User" VALUES ('cmtix5vv6000qad7dr4om8sp0', 'magnus.oberg@avarn.se', 'Magnus Öberg', '$2b$10$sAlj9zQ9RdLQNl9uMVwMfuXbSYTmCbF9rhcyf98hx7iUL3iG8U1FW', 'NATIONAL_MANAGER', '070-012 34 56', true, NULL, '2026-09-01 17:06:30.93', NULL);
INSERT INTO public."User" VALUES ('cmtix5vv8000rad7dvurtlteb', 'admin@avarn.se', 'Systemadministratör', '$2b$10$sAlj9zQ9RdLQNl9uMVwMfuXbSYTmCbF9rhcyf98hx7iUL3iG8U1FW', 'ADMIN', NULL, true, NULL, '2026-09-01 17:06:30.932', NULL);

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations VALUES ('b4a08b03-3687-430e-9f5f-9c34b0c01b36', 'e67474ddd6e107de2df8cefbeb5f9cb6e3a15399718d0cd8c3a6d8d78a9d0c8c', '2026-08-31 12:57:11.315391+00', '20260831113658_init', NULL, NULL, '2026-08-31 12:57:11.093046+00', 1);
INSERT INTO public._prisma_migrations VALUES ('3d7aae2b-ae08-4fb0-91bb-7633c03f7cbe', '46e8787317de3b806f47ed777efef5ecb3002350aaaeeca5455f5bf036fa9468', '2026-09-01 11:49:55.942159+00', '20260901114955_media_dog_and_profile_photos', NULL, NULL, '2026-09-01 11:49:55.928359+00', 1);
INSERT INTO public._prisma_migrations VALUES ('4f1dd06b-cae0-4b7e-949a-b34da3490b65', '7a3e00b28b340daabfe9ce8d318466bfd08fbb6db1fd6513568939d204259f1f', '2026-09-01 16:58:16.970172+00', '20260901165816_dog_profile_details', NULL, NULL, '2026-09-01 16:58:16.964336+00', 1);

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
