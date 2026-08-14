/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig; 
// Note: if your file is named next.config.mjs, use `export default nextConfig;` at the bottom instead.
