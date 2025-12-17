import React from "react";
import { Canvas } from "@react-three/fiber";

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

export const Scene = React.memo(() => {
  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        {/* 조명 */}
        <ambientLight intensity={LIGHTING_CONFIG.ambient} />
        <directionalLight
          position={LIGHTING_CONFIG.directionalPosition}
          intensity={LIGHTING_CONFIG.directional}
        />

        {/* 바닥 그리드 */}
        <gridHelper
          args={[
            GRID_CONFIG.size,
            GRID_CONFIG.divisions,
            GRID_CONFIG.colorCenterLine,
            GRID_CONFIG.colorGrid,
          ]}
        />
      </Canvas>
    </div>
  );
});
