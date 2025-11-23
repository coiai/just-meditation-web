// next.config.ts
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production", // ★ devでは無効化
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // turbopackを明示したいなら（なくてもOK）
  turbopack: {},
};

export default withSerwist(nextConfig);