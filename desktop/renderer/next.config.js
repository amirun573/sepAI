const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: process.env.NODE_ENV === "production" ? "../app" : ".next",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // ✅ Add rule for processing .tsx, .ts, .js, .jsx files
    config.module.rules.push({
      test: /\.(tsx|ts|js|jsx)$/,
      include: [path.resolve(__dirname, "../../frontend/src")], // ✅ Allow frontend/src
      use: {
        loader: "babel-loader",
        options: {
          presets: ["next/babel"], // ✅ Use Next.js Babel settings
        },
      },
    });

    // ✅ Fix alias configuration (merge into one)
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),  // ✅ Should match `tsconfig.json`
      "@frontend": path.resolve(__dirname, "../../frontend/src")  // ✅ Ensure frontend alias works
    };

    return config;
  },
};

module.exports = nextConfig;
