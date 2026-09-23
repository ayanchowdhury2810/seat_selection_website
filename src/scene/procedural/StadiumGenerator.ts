import * as THREE from "three";
import type { Venue3DConfig } from "@/domain/venue/venue-types";
import type { SeatMap } from "@/domain/seat/seat-types";
import { createFloor } from "@/utils/geometry";

export class StadiumGenerator {
  generate(config: Venue3DConfig, seatMap: SeatMap): THREE.Group {
    const group = new THREE.Group();

    const field = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 60),
      new THREE.MeshStandardMaterial({ color: 0x2d6a4f })
    );
    field.rotation.x = -Math.PI / 2;
    field.position.y = 0.05;
    group.add(field);

    const floor = createFloor(200, 150);
    group.add(floor);

    const rimGeometry = new THREE.TorusGeometry(80, 2, 8, 64);
    const rim = new THREE.Mesh(
      rimGeometry,
      new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 15;
    group.add(rim);

    return group;
  }
}
