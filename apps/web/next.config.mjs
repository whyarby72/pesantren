import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const appRoot = dirname(fileURLToPath(import.meta.url));
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: appRoot,
  turbopack: { root: appRoot },
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        { key: 'X-Content-Type-Options', value: 'nosniff' }
      ]
    }];
  }
};
export default nextConfig;
