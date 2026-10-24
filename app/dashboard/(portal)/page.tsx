import Link from "next/link";
import { FileText, PackageCheck, PackageSearch, Search } from "lucide-react";
import { getCustomerData } from "@/lib/customer-portal";
import { ShipmentCard } from "@/components/dashboard/ShipmentCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const data = await getCustomerData();

  const shipments = data?.shipments ?? [];
  const quotes = data?.quotes ?? [];

  // Real values only — derived from the customer's own records.
  const active = shipments.filter((s) => s.shipment.status !== "delivered");
  const completed = shipments.filter((s) => s.shipment.status === "delivered");
  const pendingQuotes = quotes.filter(
    (q) => q.status !== "won" && q.status !== "lost",
  );

  const stats = [
    { label: "Active shipments", value: active.length, icon: PackageSearch, href: "/dashboard/shipments" },
    { label: "Pending quotes", value: pendingQuotes.length, icon: FileText, href: "/dashboard/quotes" },
    { label: "Completed shipments", value: completed.length, icon: PackageCheck, href: "/dashboard/shipments" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Customer portal</p>
        <h1 className="heading-lg">Your shipments at a glance.</h1>
      </div>

      {/* Stat tiles — real counts from the customer's records */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="card flex items-center gap-4 transition-colors hover:border-navy-500"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-md border border-amber-500/25 bg-amber-500/10 text-amber-500">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-mist-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick track */}
      <div className="card flex flex-col items-start justify-between gap-4 border-navy-600 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold text-white">Have a tracking code?</h2>
          <p className="body-muted mt-1 text-sm">
            See the full milestone timeline for any of your shipments.
          </p>
        </div>
        <ButtonLink href="/tracking">
          <Search className="h-4 w-4" />
          Track a shipment
        </ButtonLink>
      </div>

      {/* Recent shipments — real records or a genuine empty state */}
      <section aria-label="Recent shipments">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent shipments</h2>
          {shipments.length > 0 && (
            <Link
              href="/dashboard/shipments"
              className="text-sm text-amber-500 hover:underline"
            >
              View all
            </Link>
          )}
        </div>

        {shipments.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No shipments yet."
            description="When a booking is confirmed, your shipments appear here with live milestone timelines."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shipments.slice(0, 3).map(({ shipment }) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
