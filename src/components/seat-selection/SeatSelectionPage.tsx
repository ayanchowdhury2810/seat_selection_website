import { useSeatSelection } from "@/state/seat-selection-store";
import { SceneCanvas } from "@/components/three/SceneCanvas";
import { SelectedSeatPanel } from "./SelectedSeatPanel";
import { SeatLegend } from "./SeatLegend";
import { SeatMapToolbar } from "./SeatMapToolbar";

export function SeatSelectionPage() {
  const selectedIds = useSeatSelection().selectedIds;
  const clearSelection = useSeatSelection().clearSelection;

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white">
      <SeatMapToolbar />
      <div className="flex flex-1 overflow-hidden h-full">
        <div className="flex-1 h-full">
          <SceneCanvas />
        </div>
        <div className="w-80 flex flex-col gap-4 p-4 bg-zinc-900 overflow-y-auto">
          <SeatLegend />
          <SelectedSeatPanel selectedIds={selectedIds} onClear={clearSelection} />
        </div>
      </div>
    </div>
  );
}
