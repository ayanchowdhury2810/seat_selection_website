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
