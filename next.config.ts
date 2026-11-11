import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone untuk deployment yang efisien di Railway
  output: "standalone",

  // Hanya untuk development (turbopack), aman di-keep
  devIndicators: false,

  // Konfigurasi gambar jika menggunakan Next Image
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
