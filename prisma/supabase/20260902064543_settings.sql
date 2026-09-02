--
-- Migrering: 20260902064543_settings
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
    WHERE migration_name = '20260902064543_settings'
  ) THEN
    RAISE NOTICE 'Migreringen 20260902064543_settings är redan applicerad – hoppar över.';
  ELSE

    -- CreateTable
    CREATE TABLE "Setting" (
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "updatedById" TEXT,

        CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
    );

    -- AddForeignKey
    ALTER TABLE "Setting" ADD CONSTRAINT "Setting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

    INSERT INTO public._prisma_migrations (
      id, checksum, finished_at, migration_name,
      logs, rolled_back_at, started_at, applied_steps_count
    ) VALUES (
      gen_random_uuid()::text,
      '5f24f7491ade4c94c0ffaa58a4fa92900e31cc4321a8eb8ec49f7eb961c21039',
      now(),
      '20260902064543_settings',
      NULL,
      NULL,
      now(),
      1
    );

    RAISE NOTICE 'Migreringen 20260902064543_settings är applicerad.';
  END IF;
END
$migration$;
