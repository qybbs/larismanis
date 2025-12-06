import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.1.23:3000", "localhost:3000"],
    },
  },
};

export default nextConfig;
