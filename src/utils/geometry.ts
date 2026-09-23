import * as THREE from "three";

export function createSeatGeometry(): THREE.BoxGeometry {
  return new THREE.BoxGeometry(0.5, 0.5, 0.5);
}

export function createSectionPlane(
  width: number,
  height: number,
  position: { x: number; y: number; z: number }
): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.position.set(position.x, position.y, position.z);
  plane.rotation.x = -Math.PI / 2;
  return plane;
}

export function createStage(width: number, depth: number): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(width, 0.3, depth);
  const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const stage = new THREE.Mesh(geometry, material);
  stage.position.y = 0.15;
  return stage;
}

export function createFloor(width: number, depth: number): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(width, depth);
  const material = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const floor = new THREE.Mesh(geometry, material);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  return floor;
}
