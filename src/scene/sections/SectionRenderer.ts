import * as THREE from "three";
import type { SeatMap } from "@/domain/seat/seat-types";
import type { SectionBounds3D } from "@/domain/venue/venue-types";
import { mapJsonToWorld } from "@/utils/coordinates";

export interface SectionWorldGeometry {
  width: number;
  height: number;
  center: { x: number; y: number; z: number };
}

export class SectionRenderer {
  private sectionBounds: Map<string, SectionBounds3D> = new Map();

  computeWorldGeometry(
    section: SeatMap["sections"][0],
    canvasWidth: number,
    canvasHeight: number,
    scale: number,
    zOffset: number
  ): SectionWorldGeometry {
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (const point of section.boundary) {
      const world = mapJsonToWorld(point.x, point.y, canvasWidth, canvasHeight, scale, zOffset);
      minX = Math.min(minX, world.x);
      maxX = Math.max(maxX, world.x);
      minZ = Math.min(minZ, world.z);
      maxZ = Math.max(maxZ, world.z);
    }

    const geom = {
      width: maxX - minX,
      height: maxZ - minZ,
      center: { x: (minX + maxX) / 2, y: 0.02, z: (minZ + maxZ) / 2 },
    };
    this.sectionBounds.set(section.id, {
      min: { x: minX, y: 0, z: minZ },
      max: { x: maxX, y: 0, z: maxZ },
    });
    return geom;
  }

  createSectionMesh(
    section: SeatMap["sections"][0],
    canvasWidth: number,
    canvasHeight: number,
    scale: number,
    zOffset: number,
    color: string
  ): THREE.Mesh {
    const geometry = this.computeWorldGeometry(
      section,
      canvasWidth,
      canvasHeight,
      scale,
      zOffset
    );
    const material = new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(geometry.width, geometry.height), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(geometry.center.x, geometry.center.y, geometry.center.z);
    mesh.userData.sectionId = section.id;
    return mesh;
  }

  getBounds(sectionId: string): SectionBounds3D | undefined {
    return this.sectionBounds.get(sectionId);
  }

  isSectionVisible(sectionId: string, cameraPosition: THREE.Vector3): boolean {
    const bounds = this.sectionBounds.get(sectionId);
    if (!bounds) return true;
    const center = new THREE.Vector3(
      (bounds.min.x + bounds.max.x) / 2,
      0,
      (bounds.min.z + bounds.max.z) / 2
    );
    return cameraPosition.distanceTo(center) < 50;
  }
}