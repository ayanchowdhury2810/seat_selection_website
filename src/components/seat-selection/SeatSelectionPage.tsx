"use client";

import { useEffect, useMemo } from "react";
import { useSeatSelection } from "@/state/seat-selection-store";
import { useSeatMap } from "@/state/use-seat-map";
import { getVenueLayout } from "@/scene/venue-layout";
import { SceneCanvas } from "@/components/three/SceneCanvas";
import { SelectedSeatPanel } from "./SelectedSeatPanel";
import { SeatLegend } from "./SeatLegend";
import { SeatMapToolbar } from "./SeatMapToolbar";

interface SeatSelectionPageProps {
  eventId?: string;
  sourceUrl?: string;
}

export function SeatSelectionPage({ eventId, sourceUrl }: SeatSelectionPageProps) {
  const { selectedIds, clearSelection, closeSection } = useSeatSelection();
  const { raw, loading, error, isFallback, reload } = useSeatMap({
    eventId,
    url: sourceUrl,
  });

  const layout = useMemo(() => (raw ? getVenueLayout(raw) : null), [raw]);
  const venueId = raw?.venue_id;

  // Stale ids point at another venue's seats. Reset on venue switch.
  useEffect(() => {
    clearSelection();
    closeSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  const seatCount = useMemo(
    () => layout?.sections.reduce((sum, section) => sum + section.seatCount, 0) ?? 0,
    [layout],
  );

  if (!loading && error && !raw) {
    return (
      <div className="flex flex-col h-screen w-screen bg-black text-white items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-red-300">Seat map failed to load: {error}</p>
        <button
          onClick={reload}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading || !raw || !layout) {
    return (
      <div className="flex flex-col h-screen w-screen bg-black text-white items-center justify-center gap-3">
        <p className="text-sm text-zinc-300">Loading seat map…</p>
        <div className="h-1.5 w-48 overflow-hidden rounded bg-zinc-800">
          <div className="h-full w-1/2 animate-pulse rounded bg-zinc-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white">
      <SeatMapToolbar
        venueName={raw.venue_name}
        eventName={raw.event_name}
        sectionCount={layout.sections.length}
        seatCount={seatCount}
        isFallback={isFallback}
      />
      {isFallback && (
        <p className="bg-amber-900/60 px-6 py-1.5 text-xs text-amber-200">
          Live seat data unavailable — showing bundled layout.
        </p>
      )}
      <div className="flex flex-1 overflow-hidden h-full">
        <div className="flex-1 h-full">
          <SceneCanvas raw={raw} />
        </div>
        <div className="w-80 flex flex-col gap-4 p-4 bg-zinc-900 overflow-y-auto">
          <SeatLegend ticketTypes={layout.seatMap.ticket_types} />
          <SelectedSeatPanel selectedIds={selectedIds} layout={layout} onClear={clearSelection} />
        </div>
      </div>
    </div>
  );
}
