import Link from "next/link";
import { ArrowUpRight, FileText, Package, Truck, Users } from "lucide-react";
import {
  createAdminSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/Card";
import {
  quoteStatusLabels,
  quoteStatusStyles,
  vehicleAvailabilityLabels,
  formatDateTime,
  cn,
} from "@/lib/utils";
import type { QuoteRequest, Shipment, Vehicle } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Demo mode — connect the database"
        description="Set Supabase environment variables in .env.local and create the tables (supabase/migrations) to activate the dashboard."
      />
    );
  }

  const db = createAdminSupabaseClient();

  // ---- Real counts over the FULL tables (head: true returns counts only) ----
  const [
    newQuotesRes,
    confirmedRes,
    activeShipmentsRes,
    availableVehiclesRes,
    customersRes,
    quotesRes,
    shipmentsRes,
    vehiclesRes,
  ] = await Promise.all([
    db.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    db.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
    db.from("shipments").select("id", { count: "exact", head: true }).neq("status", "delivered"),
    db.from("vehicles").select("id", { count: "exact", head: true }).eq("availability", "available"),
    db.from("customers").select("id", { count: "exact", head: true }),
    db.from("quote_requests").select("*").order("created_at", { ascending: false }).limit(5),
    db.from("shipments").select("*").order("created_at", { ascending: false }).limit(5),
    db.from("vehicles").select("*").order("sort_order", { ascending: true }).limit(6),
  ]);

  const quotes = (quotesRes.data ?? []) as QuoteRequest[];
  const shipments = (shipmentsRes.data ?? []) as Shipment[];
  const vehicles = (vehiclesRes.data ?? []) as Vehicle[];

  const counts = {
    newQuotes: newQuotesRes.count ?? 0,
    confirmedQuotes: confirmedRes.count ?? 0,
    activeShipments: activeShipmentsRes.count ?? 0,
    availableVehicles: availableVehiclesRes.count ?? 0,
    customers: customersRes.count ?? 0,
  };

  const stats = [
    {
      label: "New Quotes",
      value: counts.newQuotes,
      href: "/admin/quotes",
      icon: FileText,
      tone: "border-sky-500/25 bg-sky-500/10 text-sky-300",
    },
    {
      label: "Active Shipments",
      value: counts.activeShipments,
      href: "/admin/shipments",
      icon: Package,
      tone: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    },
    {
      label: "Available Vehicles",
      value: counts.availableVehicles,
      href: "/admin/content",
      icon: Truck,
      tone: "border-teal-500/25 bg-teal-500/10 text-teal-300",
    },
    {
      label: "Customers",
      value: counts.customers,
      href: "/admin/customers",
      icon: Users,
      tone: "border-violet-500/25 bg-violet-500/10 text-violet-300",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Control-center header */}
      <div className="grid-texture rounded-lg border border-navy-700 px-6 py-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500">
          Satguru Operations
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">
          Control center
        </h1>
        <p className="body-muted mt-1 text-sm">
          Live totals across the whole database.{" "}
          {counts.confirmedQuotes > 0 && (
            <>
              {counts.confirmedQuotes} quote{counts.confirmedQuotes === 1 ? "" : "s"} ready to
              convert —{" "}
              <Link href="/admin/quotes?status=confirmed" className="text-amber-500 hover:underline">
                review them
              </Link>
              .
            </>
          )}
        </p>
      </div>

      {/* Stat tiles — exact counts, 0 when the database is empty */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card group flex items-center justify-between transition-colors hover:border-navy-500"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-md border ${stat.tone}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-mist-500">{stat.label}</p>
                <p className="step-numeral text-3xl font-semibold leading-tight text-white">
                  {stat.value}
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-mist-500 transition-all group-hover:translate-x-0.5 group-hover:text-amber-500" />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent quotes */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent quotes</h2>
            <Link href="/admin/quotes" className="text-sm text-amber-500 hover:underline">
              View all
            </Link>
          </div>
          {quotes.length === 0 ? (
            <p className="body-muted text-sm">No quote requests yet.</p>
          ) : (
            <ul className="divide-y divide-navy-700">
              {quotes.map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {q.contact_name} · {q.origin_city} → {q.destination_city}
                    </p>
                    <p className="font-mono text-xs text-mist-500">
                      {q.reference_code} · {formatDateTime(q.created_at)}
                    </p>
                  </div>
                  <span className={cn("chip shrink-0", quoteStatusStyles[q.status])}>
                    {quoteStatusLabels[q.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent shipments */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">Active shipments</h2>
            <Link href="/admin/shipments" className="text-sm text-amber-500 hover:underline">
              View all
            </Link>
          </div>
          {shipments.length === 0 ? (
            <p className="body-muted text-sm">No shipments yet.</p>
          ) : (
            <ul className="divide-y divide-navy-700">
              {shipments.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-medium text-white">
                      {s.tracking_code}
                    </p>
                    <p className="text-xs text-mist-500">
                      {s.origin_city} → {s.destination_city} ·{" "}
                      {formatDateTime(s.updated_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Fleet status */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-white">Fleet status</h2>
          <Link href="/admin/content" className="text-sm text-amber-500 hover:underline">
            Manage fleet
          </Link>
        </div>
        {vehicles.length === 0 ? (
          <p className="body-muted text-sm">No vehicles registered yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between gap-3 rounded-md border border-navy-700 bg-navy-900 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{v.title}</p>
                  <p className="text-xs capitalize text-mist-500">
                    {v.category}
                    {v.vehicle_number ? ` · ${v.vehicle_number}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "chip shrink-0",
                    v.availability === "available"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : v.availability === "in_transit" || v.availability === "assigned"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        : "border-navy-600 bg-navy-800 text-mist-400",
                  )}
                >
                  {vehicleAvailabilityLabels[v.availability] ?? v.availability}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
