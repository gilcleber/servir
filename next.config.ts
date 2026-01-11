import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standard Next.js output (defaults to .next)
  // We remove 'distDir' because Vercel Next.js preset expects .next

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
