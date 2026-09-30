import { useMemo } from "react";
import { useSeatSelection } from "@/state/seat-selection-store";
import type { VenueLayout } from "@/scene/venue-layout";

interface SelectedSeatPanelProps {
  selectedIds: string[];
  layout: VenueLayout | null;
  onClear: () => void;
}

interface EnrichedSeat {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  color: string;
}

function parsePrice(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function SelectedSeatPanel({ selectedIds, layout, onClear }: SelectedSeatPanelProps) {
  const { deselectSeat } = useSeatSelection();

  const seats = useMemo<EnrichedSeat[]>(() => {
    if (!layout) return selectedIds.map((id) => ({ id, title: id, subtitle: "", price: 0, color: "#71717a" }));
    const ticketById = new Map(layout.seatMap.ticket_types.map((t) => [t.id, t]));
    const lookup = new Map<string, { section: string; row: string; label: string; ticketId: number | null }>();
    for (const section of layout.seatMap.sections) {
      for (const row of section.rows) {
        for (const seat of row.seats) {
          lookup.set(seat.object_id, {
            section: section.label,
            row: row.label,
            label: seat.label,
            ticketId: seat.ticket_type_id,
          });
        }
      }
    }
    for (const table of layout.seatMap.tables) {
      for (const seat of table.seats) {
        lookup.set(seat.object_id, {
          section: table.label || "Table",
          row: "",
          label: seat.label,
          ticketId: seat.ticket_type_id ?? table.ticket_type_id,
        });
      }
    }
    return selectedIds.map((id) => {
      const found = lookup.get(id);
      const ticket = found?.ticketId != null ? ticketById.get(found.ticketId) : undefined;
      const price = parsePrice(ticket?.offer_price ?? ticket?.price);
      return {
        id,
        title: found ? `${found.section}${found.row ? ` · Row ${found.row}` : ""} · Seat ${found.label}` : id,
        subtitle: ticket ? ticket.title : "General",
        price,
        color: ticket?.ticket_color ?? "#71717a",
      };
    });
  }, [selectedIds, layout]);

  const total = seats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="bg-zinc-800 rounded p-4">
      <h2 className="text-lg font-semibold mb-3">Selected Seats</h2>
      {seats.length === 0 ? (
        <p className="text-sm text-zinc-400">No seats selected</p>
      ) : (
        <>
          <ul className="flex flex-col gap-1 mb-3">
            {seats.map((seat) => (
              <li key={seat.id} className="text-sm bg-zinc-700 px-2 py-1 rounded flex justify-between items-center gap-2">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seat.color }} />
                  <span className="truncate">
                    {seat.title}
                    <span className="text-zinc-400"> · {seat.subtitle}</span>
                  </span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {seat.price > 0 && <span className="text-xs text-zinc-300">{seat.price.toFixed(2)}</span>}
                  <button
                    className="text-red-400 hover:text-red-300 text-xs"
                    onClick={() => deselectSeat(seat.id)}
                    aria-label={`Remove ${seat.title}`}
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-zinc-300 mb-3">
            Total: <span className="font-semibold text-white">{total.toFixed(2)}</span> ({seats.length} seat{seats.length === 1 ? "" : "s"})
          </p>
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
