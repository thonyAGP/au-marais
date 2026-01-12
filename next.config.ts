import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a0.muscache.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
    qualities: [75, 80, 85, 90],
  },
  async redirects() {
    return [
      // Redirect old /disponibilites to new /reserver for all locales
      {
        source: '/:locale(fr|en|es|de|pt|zh)/disponibilites',
        destination: '/:locale/reserver',
        permanent: true,
      },
      {
        source: '/disponibilites',
        destination: '/fr/reserver',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
