import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-overlayen lägger sig över den nedre menyn och stör granskning av
  // designen. Den fyller ingen funktion här.
  devIndicators: false,

  // Hindrar "next dev" från att skapa AGENTS.md och CLAUDE.md i projektroten.
  agentRules: false,

  /**
   * Håll Prisma-klienten utanför Next-bygget.
   *
   * Prismas frågekompilator är WebAssembly. Workers tillåter wasm bara som
   * importerad modul, och den genererade klienten har en workerd-gren som
   * gör precis det. Men bundlar Next in klienten processas wasm-importen
   * som en egen chunk, och det Prisma får tillbaka är inte en
   * WebAssembly-modul – felet blir "The loaded wasm module was unexpectedly
   * undefined or null once loaded".
   *
   * Som extern lämnas klienten orörd av Turbopack, och wrangler laddar
   * wasm-filen på det sätt Workers kräver. Node-bygget påverkas inte: där
   * väljer paketets exports-karta Node-grenen som förut.
   */
  serverExternalPackages: ["avarn-prisma"],

  /**
   * Filer som måste följa med i spårningen fast Next inte ser dem.
   *
   * `pg-cloudflare` ger node-postgres en socket som fungerar i Workers. Dess
   * exports-karta pekar på den riktiga implementationen under villkoret
   * workerd och på en tom fil under default. Next spårar default-grenen och
   * kopierar bara den tomma filen, varpå Cloudflare-bygget faller med
   * "Could not resolve pg-cloudflare".
   *
   * Wasm-filen är samma sorts problem: den importeras bara i den gren Next
   * inte spårar, så utan raden finns den inte att importera i bunten.
   *
   * Ingetdera påverkar Node-bygget – där används varken paketet eller filen.
   */
  outputFileTracingIncludes: {
    "**": [
      "./node_modules/pg-cloudflare/**",
      "./node_modules/avarn-prisma/**",
    ],
  },
};

export default nextConfig;
