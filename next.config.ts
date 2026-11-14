import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  transpilePackages: [
    "react-big-calendar",
    "antd",
    "@ant-design/icons",
    "@ant-design/cssinjs",
  ],
};

export default nextConfig;