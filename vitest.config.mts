import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src"),
      // server-only kastar så fort den laddas utanför en servermiljö.
      // Markeringen finns för att fånga en modul som råkat hamna i
      // klientbunten, och i ett enhetsprov finns ingen sådan bunt att
      // hamna i. Next väljer själv paketets tomma variant under villkoret
      // react-server; här pekas den ut uttryckligen.
      "server-only": path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "node_modules/server-only/empty.js",
      ),
    },
  },
});
