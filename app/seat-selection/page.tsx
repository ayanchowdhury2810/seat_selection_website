"use client";

import { SeatSelectionProvider } from "@/state/seat-selection-store";
import { SeatSelectionPage } from "@/components/seat-selection/SeatSelectionPage";

export default function SeatSelectionPageRoute() {
  return (
    <SeatSelectionProvider>
      <SeatSelectionPage />
    </SeatSelectionProvider>
  );
}
