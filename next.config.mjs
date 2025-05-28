/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      // Handle custom slugs by rewriting /p/slug to /p/slug/undefined
      // This allows us to detect custom slugs in the existing route structure
      {
        source: "/p/:slug([^/]+)$",
        destination: "/p/:slug/undefined",
      },
    ];
  },
};

export default nextConfig;
