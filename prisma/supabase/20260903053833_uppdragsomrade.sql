--
-- Migrering: 20260903053833_uppdragsomrade
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
    WHERE migration_name = '20260903053833_uppdragsomrade'
  ) THEN
    RAISE NOTICE 'Migreringen 20260903053833_uppdragsomrade är redan applicerad – hoppar över.';
  ELSE

    -- AlterTable
    ALTER TABLE "Mission" ADD COLUMN     "areaPolygon" TEXT,
    ADD COLUMN     "areaSizeSqm" INTEGER,
    ADD COLUMN     "meetingLat" DOUBLE PRECISION,
    ADD COLUMN     "meetingLng" DOUBLE PRECISION,
    ADD COLUMN     "parkingLat" DOUBLE PRECISION,
    ADD COLUMN     "parkingLng" DOUBLE PRECISION;

    INSERT INTO public._prisma_migrations (
      id, checksum, finished_at, migration_name,
      logs, rolled_back_at, started_at, applied_steps_count
    ) VALUES (
      gen_random_uuid()::text,
      '066e6693b0405f4b2b4d8e49c52e4f9c2f54a36195a973ad2e9c60d9875d0a24',
      now(),
      '20260903053833_uppdragsomrade',
      NULL,
      NULL,
      now(),
      1
    );

    RAISE NOTICE 'Migreringen 20260903053833_uppdragsomrade är applicerad.';
  END IF;
END
$migration$;
