import type { RawSeatMap } from "./seat-map-schema";

export const dummySeatMapData: RawSeatMap = {
  venue_id: "demo-theatre-phase1",
  venue_name: "Phase 1 Demo Theatre",
  event_name: "Demo Live Event",
  canvas_width: 1200,
  canvas_height: 800,
  ticket_types: [
    {
      id: 1,
      title: "VIP",
      price: "100.00",
      offer_price: null,
      ticket_color: "#19A024",
      max_allowed_qty: 10,
      total_quantity: 200,
    },
    {
      id: 2,
      title: "Standard",
      price: "50.00",
      offer_price: null,
      ticket_color: "#7DDC86",
      max_allowed_qty: 10,
      total_quantity: 400,
    },
  ],
  sections: [
    {
      id: "section-vip",
      label: "VIP",
      boundary: [
        { x: 260, y: 195 },
        { x: 900, y: 195 },
        { x: 900, y: 350 },
        { x: 260, y: 350 },
      ],
      entrance: null,
      rows: [
        {
          id: "row-vip-a",
          label: "A",
          seats: Array.from({ length: 10 }, (_, i) => ({
            object_id: `seat-vip-a-${i + 1}`,
            x: 300 + i * 50,
            y: 220,
            rotation: 0,
            label: String(i + 1),
            ticket_type_id: 1,
            web_3d:
              i === 0
                ? {
                    placement: {
                      mode: "explicit",
                      position: { x: -2.0, y: 1.2, z: 5.0 },
                      rotation: { x: 0, y: 0, z: 0 },
                    },
                  }
                : { placement: { mode: "derived" } },
          })),
        },
        {
          id: "row-vip-b",
          label: "B",
          seats: Array.from({ length: 10 }, (_, i) => ({
            object_id: `seat-vip-b-${i + 1}`,
            x: 300 + i * 50,
            y: 275,
            rotation: 0,
            label: String(i + 1),
            ticket_type_id: 1,
            web_3d: { placement: { mode: "derived" } },
          })),
        },
      ],
    },
    {
      id: "section-standard",
      label: "Standard",
      boundary: [
        { x: 260, y: 395 },
        { x: 900, y: 395 },
        { x: 900, y: 605 },
        { x: 260, y: 605 },
      ],
      entrance: null,
      rows: [
        {
          id: "row-standard-a",
          label: "A",
          seats: Array.from({ length: 12 }, (_, i) => ({
            object_id: `seat-standard-a-${i + 1}`,
            x: 300 + i * 50,
            y: 420,
            rotation: 0,
            label: String(i + 1),
            ticket_type_id: 2,
            web_3d: i === 0 ? { placement: { mode: "explicit", position: { x: -2.0, y: 1.2, z: 5.0 }, rotation: { x: 0, y: 0, z: 0 } } } : { placement: { mode: "derived" } },
          })),
        },
        {
          id: "row-standard-b",
          label: "B",
          seats: Array.from({ length: 12 }, (_, i) => ({
            object_id: `seat-standard-b-${i + 1}`,
            x: 300 + i * 50,
            y: 475,
            rotation: 0,
            label: String(i + 1),
            ticket_type_id: 2,
            web_3d: { placement: { mode: "derived" } },
          })),
        },
        {
          id: "row-standard-c",
          label: "C",
          seats: Array.from({ length: 12 }, (_, i) => ({
            object_id: `seat-standard-c-${i + 1}`,
            x: 300 + i * 50,
            y: 530,
            rotation: 0,
            label: String(i + 1),
            ticket_type_id: 2,
            web_3d: { placement: { mode: "derived" } },
          })),
        },
      ],
    },
  ],
  tables: [
    {
      object_id: "table-demo-1",
      table_type: "round",
      x: 170,
      y: 300,
      rotation: 0,
      radius: 28,
      width: null,
      height: null,
      label: "T1",
      booking_mode: "whole_table",
      ticket_type_id: 1,
      seats: [
        { object_id: "seat-table-demo-1-1", x: 0, y: 0, rotation: 0, label: "1", ticket_type_id: null },
        { object_id: "seat-table-demo-1-2", x: 0, y: 0, rotation: 0, label: "2", ticket_type_id: null },
        { object_id: "seat-table-demo-1-3", x: 0, y: 0, rotation: 0, label: "3", ticket_type_id: null },
        { object_id: "seat-table-demo-1-4", x: 0, y: 0, rotation: 0, label: "4", ticket_type_id: null },
      ],
    },
  ],
  web_3d: {
    enabled: true,
    venue: { type: "theatre", model_type: "procedural" },
    coordinate_system: { type: "right_handed", units: "meters" },
    event_focus: { type: "stage", position: { x: 0, y: 1.0, z: -15.0 } },
    camera: { eye_height: 1.2, fov: 65 },
    procedural: {
      theatre: { stage_width: 16, stage_depth: 6, row_spacing: 0.9, seat_spacing: 0.55, tier_height: 0.35 },
    },
  },
};
