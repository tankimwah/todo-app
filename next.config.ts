import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  transpilePackages: [
    "@fullcalendar/react",
    "antd",
    "@ant-design/icons",
    "@ant-design/cssinjs",
  ],
};

export default nextConfig;