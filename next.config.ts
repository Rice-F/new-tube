import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 允许从 https://image.mux.com/... 加载图片
      // {
      //   protocol: 'https',
      //   hostname: 'image.mux.com'
      // },
      {
        protocol: 'https',
        hostname: 'qu1txwvvyi.ufs.sh'
      }
    ]
  } 
};

export default nextConfig;
