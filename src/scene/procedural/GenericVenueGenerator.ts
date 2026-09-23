import * as THREE from "three";
import type { Venue3DConfig } from "@/domain/venue/venue-types";
import type { SeatMap } from "@/domain/seat/seat-types";
import type { ProceduralVenueGenerator } from "@/domain/venue/venue-types";

export class GenericVenueGenerator implements ProceduralVenueGenerator {
  generate(config: Venue3DConfig, seatMap: SeatMap): THREE.Group {
    const group = new THREE.Group();
    const geometry = new THREE.PlaneGeometry(50, 50);
    const material = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    group.add(floor);
    return group;
  }
}
