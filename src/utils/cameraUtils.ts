import * as THREE from "three";

// TODO: point clound 좌표계 고려해서 cameraDirection 기본값 조정 필요
interface FitToBoxOptions {
  padding?: number; // 0.0 ~ 1.0 (0.25 = 80% 화면 채움)
  cameraDirection?: THREE.Vector3;
}

export function fitCameraToPoints(
  positions: Float32Array,
  camera: THREE.Camera,
  controls: any,
  options: FitToBoxOptions = {}
) {
  const {
    padding = 0.25,
    cameraDirection = new THREE.Vector3(0.0, 1.5, -0.1),
  } = options;

  const box = new THREE.Box3();
  for (let i = 0; i < positions.length; i += 3) {
    box.expandByPoint(
      new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2])
    );
  }

  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
  const distance = (maxDim / (2 * Math.tan(fov / 2))) * (1 + padding);

  const direction = cameraDirection.clone().normalize();
  const cameraPosition = center.clone().add(direction.multiplyScalar(distance));

  camera.position.copy(cameraPosition);

  if (controls && "target" in controls) {
    controls.target.copy(center);
    controls.update();
  }

  return { center, size, distance, cameraPosition };
}
