/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip type checking during production build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during production build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
