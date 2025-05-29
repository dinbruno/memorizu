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
  async redirects() {
    return [
      // Redirect Firebase Auth handler to Firebase domain
      {
        source: "/__/auth/:path*",
        destination: "https://memorizu.com/__/auth/:path*",
        permanent: false,
        basePath: false,
      },
      // Redirect Firebase functions
      {
        source: "/__/:path*",
        destination: "https://memorizu.com/__/:path*",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
