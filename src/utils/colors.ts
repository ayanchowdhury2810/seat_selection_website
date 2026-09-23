export const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "#19A024",
  HELD: "#FFA500",
  BOOKED: "#DC143C",
  UNAVAILABLE: "#555555",
};

export const TICKET_COLORS: Record<number, string> = {
  1: "#19A024",
  2: "#7DDC86",
};

export function getStatusColor(status: string | undefined): string {
  return STATUS_COLORS[status ?? "AVAILABLE"] ?? STATUS_COLORS.AVAILABLE;
}

export function getTicketColor(ticketTypeId: number | null): string {
  return TICKET_COLORS[ticketTypeId ?? 0] ?? "#ffffff";
}
