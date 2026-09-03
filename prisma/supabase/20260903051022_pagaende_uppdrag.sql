--
-- Migrering: 20260903051022_pagaende_uppdrag
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
    WHERE migration_name = '20260903051022_pagaende_uppdrag'
  ) THEN
    RAISE NOTICE 'Migreringen 20260903051022_pagaende_uppdrag är redan applicerad – hoppar över.';
  ELSE

    -- AlterTable
    ALTER TABLE "MissionAssignment" ADD COLUMN     "checklistDone" TEXT,
    ADD COLUMN     "endedAt" TIMESTAMP(3),
    ADD COLUMN     "progressPercent" INTEGER NOT NULL DEFAULT 0;

    -- CreateTable
    CREATE TABLE "MissionEvent" (
        "id" TEXT NOT NULL,
        "assignmentId" TEXT NOT NULL,
        "kind" TEXT NOT NULL,
        "note" TEXT,
        "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdById" TEXT NOT NULL,

        CONSTRAINT "MissionEvent_pkey" PRIMARY KEY ("id")
    );

    -- CreateIndex
    CREATE INDEX "MissionEvent_assignmentId_idx" ON "MissionEvent"("assignmentId");

    -- AddForeignKey
    ALTER TABLE "MissionEvent" ADD CONSTRAINT "MissionEvent_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "MissionAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "MissionEvent" ADD CONSTRAINT "MissionEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."MissionEvent" ENABLE ROW LEVEL SECURITY;

    INSERT INTO public._prisma_migrations (
      id, checksum, finished_at, migration_name,
      logs, rolled_back_at, started_at, applied_steps_count
    ) VALUES (
      gen_random_uuid()::text,
      '2a35890bcbee5b27200a93e31c692c32cf42683d330b07f17e2f2674055f4e63',
      now(),
      '20260903051022_pagaende_uppdrag',
      NULL,
      NULL,
      now(),
      1
    );

    RAISE NOTICE 'Migreringen 20260903051022_pagaende_uppdrag är applicerad.';
  END IF;
END
$migration$;
