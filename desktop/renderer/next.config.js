/** @type {import('next').NextConfig} */
module.exports = {
  distDir: process.env.NODE_ENV === 'production' ? '../app':'.next',
  trailingSlash: true,
  images: {
    unoptimized: true, // Disable image optimization for static export
  },
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  webpack: (config) => {
    return config;
  },
};
