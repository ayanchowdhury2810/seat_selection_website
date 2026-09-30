import type { SeatStatus } from "@/domain/seat/seat-types";

export interface RawTicketType {
  id: number;
  title: string;
  price: string;
  offer_price: string | null;
  ticket_color: string;
  max_allowed_qty: number;
  total_quantity: number;
}

export interface RawSeat {
  object_id: string;
  x: number;
  y: number;
  rotation: number;
  label: string;
  ticket_type_id: number | null;
  /** Backend availability. Absent = AVAILABLE (legacy payloads). */
  status?: SeatStatus | string | null;
  web_3d?: {
    placement?: {
      mode: string;
      position?: { x: number; y: number; z: number };
      rotation?: { x: number; y: number; z: number };
    };
  };
}

export interface RawSeatRow {
  id: string;
  label: string;
  seats: RawSeat[];
}

export interface RawSection {
  id: string;
  label: string;
  boundary: Array<{ x: number; y: number }>;
  entrance: string | null;
  rows: RawSeatRow[];
}

export interface RawTableSeat {
  object_id: string;
  x: number;
  y: number;
  rotation: number;
  label: string;
  ticket_type_id: number | null;
  status?: SeatStatus | string | null;
}

export interface RawTable {
  object_id: string;
  table_type: string;
  x: number;
  y: number;
  rotation: number;
  radius: number | null;
  width: number | null;
  height: number | null;
  label: string;
  booking_mode: string;
  ticket_type_id: number | null;
  seats: RawTableSeat[];
}

export interface RawSeatMap {
  venue_id: string;
  venue_name: string;
  event_name: string;
  canvas_width: number;
  canvas_height: number;
  ticket_types: RawTicketType[];
  sections: RawSection[];
  tables: RawTable[];
  web_3d?: {
    enabled: boolean;
    venue: { type: string; model_type: string };
    coordinate_system: { type: string; units: string };
    event_focus: { type: string; position: { x: number; y: number; z: number } };
    camera: { eye_height: number; fov: number };
    procedural: Record<string, unknown>;
  };
}
