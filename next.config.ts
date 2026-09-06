import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-overlayen lägger sig över den nedre menyn och stör granskning av
  // designen. Den fyller ingen funktion här.
  devIndicators: false,

  // Hindrar "next dev" från att skapa AGENTS.md och CLAUDE.md i projektroten.
  agentRules: false,

  /**
   * Tvingar med hela pg-cloudflare i spårningen.
   *
   * Paketet ger node-postgres en socket som fungerar i Cloudflare
   * Workers. Dess exports-karta har ett workerd-villkor som pekar på den
   * riktiga implementationen, och ett default som pekar på en tom fil.
   * Next spårar default-grenen och kopierar då bara den tomma filen –
   * varpå Cloudflare-bygget faller med "Could not resolve pg-cloudflare",
   * eftersom det bygger mot workerd-villkoret.
   *
   * Raden nedan påverkar inte Node-bygget: där används paketet inte alls.
   */
  outputFileTracingIncludes: {
    "**": ["./node_modules/pg-cloudflare/**"],
  },
};

export default nextConfig;
