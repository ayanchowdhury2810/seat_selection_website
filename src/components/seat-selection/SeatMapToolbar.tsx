export function SeatMapToolbar() {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-zinc-800 border-b border-zinc-700">
      <h1 className="text-xl font-bold">Seat Selection</h1>
      <div className="flex gap-3">
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
