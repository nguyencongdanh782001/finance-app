import type { Configuration } from "webpack";
import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  webpack: (config: Configuration) => {
    return config;
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  cacheStartUrl: false,
  dynamicStartUrl: false,
  buildExcludes: [/.*\.js$/],
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
