import * as THREE from "three";
import type { SectionBounds3D } from "@/domain/venue/venue-types";

export class SectionRaycaster {
  private raycaster: THREE.Raycaster;

  constructor() {
    this.raycaster = new THREE.Raycaster();
  }

  hitTest(sectionBounds: SectionBounds3D, mouse: THREE.Vector2, camera: THREE.Camera): boolean {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -sectionBounds.min.y);
    const intersection = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(plane, intersection);
    if (!hit) return false;

    return (
      intersection.x >= sectionBounds.min.x &&
      intersection.x <= sectionBounds.max.x &&
      intersection.z >= sectionBounds.min.z &&
      intersection.z <= sectionBounds.max.z
    );
  }
}
