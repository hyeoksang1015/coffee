import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 서버 없이 Cloudflare Pages 에 올릴 수 있도록 정적 파일(out/)로 내보낸다.
  output: "export",
  trailingSlash: true,
  // 정적 내보내기에는 이미지 최적화 서버가 없다. 이미지는 미리 webp 로 만들어 public/ 에 둔다.
  images: { loader: "custom", loaderFile: "./src/lib/image-loader.ts" },
  // Webmate 사이트 안(/demo/lowwave)에 올릴 때만 하위 경로를 붙인다. npm run export:webmate 참고.
  basePath: process.env.BASE_PATH ?? "",
  env: { BASE_PATH: process.env.BASE_PATH ?? "" },
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
