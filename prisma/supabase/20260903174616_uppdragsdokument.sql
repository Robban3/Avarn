--
-- Migrering: 20260903174616_uppdragsdokument
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
    WHERE migration_name = '20260903174616_uppdragsdokument'
  ) THEN
    RAISE NOTICE 'Migreringen 20260903174616_uppdragsdokument är redan applicerad – hoppar över.';
  ELSE

    -- AlterTable
    ALTER TABLE "MediaAsset" ADD COLUMN     "missionId" TEXT,
    ADD COLUMN     "missionSource" TEXT;

    -- CreateIndex
    CREATE INDEX "MediaAsset_missionId_idx" ON "MediaAsset"("missionId");

    -- AddForeignKey
    ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    INSERT INTO public._prisma_migrations (
      id, checksum, finished_at, migration_name,
      logs, rolled_back_at, started_at, applied_steps_count
    ) VALUES (
      gen_random_uuid()::text,
      'd11c877c7f844d119a12863500a7334caeba78202f3507982e3012962a948f62',
      now(),
      '20260903174616_uppdragsdokument',
      NULL,
      NULL,
      now(),
      1
    );

    RAISE NOTICE 'Migreringen 20260903174616_uppdragsdokument är applicerad.';
  END IF;
END
$migration$;
