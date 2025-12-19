import React from "react";
import {
  Card,
  Radio,
  Button,
  Space,
  Typography,
  Divider,
  Tag,
  message,
} from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  ClearOutlined,
  SendOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSegmentationStore, PointType } from "@/store/segmentationStore";
import { apiClient, API_ENDPOINTS } from "@/lib/api";

const { Text, Title } = Typography;

export const ControlPanel = React.memo(() => {
  const {
    selectionMode,
    setSelectionMode,
    selectedPoints,
    clearSelectedPoints,
    isLoading,
    setIsLoading,
    setSegmentationMask,
    reset,
  } = useSegmentationStore();

  const positiveCount = selectedPoints.filter(
    (p) => p.type === "positive"
  ).length;
  const negativeCount = selectedPoints.filter(
    (p) => p.type === "negative"
  ).length;

  const handleSegment = async () => {
    if (selectedPoints.length === 0) {
      message.warning("Please select at least one point");
      return;
    }

    setIsLoading(true);

    try {
      const positivePoints = selectedPoints
        .filter((p) => p.type === "positive")
        .map((p) => p.position);

      const negativePoints = selectedPoints
        .filter((p) => p.type === "negative")
        .map((p) => p.position);

      const response = await apiClient.post(API_ENDPOINTS.SEGMENT, {
        positive_points: positivePoints,
        negative_points: negativePoints,
      });

      setSegmentationMask(response.data.mask);
      message.success("Segmentation completed successfully!");
    } catch (error) {
      console.error("Segmentation failed:", error);
      message.error("Segmentation failed. Please check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Segmentation Controls" className="h-full">
      <Space direction="vertical" size="large" className="w-full">
        {/* 선택 모드 */}
        <div>
          <Title level={5}>Selection Mode</Title>
          <Radio.Group
            value={selectionMode}
            onChange={(e) => setSelectionMode(e.target.value as PointType)}
            className="w-full"
          >
            <Radio.Button
              value="positive"
              className="flex-1 text-center"
              style={{ width: "50%" }}
            >
              <Space>
                <PlusOutlined style={{ color: "#52c41a" }} />
                Positive
              </Space>
            </Radio.Button>
            <Radio.Button
              value="negative"
              className="flex-1 text-center"
              style={{ width: "50%" }}
            >
              <Space>
                <MinusOutlined style={{ color: "#ff4d4f" }} />
                Negative
              </Space>
            </Radio.Button>
          </Radio.Group>
        </div>

        <Divider className="my-2" />

        {/* 선택된 포인트 통계 */}
        <div>
          <Title level={5}>Selected Points</Title>
          <Space direction="vertical" className="w-full">
            <div className="flex justify-between items-center">
              <Text>Positive:</Text>
              <Tag color="success">{positiveCount}</Tag>
            </div>
            <div className="flex justify-between items-center">
              <Text>Negative:</Text>
              <Tag color="error">{negativeCount}</Tag>
            </div>
            <div className="flex justify-between items-center">
              <Text strong>Total:</Text>
              <Tag color="blue">{selectedPoints.length}</Tag>
            </div>
          </Space>
        </div>

        <Divider className="my-2" />

        {/* 액션 버튼 */}
        <Space direction="vertical" className="w-full">
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSegment}
            disabled={selectedPoints.length === 0 || isLoading}
            loading={isLoading}
            block
            size="large"
          >
            Run Segmentation
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={clearSelectedPoints}
            disabled={selectedPoints.length === 0}
            block
          >
            Clear All Points
          </Button>
          <Button icon={<DeleteOutlined />} onClick={reset} block>
            Reset
          </Button>
        </Space>

        <Divider className="my-2" />

        {/* 사용 방법 */}
        <div>
          <Title level={5}>Instructions</Title>
          <Text type="secondary" className="text-sm">
            1. 모드를 선택하세요 (Positive/Negative)
            <br />
            2. 3D 뷰에서 포인트를 클릭하세요
            <br />
            3. 충분한 포인트를 선택한 후 세그멘테이션을 실행하세요
          </Text>
        </div>
      </Space>
    </Card>
  );
});

ControlPanel.displayName = "ControlPanel";
