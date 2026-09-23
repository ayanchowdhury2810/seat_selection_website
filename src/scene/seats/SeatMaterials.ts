import * as THREE from "three";

export class SeatMaterials {
  private availableMaterial: THREE.MeshStandardMaterial;
  private bookedMaterial: THREE.MeshStandardMaterial;
  private heldMaterial: THREE.MeshStandardMaterial;
  private unavailableMaterial: THREE.MeshStandardMaterial;
  private selectedMaterial: THREE.MeshStandardMaterial;
  private hoverMaterial: THREE.MeshStandardMaterial;

  constructor() {
    this.availableMaterial = new THREE.MeshStandardMaterial({
      color: 0x19A024,
      emissive: 0x19A024,
      emissiveIntensity: 0.1,
    });
    this.bookedMaterial = new THREE.MeshStandardMaterial({
      color: 0xDC143C,
      emissive: 0xDC143C,
      emissiveIntensity: 0.1,
    });
    this.heldMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFA500,
      emissive: 0xFFA500,
      emissiveIntensity: 0.1,
    });
    this.unavailableMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      emissive: 0x555555,
      emissiveIntensity: 0.05,
    });
    this.selectedMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFF00,
      emissive: 0xFFFF00,
      emissiveIntensity: 0.3,
    });
    this.hoverMaterial = new THREE.MeshStandardMaterial({
      color: 0xADD8E6,
      emissive: 0xADD8E6,
      emissiveIntensity: 0.2,
    });
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
}
