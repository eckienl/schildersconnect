/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
  },
  images: { unoptimized: true },
};

export default nextConfig;
