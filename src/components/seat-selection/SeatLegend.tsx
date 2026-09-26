import {
  HOVER_SEAT_COLOR,
  SELECTED_SEAT_COLOR,
  STATUS_COLORS,
} from "@/utils/colors";

export function SeatLegend() {
  const items = [
    { color: STATUS_COLORS.AVAILABLE, label: "Available" },
    { color: SELECTED_SEAT_COLOR, label: "Selected" },
    { color: HOVER_SEAT_COLOR, label: "Hovered" },
    { color: STATUS_COLORS.HELD, label: "Held" },
    { color: STATUS_COLORS.BOOKED, label: "Booked" },
    { color: STATUS_COLORS.UNAVAILABLE, label: "Unavailable" },
  ];

  return (
    <div className="bg-zinc-800 rounded p-4">
      <h2 className="text-lg font-semibold mb-3">Legend</h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
