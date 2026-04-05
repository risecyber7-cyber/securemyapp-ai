/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["framer-motion", "@tanstack/react-query"],
  },
};

export default nextConfig;
