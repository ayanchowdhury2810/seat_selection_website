import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";
import type { TicketType } from "@/domain/seat/seat-types";

interface SeatSelectionState {
  selectedIds: string[];
  hoveredId: string | null;
  materializedSectionIds: string[];
}

type SeatAction =
  | { type: "SELECT"; payload: string }
  | { type: "DESELECT"; payload: string }
  | { type: "TOGGLE"; payload: string }
  | { type: "CLEAR" }
  | { type: "SET_HOVER"; payload: string | null }
  | { type: "OPEN_SECTION"; payload: string };

function seatReducer(state: SeatSelectionState, action: SeatAction): SeatSelectionState {
  switch (action.type) {
    case "SELECT":
      if (state.selectedIds.includes(action.payload)) return state;
      return { ...state, selectedIds: [...state.selectedIds, action.payload] };
    case "DESELECT":
      return {
        ...state,
        selectedIds: state.selectedIds.filter((id) => id !== action.payload),
      };
    case "TOGGLE": {
      const selected = state.selectedIds;
      if (selected.includes(action.payload)) {
        return { ...state, selectedIds: selected.filter((id) => id !== action.payload) };
      }
      return { ...state, selectedIds: [...selected, action.payload] };
    }
    case "CLEAR":
      return { ...state, selectedIds: [] };
    case "SET_HOVER":
      return { ...state, hoveredId: action.payload };
    case "OPEN_SECTION": {
      if (state.materializedSectionIds.includes(action.payload)) return state;
      return {
        ...state,
        materializedSectionIds: [...state.materializedSectionIds, action.payload],
      };
    }
    default:
      return state;
  }
}

interface SeatSelectionContextType extends SeatSelectionState {
  dispatch: React.Dispatch<SeatAction>;
  selectSeat: (id: string) => void;
  deselectSeat: (id: string) => void;
  toggleSeat: (id: string) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;
  openSection: (id: string) => void;
  isSelected: (id: string) => boolean;
  isSectionMaterialized: (id: string) => boolean;
  maxSelectionCount: number;
}

const SeatSelectionContext = createContext<SeatSelectionContextType | null>(null);

export function SeatSelectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(seatReducer, {
    selectedIds: [],
    hoveredId: null,
    materializedSectionIds: [],
  });

  const selectSeat = useCallback((id: string) => dispatch({ type: "SELECT", payload: id }), []);
  const deselectSeat = useCallback((id: string) => dispatch({ type: "DESELECT", payload: id }), []);
  const toggleSeat = useCallback((id: string) => dispatch({ type: "TOGGLE", payload: id }), []);
  const clearSelection = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const setHovered = useCallback((id: string | null) => dispatch({ type: "SET_HOVER", payload: id }), []);
  const openSection = useCallback(
    (id: string) => dispatch({ type: "OPEN_SECTION", payload: id }),
    []
  );

  return (
    <SeatSelectionContext.Provider
      value={{
        ...state,
        dispatch,
        selectSeat,
        deselectSeat,
        toggleSeat,
        clearSelection,
        setHovered,
        openSection,
        isSelected: (id: string) => state.selectedIds.includes(id),
        isSectionMaterialized: (id: string) => state.materializedSectionIds.includes(id),
        maxSelectionCount: 10,
      }}
    >
      {children}
    </SeatSelectionContext.Provider>
  );
}

export function useSeatSelection(): SeatSelectionContextType {
  const ctx = useContext(SeatSelectionContext);
  if (!ctx) throw new Error("useSeatSelection must be used within SeatSelectionProvider");
  return ctx;
}
