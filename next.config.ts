import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-overlayen lägger sig över den nedre menyn och stör granskning av
  // designen. Den fyller ingen funktion här.
  devIndicators: false,

  // Hindrar "next dev" från att skapa AGENTS.md och CLAUDE.md i projektroten.
  agentRules: false,
};

export default nextConfig;
