interface SeatMapToolbarProps {
  venueName?: string;
  eventName?: string;
  sectionCount?: number;
  seatCount?: number;
  isFallback?: boolean;
}

export function SeatMapToolbar({
  venueName = "Seat Selection",
  eventName,
  sectionCount,
  seatCount,
  isFallback = false,
}: SeatMapToolbarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-zinc-800 border-b border-zinc-700">
      <div className="min-w-0">
        <h1 className="text-xl font-bold truncate">{venueName}</h1>
        <p className="text-xs text-zinc-400 truncate">
          {eventName ?? ""}
          {sectionCount !== undefined && seatCount !== undefined
            ? ` · ${sectionCount} sections · ${seatCount.toLocaleString()} seats`
            : ""}
          {isFallback ? " · offline layout" : ""}
        </p>
      </div>
      <div className="flex gap-3 shrink-0">
        <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
          Overview
        </button>
        <button className="px-4 py-2 bg-zinc-600 rounded hover:bg-zinc-500">
          Reset View
        </button>
      </div>
    </div>
  );
}
