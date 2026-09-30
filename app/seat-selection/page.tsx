"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SeatSelectionProvider } from "@/state/seat-selection-store";
import { SeatSelectionPage } from "@/components/seat-selection/SeatSelectionPage";

function SeatSelectionRouteInner() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") ?? undefined;
  const sourceUrl = searchParams.get("source") ?? undefined;
  return (
    <SeatSelectionProvider>
      <SeatSelectionPage eventId={eventId} sourceUrl={sourceUrl} />
    </SeatSelectionProvider>
  );
}

export default function SeatSelectionPageRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-black text-sm text-zinc-300">
          Loading seat map…
        </div>
      }
    >
      <SeatSelectionRouteInner />
    </Suspense>
  );
}
