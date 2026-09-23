import type { VenueType } from "./venue-types";

export function isVenueTypeSupported(type: VenueType): boolean {
  return ["stadium", "theatre"].includes(type);
}
