export const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "#19A024",
  HELD: "#FFA500",
  BOOKED: "#DC143C",
  UNAVAILABLE: "#555555",
};

/** Seat colors for user-driven states. Shared by the 3D materials and the legend. */
export const SELECTED_SEAT_COLOR = "#FFD60A";
export const HOVER_SEAT_COLOR = "#7DD3FC";

export function getStatusColor(status: string | undefined): string {
  return STATUS_COLORS[status ?? "AVAILABLE"] ?? STATUS_COLORS.AVAILABLE;
}
