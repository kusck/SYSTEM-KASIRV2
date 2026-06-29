import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: ['lucide-react'],
  webpack: (config, { defaultLoaders, isServer }) => {
    if (!isServer) {
      config.module.rules.push({
        test: /\.[cm]?js$/,
        include: [
          path.dirname(require.resolve('lucide-react/package.json')),
          path.dirname(require.resolve('next/package.json')),
        ],
        use: defaultLoaders.babel,
      });
    }

    return config;
  },
};

export default nextConfig;
