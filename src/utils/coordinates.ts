export function screenToWorld(
  screenX: number,
  screenY: number,
  canvasWidth: number,
  canvasHeight: number,
  cameraZ: number = 10
): { x: number; y: number; z: number } {
  const x = ((screenX / canvasWidth) * 2 - 1) * (canvasWidth / canvasHeight);
  const y = 1 - (screenY / canvasHeight) * 2;
  return { x, y, z: cameraZ };
}

export function worldToScreen(
  x: number,
  y: number,
  z: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const screenX = ((x * (canvasHeight / canvasWidth) + 1) / 2) * canvasWidth;
  const screenY = (1 - y) / 2 * canvasHeight;
  return { x: screenX, y: screenY };
}

export const MAP_SCALE = 0.02;
export const MAP_Z_OFFSET = 8;

export interface SeatMapWorldBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  centerX: number;
  centerZ: number;
  width: number;
  depth: number;
}

type BoundsSectionLike = {
  boundary: Array<{ x: number; y: number }>;
  rows: Array<{ seats: Array<{ x: number; y: number }> }>;
};

export function computeSeatMapWorldBounds(
  seatMap: {
    canvas_width: number;
    canvas_height: number;
    sections: BoundsSectionLike[];
  },
  scale: number = MAP_SCALE,
  zOffset: number = MAP_Z_OFFSET
): SeatMapWorldBounds {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  const include = (x: number, y: number) => {
    const world = mapJsonToWorld(x, y, seatMap.canvas_width, seatMap.canvas_height, scale, zOffset);
    minX = Math.min(minX, world.x);
    maxX = Math.max(maxX, world.x);
    minZ = Math.min(minZ, world.z);
    maxZ = Math.max(maxZ, world.z);
  };

  for (const section of seatMap.sections) {
    for (const point of section.boundary) include(point.x, point.y);
    for (const row of section.rows) {
      for (const seat of row.seats) include(seat.x, seat.y);
    }
  }

  if (!Number.isFinite(minX)) {
    minX = maxX = 0;
    minZ = maxZ = zOffset;
  }

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    centerX: (minX + maxX) / 2,
    centerZ: (minZ + maxZ) / 2,
    width: maxX - minX,
    depth: maxZ - minZ,
  };
}

export function mapJsonToWorld(
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number,
  scale: number = MAP_SCALE,
  zOffset: number = MAP_Z_OFFSET
): { x: number; y: number; z: number } {
  return {
    x: (x - canvasWidth / 2) * scale,
    y: 0,
    z: (canvasHeight / 2 - y) * scale + zOffset,
  };
}

export function derivePosition(
  sectionIndex: number,
  rowIndex: number,
  seatIndex: number,
  config: {
    stage_width: number;
    stage_depth: number;
    row_spacing: number;
    seat_spacing: number;
    tier_height: number;
  }
): { x: number; y: number; z: number } {
  const x = seatIndex * config.seat_spacing - (config.stage_width / 2);
  const z = -(rowIndex * config.row_spacing + sectionIndex * config.stage_depth);
  const y = rowIndex * config.tier_height;
  return { x, y, z };
}
