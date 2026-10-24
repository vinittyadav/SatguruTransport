"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  AlertTriangle,
  ClipboardCheck,
  CalendarCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  cn,
  formatDate,
  formatDateTime,
  shipmentStatusLabels,
  shipmentStatusStyles,
} from "@/lib/utils";
import type { Shipment, ShipmentEvent, ShipmentStatus } from "@/types";

const statusIcons: Record<ShipmentStatus, LucideIcon> = {
  booked: Package,
  picked_up: Package,
  in_transit: Truck,
  at_destination: MapPin,
  out_for_delivery: MapPin,
  delivered: CheckCircle2,
  exception: AlertTriangle,
};

interface Milestone {
  key: string;
  label: string;
  icon: LucideIcon;
  done: boolean;
  timestamp: string | null;
  detail: string | null;
}

/**
 * Customer-facing milestone timeline. Names are fixed:
 * Quote Requested → Confirmed → Vehicle Assigned → In Transit →
 * At Destination → Delivered. Every milestone is derived from REAL data:
 * - Quote Requested: the linked quote's creation (if this shipment came from one)
 * - Confirmed: the "booked" event
 * - Vehicle Assigned: a vehicle_id on the shipment
 * - In Transit: the "in_transit" event
 * - At Destination: the "at_destination" event
 * - Delivered: the "delivered" event
 * No milestone is ever fabricated with estimated times.
 */
export function ShipmentTimeline({
  shipment,
  events,
  quoteCreatedAt,
  vehicle,
}: {
  shipment: Shipment;
  events: ShipmentEvent[];
  quoteCreatedAt?: string | null;
  vehicle?: { title: string; category: string } | null;
}) {
  const eventBy = (status: ShipmentStatus): ShipmentEvent | undefined =>
    [...events]
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
      .find((e) => e.status === status);

  const bookedEvent = eventBy("booked");
  const pickedUpEvent = eventBy("picked_up");
  const transitEvent = eventBy("in_transit");
  const destinationEvent = eventBy("at_destination");
  const deliveredEvent = eventBy("delivered");

  const milestones: Milestone[] = [
    {
      key: "quote_requested",
      label: "Quote Requested",
      icon: Clock,
      done: true, // a shipment exists — the quote (if any) was necessarily requested
      timestamp: quoteCreatedAt ?? null,
      detail: null,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      icon: CalendarCheck,
      done: Boolean(bookedEvent || pickedUpEvent),
      timestamp: bookedEvent?.occurred_at ?? null,
      detail: bookedEvent?.location ?? null,
    },
    {
      key: "vehicle_assigned",
      label: "Vehicle Assigned",
      icon: Truck,
      done: Boolean(shipment.vehicle_id || pickedUpEvent),
      timestamp: pickedUpEvent?.occurred_at ?? null,
      detail: null,
    },
    {
      key: "in_transit",
      label: "In Transit",
      icon: Truck,
      done: Boolean(transitEvent),
      timestamp: transitEvent?.occurred_at ?? null,
      detail: transitEvent?.location ?? null,
    },
    {
      key: "at_destination",
      label: "At Destination",
      icon: MapPin,
      done: Boolean(destinationEvent || deliveredEvent),
      timestamp: destinationEvent?.occurred_at ?? null,
      detail: destinationEvent?.location ?? null,
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: CheckCircle2,
      done: Boolean(deliveredEvent),
      timestamp: deliveredEvent?.occurred_at ?? null,
      detail: deliveredEvent?.location ?? null,
    },
  ];

  const currentMilestone = [...milestones].reverse().find((m) => m.done);
  const isDelivered = Boolean(deliveredEvent);
  const hasException = shipment.status === "exception";

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* ===== Premium shipment card ===== */}
      <div className="card relative overflow-hidden border-amber-500/20 bg-navy-850 p-0">
        {/* Header strip: code + status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-700 px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-mist-500">
              Shipment Number
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-wide text-white">
              {shipment.tracking_code}
            </p>
          </div>
          <span
            className={cn(
              "chip px-3.5 py-1.5 text-sm",
              hasException ? shipmentStatusStyles.exception : shipmentStatusStyles[shipment.status],
            )}
          >
            {hasException ? shipmentStatusLabels.exception : shipmentStatusLabels[shipment.status]}
          </span>
        </div>

        {/* Route strip: Pickup ────────► Destination */}
        <div className="flex items-center gap-4 px-6 py-6">
          <div className="min-w-0 text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-mist-500">Pickup</p>
            <p className="mt-1 truncate font-semibold text-white">{shipment.origin_city}</p>
          </div>
          <div className="relative h-px flex-1 bg-navy-600">
            {/* Progress fill: amber up to the current milestone's stage */}
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isDelivered ? 1 : currentMilestone ? 0.55 : 0.2 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
              className="absolute left-0 top-0 h-px w-full origin-left bg-amber-500"
              style={{ opacity: hasException ? 0.4 : 1 }}
            />
            <ArrowRight className="absolute -right-1.5 -top-[7px] h-3.5 w-3.5 bg-navy-850 text-amber-500" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-[10px] uppercase tracking-[0.2em] text-mist-500">Destination</p>
            <p className="mt-1 truncate font-semibold text-white">{shipment.destination_city}</p>
          </div>
        </div>

        {/* Milestone track — mobile: vertical; sm+: horizontal */}
        <div className="px-6 pb-6">
          {/* Horizontal (sm and up) */}
          <div className="hidden sm:block">
            <div className="flex items-start">
              {milestones.map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={m.key} className={cn("flex items-start", i < milestones.length - 1 && "flex-1")}>
                    <div className="flex flex-col items-center text-center">
                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full border",
                          m.done
                            ? "border-amber-500 bg-amber-500 text-navy-950"
                            : "border-navy-600 bg-navy-850 text-mist-500",
                        )}
                        aria-current={currentMilestone?.key === m.key ? "step" : undefined}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span
                        className={cn(
                          "mt-2 w-20 text-[10px] font-medium uppercase leading-tight tracking-wider",
                          m.done ? "text-mist-200" : "text-mist-500",
                        )}
                      >
                        {m.label}
                      </span>
                      {m.timestamp ? (
                        <span className="mt-0.5 text-[10px] text-mist-500">
                          {formatDateTime(m.timestamp)}
                        </span>
                      ) : null}
                    </div>
                    {i < milestones.length - 1 && (
                      <div
                        className={cn(
                          "mx-1 mt-[18px] h-0.5 flex-1",
                          m.done ? "bg-amber-500" : "bg-navy-600",
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical (mobile) */}
          <ol className="space-y-4 sm:hidden">
            {milestones.map((m) => {
              const Icon = m.icon;
              return (
                <li key={m.key} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                      m.done
                        ? "border-amber-500 bg-amber-500 text-navy-950"
                        : "border-navy-600 bg-navy-850 text-mist-500",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-medium", m.done ? "text-white" : "text-mist-500")}>
                      {m.label}
                    </p>
                    {m.timestamp && (
                      <p className="text-xs text-mist-500">{formatDateTime(m.timestamp)}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Meta: Pickup / Destination / Estimated Delivery / Vehicle / Last updated */}
        <dl className="grid gap-4 border-t border-navy-700 px-6 py-5 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-mist-500">Estimated Delivery</dt>
            <dd className="mt-0.5 font-medium text-white">
              {shipment.estimated_delivery ? formatDate(shipment.estimated_delivery) : "To be updated"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-mist-500">Vehicle</dt>
            <dd className="mt-0.5 font-medium text-white">
              {vehicle ? vehicle.title : "To be assigned"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-mist-500">Current location</dt>
            <dd className="mt-0.5 font-medium text-white">
              {hasException ? shipmentStatusLabels.exception : (shipment.current_location ?? "—")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-mist-500">Last Updated</dt>
            <dd className="mt-0.5 font-medium text-white">{formatDateTime(shipment.updated_at)}</dd>
          </div>
        </dl>

        {hasException && (
          <p className="mx-6 mb-6 rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            This shipment has an exception flagged. Our team is actively working on it — contact
            us with your tracking code for details.
          </p>
        )}
      </div>

      {/* Event history */}
      <div className="card">
        <h4 className="mb-5 font-semibold text-white">Shipment history</h4>
        {sortedEvents.length === 0 ? (
          <p className="body-muted text-sm">No milestone events recorded yet.</p>
        ) : (
          <ol className="relative space-y-6 border-l border-navy-600 pl-6">
            {sortedEvents.map((event, i) => {
              const Icon = statusIcons[event.status] ?? ClipboardCheck;
              return (
                <motion.li
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="relative"
                >
                  <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border border-navy-600 bg-navy-850">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  </span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium text-white">
                      {shipmentStatusLabels[event.status]}
                    </span>
                    {event.location && (
                      <span className="text-sm text-mist-400">· {event.location}</span>
                    )}
                  </div>
                  {event.note && <p className="mt-1 text-sm text-mist-400">{event.note}</p>}
                  <p className="mt-1 text-xs text-mist-500">{formatDateTime(event.occurred_at)}</p>
                </motion.li>
              );
            })}
          </ol>
        )}
      </div>
    </motion.div>
  );
}
