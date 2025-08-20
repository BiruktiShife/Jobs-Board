import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "silver-accepted-barracuda-955.mypinata.cloud",
      "gateway.pinata.cloud",
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "platform-lookaside.fbsbx.com",
    ],
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Completely exclude Prisma from client-side bundle
      config.externals = config.externals || [];
      config.externals.push("@prisma/client");
      config.externals.push("prisma");
      config.externals.push("@/lib/prisma-server");

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        util: false,
        child_process: false,
        worker_threads: false,
      };
    }
    return config;
  },
};

export default nextConfig;
