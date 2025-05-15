/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  // Add webpack configuration to handle any potential build issues
  webpack: (config, { isServer }) => {
    // Add any necessary webpack configurations here
    return config;
  },
}

module.exports = nextConfig 