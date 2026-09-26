import * as THREE from "three";
import { HOVER_SEAT_COLOR, SELECTED_SEAT_COLOR, STATUS_COLORS } from "@/utils/colors";

export type SeatAppearance = "normal" | "selected" | "hovered";

export class SeatMaterials {
  private availableMaterial: THREE.MeshStandardMaterial;
  private bookedMaterial: THREE.MeshStandardMaterial;
  private heldMaterial: THREE.MeshStandardMaterial;
  private unavailableMaterial: THREE.MeshStandardMaterial;
  private selectedMaterial: THREE.MeshStandardMaterial;
  private hoverMaterial: THREE.MeshStandardMaterial;

  constructor() {
    this.availableMaterial = this.create(STATUS_COLORS.AVAILABLE, 0.1);
    this.bookedMaterial = this.create(STATUS_COLORS.BOOKED, 0.1);
    this.heldMaterial = this.create(STATUS_COLORS.HELD, 0.1);
    this.unavailableMaterial = this.create(STATUS_COLORS.UNAVAILABLE, 0.05);
    this.selectedMaterial = this.create(SELECTED_SEAT_COLOR, 0.45);
    this.hoverMaterial = this.create(HOVER_SEAT_COLOR, 0.35);
  }

  getForStatus(status: string | undefined): THREE.MeshStandardMaterial {
    switch (status) {
      case "HELD":
        return this.heldMaterial;
      case "BOOKED":
        return this.bookedMaterial;
      case "UNAVAILABLE":
        return this.unavailableMaterial;
      default:
        return this.availableMaterial;
    }
  }

  getSelected(): THREE.MeshStandardMaterial {
    return this.selectedMaterial;
  }

  getHover(): THREE.MeshStandardMaterial {
    return this.hoverMaterial;
  }

  private create(color: string, emissiveIntensity: number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity,
    });
  }
}
