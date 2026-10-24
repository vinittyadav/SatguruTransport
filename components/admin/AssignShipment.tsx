"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { assignShipmentResources } from "@/app/admin/actions";

export function AssignShipment({
  shipmentId,
  currentVehicleId,
  currentDriverId,
}: {
  shipmentId: string;
  currentVehicleId: string | null;
  currentDriverId: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [vehicles, setVehicles] = useState<Array<{ value: string; label: string }>>([]);
  const [drivers, setDrivers] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [vRes, dRes] = await Promise.all([
          fetch("/api/admin/vehicles", { cache: "no-store" }),
          fetch("/api/admin/drivers", { cache: "no-store" }),
        ]);
        if (cancelled) return;
        if (vRes.ok) {
          const data = await vRes.json();
          setVehicles(
            (data.vehicles ?? []).map(
              (v: { id: string; title: string; vehicle_number: string | null }) => ({
                value: v.id,
                label: v.vehicle_number ? `${v.vehicle_number} — ${v.title}` : v.title,
              }),
            ),
          );
        }
        if (dRes.ok) {
          const data = await dRes.json();
          setDrivers(
            (data.drivers ?? []).map((d: { id: string; name: string }) => ({
              value: d.id,
              label: d.name,
            })),
          );
        }
      } catch {
        // Assignment stays editable even if rosters fail to load.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        setSaved(false);
        startTransition(async () => {
          try {
            await assignShipmentResources({
              shipment_id: shipmentId,
              vehicle_id: (fd.get("vehicle_id") as string) || null,
              driver_id: (fd.get("driver_id") as string) || null,
            });
            setSaved(true);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Assignment failed.");
          }
        });
      }}
      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <Select
        label="Vehicle"
        name="vehicle_id"
        defaultValue={currentVehicleId ?? ""}
        options={[
          { value: "", label: "— Unassigned —" },
          ...vehicles,
        ]}
      />
      <Select
        label="Driver"
        name="driver_id"
        defaultValue={currentDriverId ?? ""}
        options={[
          { value: "", label: "— Unassigned —" },
          ...drivers,
        ]}
      />
      <div className="flex items-center gap-2 pb-1">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Truck className="h-3.5 w-3.5" />}
          Assign
        </Button>
        {saved && <span className="text-xs text-emerald-400">Saved</span>}
        {error && (
          <span role="alert" className="text-xs text-rose-400">
            {error}
          </span>
        )}
      </div>
    </form>
  );
}
