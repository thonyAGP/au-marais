import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a0.muscache.com',
      },
    ],
    qualities: [75, 80, 85, 90],
  },
};

export default nextConfig;
