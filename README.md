# Seat Selection Website

A 3D interactive venue seat-selection web app. Built with Next.js (App Router), React Three Fiber, and Three.js.

## What this app does

The website renders a venue (currently a procedural theatre) in 3D so users can pick seats for an event. It is the web frontend of a larger seat-map system — the layout is described by a seat-map JSON file (sections, rows, seats, tables, ticket types), and the scene is built from that data.

Workflow for a user:

1. Load the venue. A procedural theatre (stage + tiered seating area) is generated.
2. Section blocks are shown as translucent panels labeled `VIP` / `Standard`. Individual seats stay hidden until a section is tapped — this keeps the initial draw-call count low for large venues.
3. Tap a section to reveal its seats. Seats are colored by ticket type (VIP green, Standard lighter green).
4. Click seats to toggle them into the selection. Hovering a seat highlights it.
5. The side panel lists selected seats. `Clear` empties the selection; each seat can be removed individually.
6. A round table (T1) renders immediately next to the sections, with seats placed around its rim.

Orbit controls give a free camera (drag to rotate, scroll to zoom).

## Features

- 3D venue built procedurally from `web_3d.procedural` config in the seat-map JSON
- Lazy section materialization — section seats load only after the section is tapped; table seats load on mount
- Seat-map JSON `x`/`y` canvas coordinates mapped into Three.js world space (`src/utils/coordinates.ts`)
- Instanced seats via `SeatInstanceManager` for performance, with per-seat color and status
- Seat selection state machine (select / deselect / toggle / clear / hover) in a React context store
- Selection rules: a seat must be selectable (`AVAILABLE`), and the per-ticket max quantity is enforced (`maxSelectionCount` is 10)
- Ticket-type colors and a static legend (Available / Held / Booked / Unavailable)
- `loadSeatMapFromFile(path)` helper ready for fetching a JSON file at runtime (currently unused)

## Tech stack

- Next.js 16 (App Router, TypeScript)
- React 19
- Three.js 0.186
- @react-three/fiber 9 + @react-three/drei 10
- Tailwind CSS 4

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Both `/` and `/seat-selection` render the same seat-selection page.

Other scripts:

```bash
npm run build
npm run lint
npm run start
npm run generate:seat-map   # see below
```

## Data model

The app consumes one seat-map JSON describing the whole venue:

```
venue_id, venue_name, event_name
canvas_width, canvas_height          # 2D canvas the x/y coordinates refer to
ticket_types[]                       # id, title, price, ticket_color, max_allowed_qty, total_quantity
sections[]                           # polygon boundary, rows -> seats
tables[]                             # round table, radius, booking_mode, seats around rim
web_3d                               # 3D scene config (enabled, venue type, camera, procedural params)
```

Seats have `x`/`y` in the canvas space and an optional `web_3d.placement`:

- `mode: "explicit"` — 3D position given directly
- `mode: "derived"` — position computed from the 2D `x`/`y`

The raw JSON goes through `src/data/seat-map-normalizer.ts` into typed domain objects (`src/domain/seat/*`). The seat map schema lives in `src/data/seat-map-schema.ts`.

### Which data file is used

- **`src/data/dummy-seat-map.ts`** — the live data source, imported by `src/components/three/SeatScene.tsx`. Content mirrors `../phase1-updated-dummy-seat-map.json` (the phase-1 hand-authored layout: VIP section, Standard section, table T1).
- `public/dummy-seat-map.json` — static copy of the same phase-1 layout, served at `/dummy-seat-map.json`. Intended for the fetch-based loader (`loadSeatMapFromFile`), not currently wired up.
- `../phase1-updated-dummy-seat-map.json` — authoring source of truth for the phase-1 layout.
- `dummy-output.json` — machine-generated example produced by `npm run generate:seat-map` (script in `scripts/generate-dummy-seat-map.ts`). Not loaded by the app; used as a reference output for the generator.

## Project structure

```
app/                        # Next.js App Router routes and root layout
  page.tsx                  # "/" - seat selection
  seat-selection/page.tsx   # "/seat-selection" - same seat selection
src/
  components/
    seat-selection/         # page-level UI: toolbar, legend, selected-seats panel
    three/                  # R3F scene: SceneCanvas (camera/controls), SeatScene
  data/                     # raw seat-map schema, normalizer, loader, dummy data
  domain/
    seat/                   # seat status/slection/rules and types
    venue/                  # venue types, focus, rules
  scene/
    camera/                 # overview / POV / camera controller abstractions
    interaction/            # seat + section raycasters
    procedural/             # theatre, stadium, arena, generic venue generators
    seats/                  # instanced seat manager + materials
    sections/               # section renderer (boundary -> world geometry)
  state/                    # seat-selection store (React context + reducer)
  utils/                    # coordinates (JSON canvas -> world), colors, geometry, ids
scripts/
  generate-dummy-seat-map.ts  # dummy seat-map generator (writes dummy-output.json)
```

## Status and limitations

- Uses static dummy data; no backend / API calls yet. The runtime JSON loader (`loadSeatMapFromFile`) is implemented but uncalled.
- Layout uses only a subset of the schema: theatre venue + `sections` (polygon rows) + `tables` render. Stadium / arena generators exist in `src/scene/procedural/` but are not wired into the current scene.
- Toolbar buttons (`Overview`, `Reset View`) and `Select` are UI placeholders. Camera animation (POV seat view) has a stub `CameraController`; hover highlight on seats is not yet displayed visually.
- Seat statuses are normalized to `AVAILABLE` by `seat-map-normalizer.ts`; booking/held states depend on future backend data.