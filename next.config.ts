import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignores TypeScript errors during Vercel build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignores ESLint errors during Vercel build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;