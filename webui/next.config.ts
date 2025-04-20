import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* ↓ runtime ‑‑ lean binary & fast cold‑starts */
  output: 'standalone',

  images: {
    formats: ['image/avif', 'image/webp'], // ~20‑30 % smaller
  },

  swcMinify: true, // default, keep it explicitl
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
