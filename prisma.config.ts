import "dotenv/config";

import { defineConfig } from "prisma/config";

/**
 * Prisma 7 läser anslutningen härifrån i stället för ur schemat.
 * Byte till Postgres i drift = ändra provider i schema.prisma och peka
 * DATABASE_URL mot databasen; adaptern väljs i src/lib/db.ts.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Läses direkt ur miljön i stället för via hjälparen env() från
    // prisma/config, som inte finns i alla versioner av CLI:t. Fallbacken
    // gör att migreringen fungerar även innan .env har skapats.
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
