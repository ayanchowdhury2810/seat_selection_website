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

export interface Point2 {
  x: number;
  y: number;
}

/** A seat-map to world-space mapping. World origin sits at the seat-map center. */
export interface SeatMapProjection {
  /** World units per seat-map unit. */
  scale: number;
  /** Seat-map point that maps to the world origin. */
  centerX: number;
  centerY: number;
  /** Distance between neighbouring seats, in seat-map units. */
  seatPitch: number;
  /** Seat-map extent covered by the projection. */
  sourceMinX: number;
  sourceMaxX: number;
  sourceMinY: number;
  sourceMaxY: number;
  /** Resulting world extent on the floor plane. */
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface WorldBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  centerX: number;
  centerZ: number;
  width: number;
  depth: number;
  radius: number;
}

/** Minimal seat shape needed to build a projection. */
export interface SeatMapProjectable {
  canvas_width: number;
  canvas_height: number;
  sections: Array<{
    boundary: Point2[];
    rows: Array<{ seats: Array<Point2> }>;
  }>;
}

export const DEFAULT_SEAT_SPACING = 0.55;

/**
 * Projects a 2D seat-map point onto the world floor plane.
 * Seat-map +y points away from the viewer, so it maps to world -z.
 */
export function projectSeatToWorld(x: number, y: number, projection: SeatMapProjection): { x: number; z: number } {
  return {
    x: (x - projection.centerX) * projection.scale,
    z: -(y - projection.centerY) * projection.scale,
  };
}

/**
 * Median distance between neighbouring seats in a row, in seat-map units.
 * Sectors are sampled evenly so huge maps stay cheap to measure.
 */
export function measureSeatPitch(seatMap: SeatMapProjectable, maxSectors = 24): number {
  const sectorCount = seatMap.sections.length;
  if (sectorCount === 0) return 1;

  const stride = Math.max(1, Math.floor(sectorCount / maxSectors));
  const steps: number[] = [];

  for (let s = 0; s < sectorCount; s += stride) {
    for (const row of seatMap.sections[s].rows) {
      const seats = row.seats;
      for (let i = 1; i < seats.length; i++) {
        steps.push(Math.hypot(seats[i].x - seats[i - 1].x, seats[i].y - seats[i - 1].y));
      }
    }
  }

  if (steps.length === 0) return 1;
  steps.sort((a, b) => a - b);
  return steps[Math.floor(steps.length / 2)] || 1;
}

function measureSourceBounds(seatMap: SeatMapProjectable) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const include = (x: number, y: number) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  };

  for (const section of seatMap.sections) {
    for (const row of section.rows) {
      for (const seat of row.seats) include(seat.x, seat.y);
    }
  }

  if (!Number.isFinite(minX)) {
    // No seats: fall back to the declared canvas so the projection stays usable.
    return {
      minX: 0,
      maxX: seatMap.canvas_width,
      minY: 0,
      maxY: seatMap.canvas_height,
    };
  }

  return { minX, maxX, minY, maxY };
}

/**
 * Builds a projection from the seat map itself.
 *
 * Two things matter here:
 * - the origin is the seat-map center, so the venue stays centered on the ring;
 * - the scale is derived from the measured seat pitch, so one seat always occupies
 *   `targetSeatSpacing` meters whatever unit the source data uses.
 */
export function createSeatMapProjection(
  seatMap: SeatMapProjectable,
  targetSeatSpacing: number = DEFAULT_SEAT_SPACING
): SeatMapProjection {
  const bounds = measureSourceBounds(seatMap);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const seatPitch = measureSeatPitch(seatMap);
  const scale = targetSeatSpacing / seatPitch;

  const halfWidth = ((bounds.maxX - bounds.minX) / 2) * scale;
  const halfDepth = ((bounds.maxY - bounds.minY) / 2) * scale;

  return {
    scale,
    centerX,
    centerY,
    seatPitch,
    sourceMinX: bounds.minX,
    sourceMaxX: bounds.maxX,
    sourceMinY: bounds.minY,
    sourceMaxY: bounds.maxY,
    minX: -halfWidth,
    maxX: halfWidth,
    minZ: -halfDepth,
    maxZ: halfDepth,
  };
}

export function getProjectionBounds(projection: SeatMapProjection): WorldBounds {
  const width = projection.maxX - projection.minX;
  const depth = projection.maxZ - projection.minZ;
  return {
    minX: projection.minX,
    maxX: projection.maxX,
    minZ: projection.minZ,
    maxZ: projection.maxZ,
    centerX: (projection.minX + projection.maxX) / 2,
    centerZ: (projection.minZ + projection.maxZ) / 2,
    width,
    depth,
    radius: Math.max(width, depth) / 2,
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
