import * as THREE from "three";
import type { SeatMap } from "@/domain/seat/seat-types";
import type { SeatMapProjection } from "@/utils/coordinates";

export interface ProceduralVenueGenerator {
  generate(config: Venue3DConfig, seatMap: SeatMap, projection?: SeatMapProjection): THREE.Group;
}

export type VenueType =
  | "stadium"
  | "theatre"
  | "arena"
  | "concert_hall"
  | "auditorium"
  | "open_air"
  | "conference"
  | "cinema"
  | "generic";

export interface Venue3DConfig {
  enabled: boolean;
  venue: {
    type: VenueType;
    model_type: "procedural";
  };
  coordinate_system: {
    type: string;
    units: string;
  };
  event_focus: {
    type: string;
    position: { x: number; y: number; z: number };
  };
  camera: {
    eye_height: number;
    fov: number;
  };
  procedural: {
    theatre?: {
      stage_width: number;
      stage_depth: number;
      row_spacing: number;
      seat_spacing: number;
      tier_height: number;
    };
    arena?: {
      ring_width: number;
      ring_depth: number;
      bowl_tiers: number;
      row_spacing: number;
      seat_spacing: number;
      tier_height: number;
    };
    [key: string]: unknown;
  };
}

export interface SectionBounds3D {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}
