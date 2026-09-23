import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import type { Venue3DConfig } from "@/domain/venue/venue-types";

export class OverviewCamera {
  private camera: THREE.PerspectiveCamera;
  private config: Venue3DConfig;

  constructor(config: Venue3DConfig) {
    this.config = config;
    this.camera = new THREE.PerspectiveCamera(
      config.camera.fov,
      1,
      0.1,
      1000
    );
  }

  fitToVenue(bounds: { min: THREE.Vector3; max: THREE.Vector3 }): void {
    const center = new THREE.Vector3(
      (bounds.min.x + bounds.max.x) / 2,
      (bounds.min.y + bounds.max.y) / 2,
      (bounds.min.z + bounds.max.z) / 2
    );
    const size = new THREE.Vector3(
      bounds.max.x - bounds.min.x,
      bounds.max.y - bounds.min.y,
      bounds.max.z - bounds.min.z
    );
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const distance = Math.abs(maxDim / (2 * Math.tan(fov / 2)));

    this.camera.position.set(center.x, center.y + distance * 0.5, center.z + distance * 0.7);
    this.camera.lookAt(center);
  }

  reset(): void {
    this.camera.position.set(0, this.config.camera.eye_height * 5, 15);
    this.camera.lookAt(0, 0, 0);
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getControls(domElement: HTMLElement): void {
    const controls = new (OrbitControls as any)(this.camera, domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 100;
    controls.target.set(0, 0, 0);
  }

  focusOnPosition(position: THREE.Vector3): void {
    this.camera.position.set(position.x, position.y + 5, position.z + 10);
    this.camera.lookAt(position);
  }
}
