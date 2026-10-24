import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  cn,
  formatDateTime,
  shipmentStatusLabels,
  shipmentStatusStyles,
} from "@/lib/utils";
import type { Shipment } from "@/types";

/**
 * Compact shipment card for the customer portal — same visual language as
 * the tracking result card, sized for lists. Every value comes from the
 * database row; nothing is invented.
 */
export function ShipmentCard({ shipment }: { shipment: Shipment }) {
  return (
    <Link
      href={`/tracking?code=${encodeURIComponent(shipment.tracking_code)}`}
      className="card card-interactive block p-0"
    >
      <div className="flex items-center justify-between gap-3 border-b border-navy-700 px-5 py-4">
        <p className="font-mono text-base font-bold tracking-wide text-white">
          {shipment.tracking_code}
        </p>
        <span className={cn("chip", shipmentStatusStyles[shipment.status])}>
          {shipmentStatusLabels[shipment.status]}
        </span>
      </div>

      <div className="flex items-center gap-3 px-5 py-4">
        <div className="min-w-0 text-right">
          <p className="truncate text-sm font-semibold text-white">
            {shipment.origin_city}
          </p>
        </div>
        <div className="relative h-px flex-1 bg-navy-600">
          <span className="absolute left-0 top-0 h-px w-1/2 bg-amber-500/80" />
          <ArrowRight className="absolute -right-1.5 -top-[7px] h-3.5 w-3.5 bg-navy-850 text-amber-500" />
        </div>
        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-semibold text-white">
            {shipment.destination_city}
          </p>
        </div>
      </div>

      <p className="border-t border-navy-700 px-5 py-3 text-xs text-mist-500">
        Last updated {formatDateTime(shipment.updated_at)}
      </p>
    </Link>
  );
}
