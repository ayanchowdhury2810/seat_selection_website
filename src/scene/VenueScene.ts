import * as THREE from "three";
import type { Venue3DConfig, ProceduralVenueGenerator } from "@/domain/venue/venue-types";
import type { SeatMap } from "@/domain/seat/seat-types";
import { createSeatMapProjection, type SeatMapProjection } from "@/utils/coordinates";
import { TheatreGenerator } from "@/scene/procedural/TheatreGenerator";
import { StadiumGenerator } from "@/scene/procedural/StadiumGenerator";
import { GenericVenueGenerator } from "@/scene/procedural/GenericVenueGenerator";

export class VenueScene {
  private group: THREE.Group;
  private config: Venue3DConfig;
  private seatMap: SeatMap;
  private projection: SeatMapProjection;

  constructor(seatMap: SeatMap, config: Venue3DConfig, projection?: SeatMapProjection) {
    this.seatMap = seatMap;
    this.config = config;
    this.projection =
      projection ??
      createSeatMapProjection(
        seatMap,
        config.procedural.arena?.seat_spacing ??
          config.procedural.theatre?.seat_spacing ??
          0.55
      );
    this.group = new THREE.Group();
  }

  build(): THREE.Group {
    const type = this.config.venue.type;
    let generator: ProceduralVenueGenerator;
    switch (type) {
      case "stadium":
        generator = new StadiumGenerator();
        break;
      case "theatre":
      case "arena":
        generator = new TheatreGenerator();
        break;
      default:
        generator = new GenericVenueGenerator();
    }
    const venueGroup = generator.generate(this.config, this.seatMap, this.projection);
    this.group.add(venueGroup);
    return this.group;
  }

  getGroup(): THREE.Group {
    return this.group;
  }
}
