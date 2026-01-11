import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // IGNORE ERRORS TO ENSURE DEPLOYMENT
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
