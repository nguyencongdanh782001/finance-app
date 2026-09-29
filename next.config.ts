import withPWA from "next-pwa";
import defaultRuntimeCaching from "next-pwa/cache";

const runtimeCaching = [
  {
    urlPattern: /\/api\/recommendations(?:\/|$)/i,
    handler: "NetworkOnly" as const,
    method: "GET" as const,
  },
  ...defaultRuntimeCaching,
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  cacheStartUrl: false,
  dynamicStartUrl: false,
  runtimeCaching,
  customWorkerDir: "worker",
  buildExcludes: [/.*\.js$/],
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
