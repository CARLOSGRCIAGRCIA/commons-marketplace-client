import type { NextConfig } from "next";

// Server-side rewrites run inside the container: they must reach the API
// over the docker network, not via a browser-facing URL. Configure with
// INTERNAL_API_ORIGIN (Dockerfile defaults it to http://backend:5000);
// NEXT_PUBLIC_API_URL stays browser-facing and is unrelated.
const internalApiOrigin =
  process.env.INTERNAL_API_ORIGIN ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${internalApiOrigin}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;