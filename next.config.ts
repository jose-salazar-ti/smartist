import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.100.15",
    "192.168.72.1",
    "192.168.141.1",
    "192.168.50.1",
    "192.168.20.1",
    "172.22.16.1",
    "26.193.158.187",
    "localhost:3000",
    "192.168.100.15:3000",
    "192.168.72.1:3000",
    "26.193.158.187:3000"
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wpmnsyqabcdxkpfydamn.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
