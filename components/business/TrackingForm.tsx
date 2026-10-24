"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPin, PackageSearch } from "lucide-react";
import { trackingSchema, type TrackingFormValues } from "@/lib/validation/schemas";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorState, EmptyState } from "@/components/ui/Card";
import { ShipmentTimeline } from "./ShipmentTimeline";
import type { Shipment, ShipmentEvent } from "@/types";

type ViewState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "not_found" }
  | { kind: "not_configured" }
  | { kind: "error"; message: string }
  | {
      kind: "found";
      shipment: Shipment;
      events: ShipmentEvent[];
      quoteCreatedAt?: string | null;
      vehicle?: { title: string; category: string } | null;
    };

/**
 * Shipment tracking. Mobile: the search is sticky under the navbar with an
 * oversized input + full-width CTA (large touch targets, no keyboard
 * juggling). Desktop: one prominent inline search card.
 */
export function TrackingForm({ initialCode }: { initialCode?: string }) {
  const [view, setView] = useState<ViewState>({ kind: "idle" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingSchema),
    defaultValues: { tracking_code: initialCode ?? "" },
  });

  const onSubmit = async ({ tracking_code }: TrackingFormValues) => {
    setView({ kind: "loading" });
    try {
      const res = await fetch(
        `/api/tracking?code=${encodeURIComponent(tracking_code.trim())}`,
      );
      if (res.status === 404) {
        setView({ kind: "not_found" });
        return;
      }
      if (res.status === 503) {
        setView({ kind: "not_configured" });
        return;
      }
      if (!res.ok) {
        setView({
          kind: "error",
          message: "Unable to retrieve shipment status. Please try again.",
        });
        return;
      }
      const data = await res.json();
      setView({
        kind: "found",
        shipment: data.shipment,
        events: data.events ?? [],
        quoteCreatedAt: data.quote_created_at ?? null,
        vehicle: data.vehicle ?? null,
      });
    } catch {
      setView({
        kind: "error",
        message: "Unable to retrieve shipment status. Please try again.",
      });
    }
  };

  const searchCard = (
    <div className="card border-navy-600 bg-navy-900/70 p-5 sm:p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:flex-row sm:items-end" noValidate>
        <div className="flex-1">
          <Input
            label="Enter LR / Shipment Number"
            placeholder="e.g. SGT482913"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            error={errors.tracking_code?.message}
            className="min-h-14 text-base font-semibold tracking-wider"
            {...register("tracking_code")}
          />
        </div>
        <Button
          type="submit"
          disabled={view.kind === "loading"}
          className="min-h-14 w-full sm:w-auto sm:px-10"
        >
          {view.kind === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <PackageSearch className="h-4 w-4" />
              TRACK SHIPMENT
            </>
          )}
        </Button>
      </form>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-mist-500">
        <MapPin className="h-3.5 w-3.5 text-amber-500/70" />
        Codes are issued at booking. Status reflects confirmed milestones only — never estimated positions.
      </p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Sticky on mobile so TRACK SHIPMENT is always one tap away. */}
      <div className="sticky top-20 z-20 -mx-4 bg-navy-950/90 px-4 py-3 backdrop-blur-md sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        {searchCard}
      </div>

      {view.kind === "idle" && (
        <EmptyState
          icon={PackageSearch}
          title="Enter a tracking code to see shipment status."
          description="Tracking codes are issued when a shipment is booked. Format: SGT followed by six digits."
        />
      )}

      {view.kind === "not_found" && (
        <EmptyState
          title="Shipment not found."
          description="We couldn't find a shipment with that code. Check the code and try again, or contact us for help."
        />
      )}

      {view.kind === "not_configured" && (
        <EmptyState
          title="Tracking integration is not connected yet."
          description="The shipment database isn't connected on this deployment. Once it is, tracking codes issued at booking will resolve here."
        />
      )}

      {view.kind === "error" && <ErrorState title={view.message} />}

      {view.kind === "found" && (
        <ShipmentTimeline
          shipment={view.shipment}
          events={view.events}
          quoteCreatedAt={view.quoteCreatedAt}
          vehicle={view.vehicle}
        />
      )}
    </div>
  );
}
