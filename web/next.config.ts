import type { NextConfig } from 'next';

const config: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  async redirects() {
    return [
      {
        source: '/demo',
        destination: '/sign-up',
        permanent: false,
      },
      {
        source: '/demo/:path*',
        destination: '/sign-up',
        permanent: false,
      },
      {
        source: '/results',
        destination: '/sign-up',
        permanent: false,
      },
      {
        source: '/dashboard/searches',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/dashboard/searches/new',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2.5mb',
    },
  },
};

export default config;
