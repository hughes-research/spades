import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // External packages for server-side rendering
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
