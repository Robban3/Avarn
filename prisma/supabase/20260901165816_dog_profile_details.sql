--
-- Migrering: 20260901165816_dog_profile_details
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
    WHERE migration_name = '20260901165816_dog_profile_details'
  ) THEN
    RAISE NOTICE 'Migreringen 20260901165816_dog_profile_details är redan applicerad – hoppar över.';
  ELSE

    -- AlterTable
    ALTER TABLE "Dog" ADD COLUMN     "color" TEXT,
    ADD COLUMN     "heightCm" INTEGER,
    ADD COLUMN     "hipsElbows" TEXT,
    ADD COLUMN     "insuranceValidTo" TIMESTAMP(3),
    ADD COLUMN     "insurer" TEXT,
    ADD COLUMN     "mentalIndex" TEXT,
    ADD COLUMN     "neutered" BOOLEAN,
    ADD COLUMN     "originCountry" TEXT,
    ADD COLUMN     "registrationNumber" TEXT,
    ADD COLUMN     "weightKg" DOUBLE PRECISION;

    INSERT INTO public._prisma_migrations (
      id, checksum, finished_at, migration_name,
      logs, rolled_back_at, started_at, applied_steps_count
    ) VALUES (
      gen_random_uuid()::text,
      '7a3e00b28b340daabfe9ce8d318466bfd08fbb6db1fd6513568939d204259f1f',
      now(),
      '20260901165816_dog_profile_details',
      NULL,
      NULL,
      now(),
      1
    );

    RAISE NOTICE 'Migreringen 20260901165816_dog_profile_details är applicerad.';
  END IF;
END
$migration$;
