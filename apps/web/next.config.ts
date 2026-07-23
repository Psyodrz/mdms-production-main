import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@mdms/types', '@mdms/design-tokens'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/projects',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/projects/:path*',
        destination: '/portfolio/:path*',
        permanent: true,
      },
      {
        source: '/casting-calls',
        destination: '/casting',
        permanent: true,
      },
      {
        source: '/casting-calls/:path*',
        destination: '/casting',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const rawPublic = process.env.NEXT_PUBLIC_API_URL || '';
    const publicApiUrl = rawPublic.includes('vercel.app') || rawPublic.includes('localhost:3000') || rawPublic.includes('mpproductions')
      ? ''
      : rawPublic.replace(/\/api\/v1\/?$/, '');
    const apiBase = process.env.API_URL || publicApiUrl || 'https://mp-backend-api.onrender.com';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBase}/api/v1/:path*`,
      },
      // Secret admin base paths — the browser shows /studio-8f2k while the
      // real /super-admin and /admin panels are served internally. The more
      // specific /mgmt (Admin) rules MUST precede the generic Super Admin ones.
      {
        source: '/studio-8f2k/mgmt',
        destination: '/admin',
      },
      {
        source: '/studio-8f2k/mgmt/:path*',
        destination: '/admin/:path*',
      },
      {
        source: '/studio-8f2k',
        destination: '/super-admin',
      },
      {
        source: '/studio-8f2k/:path*',
        destination: '/super-admin/:path*',
      },
    ];
  },
};

export default nextConfig;
