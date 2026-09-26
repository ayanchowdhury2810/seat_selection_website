import * as THREE from "three";
import type { Venue3DConfig, ProceduralVenueGenerator } from "@/domain/venue/venue-types";
import type { SeatMap } from "@/domain/seat/seat-types";
import { createStage, createFloor } from "@/utils/geometry";
import {
  createSeatMapProjection,
  getProjectionBounds,
  DEFAULT_SEAT_SPACING,
  type SeatMapProjection,
  type WorldBounds,
} from "@/utils/coordinates";

export class TheatreGenerator implements ProceduralVenueGenerator {
  generate(config: Venue3DConfig, seatMap: SeatMap, projection?: SeatMapProjection): THREE.Group {
    const group = new THREE.Group();
    const targetSpacing =
      config.procedural.arena?.seat_spacing ??
      config.procedural.theatre?.seat_spacing ??
      DEFAULT_SEAT_SPACING;
    const projectionToUse = projection ?? createSeatMapProjection(seatMap, targetSpacing);
    const bounds = getProjectionBounds(projectionToUse);

    const floor = createFloor(bounds.width + 24, bounds.depth + 24);
    floor.position.set(bounds.centerX, -0.02, bounds.centerZ);
    group.add(floor);

    if (config.venue.type === "arena" || config.procedural.arena) {
      group.add(this.buildArena(config, bounds.radius));
      return group;
    }

    group.add(this.buildTheatre(config, bounds));
    return group;
  }

  private buildArena(config: Venue3DConfig, radius: number): THREE.Group {
    const group = new THREE.Group();
    const arena = config.procedural.arena;
    const ringWidth = arena?.ring_width ?? 6.1;
    const ringDepth = arena?.ring_depth ?? 6.1;

    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(ringWidth + 6, 0.1, ringDepth + 6),
      new THREE.MeshStandardMaterial({ color: 0x4b5563 })
    );
    apron.position.y = 0.05;
    group.add(apron);

    const ring = new THREE.Mesh(
      new THREE.BoxGeometry(ringWidth, 0.5, ringDepth),
      new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    );
    ring.position.y = 0.3;
    group.add(ring);

    const wallHeight = (arena?.bowl_tiers ?? 1) * (arena?.tier_height ?? 0.4) + 2.5;
    const outerRadius = radius + 3;
    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(outerRadius, outerRadius, wallHeight, 64, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x111827, side: THREE.BackSide })
    );
    wall.position.y = wallHeight / 2 - 0.1;
    group.add(wall);

    return group;
  }

  private buildTheatre(config: Venue3DConfig, bounds: WorldBounds): THREE.Group {
    const group = new THREE.Group();
    const proc = config.procedural.theatre ?? {
      stage_width: 16,
      stage_depth: 6,
      row_spacing: 0.9,
      seat_spacing: 0.55,
      tier_height: 0.35,
    };

    // Seat the stage in front of the seating block, not in the middle of it.
    const stageZ = bounds.minZ - proc.stage_depth / 2 - 2;
    const stage = createStage(proc.stage_width, proc.stage_depth);
    stage.position.z = stageZ;
    group.add(stage);

    const frontBarrier = new THREE.Mesh(
      new THREE.BoxGeometry(proc.stage_width, 0.5, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x666666 })
    );
    frontBarrier.position.set(0, 0.25, stageZ + proc.stage_depth / 2 + 0.2);
    group.add(frontBarrier);

    for (const side of [1, -1]) {
      const sideWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 5, proc.stage_depth * 4),
        new THREE.MeshStandardMaterial({ color: 0x555555 })
      );
      sideWall.position.set(side * (proc.stage_width / 2 + 0.15), 2.5, stageZ);
      group.add(sideWall);
    }

    return group;
  }
}
