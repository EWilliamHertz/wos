import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Shell web preview origin (hostname only: no scheme, no port).
  allowedDevOrigins: ['3000-cs-553118797525-default.cs-europe-west4-pear.cloudshell.dev'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  // Tailwind CSS v4 loader for Turbopack (without this, no styles are generated).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '**.wosworldofstickers.de',
      },
      {
        protocol: 'https',
        hostname: '**.jouwweb.nl',
      },
      {
        protocol: 'https',
        hostname: '**.jwwb.nl',
      },
      {
        protocol: 'https',
        hostname: '**.webador.de',
      },
    ],
  },
};

export default nextConfig;
