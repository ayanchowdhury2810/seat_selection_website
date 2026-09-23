import * as THREE from "three";
import { useSeatSelection } from "@/state/seat-selection-store";

export class SeatRaycaster {
  private seatManager: any;

  constructor(seatManager: any) {
    this.seatManager = seatManager;
  }

  onPointerMove(event: React.PointerEvent, camera: THREE.Camera): { objectId: string | null; normalizedX: number; normalizedY: number } {
    return { objectId: null, normalizedX: 0, normalizedY: 0 };
  }

  onPointerClick(event: React.PointerEvent, camera: THREE.Camera): string | null {
    return null;
  }
}
