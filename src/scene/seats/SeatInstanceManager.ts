import * as THREE from "three";
import type { Seat } from "@/domain/seat/seat-types";
import { SeatMaterials } from "./SeatMaterials";

export interface SeatInstance {
  objectId: string;
  position: THREE.Vector3;
  color: string;
  status?: Seat["status"];
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

  build(instances: SeatInstance[]): THREE.InstancedMesh {
    this.dispose();
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    this.mesh = new THREE.InstancedMesh(geometry, this.seatMaterials.getForStatus(undefined), instances.length);
    this.mesh.castShadow = true;

    const dummy = new THREE.Object3D();
    let idx = 0;

    for (const instance of instances) {
      dummy.position.set(instance.position.x, instance.position.y, instance.position.z);
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
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    return this.mesh;
  }

  updateSeatStatus(objectId: string, status: string | undefined): void {
    if (!this.mesh) return;
    const idx = this.seatToInstanceId.get(objectId);
    if (idx === undefined || idx === null) return;
    const color =
      status && status !== "AVAILABLE"
        ? `#${this.seatMaterials.getForStatus(status).color.getHexString()}`
        : this.seatColors.get(objectId) ?? `#${this.seatMaterials.getForStatus(undefined).color.getHexString()}`;
    this.mesh.setColorAt(idx, new THREE.Color(color));
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  selectSeat(objectId: string): void {
    if (!this.mesh) return;
    const idx = this.seatToInstanceId.get(objectId);
    if (idx === undefined) return;
    const color = `#${this.seatMaterials.getSelected().color.getHexString()}`;
    this.mesh.setColorAt(idx, new THREE.Color(color));
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  deselectSeat(objectId: string): void {
    if (!this.mesh) return;
    const idx = this.seatToInstanceId.get(objectId);
    if (idx === undefined) return;
    const color =
      this.seatColors.get(objectId) ??
      `#${this.seatMaterials.getForStatus(undefined).color.getHexString()}`;
    this.mesh.setColorAt(idx, new THREE.Color(color));
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
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
}