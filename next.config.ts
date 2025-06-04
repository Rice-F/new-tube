import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许从 https://image.mux.com/... 加载图片
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.mux.com'
      }
    ]
  } 
};

export default nextConfig;
