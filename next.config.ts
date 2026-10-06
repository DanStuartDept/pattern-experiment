import type { NextConfig } from "next";

// GitHub Pages serves project sites from /<repo>, so CI passes the repo name in.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  // The Figma shader runtime imports its own files as "./x.js" (TypeScript ESM style).
  // Turbopack can't map those to .ts/.tsx, so dev and build run on webpack with an alias.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
