import React, { useMemo, useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Bvh } from "@react-three/drei";
import * as THREE from "three";
import { useSegmentationStore } from "@/store/segmentationStore";

interface PointCloudProps {
  positions: Float32Array;
  colors: Float32Array;
  pointSize?: number;
}

export const PointCloud = React.memo<PointCloudProps>(
  ({ positions, colors, pointSize = 1 }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const { camera, gl, raycaster, size } = useThree();

    const selectionMode = useSegmentationStore((s) => s.selectionMode);
    const addSelectedPoint = useSegmentationStore((s) => s.addSelectedPoint);

    // Geometry & Material
    const { geometry, material } = useMemo(() => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const normalizedColors = new Float32Array(colors.length);
      for (let i = 0; i < colors.length; i++) {
        normalizedColors[i] = colors[i] / 255;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(normalizedColors, 3));
      geo.computeBoundingSphere();

      const mat = new THREE.PointsMaterial({
        size: pointSize,
        vertexColors: true,
        sizeAttenuation: false,
        toneMapped: false,
      });

      return { geometry: geo, material: mat };
    }, [positions, colors, pointSize]);

    // Click Handler
    useEffect(() => {
      const canvas = gl.domElement;
      let pointerDownPos = { x: 0, y: 0 };

      const handlePointerDown = (e: PointerEvent) => {
        pointerDownPos = { x: e.clientX, y: e.clientY };
      };

      // const handlePointerMove = (e: PointerEvent) => {
      //   const hoveredPoint = pickPoint(e, canvas);
      //   setHoveredPoint(hoveredPoint);
      // };

      const handlePointerUp = (e: PointerEvent) => {
        const dx = e.clientX - pointerDownPos.x;
        const dy = e.clientY - pointerDownPos.y;
        if (dx * dx + dy * dy > 9) return;

        const pickedPoint = pickPoint(e, canvas);
        if (pickedPoint !== null) {
          addSelectedPoint({
            id: `${Date.now()}-${pickedPoint.index}`,
            position: pickedPoint.position,
            type: selectionMode,
          });
        }
      };

      // TODO: 지금 문제가 검은 바탕을 클릭해도 포인트가 선택되는 현상 있음
      // 또하나 엄청 느림...
      const pickPoint = (e: PointerEvent, canvas: HTMLCanvasElement) => {
        if (!pointsRef.current) return null;

        const rect = canvas.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        // 👇 threshold를 매우 작게 설정
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
        raycaster.params.Points!.threshold = pointSize * 0.2;

        const intersects = raycaster.intersectObject(pointsRef.current, false);
        if (intersects.length === 0) return null;

        // 👇 화면 공간(2D)에서 가장 가까운 점 찾기
        const posAttr = pointsRef.current.geometry.getAttribute("position");
        const projected = new THREE.Vector3();

        let bestIndex = -1;
        let bestScreenDist = Infinity;

        for (const hit of intersects) {
          if (hit.index === undefined) continue;

          // 3D 점을 화면 좌표로 투영
          projected.fromBufferAttribute(posAttr, hit.index);
          projected.project(camera);

          // 마우스와의 화면 거리 계산
          const screenDx = projected.x - mouseX;
          const screenDy = projected.y - mouseY;
          const screenDist = screenDx * screenDx + screenDy * screenDy;

          if (screenDist < bestScreenDist) {
            bestScreenDist = screenDist;
            bestIndex = hit.index;
          }
        }

        if (bestIndex === -1) return null;

        const idx = bestIndex;
        return {
          index: idx,
          position: [
            positions[idx * 3],
            positions[idx * 3 + 1],
            positions[idx * 3 + 2],
          ] as [number, number, number],
        };
      };

      canvas.addEventListener("pointerdown", handlePointerDown);
      // canvas.addEventListener("pointermove", handlePointerMove);
      canvas.addEventListener("pointerup", handlePointerUp);

      return () => {
        canvas.removeEventListener("pointerdown", handlePointerDown);
        // canvas.removeEventListener("pointermove", handlePointerMove);
        canvas.removeEventListener("pointerup", handlePointerUp);
      };
    }, [
      camera,
      gl,
      raycaster,
      positions,
      pointSize,
      selectionMode,
      addSelectedPoint,
    ]);

    return (
      <Bvh firstHitOnly>
        <points ref={pointsRef} geometry={geometry} material={material} />
      </Bvh>
    );
  }
);

PointCloud.displayName = "PointCloud";
