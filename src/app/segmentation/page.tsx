"use client";

import React, { Suspense } from "react";
import { Row, Col, Card, Typography, Space, Spin } from "antd";
import { Scene } from "@/components/segmentation/3D/Scene";
import { ControlPanel } from "@/components/segmentation/UI/ControlPanel";
import { usePointCloudData } from "@/hooks/usePointCloudData";

const { Title, Text } = Typography;

export default function SegmentationPage() {
  usePointCloudData();

  return (
    <div className="p-6 min-h-screen">
      <Space direction="vertical" size="large" className="w-full">
        {/* 헤더 */}
        <header className="text-center mb-6">
          <Title level={1} className="mb-2">
            Robot Segmentation
          </Title>
          <Text type="secondary" className="text-base">
            로봇 링크 세그멘테이션 시각화 도구
          </Text>
        </header>

        {/* 메인 레이아웃 */}
        <Row gutter={[24, 24]} className="min-h-[calc(100vh-200px)]">
          {/* 3D Scene */}
          <Col xs={24} lg={16} className="min-h-[600px]">
            <Card
              title="3D Visualization"
              className="h-full flex flex-col"
              classNames={{
                body: "flex-1 p-0",
              }}
            >
              <Suspense
                fallback={
                  <div className="h-full flex items-center justify-center">
                    <Spin size="large" tip="Loading 3D Scene..." />
                  </div>
                }
              >
                <Scene />
              </Suspense>
            </Card>
          </Col>

          {/* 컨트롤 패널 */}
          <Col xs={24} lg={8} className="min-h-[600px]">
            <ControlPanel />
          </Col>
        </Row>
      </Space>
    </div>
  );
}
