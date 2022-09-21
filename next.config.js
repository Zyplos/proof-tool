/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/proof",
        destination: "/",
        permanent: true,
      },
      {
        source: "/library",
        destination: "/",
        permanent: true,
      },
      {
        source: "/proof/solve",
        destination: "/",
        permanent: true,
      },
    ];
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

module.exports = nextConfig;
