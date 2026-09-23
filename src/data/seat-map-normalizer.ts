import type { RawSeatMap } from "@/data/seat-map-schema";
import type { SeatMap, TicketType, SeatSection, Seat } from "@/domain/seat/seat-types";

export function validateRaw(json: unknown): json is RawSeatMap {
  return (
    typeof json === "object" &&
    json !== null &&
    "venue_id" in json &&
    "sections" in json &&
    Array.isArray((json as RawSeatMap).sections)
  );
}

export function normalizeSeatMap(raw: RawSeatMap): SeatMap {
  const ticketTypes: TicketType[] = raw.ticket_types.map((t) => ({
    id: t.id,
    title: t.title,
    price: t.price,
    offer_price: t.offer_price,
    ticket_color: t.ticket_color,
    max_allowed_qty: t.max_allowed_qty,
    total_quantity: t.total_quantity,
  }));

  const sections: SeatSection[] = raw.sections.map((s) => ({
    id: s.id,
    label: s.label,
    boundary: s.boundary,
    entrance: s.entrance,
    rows: s.rows.map((r) => ({
      id: r.id,
      label: r.label,
      seats: r.seats.map((seat) => ({
        object_id: seat.object_id,
        x: seat.x,
        y: seat.y,
        rotation: seat.rotation,
        label: seat.label,
        ticket_type_id: seat.ticket_type_id,
        status: "AVAILABLE" as const,
        object_type: "SEAT" as const,
        web_3d: seat.web_3d?.placement as Seat["web_3d"],
      })),
    })),
  }));

  return {
    venue_id: raw.venue_id,
    venue_name: raw.venue_name,
    event_name: raw.event_name,
    canvas_width: raw.canvas_width,
    canvas_height: raw.canvas_height,
    ticket_types: ticketTypes,
    sections,
    tables: raw.tables ?? [],
    web_3d: raw.web_3d,
  };
}
