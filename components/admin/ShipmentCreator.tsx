"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createShipment } from "@/app/admin/actions";
import { generateTrackingCode } from "@/lib/utils";

export function ShipmentCreator() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await createShipment({
        tracking_code: String(form.get("tracking_code") ?? ""),
        customer_name: String(form.get("customer_name") ?? "") || null,
        origin_city: String(form.get("origin_city") ?? ""),
        destination_city: String(form.get("destination_city") ?? ""),
        estimated_delivery: String(form.get("estimated_delivery") ?? "") || null,
      });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create shipment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New shipment
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Register shipment">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            >
              {error}
            </div>
          )}
          <Input
            label="Tracking code"
            name="tracking_code"
            defaultValue={generateTrackingCode()}
            required
          />
          <Input label="Customer name" name="customer_name" placeholder="Optional" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Origin city" name="origin_city" required />
            <Input label="Destination city" name="destination_city" required />
          </div>
          <Input label="Estimated delivery" name="estimated_delivery" type="date" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              Create shipment
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
