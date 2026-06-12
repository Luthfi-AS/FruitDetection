import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // Tambahkan baris ini untuk mematikan double-mount React 19
  output: "standalone", // Hasilkan build mandiri yang ramping untuk Docker
};

export default nextConfig;
