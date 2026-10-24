"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { addShipmentEvent } from "@/app/admin/actions";
import { shipmentStatusLabels } from "@/lib/utils";
import type { ShipmentStatus } from "@/types";

export function EventLogger({
  shipmentId,
  currentStatus,
}: {
  shipmentId: string;
  currentStatus: ShipmentStatus;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setDone(false);
    const form = new FormData(e.currentTarget);
    try {
      await addShipmentEvent({
        shipment_id: shipmentId,
        status: String(form.get("status") ?? "booked") as ShipmentStatus,
        location: String(form.get("location") ?? "") || null,
        note: String(form.get("note") ?? "") || null,
        occurred_at: String(form.get("occurred_at") ?? "") || null,
      });
      setDone(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log event.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      {error && (
        <p className="w-full text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}
      {done && (
        <p className="w-full text-sm text-emerald-400">
          Milestone logged and status updated.
        </p>
      )}
      <div className="w-40">
        <label className="label-base">Milestone</label>
        <select name="status" className="input-base py-2 text-sm" defaultValue={currentStatus}>
          {(Object.keys(shipmentStatusLabels) as ShipmentStatus[]).map((s) => (
            <option key={s} value={s} className="bg-navy-900">
              {shipmentStatusLabels[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="w-44">
        <label className="label-base">Location</label>
        <Input name="location" placeholder="City / hub" className="py-2 text-sm" />
      </div>
      <div className="w-48">
        <label className="label-base">Note</label>
        <Input name="note" placeholder="Optional" className="py-2 text-sm" />
      </div>
      <div className="w-44">
        <label className="label-base">Time</label>
        <Input name="occurred_at" type="datetime-local" className="py-2 text-sm" />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        <Plus className="h-3.5 w-3.5" />
        Log event
      </Button>
    </form>
  );
}
