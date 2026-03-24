const pkg = require("./package.json")

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_BUILD_DATE: new Date().toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "America/Santiago",
    }),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
};

module.exports = nextConfig;
