import { PackageSearch } from "lucide-react";
import { getCustomerData } from "@/lib/customer-portal";
import { ShipmentCard } from "@/components/dashboard/ShipmentCard";
import { ShipmentTimeline } from "@/components/business/ShipmentTimeline";
import { EmptyState } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function DashboardShipmentsPage() {
  const data = await getCustomerData();
  const shipments = data?.shipments ?? [];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Portal</p>
        <h1 className="heading-lg">Shipments.</h1>
        <p className="body-muted mt-2">
          Every shipment linked to your account, with its confirmed milestone
          history.
        </p>
      </div>

      {shipments.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No shipments yet."
          description="When a booking is confirmed, your shipments appear here with live milestone timelines."
        />
      ) : (
        <div className="space-y-10">
          {shipments.map(({ shipment, events }) => (
            <section key={shipment.id} aria-label={shipment.tracking_code}>
              <div className="mb-3 md:hidden">
                <ShipmentCard shipment={shipment} />
              </div>
              <div className="hidden md:block">
                <ShipmentTimeline shipment={shipment} events={events} />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
