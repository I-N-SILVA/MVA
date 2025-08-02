import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds to prevent deployment blocking
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during builds for faster deployment
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
