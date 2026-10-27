import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 서버 없이 Cloudflare Pages 에 올릴 수 있도록 정적 파일(out/)로 내보낸다.
  output: "export",
  trailingSlash: true,
  // 정적 내보내기에는 이미지 최적화 서버가 없다. 이미지는 미리 webp 로 만들어 public/ 에 둔다.
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
