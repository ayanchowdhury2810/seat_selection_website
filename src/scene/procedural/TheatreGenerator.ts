import * as THREE from "three";
import type { Venue3DConfig } from "@/domain/venue/venue-types";
import type { SeatMap } from "@/domain/seat/seat-types";
import { createStage } from "@/utils/geometry";
import { createFloor } from "@/utils/geometry";

export class TheatreGenerator {
  generate(config: Venue3DConfig, seatMap: SeatMap): THREE.Group {
    const group = new THREE.Group();
    const proc = config.procedural.theatre;

    const stage = createStage(proc.stage_width, proc.stage_depth);
    group.add(stage);

    const floor = createFloor(proc.stage_width * 3, proc.stage_depth * 4);
    group.add(floor);

    const frontBarrier = new THREE.Mesh(
      new THREE.BoxGeometry(proc.stage_width, 0.5, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x666666 })
    );
    frontBarrier.position.set(0, 0.25, -(proc.stage_depth / 2 + 2));
    group.add(frontBarrier);

    const sideWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 5, proc.stage_depth * 4),
      new THREE.MeshStandardMaterial({ color: 0x555555 })
    );
    sideWall.position.set(proc.stage_width / 2 + 0.15, 2.5, 0);
    group.add(sideWall);

    const sideWall2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 5, proc.stage_depth * 4),
      new THREE.MeshStandardMaterial({ color: 0x555555 })
    );
    sideWall2.position.set(-(proc.stage_width / 2 + 0.15), 2.5, 0);
    group.add(sideWall2);

    return group;
  }
}
