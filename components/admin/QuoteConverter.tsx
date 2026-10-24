"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { convertQuoteToShipment } from "@/app/admin/actions";
import { canConvertQuote } from "@/lib/workflow";
import type { QuoteStatus } from "@/types";

export function QuoteConverter({
  quoteId,
  quoteStatus,
  originCity,
  destinationCity,
  preferredDate,
}: {
  quoteId: string;
  quoteStatus: QuoteStatus;
  originCity: string;
  destinationCity: string;
  preferredDate: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Array<{ value: string; label: string }>>([]);
  const [drivers, setDrivers] = useState<Array<{ value: string; label: string }>>([]);
  const [loaded, setLoaded] = useState(false);

  async function openDialog() {
    setOpen(true);
    setError(null);
    if (loaded) return;
    try {
      // Roster options are fetched fresh each open via a server action-fed
      // API: reuse the quotes list API is wrong; use lightweight fetches of
      // the admin data through a small server action pair.
      const [vRes, dRes] = await Promise.all([
        fetch("/api/admin/vehicles", { cache: "no-store" }),
        fetch("/api/admin/drivers", { cache: "no-store" }),
      ]);
      if (vRes.ok) {
        const data = await vRes.json();
        setVehicles(
          (data.vehicles ?? []).map((v: { id: string; title: string; vehicle_number: string | null }) => ({
            value: v.id,
            label: v.vehicle_number ? `${v.vehicle_number} — ${v.title}` : v.title,
          })),
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
      // Selections remain optional — conversion still works without rosters.
    } finally {
      setLoaded(true);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await convertQuoteToShipment(quoteId, {
        vehicle_id: (fd.get("vehicle_id") as string) || null,
        driver_id: (fd.get("driver_id") as string) || null,
        estimated_delivery: (fd.get("estimated_delivery") as string) || null,
      });
      setCreated(result.tracking_code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (created) {
    return (
      <div className="card border-emerald-500/30 bg-emerald-500/5">
        <h2 className="font-semibold text-white">Shipment created</h2>
        <p className="body-muted mt-2 text-sm">
          Tracking code <span className="font-mono text-emerald-300">{created}</span> is live —
          the customer can track it now.
        </p>
        <div className="mt-4 flex gap-3">
          <Button size="sm" onClick={() => router.push("/admin/shipments")}>
            Go to shipments
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  const convertible = canConvertQuote(quoteStatus);

  return (
    <div className="card">
      <h2 className="font-semibold text-white">Convert to Shipment</h2>
      <p className="body-muted mt-2 text-sm">
        {convertible
          ? `Create a shipment for ${originCity} → ${destinationCity}. The quote, customer and shipment stay linked.`
          : "Move this quote to Confirmed before creating a shipment. You can change the status above."}
      </p>
      <Button className="mt-4" disabled={!convertible} onClick={openDialog}>
        Convert to Shipment
        <ArrowRight className="h-4 w-4" />
      </Button>

      <Modal open={open} onClose={() => !pending && setOpen(false)} title="Create shipment from quote">
        {created ? null : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="alert" className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}
            <p className="text-sm text-mist-300">
              A tracking code is generated automatically and the opening
              &ldquo;Booked&rdquo; event is logged.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Assign vehicle (optional)"
                name="vehicle_id"
                options={[{ value: "", label: "— Later —" }, ...vehicles]}
              />
              <Select
                label="Assign driver (optional)"
                name="driver_id"
                options={[{ value: "", label: "— Later —" }, ...drivers]}
              />
            </div>
            <Input
              label="Estimated delivery (optional)"
              name="estimated_delivery"
              type="date"
              defaultValue={preferredDate ?? ""}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create shipment"
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
