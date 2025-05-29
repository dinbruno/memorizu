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
  async redirects() {
    return [
      // Redirect Firebase Auth handler to Firebase domain
      {
        source: "/__/auth/:path*",
        destination: "https://memorizu-7bd4c.firebaseapp.com/__/auth/:path*",
        permanent: false,
        basePath: false,
      },
      // Redirect Firebase functions
      {
        source: "/__/:path*",
        destination: "https://memorizu-7bd4c.firebaseapp.com/__/:path*",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
