import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createAdminSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/Card";
import { formatDateTime, formatDate, quoteStatusLabels, quoteStatusStyles, cn } from "@/lib/utils";
import { QuoteStatusSelect } from "@/components/admin/QuoteStatusSelect";
import { QuoteConverter } from "@/components/admin/QuoteConverter";
import type { QuoteRequest } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Demo mode — connect the database"
        description="Quote details activate once Supabase is configured."
      />
    );
  }

  const db = createAdminSupabaseClient();
  const [{ data: quote, error }, { data: existingShipment }] = await Promise.all([
    db.from("quote_requests").select("*").eq("id", id).maybeSingle(),
    db.from("shipments").select("id, tracking_code").eq("quote_id", id).maybeSingle(),
  ]);

  if (error || !quote) {
    notFound();
  }

  const q = quote as QuoteRequest;
  const shipment = (existingShipment as { id: string; tracking_code: string } | null) ?? null;

  const rows: Array<[string, string | null]> = [
    ["Company", q.company_name],
    ["Contact", q.contact_name],
    ["Email", q.email],
    ["Phone", q.phone],
    ["Pickup date", q.preferred_pickup_date ? formatDate(q.preferred_pickup_date) : null],
    ["Service type", q.service_type],
    ["Vehicle preference", q.vehicle_preference],
    ["Weight", q.cargo_weight_kg ? `${q.cargo_weight_kg} kg` : null],
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/quotes" className="text-sm text-mist-400 hover:text-white">
          ← Back to quotes
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-amber-500">{q.reference_code}</p>
          <h1 className="heading-md mt-1">{q.origin_city} → {q.destination_city}</h1>
          <p className="body-muted mt-1 text-sm">
            Received {formatDateTime(q.created_at)} · Updated {formatDateTime(q.updated_at ?? q.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("chip", quoteStatusStyles[q.status])}>
            {quoteStatusLabels[q.status]}
          </span>
          <QuoteStatusSelect id={q.id} current={q.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Details */}
          <div className="card">
            <h2 className="font-semibold text-white">Request details</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {rows.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-mist-500">{label}</dt>
                  <dd className="mt-0.5 text-sm text-white">{value ?? "—"}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 border-t border-navy-700 pt-4">
              <p className="text-xs text-mist-500">Cargo description</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-mist-200">{q.cargo_description}</p>
            </div>
            {q.notes && (
              <div className="mt-4">
                <p className="text-xs text-mist-500">Notes</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-mist-200">{q.notes}</p>
              </div>
            )}
          </div>

          {/* Conversion */}
          {shipment ? (
            <div className="card border-emerald-500/30 bg-emerald-500/5">
              <h2 className="font-semibold text-white">Converted</h2>
              <p className="body-muted mt-2 text-sm">
                A shipment was already created from this quote. Tracking code:{" "}
                <Link
                  href="/admin/shipments"
                  className="font-mono text-emerald-300 hover:underline"
                >
                  {shipment.tracking_code}
                </Link>
                . Conversion is one-per-quote to prevent duplicates.
              </p>
            </div>
          ) : (
            <QuoteConverter
              quoteId={q.id}
              quoteStatus={q.status}
              originCity={q.origin_city}
              destinationCity={q.destination_city}
              preferredDate={q.preferred_pickup_date}
            />
          )}
        </div>

        {/* Side panel */}
        <div className="card h-fit">
          <h2 className="font-semibold text-white">Pipeline</h2>
          <ol className="mt-4 space-y-3 text-sm">
            {(["new", "contacted", "quoted", "confirmed"] as const).map((s) => {
              const stageIndex = ["new", "contacted", "quoted", "confirmed"].indexOf(q.status);
              const idx = ["new", "contacted", "quoted", "confirmed"].indexOf(s);
              const done = stageIndex > idx || q.status === "won";
              const current = q.status === s;
              return (
                <li key={s} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      done
                        ? "border-emerald-500 bg-emerald-500 text-navy-950"
                        : current
                          ? "border-amber-500 bg-amber-500/15 text-amber-400"
                          : "border-navy-600 bg-navy-850 text-mist-500",
                    )}
                  >
                    {done ? "✓" : ""}
                  </span>
                  <span className={current ? "font-medium text-white" : "text-mist-400"}>
                    {quoteStatusLabels[s]}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="body-muted mt-5 border-t border-navy-700 pt-4 text-xs leading-relaxed">
            Converting creates a linked shipment (quote_id + customer_id are connected, not
            copied), generates the tracking code, and logs the first milestone event.
          </p>
        </div>
      </div>
    </div>
  );
}
