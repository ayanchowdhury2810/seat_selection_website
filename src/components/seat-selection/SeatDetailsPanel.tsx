"use client";

import { useSeatSelection } from "../../state/seat-selection-store";

interface SeatDetailsPanelProps {
  objectId?: string | null;
}

export function SeatDetailsPanel({ objectId }: SeatDetailsPanelProps) {
  const { isSelected } = useSeatSelection();

  return (
    <div className="bg-zinc-800 rounded p-4">
      <h2 className="text-lg font-semibold mb-3">Seat Details</h2>
      {objectId ? (
        <div>
          <p className="text-sm">Seat: {objectId}</p>
          <p className="text-sm">Selected: {isSelected(objectId) ? "Yes" : "No"}</p>
        </div>
      ) : (
        <p className="text-sm text-zinc-400">Hover over a seat to see details</p>
      )}
    </div>
  );
}
