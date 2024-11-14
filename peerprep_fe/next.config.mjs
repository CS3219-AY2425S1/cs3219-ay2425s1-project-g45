/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // **Warning:** This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, _) => ({
    ...config,
    watchOptions: {
      ...config.watchOptions,
      poll: 800,
      aggregateTimeout: 300,
    },
  }),
  output: "standalone",
};

export default nextConfig;
