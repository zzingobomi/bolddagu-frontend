import React from "react";
import { useSegmentationStore } from "@/store/segmentationStore";

const MARKER_RADIUS = 0.01;

export const SelectedPointMarkers = React.memo(() => {
  const selectedPoints = useSegmentationStore((s) => s.selectedPoints);

  if (selectedPoints.length === 0) return null;

  return (
    <>
      {selectedPoints.map((p) => (
        <mesh key={p.id} position={p.position} raycast={() => null}>
          <sphereGeometry args={[MARKER_RADIUS, 16, 16]} />{" "}
          <meshBasicMaterial
            color={p.type === "positive" ? "#00ff00" : "#ff0000"}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
});

SelectedPointMarkers.displayName = "SelectedPointMarkers";
