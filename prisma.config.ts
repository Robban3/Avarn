import "dotenv/config";

import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 läser anslutningen härifrån i stället för ur schemat.
 * Byte till Postgres i drift = ändra provider i schema.prisma och peka
 * DATABASE_URL mot databasen; adaptern väljs i src/lib/db.ts.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
