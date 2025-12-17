"use client";

import { ConfigProvider, theme } from "antd";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#1890ff",
          colorBgContainer: "#1f1f1f",
          colorBgElevated: "#262626",
          colorBorder: "#434343",
          colorText: "#ffffff",
          colorTextSecondary: "#bfbfbf",
        },
        components: {
          Card: {
            colorBgContainer: "#1f1f1f",
            colorBorderSecondary: "#434343",
          },
          InputNumber: {
            colorBgContainer: "#262626",
            colorBorder: "#434343",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
