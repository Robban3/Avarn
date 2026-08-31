import "dotenv/config";

import { defineConfig } from "prisma/config";

/**
 * Prisma 7 läser anslutningen härifrån i stället för ur schemat.
 * Appen ansluter via adaptern i src/lib/db.ts; det här gäller bara CLI:t,
 * alltså migreringar och prisma studio.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Migreringar måste gå via en direktanslutning. Supabase poolare
    // (port 6543) klarar inte DDL, så DIRECT_URL används när den finns.
    // Läses direkt ur miljön i stället för via hjälparen env() från
    // prisma/config, som inte finns i alla versioner av CLI:t.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
