import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/glow-api/:path*",
        destination: "http://localhost:9093/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
