"use client";

import { useSeatSelection } from "../../state/seat-selection-store";
import type { VenueLayout } from "@/scene/venue-layout";

interface SeatDetailsPanelProps {
  objectId?: string | null;
  layout?: VenueLayout | null;
}

interface SeatDetail {
  section: string;
  row: string;
  label: string;
  status: string;
  ticket: string;
  price: string;
}

function getSeatDetail(layout: VenueLayout | null | undefined, objectId: string | null | undefined): SeatDetail | null {
  if (!objectId || !layout) return null;
  for (const section of layout.seatMap.sections) {
    for (const row of section.rows) {
      const seat = row.seats.find((s) => s.object_id === objectId);
      if (seat) {
        const ticket = layout.seatMap.ticket_types.find((t) => t.id === seat.ticket_type_id);
        return {
          section: section.label,
          row: row.label,
          label: seat.label,
          status: seat.status ?? "AVAILABLE",
          ticket: ticket?.title ?? "General",
          price: ticket?.offer_price ?? ticket?.price ?? "—",
        };
      }
    }
  }
  return null;
}

export function SeatDetailsPanel({ objectId, layout = null }: SeatDetailsPanelProps) {
  const { isSelected } = useSeatSelection();
  const detail = getSeatDetail(layout, objectId);

  return (
    <div className="bg-zinc-800 rounded p-4">
      <h2 className="text-lg font-semibold mb-3">Seat Details</h2>
      {objectId ? (
        <div>
          <p className="text-sm">Seat: {detail ? `${detail.section} · Row ${detail.row} · ${detail.label}` : objectId}</p>
          {detail && (
            <>
              <p className="text-sm text-zinc-400">{detail.ticket} · {detail.price} · {detail.status}</p>
            </>
          )}
          <p className="text-sm">Selected: {isSelected(objectId) ? "Yes" : "No"}</p>
        </div>
      ) : (
        <p className="text-sm text-zinc-400">Hover over a seat to see details</p>
      )}
    </div>
  );
}
