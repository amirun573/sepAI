/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",  // Any request to /api/ will be proxied
        destination: "http://127.0.0.1:8000/api/v1/:path*",  // Django backend
      },
    ];
  },
};

module.exports = nextConfig;
