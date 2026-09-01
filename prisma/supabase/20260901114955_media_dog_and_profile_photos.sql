--
-- Migrering: 20260901114955_media_dog_and_profile_photos
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
    WHERE migration_name = '20260901114955_media_dog_and_profile_photos'
  ) THEN
    RAISE NOTICE 'Migreringen 20260901114955_media_dog_and_profile_photos är redan applicerad – hoppar över.';
  ELSE

    -- AlterTable
    ALTER TABLE "MediaAsset" ADD COLUMN     "dogId" TEXT,
    ADD COLUMN     "profileUserId" TEXT;

    -- CreateIndex
    CREATE INDEX "MediaAsset_dogId_idx" ON "MediaAsset"("dogId");

    -- AddForeignKey
    ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_profileUserId_fkey" FOREIGN KEY ("profileUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    INSERT INTO public._prisma_migrations (
      id, checksum, finished_at, migration_name,
      logs, rolled_back_at, started_at, applied_steps_count
    ) VALUES (
      gen_random_uuid()::text,
      '46e8787317de3b806f47ed777efef5ecb3002350aaaeeca5455f5bf036fa9468',
      now(),
      '20260901114955_media_dog_and_profile_photos',
      NULL,
      NULL,
      now(),
      1
    );

    RAISE NOTICE 'Migreringen 20260901114955_media_dog_and_profile_photos är applicerad.';
  END IF;
END
$migration$;
