import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const SEED = {
  venue_id: "generated-theatre",
  venue_name: "Generated Theatre",
  event_name: "Generated Event",
  canvas_width: 1200,
  canvas_height: 800,
  ticket_types: [
    { id: 1, title: "VIP", price: "100.00", offer_price: null, ticket_color: "#19A024", max_allowed_qty: 10, total_quantity: 500 },
    { id: 2, title: "Standard", price: "50.00", offer_price: null, ticket_color: "#7DDC86", max_allowed_qty: 10, total_quantity: 1000 },
  ],
};

function generateSeatMap(opts: {
  venue: string;
  sections: number;
  rows: number;
  seatsPerRow: number;
}): object {
  const { venue, sections, rows, seatsPerRow } = opts;
  const sectionList = [];

  for (let s = 0; s < sections; s++) {
    const rowList = [];
    for (let r = 0; r < rows; r++) {
      const seatList = [];
      for (let i = 0; i < seatsPerRow; i++) {
        const seatId = `seat-${s}-${r}-${i}`;
        seatList.push({
          object_id: seatId,
          x: 300 + i * 0.55,
          y: 200 + r * 0.9,
          rotation: 0,
          label: String(i + 1),
          ticket_type_id: s === 0 ? 1 : 2,
          web_3d: { placement: { mode: "derived" } },
        });
      }
      rowList.push({ id: `row-${s}-${r}`, label: String.fromCharCode(65 + r), seats: seatList });
    }
    sectionList.push({
      id: `section-${s}`,
      label: `Section ${s}`,
      boundary: [{ x: 200, y: 100 }, { x: 1000, y: 100 }, { x: 1000, y: 300 }, { x: 200, y: 300 }],
      entrance: null,
      rows: rowList,
    });
  }

  return {
    ...SEED,
    canvas_width: sections * 200,
    canvas_height: rows * 200,
    sections: sectionList,
    web_3d: {
      enabled: true,
      venue: { type: venue === "stadium" ? "stadium" : "theatre", model_type: "procedural" },
      coordinate_system: { type: "right_handed", units: "meters" },
      event_focus: { type: venue === "stadium" ? "field" : "stage", position: { x: 0, y: 1, z: -15 } },
      camera: { eye_height: 1.2, fov: 65 },
      procedural: venue === "stadium"
        ? { stadium: { field_width: 80, field_depth: 60, tier_radius: 80, tier_height: 5, row_spacing: 1.5, aisle_width: 5 } }
        : { theatre: { stage_width: 16, stage_depth: 6, row_spacing: 0.9, seat_spacing: 0.55, tier_height: 0.35 } },
    },
  };
}

const args = process.argv.slice(2);
const flags: Record<string, string> = {};
for (let i = 0; i < args.length; i += 2) {
  flags[args[i].replace(/^--/, "")] = args[i + 1] ?? "true";
}

const venue = flags.venue ?? "theatre";
const sections = parseInt(flags.sections ?? "4");
const rows = parseInt(flags.rows ?? "8");
const seatsPerRow = parseInt(flags["seats-per-row"] ?? "20");

const result = generateSeatMap({ venue, sections, rows, seatsPerRow });
const outputPath = path.join(process.cwd(), "dummy-output.json");
writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`Generated ${sections * rows * seatsPerRow} seats -> ${outputPath}`);
