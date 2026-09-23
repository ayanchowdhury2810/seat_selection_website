import * as THREE from "three";
import type { Venue3DConfig } from "@/domain/venue/venue-types";
import type { SeatMap } from "@/domain/seat/seat-types";
import { TheatreGenerator } from "@/scene/procedural/TheatreGenerator";
import { StadiumGenerator } from "@/scene/procedural/StadiumGenerator";
import { GenericVenueGenerator } from "@/scene/procedural/GenericVenueGenerator";
import type { ProceduralVenueGenerator } from "@/domain/venue/venue-types";

export class VenueScene {
  private group: THREE.Group;
  private config: Venue3DConfig;
  private seatMap: SeatMap;

  constructor(seatMap: SeatMap, config: Venue3DConfig) {
    this.seatMap = seatMap;
    this.config = config;
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
        generator = new TheatreGenerator();
        break;
      default:
        generator = new GenericVenueGenerator();
    }
    const venueGroup = generator.generate(this.config, this.seatMap);
    this.group.add(venueGroup);
    return this.group;
  }

  getGroup(): THREE.Group {
    return this.group;
  }
}
