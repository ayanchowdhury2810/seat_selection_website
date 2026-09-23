import * as THREE from "three";
import type { Venue3DConfig } from "@/domain/venue/venue-types";
import type { SeatMap } from "@/domain/seat/seat-types";
import { ProceduralVenueGenerator } from "@/domain/venue/venue-types";
import { TheatreGenerator } from "./TheatreGenerator";
import { StadiumGenerator } from "./StadiumGenerator";
import { GenericVenueGenerator } from "./GenericVenueGenerator";

export function createVenueGenerator(type: string): ProceduralVenueGenerator {
  switch (type) {
    case "stadium":
      return new StadiumGenerator();
    case "theatre":
      return new TheatreGenerator();
    default:
      return new GenericVenueGenerator();
  }
}
