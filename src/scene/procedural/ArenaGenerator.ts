import * as THREE from "three";
import type { Venue3DConfig } from "@/domain/venue/venue-types";
import type { SeatMap } from "@/domain/seat/seat-types";
import { GenericVenueGenerator } from "./GenericVenueGenerator";
import { TheatreGenerator } from "./TheatreGenerator";
import { StadiumGenerator } from "./StadiumGenerator";
import type { ProceduralVenueGenerator } from "@/domain/venue/venue-types";

export class ArenaGenerator implements ProceduralVenueGenerator {
  generate(config: Venue3DConfig, seatMap: SeatMap): THREE.Group {
    const group = new THREE.Group();
    group.add(new GenericVenueGenerator().generate(config, seatMap));
    return group;
  }
}
