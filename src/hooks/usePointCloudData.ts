import { useEffect } from "react";
import { useSegmentationStore } from "@/store/segmentationStore";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { PointCloudData } from "@/store/segmentationStore";

interface PointCloudResponse {
  points: number[][];
  colors: number[][];
}

export const fetchPointCloudFromAPI = async (): Promise<PointCloudData> => {
  const response = await apiClient.get<PointCloudResponse>(
    API_ENDPOINTS.POINT_CLOUD
  );
  const { points, colors } = response.data;

  const positions = new Float32Array(points.flat());
  const colors32 = new Float32Array(colors.flat());

  console.log(`Loaded ${positions.length / 3} points`);
  return { positions, colors: colors32 };
};

export const usePointCloudData = () => {
  const setPointCloudData = useSegmentationStore(
    (state) => state.setPointCloudData
  );
  const setIsLoading = useSegmentationStore((state) => state.setIsLoading);

  useEffect(() => {
    const loadPointCloud = async () => {
      setIsLoading(true);

      try {
        const data = await fetchPointCloudFromAPI();
        setPointCloudData(data);
      } catch (error) {
        console.error("Failed to load point cloud:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPointCloud();
  }, [setPointCloudData, setIsLoading]);
};
