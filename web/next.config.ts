import type { NextConfig } from 'next';

const config: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2.5mb',
    },
  },
};

export default config;
