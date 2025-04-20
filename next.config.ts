import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "images.pexels.com",
      "res.cloudinary.com",
      "thumbs.dreamstime.com",
      "cdn.myanimelist.net",
      "truyenwikidich.net"
    ],
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
    ];
  },
};

export default nextConfig;
