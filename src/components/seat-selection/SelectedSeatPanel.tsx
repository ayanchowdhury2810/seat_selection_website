import { useSeatSelection } from "@/state/seat-selection-store";

interface SelectedSeatPanelProps {
  selectedIds: string[];
  onClear: () => void;
}

export function SelectedSeatPanel({ selectedIds, onClear }: SelectedSeatPanelProps) {
  const { toggleSeat, deselectSeat } = useSeatSelection();

  return (
    <div className="bg-zinc-800 rounded p-4">
      <h2 className="text-lg font-semibold mb-3">Selected Seats</h2>
      {selectedIds.length === 0 ? (
        <p className="text-sm text-zinc-400">No seats selected</p>
      ) : (
        <>
          <ul className="flex flex-col gap-1 mb-3">
            {selectedIds.map((id) => (
              <li key={id} className="text-sm bg-zinc-700 px-2 py-1 rounded flex justify-between items-center">
                <span>{id}</span>
                <button className="text-red-400 hover:text-red-300 text-xs" onClick={() => deselectSeat(id)}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-2 bg-green-600 rounded text-sm hover:bg-green-700">
              Select
            </button>
            <button className="flex-1 px-3 py-2 bg-red-600 rounded text-sm hover:bg-red-700" onClick={onClear}>
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  );
}
