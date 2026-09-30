import {
  HOVER_SEAT_COLOR,
  SELECTED_SEAT_COLOR,
  STATUS_COLORS,
} from "@/utils/colors";
import type { TicketType } from "@/domain/seat/seat-types";

interface SeatLegendProps {
  ticketTypes?: TicketType[];
}

export function SeatLegend({ ticketTypes = [] }: SeatLegendProps) {
  const statusItems = [
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
      {ticketTypes.length > 0 && (
        <>
          <p className="text-xs uppercase tracking-wide text-zinc-400 mb-2">Ticket types</p>
          <div className="flex flex-col gap-2 mb-4">
            {ticketTypes.map((ticket) => (
              <div key={ticket.id} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: ticket.ticket_color }} />
                <span className="text-sm flex-1 truncate">{ticket.title}</span>
                <span className="text-xs text-zinc-400">
                  {ticket.offer_price ?? ticket.price}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="text-xs uppercase tracking-wide text-zinc-400 mb-2">Status</p>
      <div className="flex flex-col gap-2">
        {statusItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
