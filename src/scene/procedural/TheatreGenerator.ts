import * as THREE from "three";
import type { Venue3DConfig } from "@/domain/venue/venue-types";
import type { SeatMap } from "@/domain/seat/seat-types";
import { createStage } from "@/utils/geometry";
import { createFloor } from "@/utils/geometry";
import { computeSeatMapWorldBounds } from "@/utils/coordinates";

export class TheatreGenerator {
  generate(config: Venue3DConfig, seatMap: SeatMap): THREE.Group {
    const group = new THREE.Group();
    const bounds = computeSeatMapWorldBounds(seatMap);
    const floorWidth = Math.max(bounds.width + 20, 48);
    const floorDepth = Math.max(bounds.depth + 20, 24);

    const floor = createFloor(floorWidth, floorDepth);
    floor.position.set(bounds.centerX, 0, bounds.centerZ);
    group.add(floor);

    if (config.venue.type === "arena" || config.procedural.arena) {
      const arena = config.procedural.arena;
      const ringWidth = arena?.ring_width ?? 6.1;
      const ringDepth = arena?.ring_depth ?? 6.1;
      const ring = new THREE.Mesh(
        new THREE.BoxGeometry(ringWidth, 0.5, ringDepth),
        new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      );
      ring.position.set(bounds.centerX, 0.25, bounds.centerZ);
      group.add(ring);

      const apron = new THREE.Mesh(
        new THREE.BoxGeometry(ringWidth + 4, 0.1, ringDepth + 4),
        new THREE.MeshStandardMaterial({ color: 0x777777 })
      );
      apron.position.set(bounds.centerX, 0.05, bounds.centerZ);
      group.add(apron);
      return group;
    }

    const proc = config.procedural.theatre ?? {
      stage_width: 16,
      stage_depth: 6,
      row_spacing: 0.9,
      seat_spacing: 0.55,
      tier_height: 0.35,
    };

    const stage = createStage(proc.stage_width, proc.stage_depth);
    group.add(stage);

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
