export type SeatObjectType = "SEAT" | "TABLE" | "BOOTH" | "AREA";

export type AreaCapacityType = "GENERAL_ADMISSION" | "FIXED_OCCUPANCY" | "VARIABLE_OCCUPANCY";

export type SeatStatus = "AVAILABLE" | "HELD" | "BOOKED" | "UNAVAILABLE";

export interface Seat {
  object_id: string;
  x: number;
  y: number;
  rotation: number;
  label: string;
  ticket_type_id: number | null;
  status?: SeatStatus;
  object_type?: SeatObjectType;
  web_3d?: Web3DPlacement;
}

export interface Web3DPlacement {
  mode: "derived" | "explicit";
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

export interface SeatRow {
  id: string;
  label: string;
  seats: Seat[];
}

export interface SeatSection {
  id: string;
  label: string;
  boundary: Array<{ x: number; y: number }>;
  entrance: string | null;
  rows: SeatRow[];
  object_type?: SeatObjectType;
  capacity_type?: AreaCapacityType;
}

export interface TicketType {
  id: number;
  title: string;
  price: string;
  offer_price: string | null;
  ticket_color: string;
  max_allowed_qty: number;
  total_quantity: number;
}

export interface SeatMap {
  venue_id: string;
  venue_name: string;
  event_name: string;
  canvas_width: number;
  canvas_height: number;
  ticket_types: TicketType[];
  sections: SeatSection[];
  tables: TableData[];
  web_3d?: Record<string, unknown>;
}

export interface TableData {
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
  seats: Array<{ object_id: string; x: number; y: number; rotation: number; label: string; ticket_type_id: number | null }>;
}
