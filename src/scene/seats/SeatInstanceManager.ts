import * as THREE from "three";
import type { Seat } from "@/domain/seat/seat-types";
import { SeatMaterials, type SeatAppearance } from "./SeatMaterials";

export interface SeatInstance {
  objectId: string;
  position: THREE.Vector3;
  color: string;
  status?: Seat["status"];
}

export interface BuildSeatOptions {
  /** Edge length of a seat box. Must stay below the seat pitch or seats merge. */
  size?: number;
}

export class SeatInstanceManager {
  private mesh: THREE.InstancedMesh | null = null;
  private instanceToSeatId: Map<number, string> = new Map();
  private seatToInstanceId: Map<string, number> = new Map();
  private seatColors: Map<string, string> = new Map();
  private seatMaterials: SeatMaterials;
  private count: number = 0;

  constructor() {
    this.seatMaterials = new SeatMaterials();
  }

  build(instances: SeatInstance[], options: BuildSeatOptions = {}): THREE.InstancedMesh {
    this.dispose();
    const size = options.size ?? 0.5;
    const geometry = new THREE.BoxGeometry(size, size, size);
    this.mesh = new THREE.InstancedMesh(geometry, this.seatMaterials.getForStatus(undefined), instances.length);
    this.mesh.castShadow = true;
    this.mesh.frustumCulled = false;

    const dummy = new THREE.Object3D();
    let idx = 0;

    for (const instance of instances) {
      dummy.position.copy(instance.position);
      dummy.updateMatrix();
      this.mesh.setMatrixAt(idx, dummy.matrix);

      const statusColor =
        instance.status && instance.status !== "AVAILABLE"
          ? `#${this.seatMaterials.getForStatus(instance.status).color.getHexString()}`
          : undefined;
      const color = statusColor ?? instance.color;
      this.mesh.setColorAt(idx, new THREE.Color(color));

      this.instanceToSeatId.set(idx, instance.objectId);
      this.seatToInstanceId.set(instance.objectId, idx);
      this.seatColors.set(instance.objectId, color);
      idx++;
    }

    this.count = idx;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.flushColors();
    return this.mesh;
  }

  /**
   * Repaints one seat. `normal` restores the ticket or status color it was built with.
   */
  setSeatAppearance(objectId: string, appearance: SeatAppearance): void {
    const idx = this.seatToInstanceId.get(objectId);
    if (idx === undefined || !this.mesh) return;
    const base = this.seatColors.get(objectId) ?? `#${this.seatMaterials.getForStatus(undefined).color.getHexString()}`;
    const color =
      appearance === "selected"
        ? `#${this.seatMaterials.getSelected().color.getHexString()}`
        : appearance === "hovered"
          ? `#${this.seatMaterials.getHover().color.getHexString()}`
          : base;
    this.mesh.setColorAt(idx, new THREE.Color(color));
    this.flushColors();
  }

  updateSeatStatus(objectId: string, status: string | undefined): void {
    if (!this.mesh) return;
    const idx = this.seatToInstanceId.get(objectId);
    if (idx === undefined) return;
    const color =
      status && status !== "AVAILABLE"
        ? `#${this.seatMaterials.getForStatus(status).color.getHexString()}`
        : this.seatColors.get(objectId) ?? `#${this.seatMaterials.getForStatus(undefined).color.getHexString()}`;
    this.seatColors.set(objectId, color);
    this.mesh.setColorAt(idx, new THREE.Color(color));
    this.flushColors();
  }

  selectSeat(objectId: string): void {
    this.setSeatAppearance(objectId, "selected");
  }

  deselectSeat(objectId: string): void {
    this.setSeatAppearance(objectId, "normal");
  }

  hasSeat(objectId: string): boolean {
    return this.seatToInstanceId.has(objectId);
  }

  getInstanceById(objectId: string): number | undefined {
    return this.seatToInstanceId.get(objectId);
  }

  getSeatById(instanceId: number): string | undefined {
    return this.instanceToSeatId.get(instanceId);
  }

  getCount(): number {
    return this.count;
  }

  getMesh(): THREE.InstancedMesh | null {
    return this.mesh;
  }

  dispose(): void {
    this.mesh?.geometry?.dispose();
    this.mesh?.dispose();
    this.mesh = null;
    this.instanceToSeatId.clear();
    this.seatToInstanceId.clear();
    this.seatColors.clear();
    this.count = 0;
  }

  private flushColors(): void {
    if (this.mesh?.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}
