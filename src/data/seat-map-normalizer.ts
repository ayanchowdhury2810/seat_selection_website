import type { RawSeatMap } from "@/data/seat-map-schema";
import type { SeatMap, TicketType, SeatSection, Seat, SeatStatus } from "@/domain/seat/seat-types";

const VALID_STATUSES: ReadonlySet<string> = new Set(["AVAILABLE", "HELD", "BOOKED", "UNAVAILABLE"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/** Backend may send lowercase / null / missing. Normalize to domain status. */
export function parseSeatStatus(value: unknown): SeatStatus {
  if (value === undefined || value === null) return "AVAILABLE";
  const upper = String(value).toUpperCase();
  if (VALID_STATUSES.has(upper)) return upper as SeatStatus;
  return "AVAILABLE";
}

function isValidSeat(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.object_id) &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y)
  );
}

function isValidRow(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.id) &&
    typeof value.label === "string" &&
    Array.isArray(value.seats) &&
    value.seats.every(isValidSeat)
  );
}

function isValidSection(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.id) &&
    typeof value.label === "string" &&
    Array.isArray(value.rows) &&
    (value.rows as unknown[]).every(isValidRow)
  );
}

function isValidTicketType(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isFiniteNumber(value.id) &&
    typeof value.title === "string" &&
    typeof value.price === "string" &&
    typeof value.ticket_color === "string"
  );
}

export function validateRaw(json: unknown): json is RawSeatMap {
  if (!isRecord(json)) return false;
  if (!isNonEmptyString(json.venue_id)) return false;
  if (typeof json.venue_name !== "string") return false;
  if (typeof json.event_name !== "string") return false;
  if (!isFiniteNumber(json.canvas_width) || !isFiniteNumber(json.canvas_height)) return false;
  if (!Array.isArray(json.ticket_types) || !(json.ticket_types as unknown[]).every(isValidTicketType)) return false;
  if (!Array.isArray(json.sections) || !(json.sections as unknown[]).every(isValidSection)) return false;
  // Tables optional for backend payloads without tables; when present must be an array.
  if (json.tables !== undefined && !Array.isArray(json.tables)) return false;
  return true;
}

export class SeatMapValidationError extends Error {
  constructor(message = "Seat map payload failed schema validation") {
    super(message);
    this.name = "SeatMapValidationError";
  }
}

export function assertValidSeatMap(json: unknown): asserts json is RawSeatMap {
  if (!validateRaw(json)) throw new SeatMapValidationError();
}

export function normalizeSeatMap(raw: RawSeatMap): SeatMap {
  const ticketTypes: TicketType[] = (raw.ticket_types ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    price: t.price,
    offer_price: t.offer_price,
    ticket_color: t.ticket_color,
    max_allowed_qty: t.max_allowed_qty,
    total_quantity: t.total_quantity,
  }));

  const sections: SeatSection[] = (raw.sections ?? []).map((s) => ({
    id: s.id,
    label: s.label,
    boundary: s.boundary ?? [],
    entrance: s.entrance ?? null,
    rows: (s.rows ?? []).map((r) => ({
      id: r.id,
      label: r.label,
      seats: (r.seats ?? []).map((seat) => ({
        object_id: seat.object_id,
        x: seat.x,
        y: seat.y,
        rotation: seat.rotation ?? 0,
        label: seat.label ?? seat.object_id,
        ticket_type_id: seat.ticket_type_id ?? null,
        status: parseSeatStatus(seat.status),
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
