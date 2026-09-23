export function SeatLegend() {
  const items = [
    { color: "#19A024", label: "Available" },
    { color: "#FFA500", label: "Held" },
    { color: "#DC143C", label: "Booked" },
    { color: "#555555", label: "Unavailable" },
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
