"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Typography, Row, Col, Button } from "antd";
import { BulbOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const HomePage = () => {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [loadingTool, setLoadingTool] = useState<string | null>(null);

  const tools = [
    {
      id: "segmentation",
      title: "robot segmentation",
      description: "로봇 링크 세그멘테이션 시각화",
      icon: <BulbOutlined className="text-2xl" />,
      color: "bg-blue-500",
    },
  ];

  const handleNavigate = (toolId: string) => {
    setLoadingTool(toolId);
    router.push(`/${toolId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <Title level={1} className="!mb-3 !text-4xl font-bold">
            Bolddagu
          </Title>
          <Text className="text-gray-500 text-lg">3D simulation</Text>
        </div>

        <Row gutter={[32, 32]} justify="center">
          {tools.map((tool) => {
            const isHovered = hovered === tool.id;
            const isLoading = loadingTool === tool.id;
            return (
              <Col xs={24} sm={12} md={8} key={tool.id}>
                <Card
                  hoverable
                  variant="borderless"
                  className={`backdrop-blur-lg bg-white/80 rounded-2xl transition-all duration-300 px-6 py-7 ${
                    isHovered ? "scale-105 shadow-2xl" : "shadow-md"
                  }`}
                  onClick={() => handleNavigate(tool.id)}
                  onMouseEnter={() => setHovered(tool.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    className={`w-14 h-14 mb-5 mx-auto rounded-full flex items-center justify-center text-white ${tool.color} shadow-md`}
                  >
                    {tool.icon}
                  </div>

                  <Title level={4} className="text-center font-semibold !mb-3">
                    {tool.title}
                  </Title>

                  <Text className="block text-center text-gray-500 mb-8">
                    {tool.description}
                  </Text>

                  <div className="text-center">
                    <Button
                      type="primary"
                      ghost
                      icon={<ArrowRightOutlined />}
                      className="rounded-full px-5"
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      {isLoading ? "로딩중..." : "시작하기"}
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};

export default HomePage;
