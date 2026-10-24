// ============================================================
// WORKFLOW MAPS — single source of truth for status pipelines.
// Used by the admin UI, timeline and conversion action so every
// surface renders the same milestone vocabulary.
// ============================================================

import type { QuoteStatus, ShipmentStatus, ShipmentEvent } from "@/types";

/** Quote pipeline: NEW → CONTACTED → QUOTED → CONFIRMED → (create shipment) */
export const quoteStatusOrder: QuoteStatus[] = [
  "new",
  "contacted",
  "quoted",
  "confirmed",
];

export const shipmentStatusLabels: Record<ShipmentStatus, string> = {
  booked: "Booked",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  at_destination: "At Destination",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  exception: "Exception",
};

export const shipmentStatusStyles: Record<ShipmentStatus, string> = {
  booked: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  picked_up: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  in_transit: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  at_destination: "bg-teal-500/10 text-teal-300 border-teal-500/30",
  out_for_delivery: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  delivered: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  exception: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

/**
 * Customer-facing timeline milestones (tracking page):
 * Quote Requested → Confirmed → Vehicle Assigned → In Transit →
 * At Destination → Delivered. Derived strictly from real data — a
 * milestone is shown only when the corresponding record/event exists.
 */
export const shipmentStatusOrder: ShipmentStatus[] = [
  "booked",
  "picked_up",
  "in_transit",
  "at_destination",
  "out_for_delivery",
  "delivered",
];

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  contacted: "Contacted",
  quoted: "Quoted",
  confirmed: "Confirmed",
  won: "Won",
  lost: "Lost",
};

export const quoteStatusStyles: Record<QuoteStatus, string> = {
  new: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  reviewing: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  contacted: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  quoted: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  confirmed: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  won: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  lost: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

/** Only quotes at the end of the pre-sale pipeline can convert. */
export const CONVERTIBLE_QUOTE_STATUSES: QuoteStatus[] = [
  "confirmed",
  "won",
];

export function canConvertQuote(status: QuoteStatus): boolean {
  return CONVERTIBLE_QUOTE_STATUSES.includes(status);
}

/**
 * Quote statuses that may not be reopened once the shipment exists —
 * conversion is terminal for the quote.
 */
export function assertQuoteConvertible(input: {
  status: QuoteStatus;
  existingShipmentId: string | null;
}): string | null {
  if (input.existingShipmentId) {
    return "A shipment has already been created from this quote.";
  }
  if (!canConvertQuote(input.status)) {
    return "Confirm the quote (status: Confirmed) before creating a shipment.";
  }
  return null;
}

/** Shipment status precedence — used to pick "current" milestone from events. */
export function latestStatusFromEvents(
  events: ShipmentEvent[],
): ShipmentStatus | null {
  if (events.length === 0) return null;
  const sorted = [...events].sort(
    (a, b) =>
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
  );
  return sorted[0].status;
}

export const vehicleAvailabilityLabels: Record<string, string> = {
  available: "Available",
  assigned: "Assigned",
  in_transit: "In Transit",
  maintenance: "Maintenance",
  inactive: "Inactive",
  on_request: "On request",
  unavailable: "Unavailable",
};

/** Statuses written by the ops UI (legacy showroom values excluded). */
export const vehicleOperationalStatuses = [
  "available",
  "assigned",
  "in_transit",
  "maintenance",
  "inactive",
] as const;
