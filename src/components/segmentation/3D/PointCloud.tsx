import React, { useMemo, useRef, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { INTERSECTED, NOT_INTERSECTED } from "three-mesh-bvh";
import * as THREE from "three";
import initBVH from "@/utils/initBVH";
import { useSegmentationStore } from "@/store/segmentationStore";

initBVH();

interface PointCloudProps {
  positions: Float32Array;
  colors: Float32Array;
  pointSize?: number;
}

enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2,
}

export function PointCloud({
  positions,
  colors,
  pointSize = 0.001,
}: PointCloudProps) {
  const { camera, gl, raycaster } = useThree();

  const pointsRef = useRef<THREE.Points>(null);

  const selectionMode = useSegmentationStore((s) => s.selectionMode);
  const addSelectedPoint = useSegmentationStore((s) => s.addSelectedPoint);
  const removeSelectedPoint = useSegmentationStore(
    (s) => s.removeSelectedPoint
  );

  const selectedPoints = useSegmentationStore((s) => s.selectedPoints);

  const [hoverPoint, setHoverPoint] = useState<THREE.Vector3 | null>(null);
  const hoverPointRef = useRef<THREE.Vector3 | null>(null);

  const segmentationMask = useSegmentationStore((s) => s.segmentationMask);

  const { pointsGeometry, pointsMaterial, bvhMesh } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const normalized = new Float32Array(colors.length);
    const color = new THREE.Color();
    for (let i = 0; i < colors.length; i += 3) {
      color
        .setRGB(colors[i] / 255, colors[i + 1] / 255, colors[i + 2] / 255)
        .convertSRGBToLinear();
      normalized[i] = color.r;
      normalized[i + 1] = color.g;
      normalized[i + 2] = color.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(normalized, 3));

    const mat = new THREE.PointsMaterial({
      size: pointSize,
      vertexColors: true,
    });

    // Create BVH mesh for raycasting
    const bvhGeo = geo.clone();
    const count = bvhGeo.attributes.position.count;
    const indices: number[] = [];
    for (let i = 0; i < count; i++) indices.push(i, i, i);
    bvhGeo.setIndex(indices);

    const mesh = new THREE.Mesh(bvhGeo, new THREE.MeshBasicMaterial());
    console.time("computeBoundsTree");
    mesh.geometry.computeBoundsTree();
    console.timeEnd("computeBoundsTree");

    return { pointsGeometry: geo, pointsMaterial: mat, bvhMesh: mesh };
  }, [positions, colors, pointSize]);

  const originalColors = useMemo(
    () => new Float32Array(pointsGeometry.attributes.color.array),
    [pointsGeometry]
  );

  const isNearExistingPoint = (
    point: THREE.Vector3,
    selected: { position: [number, number, number] }[],
    thresholdSq: number
  ) => {
    for (const p of selected) {
      const dx = p.position[0] - point.x;
      const dy = p.position[1] - point.y;
      const dz = p.position[2] - point.z;
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < thresholdSq) return true;
    }
    return false;
  };

  const findClosestSelectedPoint = (
    point: THREE.Vector3,
    selected: { id: string; position: [number, number, number] }[],
    thresholdSq: number
  ) => {
    let closestId: string | null = null;
    let minDistSq = Infinity;

    for (const p of selected) {
      const dx = p.position[0] - point.x;
      const dy = p.position[1] - point.y;
      const dz = p.position[2] - point.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < thresholdSq && distSq < minDistSq) {
        minDistSq = distSq;
        closestId = p.id;
      }
    }

    return closestId;
  };

  useEffect(() => {
    if (!bvhMesh.geometry.boundsTree) {
      console.warn("BVH not initialized properly. useEffect");
      return;
    }

    console.log("BVH initialized for point cloud raycasting.");
    const canvas = gl.domElement;

    const handlePointerMove = (event: PointerEvent) => {
      if (!bvhMesh.geometry.boundsTree) {
        console.warn("BVH not initialized properly. handlePointerMove");
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);

      const inverseMatrix = new THREE.Matrix4()
        .copy(bvhMesh.matrixWorld)
        .invert();

      const localRay = raycaster.ray.clone();
      localRay.applyMatrix4(inverseMatrix);

      const pixelRadius = 6;
      const dist = camera.position.distanceTo(
        new THREE.Vector3().setFromMatrixPosition(bvhMesh.matrixWorld)
      );
      const cam = camera as THREE.PerspectiveCamera;
      const vFov = THREE.MathUtils.degToRad(cam.fov);
      const worldHeight = 2 * Math.tan(vFov / 2) * dist;
      const worldThreshold = (pixelRadius * worldHeight) / canvas.clientHeight;
      const avgScale =
        (bvhMesh.scale.x + bvhMesh.scale.y + bvhMesh.scale.z) / 3;
      const localThreshold = worldThreshold / avgScale;
      const localThresholdSq = localThreshold * localThreshold;

      let closestDistance = Infinity;
      let hitPoint: THREE.Vector3 | null = null;

      bvhMesh.geometry.boundsTree.shapecast({
        boundsTraverseOrder: (box) => box.distanceToPoint(localRay.origin),
        intersectsBounds: (box, _isLeaf, score) => {
          if (score !== undefined && score > closestDistance)
            return NOT_INTERSECTED;
          const expanded = box.clone().expandByScalar(localThreshold);
          return localRay.intersectsBox(expanded)
            ? INTERSECTED
            : NOT_INTERSECTED;
        },
        intersectsTriangle: (triangle) => {
          const distSq = localRay.distanceSqToPoint(triangle.a);
          if (distSq < localThresholdSq) {
            const dist = localRay.origin.distanceTo(triangle.a);
            if (dist < closestDistance) {
              closestDistance = dist;
              hitPoint = triangle.a.clone();
            }
          }
        },
      });

      if (hitPoint) {
        // @ts-ignore
        hitPoint.applyMatrix4(bvhMesh.matrixWorld);
        setHoverPoint(hitPoint);
        // @ts-ignore
        hoverPointRef.current = hitPoint.clone();
      } else {
        setHoverPoint(null);
        hoverPointRef.current = null;
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [bvhMesh.geometry.boundsTree]);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const point = hoverPointRef.current;
      if (!point) return;

      const threshold = 0.004;
      const thresholdSq = threshold * threshold;

      // 우클릭 → 삭제
      if (e.button === MouseButton.Right) {
        const id = findClosestSelectedPoint(point, selectedPoints, thresholdSq);

        if (id) {
          removeSelectedPoint(id);
        }
        return;
      }

      // 좌클릭 → 추가
      if (e.button === MouseButton.Left) {
        if (isNearExistingPoint(point, selectedPoints, thresholdSq)) {
          return;
        }

        addSelectedPoint({
          id: crypto.randomUUID(),
          position: [point.x, point.y, point.z],
          type: selectionMode,
        });
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [selectionMode, selectedPoints, addSelectedPoint, removeSelectedPoint]);

  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", preventContextMenu);
    return () => window.removeEventListener("contextmenu", preventContextMenu);
  }, []);

  useEffect(() => {
    const colorAttr = pointsGeometry.getAttribute("color");
    const colors = colorAttr.array as Float32Array;

    if (!segmentationMask) {
      colors.set(originalColors);
      colorAttr.needsUpdate = true;
      return;
    }

    for (let i = 0; i < segmentationMask.length; i++) {
      const idx = i * 3;

      if (segmentationMask[i] === 1) {
        colors[idx] = originalColors[idx];
        colors[idx + 1] = originalColors[idx + 1];
        colors[idx + 2] = originalColors[idx + 2];
      } else {
        colors[idx] = 0.3;
        colors[idx + 1] = 0.3;
        colors[idx + 2] = 0.3;
      }
    }

    colorAttr.needsUpdate = true;
  }, [segmentationMask, pointsGeometry, originalColors]);

  return (
    <>
      <points
        ref={pointsRef}
        geometry={pointsGeometry}
        material={pointsMaterial}
      />

      {/* hover */}
      {hoverPoint && (
        <mesh position={hoverPoint}>
          <sphereGeometry args={[0.003, 16, 16]} />
          <meshBasicMaterial color={0xffff00} transparent opacity={0.9} />
        </mesh>
      )}

      {/* selected */}
      {selectedPoints.map((p) => (
        <mesh key={p.id} position={p.position}>
          <sphereGeometry args={[0.004, 16, 16]} />
          <meshBasicMaterial
            color={p.type === "positive" ? 0x52c41a : 0xff4d4f}
            transparent
            opacity={0.9}
            depthTest={false}
          />
        </mesh>
      ))}
    </>
  );
}
