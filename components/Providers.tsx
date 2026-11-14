"use client";

import "@ant-design/v5-patch-for-react-19";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";
import type { ReactNode } from "react";

const theme = {
  token: {
    colorPrimary: "#0D9488",
    colorInfo: "#0D9488",
    colorWarning: "#EA580C",
    colorError: "#DC2626",
    colorSuccess: "#0F766E",
    colorLink: "#0D9488",
    borderRadius: 8,
    fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
  },
  components: {
    Button: {
      controlHeight: 40,
    },
    Input: {
      controlHeight: 40,
    },
    Select: {
      controlHeight: 40,
    },
  },
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={theme}>
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}