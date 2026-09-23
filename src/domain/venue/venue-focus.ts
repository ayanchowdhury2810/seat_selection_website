import type { VenueType } from "./venue-types";

export function getEventFocus(venueType: VenueType): string {
  const focusMap: Record<VenueType, string> = {
    theatre: "stage",
    stadium: "field",
    arena: "court/event area",
    concert_hall: "stage",
    auditorium: "stage",
    open_air: "stage",
    conference: "presentation area",
    cinema: "screen",
    generic: "stage",
  };
  return focusMap[venueType] ?? "stage";
}
