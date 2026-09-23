import type { SeatMap } from "../../domain/seat/seat-types";

export interface PovRequest {
  seatId: string;
}

export interface PovCameraConfig {
  eyeHeight: number;
  lookAt: { x: number; y: number; z: number };
  seatPosition: { x: number; y: number; z: number };
}

export function computePovConfig(seat: { x: number; y: number; rotation: number }, eyeHeight: number): PovCameraConfig {
  return {
    eyeHeight,
    lookAt: { x: 0, y: 1, z: -15 },
    seatPosition: { x: seat.x, y: seat.y, z: seat.rotation },
  };
}
