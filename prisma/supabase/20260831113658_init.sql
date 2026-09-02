--
-- Migrering: 20260831113658_init
--
-- Klistra in i Supabase: SQL Editor > New query > Run.
-- Avsedd för en databas som REDAN har tabellerna. Är databasen tom, kör
-- prisma/supabase-setup.sql i stället.
--
-- Filen kan köras om utan risk: har migreringen redan applicerats händer
-- ingenting.
--
-- Genererad av scripts/generate-supabase-migration-sql.mjs.
--

DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public._prisma_migrations
    WHERE migration_name = '20260831113658_init'
  ) THEN
    RAISE NOTICE 'Migreringen 20260831113658_init är redan applicerad – hoppar över.';
  ELSE

    -- CreateTable
    CREATE TABLE "Region" (
        "id" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,

        CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "phone" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "lastLoginAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "regionId" TEXT,

        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "HandlerProfile" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "employeeNumber" TEXT,
        "baseLocation" TEXT,
        "bio" TEXT,
        "photoUrl" TEXT,

        CONSTRAINT "HandlerProfile_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "Dog" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "breed" TEXT NOT NULL,
        "birthDate" TIMESTAMP(3) NOT NULL,
        "sex" TEXT,
        "chipNumber" TEXT,
        "photoUrl" TEXT,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "Dog_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "SearchDiscipline" (
        "id" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "shortLabel" TEXT NOT NULL,
        "description" TEXT,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,

        CONSTRAINT "SearchDiscipline_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "DogDiscipline" (
        "id" TEXT NOT NULL,
        "dogId" TEXT NOT NULL,
        "disciplineId" TEXT NOT NULL,
        "level" TEXT,
        "certifiedAt" TIMESTAMP(3),

        CONSTRAINT "DogDiscipline_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "DogEducation" (
        "id" TEXT NOT NULL,
        "dogId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "provider" TEXT,
        "completedAt" TIMESTAMP(3),

        CONSTRAINT "DogEducation_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "Team" (
        "id" TEXT NOT NULL,
        "handlerId" TEXT NOT NULL,
        "dogId" TEXT NOT NULL,
        "regionId" TEXT NOT NULL,
        "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endedAt" TIMESTAMP(3),
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',

        CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "InstructorAssignment" (
        "id" TEXT NOT NULL,
        "instructorId" TEXT NOT NULL,
        "teamId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "InstructorAssignment_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "TeamAvailability" (
        "id" TEXT NOT NULL,
        "teamId" TEXT NOT NULL,
        "startAt" TIMESTAMP(3) NOT NULL,
        "endAt" TIMESTAMP(3) NOT NULL,
        "kind" TEXT NOT NULL,
        "note" TEXT,

        CONSTRAINT "TeamAvailability_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "CertificationType" (
        "id" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "validityMonths" INTEGER NOT NULL,
        "appliesTo" TEXT NOT NULL,
        "description" TEXT,

        CONSTRAINT "CertificationType_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "Certification" (
        "id" TEXT NOT NULL,
        "typeId" TEXT NOT NULL,
        "dogId" TEXT,
        "userId" TEXT,
        "teamId" TEXT,
        "issuer" TEXT,
        "reference" TEXT,
        "issuedAt" TIMESTAMP(3) NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "TrainingPlan" (
        "id" TEXT NOT NULL,
        "teamId" TEXT NOT NULL,
        "instructorId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "purpose" TEXT,
        "periodStart" TIMESTAMP(3) NOT NULL,
        "periodEnd" TIMESTAMP(3) NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "TrainingPlan_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "PlannedExercise" (
        "id" TEXT NOT NULL,
        "planId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "instructions" TEXT,
        "disciplineId" TEXT,
        "targetOdor" TEXT,
        "environment" TEXT,
        "dueDate" TIMESTAMP(3),
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'PLANNED',

        CONSTRAINT "PlannedExercise_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "TrainingSession" (
        "id" TEXT NOT NULL,
        "teamId" TEXT NOT NULL,
        "plannedExerciseId" TEXT,
        "startAt" TIMESTAMP(3) NOT NULL,
        "endAt" TIMESTAMP(3),
        "location" TEXT NOT NULL,
        "trainingArea" TEXT NOT NULL,
        "environment" TEXT NOT NULL,
        "targetOdor" TEXT NOT NULL,
        "disciplineId" TEXT,
        "hideCount" INTEGER NOT NULL DEFAULT 0,
        "foundCount" INTEGER NOT NULL DEFAULT 0,
        "comment" TEXT,
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "createdById" TEXT NOT NULL,
        "approvedById" TEXT,
        "approvedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "Hide" (
        "id" TEXT NOT NULL,
        "sessionId" TEXT NOT NULL,
        "label" TEXT,
        "placement" TEXT,
        "heightCm" INTEGER,
        "difficulty" TEXT,
        "outcome" TEXT NOT NULL DEFAULT 'FOUND',
        "searchSeconds" INTEGER,
        "notes" TEXT,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,

        CONSTRAINT "Hide_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "Customer" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "orgNumber" TEXT,
        "contactName" TEXT,
        "contactPhone" TEXT,
        "contactEmail" TEXT,
        "notes" TEXT,

        CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "Mission" (
        "id" TEXT NOT NULL,
        "reference" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "missionType" TEXT NOT NULL,
        "customerId" TEXT,
        "contactName" TEXT,
        "contactPhone" TEXT,
        "startAt" TIMESTAMP(3) NOT NULL,
        "endAt" TIMESTAMP(3),
        "address" TEXT,
        "locality" TEXT NOT NULL,
        "regionId" TEXT NOT NULL,
        "disciplineId" TEXT,
        "specialInstructions" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PLANNED',
        "createdById" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "MissionAssignment" (
        "id" TEXT NOT NULL,
        "missionId" TEXT NOT NULL,
        "teamId" TEXT NOT NULL,
        "assignedById" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'OFFERED',
        "note" TEXT,
        "respondedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "MissionAssignment_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "OperationalReport" (
        "id" TEXT NOT NULL,
        "missionId" TEXT NOT NULL,
        "teamId" TEXT NOT NULL,
        "authorId" TEXT NOT NULL,
        "areasSearched" TEXT,
        "findings" TEXT,
        "deviations" TEXT,
        "actions" TEXT,
        "startedAt" TIMESTAMP(3),
        "endedAt" TIMESTAMP(3),
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "submittedAt" TIMESTAMP(3),
        "approvedById" TEXT,
        "approvedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "OperationalReport_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "Indication" (
        "id" TEXT NOT NULL,
        "reportId" TEXT NOT NULL,
        "location" TEXT,
        "description" TEXT,
        "outcome" TEXT NOT NULL DEFAULT 'FIND',
        "handedOverTo" TEXT,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,

        CONSTRAINT "Indication_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "MediaAsset" (
        "id" TEXT NOT NULL,
        "kind" TEXT NOT NULL,
        "originalName" TEXT NOT NULL,
        "storedName" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        "size" INTEGER NOT NULL,
        "uploadedById" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "trainingSessionId" TEXT,
        "reportId" TEXT,
        "certificationId" TEXT,

        CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "Comment" (
        "id" TEXT NOT NULL,
        "authorId" TEXT NOT NULL,
        "body" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "trainingSessionId" TEXT,
        "reportId" TEXT,
        "teamId" TEXT,

        CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "FollowUp" (
        "id" TEXT NOT NULL,
        "teamId" TEXT NOT NULL,
        "instructorId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT,
        "dueDate" TIMESTAMP(3),
        "status" TEXT NOT NULL DEFAULT 'OPEN',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "Notification" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "body" TEXT,
        "url" TEXT,
        "readAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "AuditLog" (
        "id" TEXT NOT NULL,
        "userId" TEXT,
        "action" TEXT NOT NULL,
        "entityType" TEXT NOT NULL,
        "entityId" TEXT,
        "detail" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
    );

    -- CreateIndex
    CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");

    -- CreateIndex
    CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

    -- CreateIndex
    CREATE INDEX "User_role_idx" ON "User"("role");

    -- CreateIndex
    CREATE INDEX "User_regionId_idx" ON "User"("regionId");

    -- CreateIndex
    CREATE UNIQUE INDEX "HandlerProfile_userId_key" ON "HandlerProfile"("userId");

    -- CreateIndex
    CREATE UNIQUE INDEX "SearchDiscipline_code_key" ON "SearchDiscipline"("code");

    -- CreateIndex
    CREATE UNIQUE INDEX "DogDiscipline_dogId_disciplineId_key" ON "DogDiscipline"("dogId", "disciplineId");

    -- CreateIndex
    CREATE INDEX "Team_regionId_idx" ON "Team"("regionId");

    -- CreateIndex
    CREATE UNIQUE INDEX "Team_handlerId_dogId_key" ON "Team"("handlerId", "dogId");

    -- CreateIndex
    CREATE INDEX "InstructorAssignment_teamId_idx" ON "InstructorAssignment"("teamId");

    -- CreateIndex
    CREATE UNIQUE INDEX "InstructorAssignment_instructorId_teamId_key" ON "InstructorAssignment"("instructorId", "teamId");

    -- CreateIndex
    CREATE INDEX "TeamAvailability_teamId_startAt_idx" ON "TeamAvailability"("teamId", "startAt");

    -- CreateIndex
    CREATE UNIQUE INDEX "CertificationType_code_key" ON "CertificationType"("code");

    -- CreateIndex
    CREATE INDEX "Certification_expiresAt_idx" ON "Certification"("expiresAt");

    -- CreateIndex
    CREATE INDEX "Certification_dogId_idx" ON "Certification"("dogId");

    -- CreateIndex
    CREATE INDEX "Certification_teamId_idx" ON "Certification"("teamId");

    -- CreateIndex
    CREATE INDEX "TrainingPlan_teamId_idx" ON "TrainingPlan"("teamId");

    -- CreateIndex
    CREATE INDEX "PlannedExercise_planId_idx" ON "PlannedExercise"("planId");

    -- CreateIndex
    CREATE UNIQUE INDEX "TrainingSession_plannedExerciseId_key" ON "TrainingSession"("plannedExerciseId");

    -- CreateIndex
    CREATE INDEX "TrainingSession_teamId_startAt_idx" ON "TrainingSession"("teamId", "startAt");

    -- CreateIndex
    CREATE INDEX "TrainingSession_status_idx" ON "TrainingSession"("status");

    -- CreateIndex
    CREATE INDEX "Hide_sessionId_idx" ON "Hide"("sessionId");

    -- CreateIndex
    CREATE UNIQUE INDEX "Mission_reference_key" ON "Mission"("reference");

    -- CreateIndex
    CREATE INDEX "Mission_startAt_idx" ON "Mission"("startAt");

    -- CreateIndex
    CREATE INDEX "Mission_regionId_idx" ON "Mission"("regionId");

    -- CreateIndex
    CREATE INDEX "Mission_status_idx" ON "Mission"("status");

    -- CreateIndex
    CREATE INDEX "MissionAssignment_teamId_idx" ON "MissionAssignment"("teamId");

    -- CreateIndex
    CREATE UNIQUE INDEX "MissionAssignment_missionId_teamId_key" ON "MissionAssignment"("missionId", "teamId");

    -- CreateIndex
    CREATE INDEX "OperationalReport_teamId_idx" ON "OperationalReport"("teamId");

    -- CreateIndex
    CREATE INDEX "OperationalReport_missionId_idx" ON "OperationalReport"("missionId");

    -- CreateIndex
    CREATE INDEX "OperationalReport_status_idx" ON "OperationalReport"("status");

    -- CreateIndex
    CREATE INDEX "Indication_reportId_idx" ON "Indication"("reportId");

    -- CreateIndex
    CREATE UNIQUE INDEX "MediaAsset_storedName_key" ON "MediaAsset"("storedName");

    -- CreateIndex
    CREATE INDEX "MediaAsset_trainingSessionId_idx" ON "MediaAsset"("trainingSessionId");

    -- CreateIndex
    CREATE INDEX "MediaAsset_reportId_idx" ON "MediaAsset"("reportId");

    -- CreateIndex
    CREATE INDEX "Comment_trainingSessionId_idx" ON "Comment"("trainingSessionId");

    -- CreateIndex
    CREATE INDEX "Comment_reportId_idx" ON "Comment"("reportId");

    -- CreateIndex
    CREATE INDEX "FollowUp_teamId_idx" ON "FollowUp"("teamId");

    -- CreateIndex
    CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

    -- CreateIndex
    CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

    -- CreateIndex
    CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

    -- AddForeignKey
    ALTER TABLE "User" ADD CONSTRAINT "User_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "HandlerProfile" ADD CONSTRAINT "HandlerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "DogDiscipline" ADD CONSTRAINT "DogDiscipline_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "DogDiscipline" ADD CONSTRAINT "DogDiscipline_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "SearchDiscipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "DogEducation" ADD CONSTRAINT "DogEducation_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Team" ADD CONSTRAINT "Team_handlerId_fkey" FOREIGN KEY ("handlerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Team" ADD CONSTRAINT "Team_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Team" ADD CONSTRAINT "Team_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "InstructorAssignment" ADD CONSTRAINT "InstructorAssignment_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "InstructorAssignment" ADD CONSTRAINT "InstructorAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "TeamAvailability" ADD CONSTRAINT "TeamAvailability_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Certification" ADD CONSTRAINT "Certification_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CertificationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Certification" ADD CONSTRAINT "Certification_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Certification" ADD CONSTRAINT "Certification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Certification" ADD CONSTRAINT "Certification_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "TrainingPlan" ADD CONSTRAINT "TrainingPlan_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "TrainingPlan" ADD CONSTRAINT "TrainingPlan_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "PlannedExercise" ADD CONSTRAINT "PlannedExercise_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "PlannedExercise" ADD CONSTRAINT "PlannedExercise_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "SearchDiscipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_plannedExerciseId_fkey" FOREIGN KEY ("plannedExerciseId") REFERENCES "PlannedExercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "SearchDiscipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Hide" ADD CONSTRAINT "Hide_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Mission" ADD CONSTRAINT "Mission_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Mission" ADD CONSTRAINT "Mission_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Mission" ADD CONSTRAINT "Mission_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "SearchDiscipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Mission" ADD CONSTRAINT "Mission_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "MissionAssignment" ADD CONSTRAINT "MissionAssignment_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "MissionAssignment" ADD CONSTRAINT "MissionAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "MissionAssignment" ADD CONSTRAINT "MissionAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "OperationalReport" ADD CONSTRAINT "OperationalReport_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "OperationalReport" ADD CONSTRAINT "OperationalReport_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "OperationalReport" ADD CONSTRAINT "OperationalReport_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "OperationalReport" ADD CONSTRAINT "OperationalReport_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Indication" ADD CONSTRAINT "Indication_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "OperationalReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_trainingSessionId_fkey" FOREIGN KEY ("trainingSessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "OperationalReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Comment" ADD CONSTRAINT "Comment_trainingSessionId_fkey" FOREIGN KEY ("trainingSessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Comment" ADD CONSTRAINT "Comment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "OperationalReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Comment" ADD CONSTRAINT "Comment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."Region" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."HandlerProfile" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."Dog" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."SearchDiscipline" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."DogDiscipline" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."DogEducation" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."Team" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."InstructorAssignment" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."TeamAvailability" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."CertificationType" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."Certification" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."TrainingPlan" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."PlannedExercise" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."TrainingSession" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."Hide" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."Customer" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."Mission" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."MissionAssignment" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."OperationalReport" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."Indication" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."MediaAsset" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."Comment" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."FollowUp" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;
    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;

    INSERT INTO public._prisma_migrations (
      id, checksum, finished_at, migration_name,
      logs, rolled_back_at, started_at, applied_steps_count
    ) VALUES (
      gen_random_uuid()::text,
      'e67474ddd6e107de2df8cefbeb5f9cb6e3a15399718d0cd8c3a6d8d78a9d0c8c',
      now(),
      '20260831113658_init',
      NULL,
      NULL,
      now(),
      1
    );

    RAISE NOTICE 'Migreringen 20260831113658_init är applicerad.';
  END IF;
END
$migration$;
