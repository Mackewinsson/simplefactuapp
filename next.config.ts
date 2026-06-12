import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smaller Docker images and correct `node server.js` layout for `Dockerfile`
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    // Production: one canonical host so Google does not see duplicate www + apex URLs.
    if (process.env.VERCEL_ENV !== "production") return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.simplefactu.com" }],
        destination: "https://simplefactu.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
