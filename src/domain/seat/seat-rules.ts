import type { Seat, SeatSection, TicketType } from "./seat-types";
import { isSelectable } from "./seat-status";

export function validateSeatSelection(seat: Seat, selectedCount: number, maxQty: number): boolean {
  if (!isSelectable(seat.status)) return false;
  if (selectedCount >= maxQty) return false;
  return true;
}

export function getMaxQtyForSeat(seat: Seat, ticketTypes: TicketType[]): number {
  const ticket = ticketTypes.find((t) => t.id === seat.ticket_type_id);
  return ticket?.max_allowed_qty ?? 10;
}

export function resolveSectionById(sections: SeatSection[], id: string): SeatSection | undefined {
  return sections.find((s) => s.id === id);
}

export function resolveSeatById(sections: SeatSection[], objectId: string): Seat | undefined {
  for (const section of sections) {
    for (const row of section.rows) {
      const seat = row.seats.find((s) => s.object_id === objectId);
      if (seat) return seat;
    }
  }
  return undefined;
}
