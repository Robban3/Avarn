--
-- Migrering: 20260903033605_uppdragsdetaljer
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
    WHERE migration_name = '20260903033605_uppdragsdetaljer'
  ) THEN
    RAISE NOTICE 'Migreringen 20260903033605_uppdragsdetaljer är redan applicerad – hoppar över.';
  ELSE

    -- AlterTable
    ALTER TABLE "Mission" ADD COLUMN     "equipment" TEXT,
    ADD COLUMN     "latitude" DOUBLE PRECISION,
    ADD COLUMN     "longitude" DOUBLE PRECISION,
    ADD COLUMN     "meetingPoint" TEXT,
    ADD COLUMN     "missionArea" TEXT,
    ADD COLUMN     "parkingInfo" TEXT;

    -- AlterTable
    ALTER TABLE "MissionAssignment" ADD COLUMN     "startedAt" TIMESTAMP(3);

    -- AlterTable
    ALTER TABLE "OperationalReport" ADD COLUMN     "areaSize" INTEGER,
    ADD COLUMN     "comment" TEXT;

    INSERT INTO public._prisma_migrations (
      id, checksum, finished_at, migration_name,
      logs, rolled_back_at, started_at, applied_steps_count
    ) VALUES (
      gen_random_uuid()::text,
      '0f60de1173bb33eb8606226b1b31ba175ab7ff5047ef7269a42e3fe92990d10a',
      now(),
      '20260903033605_uppdragsdetaljer',
      NULL,
      NULL,
      now(),
      1
    );

    RAISE NOTICE 'Migreringen 20260903033605_uppdragsdetaljer är applicerad.';
  END IF;
END
$migration$;
