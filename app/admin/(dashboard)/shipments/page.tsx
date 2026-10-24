import Link from "next/link";
import {
  createAdminSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/Card";
import { cn, formatDateTime, shipmentStatusLabels, shipmentStatusStyles } from "@/lib/utils";
import { shipmentStatusOrder } from "@/lib/workflow";
import { ShipmentCreator } from "@/components/admin/ShipmentCreator";
import { EventLogger } from "@/components/admin/EventLogger";
import { AssignShipment } from "@/components/admin/AssignShipment";
import type { Shipment, ShipmentStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Demo mode — connect the database"
        description="Shipment management activates once Supabase is configured."
      />
    );
  }

  const db = createAdminSupabaseClient();
  let query = db
    .from("shipments")
    .select("*")
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return (
      <EmptyState
        title="Something went wrong. Please try again."
        description={error.message}
      />
    );
  }

  const shipments = (data ?? []) as Shipment[];

  const filters: Array<{ value: string; label: string }> = [
    { value: "all", label: "All" },
    ...shipmentStatusOrder.map((s: ShipmentStatus) => ({
      value: s,
      label: shipmentStatusLabels[s],
    })),
    { value: "exception", label: "Exception" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Shipments</h1>
          <p className="body-muted mt-1 text-sm">
            Register shipments, assign vehicles and drivers, and log milestones customers can track.
          </p>
        </div>
        <ShipmentCreator />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/shipments" : `/admin/shipments?status=${f.value}`}
            className={cn(
              "chip cursor-pointer",
              status === f.value
                ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                : "border-navy-600 bg-navy-800 text-mist-400 hover:text-white",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {shipments.length === 0 ? (
        <EmptyState
          title={status !== "all" ? "No shipments with this status." : "No shipments yet."}
          description={
            status !== "all"
              ? "Try a different status filter."
              : "Create a shipment to generate a customer-facing tracking code, or convert a confirmed quote."
          }
        />
      ) : (
        <div className="space-y-4">
          {shipments.map((s) => (
            <div key={s.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-lg font-bold text-white">{s.tracking_code}</p>
                  <p className="text-sm text-mist-400">
                    {s.customer_name ?? "—"} · {s.origin_city} → {s.destination_city}
                    {s.quote_id && (
                      <>
                        {" · "}
                        <Link href={`/admin/quotes/${s.quote_id}`} className="text-amber-500 hover:underline">
                          from quote
                        </Link>
                      </>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-mist-500">
                    Updated {formatDateTime(s.updated_at)}
                  </p>
                </div>
                <span className={cn("chip", shipmentStatusStyles[s.status])}>
                  {shipmentStatusLabels[s.status]}
                </span>
              </div>

              <div className="mt-4 space-y-3 border-t border-navy-700 pt-4">
                <AssignShipment
                  shipmentId={s.id}
                  currentVehicleId={s.vehicle_id}
                  currentDriverId={s.driver_id}
                />
                <EventLogger shipmentId={s.id} currentStatus={s.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
