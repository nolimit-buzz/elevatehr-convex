/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: ["localhost", "127.0.0.1", "app.elevatehr.ai", "api-convexy.codesordinatestudio.net.ng"],
  },
};

module.exports = nextConfig;
