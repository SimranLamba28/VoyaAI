/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  allowedDevOrigins: process.env.DEV_ALLOWED_ORIGINS
    ? process.env.DEV_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : [],
};

export default nextConfig;
