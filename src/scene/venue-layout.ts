import type { RawSeatMap } from "@/data/seat-map-schema";
import { normalizeSeatMap } from "@/data/seat-map-normalizer";
import type { SeatMap, SeatStatus } from "@/domain/seat/seat-types";
import {
  createSeatMapProjection,
  getProjectionBounds,
  projectSeatToWorld,
  type SeatMapProjection,
  type WorldBounds,
} from "@/utils/coordinates";
import { computeConvexHull, expandPolygon, polygonCentroid } from "@/utils/geometry";

const FALLBACK_SEAT_COLOR = "#94a3b8";

export interface SeatPlacement {
  objectId: string;
  /** World position on the venue floor. */
  x: number;
  z: number;
  color: string;
  status: SeatStatus | undefined;
}

export interface SectionLayout {
  id: string;
  label: string;
  /** Ticket type most seats in this section use. */
  ticketTypeId: number | null;
  tierIndex: number;
  tierName: string;
  color: string;
  /** Height of the section deck above the floor. */
  elevation: number;
  /** Section outline in world space, counter-clockwise. */
  outline: { x: number; z: number }[];
  center: { x: number; z: number };
  radius: number;
  seatCount: number;
  seats: SeatPlacement[];
}

export interface VenueLayout {
  seatMap: SeatMap;
  projection: SeatMapProjection;
  bounds: WorldBounds;
  sections: SectionLayout[];
  sectionsById: Map<string, SectionLayout>;
  seatSpacing: number;
  tierHeight: number;
  /** Edge length of a single seat box, kept below the pitch so seats stay readable. */
  seatBoxSize: number;
  /** Height of one section deck slab. */
  deckHeight: number;
}

interface VenueStyle {
  seatSpacing: number;
  tierHeight: number;
}

function readVenueStyle(seatMap: SeatMap): VenueStyle {
  const web3d = (seatMap.web_3d ?? {}) as {
    procedural?: {
      arena?: { seat_spacing?: number; tier_height?: number };
      theatre?: { seat_spacing?: number; tier_height?: number };
    };
  };
  const arena = web3d.procedural?.arena;
  const theatre = web3d.procedural?.theatre;
  return {
    seatSpacing: arena?.seat_spacing ?? theatre?.seat_spacing ?? 0.55,
    tierHeight: arena?.tier_height ?? theatre?.tier_height ?? 0.4,
  };
}

function buildVenueLayout(raw: RawSeatMap): VenueLayout {
  const seatMap = normalizeSeatMap(raw);
  const style = readVenueStyle(seatMap);
  const projection = createSeatMapProjection(seatMap, style.seatSpacing);
  const bounds = getProjectionBounds(projection);

  const ticketColors = new Map<number, string>();
  const ticketNames = new Map<number, string>();
  for (const ticket of seatMap.ticket_types) {
    ticketColors.set(ticket.id, ticket.ticket_color);
    ticketNames.set(ticket.id, ticket.title);
  }

  type Draft = {
    id: string;
    label: string;
    ticketTypeId: number | null;
    color: string;
    outline: { x: number; z: number }[];
    center: { x: number; z: number };
    radius: number;
    seats: SeatPlacement[];
  };

  const drafts: Draft[] = [];
  const ticketRadius = new Map<number, number>();

  for (const section of seatMap.sections) {
    const points: { x: number; z: number }[] = [];
    const seats: SeatPlacement[] = [];
    const ticketCounts = new Map<number, number>();

    for (const row of section.rows) {
      for (const seat of row.seats) {
        const world = projectSeatToWorld(seat.x, seat.y, projection);
        points.push(world);
        seats.push({
          objectId: seat.object_id,
          x: world.x,
          z: world.z,
          color: ticketColors.get(seat.ticket_type_id ?? -1) ?? FALLBACK_SEAT_COLOR,
          status: seat.status,
        });
        const ticketId = seat.ticket_type_id ?? -1;
        ticketCounts.set(ticketId, (ticketCounts.get(ticketId) ?? 0) + 1);
      }
    }

    let ticketTypeId: number | null = null;
    let bestCount = -1;
    for (const [id, count] of ticketCounts) {
      if (count > bestCount) {
        bestCount = count;
        ticketTypeId = id === -1 ? null : id;
      }
    }

    // Hull helpers work in 2D, so the floor plane is treated as (x, z).
    const flat = points.map((p) => ({ x: p.x, y: p.z }));
    const padded = expandPolygon(computeConvexHull(flat), style.seatSpacing * 1.4);
    const centroid = polygonCentroid(flat);
    const outline = padded.map((p) => ({ x: p.x, z: p.y }));
    const radius = Math.max(
      ...flat.map((p) => Math.hypot(p.x - centroid.x, p.y - centroid.y)),
      0.001
    );

    const id = ticketTypeId ?? -1;
    ticketRadius.set(id, (ticketRadius.get(id) ?? 0) + radius * Math.max(seats.length, 1));

    drafts.push({
      id: section.id,
      label: section.label,
      ticketTypeId,
      color: (ticketTypeId !== null ? ticketColors.get(ticketTypeId) : undefined) ?? FALLBACK_SEAT_COLOR,
      outline,
      center: { x: centroid.x, z: centroid.y },
      radius,
      seats,
    });
  }

  // Tier order comes from how far each ticket type sits from the ring, so the bowl
  // rises outwards no matter how the source data orders its ticket types.
  const tierByTicket = new Map<number, number>();
  [...ticketRadius.entries()]
    .sort((a, b) => a[1] - b[1])
    .forEach(([ticketId], index) => tierByTicket.set(ticketId, index));

  const sections: SectionLayout[] = drafts.map((draft) => {
    const tierIndex = tierByTicket.get(draft.ticketTypeId ?? -1) ?? 0;
    return {
      ...draft,
      tierIndex,
      tierName: (draft.ticketTypeId !== null ? ticketNames.get(draft.ticketTypeId) : undefined) ?? "General",
      elevation: tierIndex * style.tierHeight,
      seatCount: draft.seats.length,
    };
  });

  return {
    seatMap,
    projection,
    bounds,
    sections,
    sectionsById: new Map(sections.map((section) => [section.id, section])),
    seatSpacing: style.seatSpacing,
    tierHeight: style.tierHeight,
    seatBoxSize: style.seatSpacing * 0.62,
    deckHeight: style.tierHeight * 0.7,
  };
}

let cached: { raw: RawSeatMap; layout: VenueLayout } | null = null;

/**
 * Single source of truth for everything the 3D scene needs.
 * Cached per raw seat map, so the canvas and the scene share one computation.
 */
export function getVenueLayout(raw: RawSeatMap): VenueLayout {
  if (cached && cached.raw === raw) return cached.layout;
  const layout = buildVenueLayout(raw);
  cached = { raw, layout };
  return layout;
}
