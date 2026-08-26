import withPWA from "next-pwa";

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
  buildExcludes: [/.*\.js$/],
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
