--
-- Migrering: 20260907042525_push_prenumerationer
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
    WHERE migration_name = '20260907042525_push_prenumerationer'
  ) THEN
    RAISE NOTICE 'Migreringen 20260907042525_push_prenumerationer är redan applicerad – hoppar över.';
  ELSE

    -- CreateTable
    CREATE TABLE "PushSubscription" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "endpoint" TEXT NOT NULL,
        "p256dh" TEXT NOT NULL,
        "auth" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
    );

    -- CreateIndex
    CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

    -- CreateIndex
    CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

    -- AddForeignKey
    ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- Radskydd utan policy: bara ägarrollen kommer åt tabellen.
    ALTER TABLE public."PushSubscription" ENABLE ROW LEVEL SECURITY;

    INSERT INTO public._prisma_migrations (
      id, checksum, finished_at, migration_name,
      logs, rolled_back_at, started_at, applied_steps_count
    ) VALUES (
      gen_random_uuid()::text,
      '0353b16358b48201e9ea606c9cb8f5ba32dc08745fa74ce613df1e97b82e8d57',
      now(),
      '20260907042525_push_prenumerationer',
      NULL,
      NULL,
      now(),
      1
    );

    RAISE NOTICE 'Migreringen 20260907042525_push_prenumerationer är applicerad.';
  END IF;
END
$migration$;
