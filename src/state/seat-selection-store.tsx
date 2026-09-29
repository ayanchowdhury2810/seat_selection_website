import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";

export interface PendingSeat {
  objectId: string;
  /** Modal anchor, pixels relative to canvas container. */
  screenX: number;
  screenY: number;
  /** Seat box center in world space. */
  worldX: number;
  worldY: number;
  worldZ: number;
  status?: string;
}

export interface PovSeat {
  objectId: string;
  worldX: number;
  worldY: number;
  worldZ: number;
}

interface SeatSelectionState {
  selectedIds: string[];
  hoveredId: string | null;
  /** The one section whose individual seats are rendered. */
  activeSectionId: string | null;
  /** Seat clicked but not yet confirmed; modal open. */
  pendingSeat: PendingSeat | null;
  /** Seat whose point of view camera is showing. */
  povSeat: PovSeat | null;
}

type SeatAction =
  | { type: "SELECT"; payload: string }
  | { type: "DESELECT"; payload: string }
  | { type: "TOGGLE"; payload: string }
  | { type: "CLEAR" }
  | { type: "SET_HOVER"; payload: string | null }
  | { type: "SET_ACTIVE_SECTION"; payload: string | null }
  | { type: "SET_PENDING_SEAT"; payload: PendingSeat | null }
  | { type: "SET_POV_SEAT"; payload: PovSeat | null };

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
      if (state.hoveredId === action.payload) return state;
      return { ...state, hoveredId: action.payload };
    case "SET_ACTIVE_SECTION":
      if (state.activeSectionId === action.payload) return state;
      return { ...state, activeSectionId: action.payload };
    case "SET_PENDING_SEAT":
      if (state.pendingSeat?.objectId === action.payload?.objectId && action.payload !== null) return state;
      return { ...state, pendingSeat: action.payload };
    case "SET_POV_SEAT":
      if (state.povSeat?.objectId === action.payload?.objectId && action.payload !== null) return state;
      return { ...state, povSeat: action.payload };
    default:
      return state;
  }
}

interface SeatSelectionContextType extends SeatSelectionState {
  selectSeat: (id: string) => void;
  deselectSeat: (id: string) => void;
  toggleSeat: (id: string) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;
  /** Opens a section, or closes it when it is already the open one. */
  openSection: (id: string) => void;
  closeSection: () => void;
  openSeatModal: (seat: PendingSeat) => void;
  closeSeatModal: () => void;
  /** Moves pending seat into POV mode and closes modal. */
  viewSeatPov: () => void;
  exitPov: () => void;
  isSelected: (id: string) => boolean;
  isSectionActive: (id: string) => boolean;
}

const SeatSelectionContext = createContext<SeatSelectionContextType | null>(null);

export function SeatSelectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(seatReducer, {
    selectedIds: [],
    hoveredId: null,
    activeSectionId: null,
    pendingSeat: null,
    povSeat: null,
  });

  const selectSeat = useCallback((id: string) => dispatch({ type: "SELECT", payload: id }), []);
  const deselectSeat = useCallback((id: string) => dispatch({ type: "DESELECT", payload: id }), []);
  const toggleSeat = useCallback((id: string) => dispatch({ type: "TOGGLE", payload: id }), []);
  const clearSelection = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const setHovered = useCallback(
    (id: string | null) => dispatch({ type: "SET_HOVER", payload: id }),
    []
  );
  const closeSection = useCallback(
    () => {
      dispatch({ type: "SET_ACTIVE_SECTION", payload: null });
      dispatch({ type: "SET_PENDING_SEAT", payload: null });
      dispatch({ type: "SET_POV_SEAT", payload: null });
    },
    []
  );
  const openSection = useCallback(
    (id: string) => {
      dispatch({ type: "SET_PENDING_SEAT", payload: null });
      dispatch({ type: "SET_POV_SEAT", payload: null });
      dispatch({
        type: "SET_ACTIVE_SECTION",
        payload: state.activeSectionId === id ? null : id,
      });
    },
    [state.activeSectionId]
  );
  const openSeatModal = useCallback(
    (seat: PendingSeat) => {
      dispatch({ type: "SET_POV_SEAT", payload: null });
      dispatch({ type: "SET_PENDING_SEAT", payload: seat });
    },
    []
  );
  const closeSeatModal = useCallback(
    () => dispatch({ type: "SET_PENDING_SEAT", payload: null }),
    []
  );
  const viewSeatPov = useCallback(() => {
    if (!state.pendingSeat) return;
    const { objectId, worldX, worldY, worldZ } = state.pendingSeat;
    dispatch({ type: "SET_PENDING_SEAT", payload: null });
    dispatch({ type: "SET_POV_SEAT", payload: { objectId, worldX, worldY, worldZ } });
  }, [state.pendingSeat]);
  const exitPov = useCallback(
    () => dispatch({ type: "SET_POV_SEAT", payload: null }),
    []
  );

  return (
    <SeatSelectionContext.Provider
      value={{
        ...state,
        selectSeat,
        deselectSeat,
        toggleSeat,
        clearSelection,
        setHovered,
        openSection,
        closeSection,
        openSeatModal,
        closeSeatModal,
        viewSeatPov,
        exitPov,
        isSelected: (id: string) => state.selectedIds.includes(id),
        isSectionActive: (id: string) => state.activeSectionId === id,
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
