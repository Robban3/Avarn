import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-overlayen lägger sig över den nedre menyn och stör granskning av
  // designen. Den fyller ingen funktion här.
  devIndicators: false,
};

export default nextConfig;
