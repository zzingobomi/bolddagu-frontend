import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Html } from "@react-three/drei";
import { useSegmentationStore } from "@/store/segmentationStore";
import { PointCloud } from "./PointCloud";
import { SelectedPointMarkers } from "./SelectedPointMarkers";
import { useCameraAutoFit } from "@/hooks/useCameraAutoFit";

const LIGHTING_CONFIG = {
  ambient: 0.6,
  directional: 0.8,
  directionalPosition: [10, 10, 5],
} as const;

const GRID_CONFIG = {
  size: 10,
  divisions: 20,
  colorCenterLine: "#444444",
  colorGrid: "#222222",
} as const;

const SceneContent = () => {
  const pointCloudData = useSegmentationStore((state) => state.pointCloudData);
  const isLoading = useSegmentationStore((s) => s.isLoading);

  useCameraAutoFit(pointCloudData?.positions ?? null);

  return (
    <>
      {isLoading && (
        <Html center>
          <div
            style={{
              padding: "8px 12px",
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            Loading point cloud…
          </div>
        </Html>
      )}

      {/* 조명 */}
      <ambientLight intensity={LIGHTING_CONFIG.ambient} />
      <directionalLight
        position={LIGHTING_CONFIG.directionalPosition}
        intensity={LIGHTING_CONFIG.directional}
      />

      <axesHelper args={[1]} />

      {/* 바닥 그리드 */}
      <gridHelper
        args={[
          GRID_CONFIG.size,
          GRID_CONFIG.divisions,
          GRID_CONFIG.colorCenterLine,
          GRID_CONFIG.colorGrid,
        ]}
      />

      {/* 포인트 클라우드 */}
      {pointCloudData && (
        <PointCloud
          positions={pointCloudData.positions}
          colors={pointCloudData.colors}
        />
      )}

      {/* 선택된 포인트 마커 - 별도 렌더링 */}
      {/* <SelectedPointMarkers /> */}

      {/* 카메라 컨트롤 */}
      <OrbitControls
        enableDamping={false}
        minDistance={1}
        maxDistance={50}
        makeDefault
      />
    </>
  );
};

export const Scene = React.memo(() => {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 60 }}
        gl={{ antialias: true }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
});

Scene.displayName = "Scene";
