import type { NextConfig } from 'next';

const SEARCH_PAGE = '/dashboard/searches';

const config: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/demo', destination: '/try', permanent: false },
      { source: '/demo/:path*', destination: '/try', permanent: false },
      { source: '/results', destination: '/try', permanent: false },
      // Legacy dashboard URLs → canonical search workspace (query string preserved)
      { source: '/dashboard/runs/:id', destination: `${SEARCH_PAGE}?run=:id`, permanent: false },
      { source: '/dashboard/searches/:id/edit', destination: '/dashboard/settings/search', permanent: false },
      { source: '/dashboard/searches/new', destination: SEARCH_PAGE, permanent: false },
      { source: '/dashboard/searches/:id', destination: SEARCH_PAGE, permanent: false },
      { source: '/dashboard/profiles/:id', destination: SEARCH_PAGE, permanent: false },
      { source: '/dashboard', destination: SEARCH_PAGE, permanent: false },
      { source: '/onboarding', destination: SEARCH_PAGE, permanent: false },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2.5mb',
    },
  },
};

export default config;
