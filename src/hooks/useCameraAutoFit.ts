import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { fitCameraToPoints } from "@/utils/cameraUtils";

export function useCameraAutoFit(positions: Float32Array | null) {
  const { camera, controls } = useThree();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (!positions || hasFitted.current || !controls) return;

    const result = fitCameraToPoints(positions, camera, controls);

    hasFitted.current = true;

    console.log("Camera auto-fitted:", result);
  }, [positions, camera, controls]);
}
