--
-- Avarn Hundtjänst – komplett uppsättning av databasen
--
-- Klistra in hela den här filen i Supabase: SQL Editor > New query > Run.
-- Filen skapar samtliga tabeller, lägger in exempeldata och slår på
-- radsäkerhet. Den är avsedd för en tom databas och körs en gång.
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
    "certificationId" text
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

INSERT INTO public."Certification" VALUES ('cmth8tfh6002nci7dyefohs2p', 'cmth8tfbn000bci7daplfg0zq', NULL, NULL, 'cmth8tfdv0014ci7dj2j75fhm', 'Svenska Brukshundklubben', 'NHPR-8777', '2026-05-01 12:57:12.115', '2027-05-01 12:57:12.115', NULL, '2026-08-31 12:57:12.858');
INSERT INTO public."Certification" VALUES ('cmth8tfh9002oci7d7tm0rtkx', 'cmth8tfbp000cci7d72zdx405', NULL, NULL, 'cmth8tfdv0014ci7dj2j75fhm', 'Avarn Security', 'EKIPAGE-2513', '2025-12-31 12:57:12.115', '2027-12-31 12:57:12.115', NULL, '2026-08-31 12:57:12.861');
INSERT INTO public."Certification" VALUES ('cmth8tfhb002pci7dj1g478b5', 'cmth8tfbr000dci7dfkgdumlh', 'cmth8tfdn000yci7duxafu3hc', NULL, NULL, 'Avarn Security', 'NARK_CERT-6627', '2025-10-01 12:57:12.115', '2026-10-01 12:57:12.115', NULL, '2026-08-31 12:57:12.863');
INSERT INTO public."Certification" VALUES ('cmth8tfhd002qci7dc7ivpith', 'cmth8tfbn000bci7daplfg0zq', NULL, NULL, 'cmth8tfed0019ci7dykze3pyp', 'Svenska Brukshundklubben', 'NHPR-7703', '2025-10-31 12:57:12.115', '2026-10-31 12:57:12.115', NULL, '2026-08-31 12:57:12.865');
INSERT INTO public."Certification" VALUES ('cmth8tfhe002rci7djamg8r2e', 'cmth8tfbp000cci7d72zdx405', NULL, NULL, 'cmth8tfed0019ci7dykze3pyp', 'Avarn Security', 'EKIPAGE-3863', '2026-03-03 12:57:12.115', '2028-03-02 12:57:12.115', NULL, '2026-08-31 12:57:12.866');
INSERT INTO public."Certification" VALUES ('cmth8tfhg002sci7d9qt1nld9', 'cmth8tfbp000cci7d72zdx405', NULL, NULL, 'cmth8tfeu001fci7d6swxswqt', 'Avarn Security', 'EKIPAGE-5990', '2024-08-31 12:57:12.115', '2026-09-02 12:00:00', NULL, '2026-08-31 12:57:12.868');
INSERT INTO public."Certification" VALUES ('cmth8tfhi002tci7di2aixr5l', 'cmth8tfbn000bci7daplfg0zq', NULL, NULL, 'cmth8tfeu001fci7d6swxswqt', 'Avarn Security', 'NHPR-7722', '2026-05-31 12:57:12.115', '2027-05-31 12:57:12.115', NULL, '2026-08-31 12:57:12.87');
INSERT INTO public."Certification" VALUES ('cmth8tfhk002uci7doz2j0ux0', 'cmth8tfbn000bci7daplfg0zq', NULL, NULL, 'cmth8tff1001kci7d86na1voz', 'Avarn Security', 'NHPR-8003', '2026-07-01 12:57:12.115', '2027-07-01 12:57:12.115', NULL, '2026-08-31 12:57:12.872');
INSERT INTO public."Certification" VALUES ('cmth8tfhm002vci7d3kc8xpey', 'cmth8tfbp000cci7d72zdx405', NULL, NULL, 'cmth8tff1001kci7d86na1voz', 'Avarn Security', 'EKIPAGE-3118', '2025-08-31 12:57:12.115', '2027-08-31 12:57:12.115', NULL, '2026-08-31 12:57:12.874');
INSERT INTO public."Certification" VALUES ('cmth8tfho002wci7d40aw7oum', 'cmth8tfbt000eci7dsjq4zxpr', 'cmth8tff4001lci7dlnge3pqd', NULL, NULL, 'Avarn Security', 'SPRANG_CERT-5486', '2025-12-01 12:57:12.115', '2026-12-01 12:57:12.115', NULL, '2026-08-31 12:57:12.876');
INSERT INTO public."Certification" VALUES ('cmth8tfhq002xci7do3250uxm', 'cmth8tfbp000cci7d72zdx405', NULL, NULL, 'cmth8tff9001qci7digigiwdg', 'Avarn Security', 'EKIPAGE-2876', '2026-03-31 12:57:12.115', '2028-03-31 12:57:12.115', NULL, '2026-08-31 12:57:12.878');
INSERT INTO public."Certification" VALUES ('cmth8tfht002yci7d0qaw9ikn', 'cmth8tfbn000bci7daplfg0zq', NULL, NULL, 'cmth8tffg001vci7drzxl2icx', 'Avarn Security', 'NHPR-9701', '2026-07-31 12:57:12.115', '2027-07-31 12:57:12.115', NULL, '2026-08-31 12:57:12.881');
INSERT INTO public."Certification" VALUES ('cmth8tfhv002zci7dskxrcjfz', 'cmth8tfbp000cci7d72zdx405', NULL, NULL, 'cmth8tffs0020ci7d0ygr445u', 'Avarn Security', 'EKIPAGE-7999', '2024-10-01 12:57:12.115', '2026-10-01 12:57:12.115', NULL, '2026-08-31 12:57:12.883');
INSERT INTO public."Certification" VALUES ('cmth8tfhx0030ci7dxi3x1f3z', 'cmth8tfbr000dci7dfkgdumlh', 'cmth8tffn001wci7dwup4h3mj', NULL, NULL, 'Avarn Security', 'NARK_CERT-1961', '2025-07-31 12:57:12.115', '2026-07-31 12:57:12.115', NULL, '2026-08-31 12:57:12.885');
INSERT INTO public."Certification" VALUES ('cmth8tfhz0031ci7d2gfeailt', 'cmth8tfbn000bci7daplfg0zq', NULL, NULL, 'cmth8tfg10025ci7dpelv7kwh', 'Avarn Security', 'NHPR-9015', '2026-01-31 12:57:12.115', '2027-01-31 12:57:12.115', NULL, '2026-08-31 12:57:12.887');
INSERT INTO public."Certification" VALUES ('cmth8tfi20032ci7dtd0sset9', 'cmth8tfbu000fci7d3vug752o', NULL, 'cmth8tfc1000hci7d8zxp7rfj', NULL, 'Avarn Security', 'SKYDDSVAKT-8991', '2024-12-31 12:57:12.115', '2027-12-31 12:57:12.115', NULL, '2026-08-31 12:57:12.89');
INSERT INTO public."Certification" VALUES ('cmth8tfi40033ci7dpj9ub5wz', 'cmth8tfbv000gci7d1xgs4dr3', NULL, 'cmth8tfc1000hci7d8zxp7rfj', NULL, 'Avarn Security', 'HLR-6669', '2024-10-31 12:57:12.115', '2026-10-31 12:57:12.115', NULL, '2026-08-31 12:57:12.892');
INSERT INTO public."Certification" VALUES ('cmth8tfi70034ci7d92a0qg7w', 'cmth8tfbu000fci7d3vug752o', NULL, 'cmth8tfc6000ici7dxt92o6r4', NULL, 'Avarn Security', 'SKYDDSVAKT-6472', '2024-03-02 12:57:12.115', '2027-03-03 12:57:12.115', NULL, '2026-08-31 12:57:12.895');
INSERT INTO public."Certification" VALUES ('cmth8tfi90035ci7drdborms8', 'cmth8tfbv000gci7d1xgs4dr3', NULL, 'cmth8tfc8000jci7dbtrk4lpy', NULL, 'Avarn Security', 'HLR-6465', '2024-10-01 12:57:12.115', '2026-10-01 12:57:12.115', NULL, '2026-08-31 12:57:12.897');
INSERT INTO public."Certification" VALUES ('cmth8tfib0036ci7dn2ia5igk', 'cmth8tfbu000fci7d3vug752o', NULL, 'cmth8tfcb000kci7dmqwsp9t6', NULL, 'Avarn Security', 'SKYDDSVAKT-6575', '2025-08-31 12:57:12.115', '2028-08-31 12:57:12.115', NULL, '2026-08-31 12:57:12.899');

--
-- Data for Name: CertificationType; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."CertificationType" VALUES ('cmth8tfbn000bci7daplfg0zq', 'NHPR', 'NHPR Godkänd', 12, 'TEAM', 'Nationellt hundprov för räddning och sök.');
INSERT INTO public."CertificationType" VALUES ('cmth8tfbp000cci7d72zdx405', 'EKIPAGE', 'Auktoriserat ekipage', 24, 'TEAM', 'Behörighet att arbeta operativt som ekipage.');
INSERT INTO public."CertificationType" VALUES ('cmth8tfbr000dci7dfkgdumlh', 'NARK_CERT', 'Certifikat narkotikasök', 12, 'DOG', NULL);
INSERT INTO public."CertificationType" VALUES ('cmth8tfbt000eci7dsjq4zxpr', 'SPRANG_CERT', 'Certifikat sprängämnessök', 12, 'DOG', NULL);
INSERT INTO public."CertificationType" VALUES ('cmth8tfbu000fci7d3vug752o', 'SKYDDSVAKT', 'Skyddsvaktsförordnande', 36, 'HANDLER', NULL);
INSERT INTO public."CertificationType" VALUES ('cmth8tfbv000gci7d1xgs4dr3', 'HLR', 'HLR och första hjälpen', 24, 'HANDLER', NULL);

--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Comment" VALUES ('cmth8tfov0073ci7dm3r0e1z0', 'cmth8tfcg000nci7du1r2iasp', 'Bra jobbat! Fortsätt nöta på uthålligheten.', '2026-08-23 09:15:00', 'cmth8tfj4003eci7dew63p4kp', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmth8tfox0074ci7dcajj836m', 'cmth8tfcg000nci7du1r2iasp', 'Lägg in fler höga gömmor kommande veckor, gärna 180–220 cm.', '2026-08-09 14:00:00', 'cmth8tfju003rci7d67geopn7', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmth8tfoy0075ci7dvwuotrbd', 'cmth8tfci000oci7dl8smk5uu', 'Helt rätt tänkt att korta passen. Bygg på fem minuter i taget.', '2026-08-24 11:30:00', 'cmth8tfkt004oci7dzsy96hax', NULL, NULL);
INSERT INTO public."Comment" VALUES ('cmth8tfqi007uci7doopdakrq', 'cmth8tfck000pci7dihh8t4ak', 'Tydlig rapport. Bra att kvittonummer finns med.', '2026-08-22 09:35:00', NULL, 'cmth8tfq4007oci7dykbqj7f2', NULL);

--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Customer" VALUES ('cmth8tfp00076ci7dz7r30of0', 'Swedavia AB', '556797-0818', 'Lars Holmberg', '010-109 00 00', 'sakerhet@swedavia.se', NULL);
INSERT INTO public."Customer" VALUES ('cmth8tfp20077ci7do0fyvs5h', 'Friends Arena', '556768-2942', 'Nina Ek', '08-500 300 00', 'drift@friendsarena.se', NULL);
INSERT INTO public."Customer" VALUES ('cmth8tfp30078ci7dmus19f1r', 'Jordbro Logistik AB', '556123-4567', 'Tomas Ek', '08-555 12 00', 'lager@jordbrologistik.se', NULL);
INSERT INTO public."Customer" VALUES ('cmth8tfp40079ci7dqnjvra8t', 'Uppsalahem', '556137-3589', 'Petra Lund', '018-727 30 00', 'trygghet@uppsalahem.se', NULL);

--
-- Data for Name: Dog; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Dog" VALUES ('cmth8tfdn000yci7duxafu3hc', 'Nova', 'Belgisk vallhund (Malinois)', '2022-04-12 00:00:00', 'TIK', '752098100123456', NULL, 'ACTIVE', NULL, '2026-08-31 12:57:12.731');
INSERT INTO public."Dog" VALUES ('cmth8tfe30015ci7dquulxh11', 'Rex', 'Labrador Retriever', '2020-04-12 00:00:00', 'HANE', '752098100234567', NULL, 'ACTIVE', NULL, '2026-08-31 12:57:12.747');
INSERT INTO public."Dog" VALUES ('cmth8tfeq001aci7dure7w9mp', 'Balder', 'Schäfer', '2021-04-12 00:00:00', 'HANE', '752098100345678', NULL, 'ACTIVE', NULL, '2026-08-31 12:57:12.77');
INSERT INTO public."Dog" VALUES ('cmth8tfex001gci7d14c4kplq', 'Mira', 'Springer Spaniel', '2023-04-12 00:00:00', 'TIK', '752098100456789', NULL, 'ACTIVE', NULL, '2026-08-31 12:57:12.777');
INSERT INTO public."Dog" VALUES ('cmth8tff4001lci7dlnge3pqd', 'Sigge', 'Labrador Retriever', '2019-04-12 00:00:00', 'HANE', '752098100567890', NULL, 'ACTIVE', NULL, '2026-08-31 12:57:12.784');
INSERT INTO public."Dog" VALUES ('cmth8tffc001rci7dpjjpt24h', 'Iris', 'Belgisk vallhund (Malinois)', '2024-04-12 00:00:00', 'TIK', '752098100678901', NULL, 'ACTIVE', NULL, '2026-08-31 12:57:12.792');
INSERT INTO public."Dog" VALUES ('cmth8tffn001wci7dwup4h3mj', 'Zeb', 'Schäfer', '2018-04-12 00:00:00', 'HANE', '752098100789012', NULL, 'ACTIVE', NULL, '2026-08-31 12:57:12.803');
INSERT INTO public."Dog" VALUES ('cmth8tffu0021ci7dybl8v5ns', 'Tira', 'Springer Spaniel', '2022-04-12 00:00:00', 'TIK', '752098100890123', NULL, 'ACTIVE', NULL, '2026-08-31 12:57:12.81');

--
-- Data for Name: DogDiscipline; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."DogDiscipline" VALUES ('cmth8tfdp000zci7dfeo875i1', 'cmth8tfdn000yci7duxafu3hc', 'cmth8tfbg0008ci7dmmb6e1l1', 'SPECIALIST', '2025-07-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tfdp0010ci7dru9m5btg', 'cmth8tfdn000yci7duxafu3hc', 'cmth8tfbh0009ci7duf5obdp2', 'GRUND', '2025-08-26 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tfdp0011ci7dedhqqs25', 'cmth8tfdn000yci7duxafu3hc', 'cmth8tfbj000aci7ddcgxuph0', 'GRUND', '2025-09-25 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tfe40016ci7dv4ysfrr9', 'cmth8tfe30015ci7dquulxh11', 'cmth8tfbg0008ci7dmmb6e1l1', 'SPECIALIST', '2025-07-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tfe40017ci7dkge2djha', 'cmth8tfe30015ci7dquulxh11', 'cmth8tfbd0007ci7dhmfhljel', 'GRUND', '2025-08-26 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tfeq001bci7dz4rib38y', 'cmth8tfeq001aci7dure7w9mp', 'cmth8tfb90005ci7dffm90uyd', 'SPECIALIST', '2025-07-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tfeq001cci7d0bifuxmx', 'cmth8tfeq001aci7dure7w9mp', 'cmth8tfbc0006ci7dwxvt5zbg', 'GRUND', '2025-08-26 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tfey001hci7d4a5xg4df', 'cmth8tfex001gci7d14c4kplq', 'cmth8tfbg0008ci7dmmb6e1l1', 'SPECIALIST', '2025-07-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tfey001ici7dc17m9s87', 'cmth8tfex001gci7d14c4kplq', 'cmth8tfbd0007ci7dhmfhljel', 'GRUND', '2025-08-26 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tff5001mci7do479seso', 'cmth8tff4001lci7dlnge3pqd', 'cmth8tfbh0009ci7duf5obdp2', 'SPECIALIST', '2025-07-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tff5001nci7dxbxcjkat', 'cmth8tff4001lci7dlnge3pqd', 'cmth8tfbd0007ci7dhmfhljel', 'GRUND', '2025-08-26 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tffd001sci7d5e2z983l', 'cmth8tffc001rci7dpjjpt24h', 'cmth8tfb90005ci7dffm90uyd', 'SPECIALIST', '2025-07-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tffd001tci7dg3kr7n2f', 'cmth8tffc001rci7dpjjpt24h', 'cmth8tfbc0006ci7dwxvt5zbg', 'GRUND', '2025-08-26 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tffn001xci7dr9dglwda', 'cmth8tffn001wci7dwup4h3mj', 'cmth8tfbg0008ci7dmmb6e1l1', 'SPECIALIST', '2025-07-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tffv0022ci7d0esknavi', 'cmth8tffu0021ci7dybl8v5ns', 'cmth8tfbg0008ci7dmmb6e1l1', 'SPECIALIST', '2025-07-27 08:00:00');
INSERT INTO public."DogDiscipline" VALUES ('cmth8tffv0023ci7da8h32e0r', 'cmth8tffu0021ci7dybl8v5ns', 'cmth8tfbj000aci7ddcgxuph0', 'GRUND', '2025-08-26 08:00:00');

--
-- Data for Name: DogEducation; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."DogEducation" VALUES ('cmth8tfdq0012ci7dzugew53w', 'cmth8tfdn000yci7duxafu3hc', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-08 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmth8tfdq0013ci7db8dsateu', 'cmth8tfdn000yci7duxafu3hc', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-07-07 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmth8tfe40018ci7d7f79rel0', 'cmth8tfe30015ci7dquulxh11', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-08 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmth8tfer001dci7d2ym83c1j', 'cmth8tfeq001aci7dure7w9mp', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-08 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmth8tfer001eci7dggygjjmi', 'cmth8tfeq001aci7dure7w9mp', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-07-07 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmth8tfez001jci7dg8hdnlaf', 'cmth8tfex001gci7d14c4kplq', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-08 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmth8tff5001oci7dxdtwl5vf', 'cmth8tff4001lci7dlnge3pqd', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-08 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmth8tff5001pci7dnn4n88mx', 'cmth8tff4001lci7dlnge3pqd', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-07-07 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmth8tffe001uci7dppilfwm6', 'cmth8tffc001rci7dpjjpt24h', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-08 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmth8tffo001yci7d19o7edlk', 'cmth8tffn001wci7dwup4h3mj', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-08 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmth8tffo001zci7dq3d1w7en', 'cmth8tffn001wci7dwup4h3mj', 'Fortsättningsutbildning', 'Avarn Security Hundutbildning', '2025-07-07 08:00:00');
INSERT INTO public."DogEducation" VALUES ('cmth8tffv0024ci7d3b9oxv2o', 'cmth8tffu0021ci7dybl8v5ns', 'Grundutbildning', 'Avarn Security Hundutbildning', '2025-01-08 08:00:00');

--
-- Data for Name: FollowUp; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."FollowUp" VALUES ('cmth8tfqk007vci7d9t0soo2c', 'cmth8tfdv0014ci7dj2j75fhm', 'cmth8tfcg000nci7du1r2iasp', 'Uppföljning höga gömmor', 'Vi tar ett gemensamt pass på höga gömmor innan certifieringen. Hör av dig med tid som passar.', '2026-09-09 08:00:00', 'OPEN', '2026-08-31 12:57:13.196');

--
-- Data for Name: HandlerProfile; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."HandlerProfile" VALUES ('cmth8tfcr000sci7dhqkbtbxt', 'cmth8tfc1000hci7d8zxp7rfj', 'AV-1000', 'Stockholm', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmth8tfcu000tci7dpckq53o3', 'cmth8tfc6000ici7dxt92o6r4', 'AV-1001', 'Södertälje', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmth8tfcv000uci7drw31kzqs', 'cmth8tfc8000jci7dbtrk4lpy', 'AV-1002', 'Göteborg', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmth8tfcx000vci7dyrcowx3e', 'cmth8tfcb000kci7dmqwsp9t6', 'AV-1003', 'Malmö', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmth8tfcy000wci7dsp57z1lm', 'cmth8tfcd000lci7dj7x4s87l', 'AV-1004', 'Umeå', 'Operativ hundförare inom Avarn Security.', NULL);
INSERT INTO public."HandlerProfile" VALUES ('cmth8tfd0000xci7dwq4u503f', 'cmth8tfce000mci7dlyq2ywrn', 'AV-1005', 'Örebro', 'Operativ hundförare inom Avarn Security.', NULL);

--
-- Data for Name: Hide; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Hide" VALUES ('cmth8tfj6003fci7dv16g62qm', 'cmth8tfj4003eci7dew63p4kp', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmth8tfj7003gci7diwjn6883', 'cmth8tfj4003eci7dew63p4kp', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmth8tfj7003hci7dxhyso5td', 'cmth8tfj4003eci7dew63p4kp', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmth8tfj7003ici7dbrfx28yf', 'cmth8tfj4003eci7dew63p4kp', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmth8tfj7003jci7d9wm1skte', 'cmth8tfj4003eci7dew63p4kp', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'MISSED', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmth8tfjm003lci7dc15w3uw7', 'cmth8tfjk003kci7dm0x32bk4', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmth8tfjm003mci7d57px49zr', 'cmth8tfjk003kci7dm0x32bk4', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmth8tfjm003nci7dmitgr303', 'cmth8tfjk003kci7dm0x32bk4', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmth8tfjm003oci7d8jrx14fq', 'cmth8tfjk003kci7dm0x32bk4', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmth8tfjm003pci7dgstqaun7', 'cmth8tfjk003kci7dm0x32bk4', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmth8tfjm003qci7d27rwgy70', 'cmth8tfjk003kci7dm0x32bk4', 'Gömma 6', 'Under pall', 15, 'SVAR', 'FOUND', 235, NULL, 6);
INSERT INTO public."Hide" VALUES ('cmth8tfjv003sci7d7yo1e0ir', 'cmth8tfju003rci7d67geopn7', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmth8tfjv003tci7d6jj1zujp', 'cmth8tfju003rci7d67geopn7', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmth8tfjv003uci7denoxbtej', 'cmth8tfju003rci7d67geopn7', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmth8tfjv003vci7dj7g3ik6b', 'cmth8tfju003rci7d67geopn7', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'MISSED', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmth8tfk1003xci7dzwy3gwqe', 'cmth8tfk0003wci7df4n43unh', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmth8tfk1003yci7dtgw48b6z', 'cmth8tfk0003wci7df4n43unh', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmth8tfk1003zci7d5515iykp', 'cmth8tfk0003wci7df4n43unh', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmth8tfk10040ci7dnca3kpu5', 'cmth8tfk0003wci7df4n43unh', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmth8tfk10041ci7dvjix4a5s', 'cmth8tfk0003wci7df4n43unh', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmth8tfk70043ci7dvinw7za3', 'cmth8tfk60042ci7dk9laov44', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmth8tfk70044ci7dzucydh9x', 'cmth8tfk60042ci7dk9laov44', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmth8tfk70045ci7degok927q', 'cmth8tfk60042ci7dk9laov44', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmth8tfk70046ci7d6i1gfddp', 'cmth8tfk60042ci7dk9laov44', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmth8tfke0048ci7dkl50ii61', 'cmth8tfkd0047ci7dvxsygy96', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmth8tfke0049ci7dkmvs6skm', 'cmth8tfkd0047ci7dvxsygy96', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmth8tfke004aci7dcagpj5zf', 'cmth8tfkd0047ci7dvxsygy96', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmth8tfki004cci7dh6ahsx9o', 'cmth8tfkh004bci7d8eqi415m', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmth8tfki004dci7d2btl8hap', 'cmth8tfkh004bci7d8eqi415m', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmth8tfki004eci7d8akb9iz6', 'cmth8tfkh004bci7d8eqi415m', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmth8tfki004fci7dxufmyt8n', 'cmth8tfkh004bci7d8eqi415m', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmth8tfki004gci7dw8ig1hv4', 'cmth8tfkh004bci7d8eqi415m', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'MISSED', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmth8tfko004ici7delm6jcfn', 'cmth8tfkn004hci7d91fp9es2', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmth8tfko004jci7djdu4zd2f', 'cmth8tfkn004hci7d91fp9es2', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmth8tfko004kci7d6lzzsgcg', 'cmth8tfkn004hci7d91fp9es2', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmth8tfko004lci7d17tmybn3', 'cmth8tfkn004hci7d91fp9es2', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmth8tfko004mci7dys6fsu8g', 'cmth8tfkn004hci7d91fp9es2', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmth8tfko004nci7de1fwev8c', 'cmth8tfkn004hci7d91fp9es2', 'Gömma 6', 'Under pall', 15, 'SVAR', 'MISSED', 235, NULL, 6);
INSERT INTO public."Hide" VALUES ('cmth8tfku004pci7deno1k91o', 'cmth8tfkt004oci7dzsy96hax', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmth8tfku004qci7d5illays5', 'cmth8tfkt004oci7dzsy96hax', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmth8tfku004rci7dq0y8z36w', 'cmth8tfkt004oci7dzsy96hax', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'MISSED', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmth8tfl0004tci7dp4gjw74g', 'cmth8tfkz004sci7dlaribw44', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmth8tfl0004uci7dch4uqvo5', 'cmth8tfkz004sci7dlaribw44', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmth8tfl0004vci7dx46fvuht', 'cmth8tfkz004sci7dlaribw44', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmth8tfl0004wci7duscy2cvp', 'cmth8tfkz004sci7dlaribw44', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'FOUND', 165, NULL, 4);
INSERT INTO public."Hide" VALUES ('cmth8tfl0004xci7dr2dbyiyo', 'cmth8tfkz004sci7dlaribw44', 'Gömma 5', 'Bakom stolpe', 60, 'MEDEL', 'FOUND', 200, NULL, 5);
INSERT INTO public."Hide" VALUES ('cmth8tfl4004zci7d2exk5hv8', 'cmth8tfl3004yci7dv202kom0', 'Gömma 1', 'Marknivå vid stubbe', 10, 'LATT', 'FOUND', 60, NULL, 1);
INSERT INTO public."Hide" VALUES ('cmth8tfl40050ci7drg7xqn9j', 'cmth8tfl3004yci7dv202kom0', 'Gömma 2', 'Stenröse, 40 cm höjd', 40, 'MEDEL', 'FOUND', 95, NULL, 2);
INSERT INTO public."Hide" VALUES ('cmth8tfl40051ci7dqubtqz1v', 'cmth8tfl3004yci7dv202kom0', 'Gömma 3', 'Rotvälta', 25, 'SVAR', 'FOUND', 130, NULL, 3);
INSERT INTO public."Hide" VALUES ('cmth8tfl40052ci7d1twbhoyo', 'cmth8tfl3004yci7dv202kom0', 'Gömma 4', 'Hylla 180 cm', 180, 'LATT', 'MISSED', 165, NULL, 4);

--
-- Data for Name: Indication; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Indication" VALUES ('cmth8tfq6007pci7da4x87w4a', 'cmth8tfq4007oci7dykbqj7f2', 'Bagageband 3, kolli 18', 'Tydlig och kvarstående markering på resväska.', 'FIND', 'Polis, region Stockholm', 1);
INSERT INTO public."Indication" VALUES ('cmth8tfq6007qci7d1e4tj2yj', 'cmth8tfq4007oci7dykbqj7f2', 'Lastpall vid port 2', 'Markering utan fynd vid kontroll.', 'NO_FIND', NULL, 2);
INSERT INTO public."Indication" VALUES ('cmth8tfqf007tci7dugjexrdo', 'cmth8tfqe007sci7ducu95b1l', 'Container 9, bakre vänstra hörnet', 'Markering på pallkrage.', 'FIND', 'Tullverket', 1);

--
-- Data for Name: InstructorAssignment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."InstructorAssignment" VALUES ('cmth8tfg30026ci7dx2kgk1dm', 'cmth8tfcg000nci7du1r2iasp', 'cmth8tfdv0014ci7dj2j75fhm', '2026-08-31 12:57:12.819');
INSERT INTO public."InstructorAssignment" VALUES ('cmth8tfg50027ci7dstteienm', 'cmth8tfcg000nci7du1r2iasp', 'cmth8tfed0019ci7dykze3pyp', '2026-08-31 12:57:12.821');
INSERT INTO public."InstructorAssignment" VALUES ('cmth8tfg70028ci7djcxxjm88', 'cmth8tfcg000nci7du1r2iasp', 'cmth8tff9001qci7digigiwdg', '2026-08-31 12:57:12.823');
INSERT INTO public."InstructorAssignment" VALUES ('cmth8tfg80029ci7du7c25746', 'cmth8tfcg000nci7du1r2iasp', 'cmth8tfg10025ci7dpelv7kwh', '2026-08-31 12:57:12.824');
INSERT INTO public."InstructorAssignment" VALUES ('cmth8tfg9002aci7dw4n91yzk', 'cmth8tfcg000nci7du1r2iasp', 'cmth8tff1001kci7d86na1voz', '2026-08-31 12:57:12.825');
INSERT INTO public."InstructorAssignment" VALUES ('cmth8tfgb002bci7dpnb5mh8y', 'cmth8tfci000oci7dl8smk5uu', 'cmth8tfeu001fci7d6swxswqt', '2026-08-31 12:57:12.827');
INSERT INTO public."InstructorAssignment" VALUES ('cmth8tfgd002cci7d063aza1w', 'cmth8tfci000oci7dl8smk5uu', 'cmth8tffg001vci7drzxl2icx', '2026-08-31 12:57:12.829');
INSERT INTO public."InstructorAssignment" VALUES ('cmth8tfgf002dci7d4moa9fvr', 'cmth8tfci000oci7dl8smk5uu', 'cmth8tffs0020ci7d0ygr445u', '2026-08-31 12:57:12.831');

--
-- Data for Name: MediaAsset; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Mission; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Mission" VALUES ('cmth8tfp7007aci7d73edaf1z', 'UPP-2451', 'Flygplatskontroll', 'Flygplatskontroll', 'cmth8tfp00076ci7dz7r30of0', 'Lars Holmberg', '010-109 00 00', '2026-09-03 08:00:00', '2026-09-03 10:00:00', 'Terminal 5, bagagehall', 'Arlanda, Stockholm', 'cmth8tfaz0002ci7dwc63k4gy', 'cmth8tfb90005ci7dffm90uyd', 'Anmälan i säkerhetskontrollen senast 07:45. ID-handling och förordnande ska medföras. Sök sker i bagagehall och angränsande lastutrymme.', 'ASSIGNED', 'cmth8tfck000pci7dihh8t4ak', '2026-08-31 12:57:13.147');
INSERT INTO public."Mission" VALUES ('cmth8tfpe007cci7d8sp87rac', 'UPP-2452', 'Evenemangssök', 'Evenemangssök', 'cmth8tfp20077ci7do0fyvs5h', 'Nina Ek', '08-500 300 00', '2026-09-04 14:30:00', '2026-09-04 17:30:00', 'Friends Arena, entré C', 'Solna', 'cmth8tfaz0002ci7dwc63k4gy', 'cmth8tfbc0006ci7dwxvt5zbg', 'Genomsökning av läktarsektion A–D före publikinsläpp. Klart senast 17:30.', 'ASSIGNED', 'cmth8tfck000pci7dihh8t4ak', '2026-08-31 12:57:13.154');
INSERT INTO public."Mission" VALUES ('cmth8tfpi007eci7duf0ez98r', 'UPP-2453', 'Lagerkontroll', 'Lagerkontroll', 'cmth8tfp30078ci7dmus19f1r', 'Tomas Ek', '08-555 12 00', '2026-09-05 10:00:00', '2026-09-05 14:00:00', 'Lagerväg 12', 'Jordbro, Haninge', 'cmth8tfaz0002ci7dwc63k4gy', 'cmth8tfbd0007ci7dhmfhljel', 'Samordnas med lagerchef på plats. Truckar stoppas under sök.', 'PLANNED', 'cmth8tfck000pci7dihh8t4ak', '2026-08-31 12:57:13.158');
INSERT INTO public."Mission" VALUES ('cmth8tfpk007fci7dlbe2dpby', 'UPP-2454', 'Bostadssök', 'Bostadssök', 'cmth8tfp40079ci7dqnjvra8t', 'Petra Lund', '018-727 30 00', '2026-09-07 09:30:00', '2026-09-07 12:30:00', 'Gränbyvägen 8', 'Uppsala', 'cmth8tfaz0002ci7dwc63k4gy', 'cmth8tfb90005ci7dffm90uyd', 'Polis närvarar. Invänta klartecken innan sök påbörjas.', 'PLANNED', 'cmth8tfck000pci7dihh8t4ak', '2026-08-31 12:57:13.16');
INSERT INTO public."Mission" VALUES ('cmth8tfpn007gci7dx5nzpyl2', 'UPP-2448', 'Objektsbevakning hamnen', 'Objektsbevakning', 'cmth8tfp30078ci7dmus19f1r', 'Tomas Ek', '031-555 00 12', '2026-09-06 20:00:00', '2026-09-07 02:00:00', 'Skandiahamnen, port 4', 'Göteborg', 'cmth8tfb10003ci7de0ioupw5', 'cmth8tfbc0006ci7dwxvt5zbg', 'Nattpass. Rapportering till larmcentral varannan timme.', 'ASSIGNED', 'cmth8tfck000pci7dihh8t4ak', '2026-08-31 12:57:13.163');
INSERT INTO public."Mission" VALUES ('cmth8tfps007ici7di3nrelv3', 'UPP-2431', 'Flygplatskontroll', 'Flygplatskontroll', 'cmth8tfp00076ci7dz7r30of0', 'Lars Holmberg', '010-109 00 00', '2026-08-21 08:00:00', '2026-08-21 10:00:00', 'Terminal 5, bagagehall', 'Arlanda, Stockholm', 'cmth8tfaz0002ci7dwc63k4gy', 'cmth8tfb90005ci7dffm90uyd', 'Rutinkontroll enligt avtal.', 'COMPLETED', 'cmth8tfck000pci7dihh8t4ak', '2026-08-31 12:57:13.168');
INSERT INTO public."Mission" VALUES ('cmth8tfpv007kci7dygc8vzie', 'UPP-2427', 'Lagerkontroll', 'Lagerkontroll', 'cmth8tfp30078ci7dmus19f1r', 'Tomas Ek', '08-555 12 00', '2026-08-14 13:00:00', '2026-08-14 16:00:00', 'Lagerväg 12', 'Jordbro, Haninge', 'cmth8tfaz0002ci7dwc63k4gy', 'cmth8tfbd0007ci7dhmfhljel', 'Kvartalskontroll.', 'COMPLETED', 'cmth8tfck000pci7dihh8t4ak', '2026-08-31 12:57:13.171');
INSERT INTO public."Mission" VALUES ('cmth8tfpz007mci7dfwyz4wx1', 'UPP-2422', 'Godskontroll', 'Lagerkontroll', 'cmth8tfp30078ci7dmus19f1r', 'Tomas Ek', '040-555 00 20', '2026-08-10 09:00:00', '2026-08-10 13:00:00', 'Terminalgatan 3', 'Malmö', 'cmth8tfb20004ci7dk0sftuu7', 'cmth8tfbd0007ci7dhmfhljel', 'Sök av inkommande gods från hamnen.', 'COMPLETED', 'cmth8tfck000pci7dihh8t4ak', '2026-08-31 12:57:13.175');

--
-- Data for Name: MissionAssignment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MissionAssignment" VALUES ('cmth8tfpb007bci7doujejjr6', 'cmth8tfp7007aci7d73edaf1z', 'cmth8tfdv0014ci7dj2j75fhm', 'cmth8tfck000pci7dihh8t4ak', 'ACCEPTED', NULL, '2026-09-02 16:00:00', '2026-08-31 12:57:13.151');
INSERT INTO public."MissionAssignment" VALUES ('cmth8tfpg007dci7dzka1ul42', 'cmth8tfpe007cci7d8sp87rac', 'cmth8tfdv0014ci7dj2j75fhm', 'cmth8tfck000pci7dihh8t4ak', 'OFFERED', NULL, NULL, '2026-08-31 12:57:13.156');
INSERT INTO public."MissionAssignment" VALUES ('cmth8tfpp007hci7dfi7q4jsw', 'cmth8tfpn007gci7dx5nzpyl2', 'cmth8tfeu001fci7d6swxswqt', 'cmth8tfck000pci7dihh8t4ak', 'ACCEPTED', NULL, '2026-09-05 16:00:00', '2026-08-31 12:57:13.165');
INSERT INTO public."MissionAssignment" VALUES ('cmth8tfpu007jci7d95ux0w0i', 'cmth8tfps007ici7di3nrelv3', 'cmth8tfdv0014ci7dj2j75fhm', 'cmth8tfck000pci7dihh8t4ak', 'COMPLETED', NULL, '2026-08-20 16:00:00', '2026-08-31 12:57:13.17');
INSERT INTO public."MissionAssignment" VALUES ('cmth8tfpx007lci7dli68zit3', 'cmth8tfpv007kci7dygc8vzie', 'cmth8tfed0019ci7dykze3pyp', 'cmth8tfck000pci7dihh8t4ak', 'COMPLETED', NULL, '2026-08-13 16:00:00', '2026-08-31 12:57:13.173');
INSERT INTO public."MissionAssignment" VALUES ('cmth8tfq0007nci7dniyrdswd', 'cmth8tfpz007mci7dfwyz4wx1', 'cmth8tff1001kci7d86na1voz', 'cmth8tfck000pci7dihh8t4ak', 'COMPLETED', NULL, '2026-08-09 16:00:00', '2026-08-31 12:57:13.176');

--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Notification" VALUES ('cmth8tfqo007wci7d29ogknc9', 'cmth8tfc1000hci7d8zxp7rfj', 'MISSION_ASSIGNED', 'Nytt uppdrag: Evenemangssök', 'Friends Arena, Solna – 14:30. Svara ja eller nej i uppdragsvyn.', '/uppdrag/cmth8tfpe007cci7d8sp87rac', NULL, '2026-08-30 15:20:00');
INSERT INTO public."Notification" VALUES ('cmth8tfqq007xci7d8lv526p7', 'cmth8tfc1000hci7d8zxp7rfj', 'COMMENT', 'Anna Karlsson kommenterade din träning', 'Bra jobbat! Fortsätt nöta på uthålligheten.', '/traning/cmth8tfj4003eci7dew63p4kp', NULL, '2026-08-23 09:15:00');
INSERT INTO public."Notification" VALUES ('cmth8tfqs007yci7drdcqm23m', 'cmth8tfc1000hci7d8zxp7rfj', 'FOLLOW_UP', 'Kallelse till uppföljning', 'Anna Karlsson vill följa upp höga gömmor.', '/traning', NULL, '2026-08-29 10:00:00');
INSERT INTO public."Notification" VALUES ('cmth8tfqu007zci7d4r5mj8aw', 'cmth8tfc1000hci7d8zxp7rfj', 'SESSION_APPROVED', 'Träning godkänd', 'Områdessök – Skog, Tyresta är godkänt.', '/traning/cmth8tfj4003eci7dew63p4kp', '2026-08-24 08:00:00', '2026-08-23 12:00:00');
INSERT INTO public."Notification" VALUES ('cmth8tfqv0080ci7dflr88ew9', 'cmth8tfc8000jci7dbtrk4lpy', 'CERT_EXPIRING', 'Behörighet löper ut', 'Auktoriserat ekipage för Balder går ut om 2 dagar.', '/certifikat', NULL, '2026-08-30 07:00:00');
INSERT INTO public."Notification" VALUES ('cmth8tfqw0081ci7dfzhh6ypf', 'cmth8tfcg000nci7du1r2iasp', 'COMMENT', 'Nytt träningspass att granska', 'Erik Andersson har skickat in Fordonssök – Fordon.', '/instruktor', NULL, '2026-08-28 18:40:00');
INSERT INTO public."Notification" VALUES ('cmth8tfqx0082ci7dj3k5caud', 'cmth8tfck000pci7dihh8t4ak', 'COMMENT', 'Ny rapport inskickad', 'Sofie Holm har skickat in rapport för UPP-2422.', '/rapporter', NULL, '2026-08-10 13:15:00');

--
-- Data for Name: OperationalReport; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."OperationalReport" VALUES ('cmth8tfq4007oci7dykbqj7f2', 'cmth8tfps007ici7di3nrelv3', 'cmth8tfdv0014ci7dj2j75fhm', 'cmth8tfc1000hci7d8zxp7rfj', 'Terminal 5, bagagehall samt angränsande lastutrymme.', '1 paket – Narkotika (Cannabis), cirka 400 gram.', 'Inga', 'Överlämnat till polis på plats. Kvitto nummer 41221 erhållet.', '2026-08-21 08:00:00', '2026-08-21 10:20:00', 'APPROVED', '2026-08-21 11:00:00', 'cmth8tfck000pci7dihh8t4ak', '2026-08-22 09:30:00', '2026-08-21 10:45:00', '2026-08-31 12:57:13.18');
INSERT INTO public."OperationalReport" VALUES ('cmth8tfqa007rci7dx3gvyzyr', 'cmth8tfpv007kci7dygc8vzie', 'cmth8tfed0019ci7dykze3pyp', 'cmth8tfc1000hci7d8zxp7rfj', 'Lagerhall A och B, samtliga ställage samt lastkaj.', 'Inga fynd.', 'Port 4 gick inte att öppna, avsnittet kunde inte genomsökas.', 'Avvikelsen rapporterad till lagerchef Tomas Ek.', '2026-08-14 13:00:00', '2026-08-14 15:45:00', 'APPROVED', '2026-08-14 16:30:00', 'cmth8tfck000pci7dihh8t4ak', '2026-08-15 08:15:00', '2026-08-14 16:20:00', '2026-08-31 12:57:13.186');
INSERT INTO public."OperationalReport" VALUES ('cmth8tfqe007sci7ducu95b1l', 'cmth8tfpz007mci7dfwyz4wx1', 'cmth8tff1001kci7d86na1voz', 'cmth8tfcb000kci7dmqwsp9t6', 'Inkommande gods, container 1–14.', '1 fynd – misstänkt narkotika i container 9.', 'Inga', 'Godset avskilt och överlämnat till Tullverket.', '2026-08-10 09:00:00', '2026-08-10 12:30:00', 'SUBMITTED', '2026-08-10 13:10:00', NULL, NULL, '2026-08-10 12:55:00', '2026-08-31 12:57:13.19');

--
-- Data for Name: PlannedExercise; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."PlannedExercise" VALUES ('cmth8tfil0039ci7d84c3lw0s', 'cmth8tfik0037ci7dcblejnfj', 'Höga gömmor i lagermiljö', 'Placera gömmor på 150–220 cm. Belöna först vid tydlig och kvarstående markering.', 'cmth8tfbg0008ci7dmmb6e1l1', 'Narkotika', 'Lagerlokal', '2026-09-13 08:00:00', 2, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmth8tfil003aci7dc2f4l4pz', 'cmth8tfik0037ci7dcblejnfj', 'Fordonssök under tidspress', 'Sex fordon, max 12 minuter totalt. Syftet är att hålla noggrannheten uppe när tempot ökar.', 'cmth8tfbd0007ci7dhmfhljel', 'Narkotika', 'Fordon', '2026-09-20 08:00:00', 3, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmth8tfiv003cci7dyxdg61xs', 'cmth8tfiu003bci7dm3lcpcyq', 'Vinkelspår 600 meter', 'Tre räta vinklar, 45 minuter gammalt spår.', 'cmth8tfb90005ci7dffm90uyd', 'Människa', 'Stadsmiljö', '2026-09-04 08:00:00', 1, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmth8tfiv003dci7d0dz4iutz', 'cmth8tfiu003bci7dm3lcpcyq', 'Ytsök öppen mark 30 minuter', 'Två figuranter, växlande vindriktning.', 'cmth8tfbc0006ci7dwxvt5zbg', 'Människa', 'Öppen mark', '2026-09-11 08:00:00', 2, 'PLANNED');
INSERT INTO public."PlannedExercise" VALUES ('cmth8tfil0038ci7drdx827ji', 'cmth8tfik0037ci7dcblejnfj', 'Områdessök 45 minuter i kuperad skog', 'Två pass om 45 minuter med minst fem gömmor. Fokus på systematiskt sökmönster och att hunden håller tempot hela passet.', 'cmth8tfbg0008ci7dmmb6e1l1', 'Narkotika', 'Skog', '2026-09-06 08:00:00', 1, 'COMPLETED');

--
-- Data for Name: Region; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Region" VALUES ('cmth8tfar0000ci7doj1q9sau', 'NORD', 'Region Nord', 1);
INSERT INTO public."Region" VALUES ('cmth8tfaw0001ci7do66mexy9', 'MITT', 'Region Mitt', 2);
INSERT INTO public."Region" VALUES ('cmth8tfaz0002ci7dwc63k4gy', 'OST', 'Region Öst', 3);
INSERT INTO public."Region" VALUES ('cmth8tfb10003ci7de0ioupw5', 'VAST', 'Region Väst', 4);
INSERT INTO public."Region" VALUES ('cmth8tfb20004ci7dk0sftuu7', 'SYD', 'Region Syd', 5);

--
-- Data for Name: SearchDiscipline; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."SearchDiscipline" VALUES ('cmth8tfb90005ci7dffm90uyd', 'SPAR', 'Spårsök', 'SÖK – SPÅR', 'Spårsök efter person eller föremål.', 1);
INSERT INTO public."SearchDiscipline" VALUES ('cmth8tfbc0006ci7dwxvt5zbg', 'YTA', 'Ytsök', 'SÖK – YTA', 'Ytsök över öppna och bebyggda områden.', 2);
INSERT INTO public."SearchDiscipline" VALUES ('cmth8tfbd0007ci7dhmfhljel', 'GODS', 'Godssök', 'SÖK – GODS', 'Sök i gods, bagage och fordon.', 3);
INSERT INTO public."SearchDiscipline" VALUES ('cmth8tfbg0008ci7dmmb6e1l1', 'NARKOTIKA', 'Narkotika', 'NARKOTIKA', 'Sök efter narkotiska preparat.', 4);
INSERT INTO public."SearchDiscipline" VALUES ('cmth8tfbh0009ci7duf5obdp2', 'SPRANG', 'Sprängämnen', 'SPRÄNGÄMNEN', 'Sök efter explosiva ämnen.', 5);
INSERT INTO public."SearchDiscipline" VALUES ('cmth8tfbj000aci7ddcgxuph0', 'VAPEN', 'Vapen', 'VAPEN', 'Sök efter vapen och ammunition.', 6);

--
-- Data for Name: Team; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Team" VALUES ('cmth8tfdv0014ci7dj2j75fhm', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfdn000yci7duxafu3hc', 'cmth8tfaz0002ci7dwc63k4gy', '2024-06-22 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmth8tfed0019ci7dykze3pyp', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfe30015ci7dquulxh11', 'cmth8tfaz0002ci7dwc63k4gy', '2023-05-19 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmth8tfeu001fci7d6swxswqt', 'cmth8tfc8000jci7dbtrk4lpy', 'cmth8tfeq001aci7dure7w9mp', 'cmth8tfb10003ci7de0ioupw5', '2023-12-05 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmth8tff1001kci7d86na1voz', 'cmth8tfcb000kci7dmqwsp9t6', 'cmth8tfex001gci7d14c4kplq', 'cmth8tfb20004ci7dk0sftuu7', '2025-01-08 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmth8tff9001qci7digigiwdg', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tff4001lci7dlnge3pqd', 'cmth8tfaz0002ci7dwc63k4gy', '2022-10-31 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmth8tffg001vci7drzxl2icx', 'cmth8tfcd000lci7dj7x4s87l', 'cmth8tffc001rci7dpjjpt24h', 'cmth8tfar0000ci7doj1q9sau', '2025-07-27 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmth8tffs0020ci7d0ygr445u', 'cmth8tfce000mci7dlyq2ywrn', 'cmth8tffn001wci7dwup4h3mj', 'cmth8tfaw0001ci7do66mexy9', '2022-04-14 08:00:00', NULL, 'ACTIVE');
INSERT INTO public."Team" VALUES ('cmth8tfg10025ci7dpelv7kwh', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tffu0021ci7dybl8v5ns', 'cmth8tfaz0002ci7dwc63k4gy', '2024-06-22 08:00:00', NULL, 'ACTIVE');

--
-- Data for Name: TeamAvailability; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TeamAvailability" VALUES ('cmth8tfgi002eci7dho2pavzd', 'cmth8tfdv0014ci7dj2j75fhm', '2026-08-31 06:00:00', '2026-09-30 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmth8tfgp002fci7dpfrgf45b', 'cmth8tfed0019ci7dykze3pyp', '2026-08-31 06:00:00', '2026-09-30 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmth8tfgr002gci7dzpqw0bhl', 'cmth8tfeu001fci7d6swxswqt', '2026-08-31 06:00:00', '2026-09-30 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmth8tfgv002hci7dqejs49cd', 'cmth8tff1001kci7d86na1voz', '2026-08-31 06:00:00', '2026-09-30 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmth8tfgx002ici7dwahf015u', 'cmth8tff9001qci7digigiwdg', '2026-08-31 06:00:00', '2026-09-30 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmth8tfgz002jci7dsyt9h1ku', 'cmth8tffg001vci7drzxl2icx', '2026-08-31 06:00:00', '2026-09-30 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmth8tfh0002kci7dsm33i855', 'cmth8tffs0020ci7d0ygr445u', '2026-08-31 06:00:00', '2026-09-30 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmth8tfh2002lci7dcugt0as6', 'cmth8tfg10025ci7dpelv7kwh', '2026-08-31 06:00:00', '2026-09-30 20:00:00', 'AVAILABLE', 'Ordinarie tjänstgöring');
INSERT INTO public."TeamAvailability" VALUES ('cmth8tfh3002mci7dt5yve2rh', 'cmth8tffs0020ci7d0ygr445u', '2026-09-02 00:00:00', '2026-09-09 23:00:00', 'UNAVAILABLE', 'Semester');

--
-- Data for Name: TrainingPlan; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TrainingPlan" VALUES ('cmth8tfik0037ci7dcblejnfj', 'cmth8tfdv0014ci7dj2j75fhm', 'cmth8tfcg000nci7du1r2iasp', 'Uthållighet i svår terräng', 'Bygga uthållighet över längre sök och stabilisera markering vid stenrösen och rotvältor.', '2026-08-10 08:00:00', '2026-10-05 08:00:00', 'ACTIVE', '2026-08-31 12:57:12.908');
INSERT INTO public."TrainingPlan" VALUES ('cmth8tfiu003bci7dm3lcpcyq', 'cmth8tfeu001fci7d6swxswqt', 'cmth8tfci000oci7dl8smk5uu', 'Spårsäkerhet på hårt underlag', 'Öka spårsäkerheten på asfalt och grus samt vid vinkelspår.', '2026-08-17 08:00:00', '2026-10-12 08:00:00', 'ACTIVE', '2026-08-31 12:57:12.918');

--
-- Data for Name: TrainingSession; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TrainingSession" VALUES ('cmth8tfjk003kci7dm0x32bk4', 'cmth8tfdv0014ci7dj2j75fhm', NULL, '2026-08-15 13:30:00', '2026-08-15 15:00:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 6, 6, 'Felfritt pass. Hög arbetsglädje genom hela söket.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-08-16 12:00:00', '2026-08-31 12:57:12.944', '2026-08-31 12:57:12.944');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfju003rci7d67geopn7', 'cmth8tfdv0014ci7dj2j75fhm', NULL, '2026-08-08 08:00:00', '2026-08-08 09:45:00', 'Arlanda, hangar 4', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmth8tfbh0009ci7duf5obdp2', 4, 3, 'Tveksam vid höga gömmor. Behöver mer träning över 180 cm.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-08-09 12:00:00', '2026-08-31 12:57:12.954', '2026-08-31 12:57:12.954');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfk0003wci7df4n43unh', 'cmth8tfdv0014ci7dj2j75fhm', NULL, '2026-08-28 17:00:00', '2026-08-28 18:30:00', 'Farsta industriområde', 'Fordonssök', 'Fordon', 'Narkotika', 'cmth8tfbd0007ci7dhmfhljel', 5, 5, 'Snabbt och rent sök på sex fordon.', 'SUBMITTED', 'cmth8tfc1000hci7d8zxp7rfj', NULL, NULL, '2026-08-31 12:57:12.96', '2026-08-31 12:57:12.96');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfk60042ci7dk9laov44', 'cmth8tfed0019ci7dykze3pyp', NULL, '2026-08-26 10:00:00', '2026-08-26 11:30:00', 'Södertälje hamn', 'Bagagesök', 'Lagerlokal', 'Narkotika', 'cmth8tfbd0007ci7dhmfhljel', 4, 4, 'Stabilt. Rex arbetar lugnt och metodiskt.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-08-27 12:00:00', '2026-08-31 12:57:12.966', '2026-08-31 12:57:12.966');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfkd0047ci7dvxsygy96', 'cmth8tfeu001fci7d6swxswqt', NULL, '2026-08-29 07:30:00', '2026-08-29 09:00:00', 'Slottsskogen, Göteborg', 'Spårarbete', 'Öppen mark', 'Människa', 'cmth8tfb90005ci7dffm90uyd', 3, 3, 'Höll spåret genom samtliga vinklar.', 'SUBMITTED', 'cmth8tfc8000jci7dbtrk4lpy', NULL, NULL, '2026-08-31 12:57:12.973', '2026-08-31 12:57:12.973');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfkh004bci7d8eqi415m', 'cmth8tff1001kci7d86na1voz', NULL, '2026-08-27 14:00:00', '2026-08-27 15:30:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 4, 'En falsk markering vid tomt kolli.', 'APPROVED', 'cmth8tfcb000kci7dmqwsp9t6', 'cmth8tfcg000nci7du1r2iasp', '2026-08-28 12:00:00', '2026-08-31 12:57:12.977', '2026-08-31 12:57:12.977');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfkn004hci7d91fp9es2', 'cmth8tff9001qci7digigiwdg', NULL, '2026-08-25 09:00:00', '2026-08-25 10:45:00', 'Arlanda terminal 5', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmth8tfbh0009ci7duf5obdp2', 6, 5, 'Bra tempo, tappade fokus mot slutet av passet.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-08-26 12:00:00', '2026-08-31 12:57:12.983', '2026-08-31 12:57:12.983');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfkt004oci7dzsy96hax', 'cmth8tffg001vci7drzxl2icx', NULL, '2026-08-23 11:00:00', '2026-08-23 12:15:00', 'Umeå, Nydalaområdet', 'Områdessök', 'Skog', 'Människa', 'cmth8tfbc0006ci7dwxvt5zbg', 3, 2, 'Ung hund, behöver kortare pass tills uthålligheten byggts upp.', 'APPROVED', 'cmth8tfcd000lci7dj7x4s87l', 'cmth8tfci000oci7dl8smk5uu', '2026-08-24 12:00:00', '2026-08-31 12:57:12.989', '2026-08-31 12:57:12.989');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfkz004sci7dlaribw44', 'cmth8tffs0020ci7d0ygr445u', NULL, '2026-08-19 08:30:00', '2026-08-19 10:00:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 5, 'Rutinerat och effektivt.', 'APPROVED', 'cmth8tfce000mci7dlyq2ywrn', 'cmth8tfci000oci7dl8smk5uu', '2026-08-20 12:00:00', '2026-08-31 12:57:12.995', '2026-08-31 12:57:12.995');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfl3004yci7dv202kom0', 'cmth8tfg10025ci7dpelv7kwh', NULL, '2026-08-24 15:00:00', '2026-08-24 16:20:00', 'Södertälje, Ronna', 'Personsök', 'Stadsmiljö', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 4, 3, 'Störningsträning i folkvimmel. God kontakt med föraren.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-08-25 12:00:00', '2026-08-31 12:57:12.999', '2026-08-31 12:57:12.999');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfl80053ci7ditw88c8h', 'cmth8tfdv0014ci7dj2j75fhm', NULL, '2026-07-25 09:00:00', '2026-07-25 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-07-26 12:00:00', '2026-08-31 12:57:13.004', '2026-08-31 12:57:13.004');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfl90054ci7dg0rn2hhl', 'cmth8tfdv0014ci7dj2j75fhm', NULL, '2026-07-12 09:00:00', '2026-07-12 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-07-13 12:00:00', '2026-08-31 12:57:13.005', '2026-08-31 12:57:13.005');
INSERT INTO public."TrainingSession" VALUES ('cmth8tflc0055ci7dzserboay', 'cmth8tfdv0014ci7dj2j75fhm', NULL, '2026-06-29 09:00:00', '2026-06-29 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-06-30 12:00:00', '2026-08-31 12:57:13.008', '2026-08-31 12:57:13.008');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfld0056ci7dhg4e8ai1', 'cmth8tfdv0014ci7dj2j75fhm', NULL, '2026-06-13 09:00:00', '2026-06-13 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-06-14 12:00:00', '2026-08-31 12:57:13.009', '2026-08-31 12:57:13.009');
INSERT INTO public."TrainingSession" VALUES ('cmth8tflf0057ci7d3hbcjnkr', 'cmth8tfdv0014ci7dj2j75fhm', NULL, '2026-05-31 09:00:00', '2026-05-31 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-06-01 12:00:00', '2026-08-31 12:57:13.011', '2026-08-31 12:57:13.011');
INSERT INTO public."TrainingSession" VALUES ('cmth8tflj0058ci7ddw07aewo', 'cmth8tfdv0014ci7dj2j75fhm', NULL, '2026-05-18 09:00:00', '2026-05-18 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-05-19 12:00:00', '2026-08-31 12:57:13.015', '2026-08-31 12:57:13.015');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfll0059ci7dgqucx927', 'cmth8tfdv0014ci7dj2j75fhm', NULL, '2026-05-02 09:00:00', '2026-05-02 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-05-03 12:00:00', '2026-08-31 12:57:13.017', '2026-08-31 12:57:13.017');
INSERT INTO public."TrainingSession" VALUES ('cmth8tflm005aci7dldjfwniv', 'cmth8tfdv0014ci7dj2j75fhm', NULL, '2026-04-19 09:00:00', '2026-04-19 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-04-20 12:00:00', '2026-08-31 12:57:13.018', '2026-08-31 12:57:13.018');
INSERT INTO public."TrainingSession" VALUES ('cmth8tflo005bci7dtl9yl2t8', 'cmth8tfdv0014ci7dj2j75fhm', NULL, '2026-04-06 09:00:00', '2026-04-06 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-04-07 12:00:00', '2026-08-31 12:57:13.02', '2026-08-31 12:57:13.02');
INSERT INTO public."TrainingSession" VALUES ('cmth8tflq005cci7d8y0gmltr', 'cmth8tfed0019ci7dykze3pyp', NULL, '2026-07-25 09:00:00', '2026-07-25 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbd0007ci7dhmfhljel', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-07-26 12:00:00', '2026-08-31 12:57:13.022', '2026-08-31 12:57:13.022');
INSERT INTO public."TrainingSession" VALUES ('cmth8tflr005dci7d16cenwc7', 'cmth8tfed0019ci7dykze3pyp', NULL, '2026-07-12 09:00:00', '2026-07-12 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbd0007ci7dhmfhljel', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-07-13 12:00:00', '2026-08-31 12:57:13.023', '2026-08-31 12:57:13.023');
INSERT INTO public."TrainingSession" VALUES ('cmth8tflt005eci7d18trv4qv', 'cmth8tfed0019ci7dykze3pyp', NULL, '2026-06-29 09:00:00', '2026-06-29 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbd0007ci7dhmfhljel', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-06-30 12:00:00', '2026-08-31 12:57:13.025', '2026-08-31 12:57:13.025');
INSERT INTO public."TrainingSession" VALUES ('cmth8tflv005fci7dc3knhqo9', 'cmth8tfed0019ci7dykze3pyp', NULL, '2026-06-13 09:00:00', '2026-06-13 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbd0007ci7dhmfhljel', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-06-14 12:00:00', '2026-08-31 12:57:13.027', '2026-08-31 12:57:13.027');
INSERT INTO public."TrainingSession" VALUES ('cmth8tflw005gci7dgfazkqul', 'cmth8tfed0019ci7dykze3pyp', NULL, '2026-05-31 09:00:00', '2026-05-31 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbd0007ci7dhmfhljel', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-06-01 12:00:00', '2026-08-31 12:57:13.028', '2026-08-31 12:57:13.028');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfly005hci7dz67g5ppy', 'cmth8tfed0019ci7dykze3pyp', NULL, '2026-05-18 09:00:00', '2026-05-18 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbd0007ci7dhmfhljel', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-05-19 12:00:00', '2026-08-31 12:57:13.03', '2026-08-31 12:57:13.03');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfm0005ici7dad5lmvwe', 'cmth8tfed0019ci7dykze3pyp', NULL, '2026-05-02 09:00:00', '2026-05-02 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbd0007ci7dhmfhljel', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-05-03 12:00:00', '2026-08-31 12:57:13.032', '2026-08-31 12:57:13.032');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfm1005jci7dag4q2nbn', 'cmth8tfed0019ci7dykze3pyp', NULL, '2026-04-19 09:00:00', '2026-04-19 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbd0007ci7dhmfhljel', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-04-20 12:00:00', '2026-08-31 12:57:13.033', '2026-08-31 12:57:13.033');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfm3005kci7dbbww6g2x', 'cmth8tfed0019ci7dykze3pyp', NULL, '2026-04-06 09:00:00', '2026-04-06 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbd0007ci7dhmfhljel', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-04-07 12:00:00', '2026-08-31 12:57:13.035', '2026-08-31 12:57:13.035');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfm4005lci7d6xbm5d32', 'cmth8tfeu001fci7d6swxswqt', NULL, '2026-07-25 09:00:00', '2026-07-25 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmth8tfb90005ci7dffm90uyd', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc8000jci7dbtrk4lpy', 'cmth8tfci000oci7dl8smk5uu', '2026-07-26 12:00:00', '2026-08-31 12:57:13.036', '2026-08-31 12:57:13.036');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfm5005mci7drzkw0z2j', 'cmth8tfeu001fci7d6swxswqt', NULL, '2026-07-12 09:00:00', '2026-07-12 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Människa', 'cmth8tfb90005ci7dffm90uyd', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc8000jci7dbtrk4lpy', 'cmth8tfci000oci7dl8smk5uu', '2026-07-13 12:00:00', '2026-08-31 12:57:13.037', '2026-08-31 12:57:13.037');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfm7005nci7dj6pyiwkp', 'cmth8tfeu001fci7d6swxswqt', NULL, '2026-06-29 09:00:00', '2026-06-29 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmth8tfb90005ci7dffm90uyd', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc8000jci7dbtrk4lpy', 'cmth8tfci000oci7dl8smk5uu', '2026-06-30 12:00:00', '2026-08-31 12:57:13.039', '2026-08-31 12:57:13.039');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfm8005oci7dglct2avj', 'cmth8tfeu001fci7d6swxswqt', NULL, '2026-06-13 09:00:00', '2026-06-13 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Människa', 'cmth8tfb90005ci7dffm90uyd', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc8000jci7dbtrk4lpy', 'cmth8tfci000oci7dl8smk5uu', '2026-06-14 12:00:00', '2026-08-31 12:57:13.04', '2026-08-31 12:57:13.04');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfma005pci7dwpmt83l5', 'cmth8tfeu001fci7d6swxswqt', NULL, '2026-05-31 09:00:00', '2026-05-31 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmth8tfb90005ci7dffm90uyd', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc8000jci7dbtrk4lpy', 'cmth8tfci000oci7dl8smk5uu', '2026-06-01 12:00:00', '2026-08-31 12:57:13.042', '2026-08-31 12:57:13.042');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmb005qci7d0rbowi7o', 'cmth8tfeu001fci7d6swxswqt', NULL, '2026-05-18 09:00:00', '2026-05-18 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Människa', 'cmth8tfb90005ci7dffm90uyd', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc8000jci7dbtrk4lpy', 'cmth8tfci000oci7dl8smk5uu', '2026-05-19 12:00:00', '2026-08-31 12:57:13.043', '2026-08-31 12:57:13.043');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmd005rci7df1aef0i1', 'cmth8tfeu001fci7d6swxswqt', NULL, '2026-05-02 09:00:00', '2026-05-02 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmth8tfb90005ci7dffm90uyd', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc8000jci7dbtrk4lpy', 'cmth8tfci000oci7dl8smk5uu', '2026-05-03 12:00:00', '2026-08-31 12:57:13.045', '2026-08-31 12:57:13.045');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmf005sci7dytrrkfei', 'cmth8tfeu001fci7d6swxswqt', NULL, '2026-04-19 09:00:00', '2026-04-19 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Människa', 'cmth8tfb90005ci7dffm90uyd', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc8000jci7dbtrk4lpy', 'cmth8tfci000oci7dl8smk5uu', '2026-04-20 12:00:00', '2026-08-31 12:57:13.047', '2026-08-31 12:57:13.047');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmg005tci7dw9sqoy5h', 'cmth8tfeu001fci7d6swxswqt', NULL, '2026-04-06 09:00:00', '2026-04-06 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmth8tfb90005ci7dffm90uyd', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc8000jci7dbtrk4lpy', 'cmth8tfci000oci7dl8smk5uu', '2026-04-07 12:00:00', '2026-08-31 12:57:13.048', '2026-08-31 12:57:13.048');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmi005uci7dwmnpjdsi', 'cmth8tff1001kci7d86na1voz', NULL, '2026-07-25 09:00:00', '2026-07-25 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcb000kci7dmqwsp9t6', 'cmth8tfcg000nci7du1r2iasp', '2026-07-26 12:00:00', '2026-08-31 12:57:13.05', '2026-08-31 12:57:13.05');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmk005vci7d6ijry2b8', 'cmth8tff1001kci7d86na1voz', NULL, '2026-07-12 09:00:00', '2026-07-12 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcb000kci7dmqwsp9t6', 'cmth8tfcg000nci7du1r2iasp', '2026-07-13 12:00:00', '2026-08-31 12:57:13.052', '2026-08-31 12:57:13.052');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmm005wci7dp2i2k6uv', 'cmth8tff1001kci7d86na1voz', NULL, '2026-06-29 09:00:00', '2026-06-29 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcb000kci7dmqwsp9t6', 'cmth8tfcg000nci7du1r2iasp', '2026-06-30 12:00:00', '2026-08-31 12:57:13.054', '2026-08-31 12:57:13.054');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmn005xci7ddo0f708u', 'cmth8tff1001kci7d86na1voz', NULL, '2026-06-13 09:00:00', '2026-06-13 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcb000kci7dmqwsp9t6', 'cmth8tfcg000nci7du1r2iasp', '2026-06-14 12:00:00', '2026-08-31 12:57:13.055', '2026-08-31 12:57:13.055');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmp005yci7ddfrm33m0', 'cmth8tff1001kci7d86na1voz', NULL, '2026-05-31 09:00:00', '2026-05-31 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcb000kci7dmqwsp9t6', 'cmth8tfcg000nci7du1r2iasp', '2026-06-01 12:00:00', '2026-08-31 12:57:13.057', '2026-08-31 12:57:13.057');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmq005zci7diup1xxxh', 'cmth8tff1001kci7d86na1voz', NULL, '2026-05-18 09:00:00', '2026-05-18 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcb000kci7dmqwsp9t6', 'cmth8tfcg000nci7du1r2iasp', '2026-05-19 12:00:00', '2026-08-31 12:57:13.058', '2026-08-31 12:57:13.058');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfms0060ci7dtqrh5awq', 'cmth8tff1001kci7d86na1voz', NULL, '2026-05-02 09:00:00', '2026-05-02 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcb000kci7dmqwsp9t6', 'cmth8tfcg000nci7du1r2iasp', '2026-05-03 12:00:00', '2026-08-31 12:57:13.06', '2026-08-31 12:57:13.06');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmt0061ci7d6l6w4wvq', 'cmth8tff1001kci7d86na1voz', NULL, '2026-04-19 09:00:00', '2026-04-19 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcb000kci7dmqwsp9t6', 'cmth8tfcg000nci7du1r2iasp', '2026-04-20 12:00:00', '2026-08-31 12:57:13.061', '2026-08-31 12:57:13.061');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmv0062ci7df4k8rkps', 'cmth8tff1001kci7d86na1voz', NULL, '2026-04-06 09:00:00', '2026-04-06 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcb000kci7dmqwsp9t6', 'cmth8tfcg000nci7du1r2iasp', '2026-04-07 12:00:00', '2026-08-31 12:57:13.063', '2026-08-31 12:57:13.063');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmw0063ci7d3m9tp5pq', 'cmth8tff9001qci7digigiwdg', NULL, '2026-07-25 09:00:00', '2026-07-25 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmth8tfbh0009ci7duf5obdp2', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-07-26 12:00:00', '2026-08-31 12:57:13.064', '2026-08-31 12:57:13.064');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmy0064ci7dbblp7zrw', 'cmth8tff9001qci7digigiwdg', NULL, '2026-07-12 09:00:00', '2026-07-12 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmth8tfbh0009ci7duf5obdp2', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-07-13 12:00:00', '2026-08-31 12:57:13.066', '2026-08-31 12:57:13.066');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfmz0065ci7dcjrah9q4', 'cmth8tff9001qci7digigiwdg', NULL, '2026-06-29 09:00:00', '2026-06-29 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmth8tfbh0009ci7duf5obdp2', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-06-30 12:00:00', '2026-08-31 12:57:13.067', '2026-08-31 12:57:13.067');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfn10066ci7dxb76tikr', 'cmth8tff9001qci7digigiwdg', NULL, '2026-06-13 09:00:00', '2026-06-13 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmth8tfbh0009ci7duf5obdp2', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-06-14 12:00:00', '2026-08-31 12:57:13.069', '2026-08-31 12:57:13.069');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfn30067ci7dcnamt3eh', 'cmth8tff9001qci7digigiwdg', NULL, '2026-05-31 09:00:00', '2026-05-31 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmth8tfbh0009ci7duf5obdp2', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-06-01 12:00:00', '2026-08-31 12:57:13.071', '2026-08-31 12:57:13.071');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfn40068ci7dpi329x3d', 'cmth8tff9001qci7digigiwdg', NULL, '2026-05-18 09:00:00', '2026-05-18 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmth8tfbh0009ci7duf5obdp2', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-05-19 12:00:00', '2026-08-31 12:57:13.072', '2026-08-31 12:57:13.072');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfn60069ci7d1llwsj58', 'cmth8tff9001qci7digigiwdg', NULL, '2026-05-02 09:00:00', '2026-05-02 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmth8tfbh0009ci7duf5obdp2', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-05-03 12:00:00', '2026-08-31 12:57:13.074', '2026-08-31 12:57:13.074');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfn7006aci7dbf7urgcu', 'cmth8tff9001qci7digigiwdg', NULL, '2026-04-19 09:00:00', '2026-04-19 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Sprängämnen', 'cmth8tfbh0009ci7duf5obdp2', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-04-20 12:00:00', '2026-08-31 12:57:13.075', '2026-08-31 12:57:13.075');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfn9006bci7d29xxi3ny', 'cmth8tff9001qci7digigiwdg', NULL, '2026-04-06 09:00:00', '2026-04-06 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Sprängämnen', 'cmth8tfbh0009ci7duf5obdp2', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-04-07 12:00:00', '2026-08-31 12:57:13.077', '2026-08-31 12:57:13.077');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfna006cci7d6amjoi9g', 'cmth8tffg001vci7drzxl2icx', NULL, '2026-07-25 09:00:00', '2026-07-25 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmth8tfbc0006ci7dwxvt5zbg', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcd000lci7dj7x4s87l', 'cmth8tfci000oci7dl8smk5uu', '2026-07-26 12:00:00', '2026-08-31 12:57:13.078', '2026-08-31 12:57:13.078');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfnc006dci7dl3ze3c4u', 'cmth8tffg001vci7drzxl2icx', NULL, '2026-07-12 09:00:00', '2026-07-12 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Människa', 'cmth8tfbc0006ci7dwxvt5zbg', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcd000lci7dj7x4s87l', 'cmth8tfci000oci7dl8smk5uu', '2026-07-13 12:00:00', '2026-08-31 12:57:13.08', '2026-08-31 12:57:13.08');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfnd006eci7dp8vfvvgy', 'cmth8tffg001vci7drzxl2icx', NULL, '2026-06-29 09:00:00', '2026-06-29 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmth8tfbc0006ci7dwxvt5zbg', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcd000lci7dj7x4s87l', 'cmth8tfci000oci7dl8smk5uu', '2026-06-30 12:00:00', '2026-08-31 12:57:13.081', '2026-08-31 12:57:13.081');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfnf006fci7dk14kcxmu', 'cmth8tffg001vci7drzxl2icx', NULL, '2026-06-13 09:00:00', '2026-06-13 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Människa', 'cmth8tfbc0006ci7dwxvt5zbg', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcd000lci7dj7x4s87l', 'cmth8tfci000oci7dl8smk5uu', '2026-06-14 12:00:00', '2026-08-31 12:57:13.083', '2026-08-31 12:57:13.083');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfnh006gci7dqtxfj87l', 'cmth8tffg001vci7drzxl2icx', NULL, '2026-05-31 09:00:00', '2026-05-31 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmth8tfbc0006ci7dwxvt5zbg', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcd000lci7dj7x4s87l', 'cmth8tfci000oci7dl8smk5uu', '2026-06-01 12:00:00', '2026-08-31 12:57:13.085', '2026-08-31 12:57:13.085');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfni006hci7dg7kguv4b', 'cmth8tffg001vci7drzxl2icx', NULL, '2026-05-18 09:00:00', '2026-05-18 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Människa', 'cmth8tfbc0006ci7dwxvt5zbg', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcd000lci7dj7x4s87l', 'cmth8tfci000oci7dl8smk5uu', '2026-05-19 12:00:00', '2026-08-31 12:57:13.086', '2026-08-31 12:57:13.086');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfnk006ici7dpk9tlqvl', 'cmth8tffg001vci7drzxl2icx', NULL, '2026-05-02 09:00:00', '2026-05-02 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmth8tfbc0006ci7dwxvt5zbg', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcd000lci7dj7x4s87l', 'cmth8tfci000oci7dl8smk5uu', '2026-05-03 12:00:00', '2026-08-31 12:57:13.088', '2026-08-31 12:57:13.088');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfnm006jci7dvjh0t8qu', 'cmth8tffg001vci7drzxl2icx', NULL, '2026-04-19 09:00:00', '2026-04-19 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Människa', 'cmth8tfbc0006ci7dwxvt5zbg', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcd000lci7dj7x4s87l', 'cmth8tfci000oci7dl8smk5uu', '2026-04-20 12:00:00', '2026-08-31 12:57:13.09', '2026-08-31 12:57:13.09');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfno006kci7dc4qdc58x', 'cmth8tffg001vci7drzxl2icx', NULL, '2026-04-06 09:00:00', '2026-04-06 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Människa', 'cmth8tfbc0006ci7dwxvt5zbg', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfcd000lci7dj7x4s87l', 'cmth8tfci000oci7dl8smk5uu', '2026-04-07 12:00:00', '2026-08-31 12:57:13.092', '2026-08-31 12:57:13.092');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfnp006lci7d0t634b07', 'cmth8tffs0020ci7d0ygr445u', NULL, '2026-07-25 09:00:00', '2026-07-25 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfce000mci7dlyq2ywrn', 'cmth8tfci000oci7dl8smk5uu', '2026-07-26 12:00:00', '2026-08-31 12:57:13.093', '2026-08-31 12:57:13.093');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfnr006mci7dj18ktfp9', 'cmth8tffs0020ci7d0ygr445u', NULL, '2026-07-12 09:00:00', '2026-07-12 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfce000mci7dlyq2ywrn', 'cmth8tfci000oci7dl8smk5uu', '2026-07-13 12:00:00', '2026-08-31 12:57:13.095', '2026-08-31 12:57:13.095');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfns006nci7dq191rnm6', 'cmth8tffs0020ci7d0ygr445u', NULL, '2026-06-29 09:00:00', '2026-06-29 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfce000mci7dlyq2ywrn', 'cmth8tfci000oci7dl8smk5uu', '2026-06-30 12:00:00', '2026-08-31 12:57:13.096', '2026-08-31 12:57:13.096');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfnu006oci7dwdkozv66', 'cmth8tffs0020ci7d0ygr445u', NULL, '2026-06-13 09:00:00', '2026-06-13 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfce000mci7dlyq2ywrn', 'cmth8tfci000oci7dl8smk5uu', '2026-06-14 12:00:00', '2026-08-31 12:57:13.098', '2026-08-31 12:57:13.098');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfnw006pci7d9f0m7ie5', 'cmth8tffs0020ci7d0ygr445u', NULL, '2026-05-31 09:00:00', '2026-05-31 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfce000mci7dlyq2ywrn', 'cmth8tfci000oci7dl8smk5uu', '2026-06-01 12:00:00', '2026-08-31 12:57:13.1', '2026-08-31 12:57:13.1');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfny006qci7dh90gslen', 'cmth8tffs0020ci7d0ygr445u', NULL, '2026-05-18 09:00:00', '2026-05-18 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfce000mci7dlyq2ywrn', 'cmth8tfci000oci7dl8smk5uu', '2026-05-19 12:00:00', '2026-08-31 12:57:13.102', '2026-08-31 12:57:13.102');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfo0006rci7d0cfi7nma', 'cmth8tffs0020ci7d0ygr445u', NULL, '2026-05-02 09:00:00', '2026-05-02 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfce000mci7dlyq2ywrn', 'cmth8tfci000oci7dl8smk5uu', '2026-05-03 12:00:00', '2026-08-31 12:57:13.104', '2026-08-31 12:57:13.104');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfo1006sci7dwgragp5k', 'cmth8tffs0020ci7d0ygr445u', NULL, '2026-04-19 09:00:00', '2026-04-19 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfce000mci7dlyq2ywrn', 'cmth8tfci000oci7dl8smk5uu', '2026-04-20 12:00:00', '2026-08-31 12:57:13.105', '2026-08-31 12:57:13.105');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfo3006tci7deoszk2mu', 'cmth8tffs0020ci7d0ygr445u', NULL, '2026-04-06 09:00:00', '2026-04-06 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfce000mci7dlyq2ywrn', 'cmth8tfci000oci7dl8smk5uu', '2026-04-07 12:00:00', '2026-08-31 12:57:13.107', '2026-08-31 12:57:13.107');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfo5006uci7d4hb0almh', 'cmth8tfg10025ci7dpelv7kwh', NULL, '2026-07-25 09:00:00', '2026-07-25 11:00:00', 'Umeå, Nydalaområdet', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 6, 6, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-07-26 12:00:00', '2026-08-31 12:57:13.109', '2026-08-31 12:57:13.109');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfo7006vci7dpdrm9z85', 'cmth8tfg10025ci7dpelv7kwh', NULL, '2026-07-12 09:00:00', '2026-07-12 10:45:00', 'Tyresta, Stockholm', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-07-13 12:00:00', '2026-08-31 12:57:13.111', '2026-08-31 12:57:13.111');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfo9006wci7dcwspevh6', 'cmth8tfg10025ci7dpelv7kwh', NULL, '2026-06-29 09:00:00', '2026-06-29 10:30:00', 'Farsta industriområde', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-06-30 12:00:00', '2026-08-31 12:57:13.113', '2026-08-31 12:57:13.113');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfob006xci7d37g9upwy', 'cmth8tfg10025ci7dpelv7kwh', NULL, '2026-06-13 09:00:00', '2026-06-13 11:00:00', 'Malmö godsterminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-06-14 12:00:00', '2026-08-31 12:57:13.115', '2026-08-31 12:57:13.115');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfod006yci7df4hjv691', 'cmth8tfg10025ci7dpelv7kwh', NULL, '2026-05-31 09:00:00', '2026-05-31 10:45:00', 'Örebro logistikcenter', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-06-01 12:00:00', '2026-08-31 12:57:13.117', '2026-08-31 12:57:13.117');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfof006zci7dunrbjs2n', 'cmth8tfg10025ci7dpelv7kwh', NULL, '2026-05-18 09:00:00', '2026-05-18 10:30:00', 'Jordbro terminal', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-05-19 12:00:00', '2026-08-31 12:57:13.119', '2026-08-31 12:57:13.119');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfoh0070ci7d7s7o8rnw', 'cmth8tfg10025ci7dpelv7kwh', NULL, '2026-05-02 09:00:00', '2026-05-02 11:00:00', 'Slottsskogen, Göteborg', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 6, 5, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-05-03 12:00:00', '2026-08-31 12:57:13.121', '2026-08-31 12:57:13.121');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfoj0071ci7dogne8css', 'cmth8tfg10025ci7dpelv7kwh', NULL, '2026-04-19 09:00:00', '2026-04-19 10:45:00', 'Umeå, Nydalaområdet', 'Bagagesök', 'Terminal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 4, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-04-20 12:00:00', '2026-08-31 12:57:13.123', '2026-08-31 12:57:13.123');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfol0072ci7dji36y5jq', 'cmth8tfg10025ci7dpelv7kwh', NULL, '2026-04-06 09:00:00', '2026-04-06 10:30:00', 'Tyresta, Stockholm', 'Byggnadssök', 'Lagerlokal', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 4, 3, 'Ordinarie underhållsträning.', 'APPROVED', 'cmth8tfc6000ici7dxt92o6r4', 'cmth8tfcg000nci7du1r2iasp', '2026-04-07 12:00:00', '2026-08-31 12:57:13.125', '2026-08-31 12:57:13.125');
INSERT INTO public."TrainingSession" VALUES ('cmth8tfj4003eci7dew63p4kp', 'cmth8tfdv0014ci7dj2j75fhm', 'cmth8tfil0038ci7drdx827ji', '2026-08-22 09:00:00', '2026-08-22 11:15:00', 'Tyresta, Stockholm', 'Områdessök', 'Skog', 'Narkotika', 'cmth8tfbg0008ci7dmmb6e1l1', 5, 4, 'Bra genomförande. Stabilt sök i svår terräng. Missade en gömma vid stenröse.', 'APPROVED', 'cmth8tfc1000hci7d8zxp7rfj', 'cmth8tfcg000nci7du1r2iasp', '2026-08-23 12:00:00', '2026-08-31 12:57:12.928', '2026-08-31 12:57:13.13');

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."User" VALUES ('cmth8tfc1000hci7d8zxp7rfj', 'erik.andersson@avarn.se', 'Erik Andersson', '$2b$10$k985sEIvSMtsFPEyo3RPnu6lx6ILuPzXVvAf75V4BRqyg/Zv/D68q', 'HANDLER', '070-123 45 67', true, NULL, '2026-08-31 12:57:12.673', 'cmth8tfaz0002ci7dwc63k4gy');
INSERT INTO public."User" VALUES ('cmth8tfc6000ici7dxt92o6r4', 'maria.svensson@avarn.se', 'Maria Svensson', '$2b$10$k985sEIvSMtsFPEyo3RPnu6lx6ILuPzXVvAf75V4BRqyg/Zv/D68q', 'HANDLER', '070-234 56 78', true, NULL, '2026-08-31 12:57:12.678', 'cmth8tfaz0002ci7dwc63k4gy');
INSERT INTO public."User" VALUES ('cmth8tfc8000jci7dbtrk4lpy', 'johan.larsson@avarn.se', 'Johan Larsson', '$2b$10$k985sEIvSMtsFPEyo3RPnu6lx6ILuPzXVvAf75V4BRqyg/Zv/D68q', 'HANDLER', '070-345 67 89', true, NULL, '2026-08-31 12:57:12.68', 'cmth8tfb10003ci7de0ioupw5');
INSERT INTO public."User" VALUES ('cmth8tfcb000kci7dmqwsp9t6', 'sofie.holm@avarn.se', 'Sofie Holm', '$2b$10$k985sEIvSMtsFPEyo3RPnu6lx6ILuPzXVvAf75V4BRqyg/Zv/D68q', 'HANDLER', '070-456 78 90', true, NULL, '2026-08-31 12:57:12.683', 'cmth8tfb20004ci7dk0sftuu7');
INSERT INTO public."User" VALUES ('cmth8tfcd000lci7dj7x4s87l', 'anders.berg@avarn.se', 'Anders Berg', '$2b$10$k985sEIvSMtsFPEyo3RPnu6lx6ILuPzXVvAf75V4BRqyg/Zv/D68q', 'HANDLER', '070-567 89 01', true, NULL, '2026-08-31 12:57:12.685', 'cmth8tfar0000ci7doj1q9sau');
INSERT INTO public."User" VALUES ('cmth8tfce000mci7dlyq2ywrn', 'lisa.ek@avarn.se', 'Lisa Ek', '$2b$10$k985sEIvSMtsFPEyo3RPnu6lx6ILuPzXVvAf75V4BRqyg/Zv/D68q', 'HANDLER', '070-678 90 12', true, NULL, '2026-08-31 12:57:12.686', 'cmth8tfaw0001ci7do66mexy9');
INSERT INTO public."User" VALUES ('cmth8tfcg000nci7du1r2iasp', 'anna.karlsson@avarn.se', 'Anna Karlsson', '$2b$10$k985sEIvSMtsFPEyo3RPnu6lx6ILuPzXVvAf75V4BRqyg/Zv/D68q', 'INSTRUCTOR', '070-789 01 23', true, NULL, '2026-08-31 12:57:12.688', 'cmth8tfaz0002ci7dwc63k4gy');
INSERT INTO public."User" VALUES ('cmth8tfci000oci7dl8smk5uu', 'peter.nyman@avarn.se', 'Peter Nyman', '$2b$10$k985sEIvSMtsFPEyo3RPnu6lx6ILuPzXVvAf75V4BRqyg/Zv/D68q', 'INSTRUCTOR', '070-890 12 34', true, NULL, '2026-08-31 12:57:12.69', 'cmth8tfb10003ci7de0ioupw5');
INSERT INTO public."User" VALUES ('cmth8tfck000pci7dihh8t4ak', 'karin.dahl@avarn.se', 'Karin Dahl', '$2b$10$k985sEIvSMtsFPEyo3RPnu6lx6ILuPzXVvAf75V4BRqyg/Zv/D68q', 'REGIONAL_MANAGER', '070-901 23 45', true, NULL, '2026-08-31 12:57:12.692', 'cmth8tfaz0002ci7dwc63k4gy');
INSERT INTO public."User" VALUES ('cmth8tfcm000qci7domxnhavn', 'magnus.oberg@avarn.se', 'Magnus Öberg', '$2b$10$k985sEIvSMtsFPEyo3RPnu6lx6ILuPzXVvAf75V4BRqyg/Zv/D68q', 'NATIONAL_MANAGER', '070-012 34 56', true, NULL, '2026-08-31 12:57:12.694', NULL);
INSERT INTO public."User" VALUES ('cmth8tfcp000rci7dk2qec6kq', 'admin@avarn.se', 'Systemadministratör', '$2b$10$k985sEIvSMtsFPEyo3RPnu6lx6ILuPzXVvAf75V4BRqyg/Zv/D68q', 'ADMIN', NULL, true, NULL, '2026-08-31 12:57:12.697', NULL);

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations VALUES ('b4a08b03-3687-430e-9f5f-9c34b0c01b36', 'e67474ddd6e107de2df8cefbeb5f9cb6e3a15399718d0cd8c3a6d8d78a9d0c8c', '2026-08-31 12:57:11.315391+00', '20260831113658_init', NULL, NULL, '2026-08-31 12:57:11.093046+00', 1);

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
