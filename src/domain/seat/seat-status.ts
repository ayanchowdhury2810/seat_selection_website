import type { SeatStatus } from "./seat-types";

export function isSelectable(status: SeatStatus | undefined): boolean {
  return status === undefined || status === "AVAILABLE";
}

export function isBooked(status: SeatStatus | undefined): boolean {
  return status === "BOOKED" || status === "HELD";
}

export function isUnavailable(status: SeatStatus | undefined): boolean {
  return status === "UNAVAILABLE";
}
