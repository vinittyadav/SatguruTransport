import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { TrackingForm } from "@/components/business/TrackingForm";

export const metadata: Metadata = {
  title: "Track Shipment",
  description:
    "Track your Satguru Transport shipment by tracking code. See current status and milestone history.",
  alternates: { canonical: "/tracking" },
  openGraph: {
    title: "Track Shipment | Satguru Transport",
    description:
      "Track your Satguru Transport shipment by tracking code. See current status and milestone history.",
    url: "/tracking",
  },
};

export default async function TrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <main className="min-h-screen bg-navy-950">
      <Navbar />
      <section className="section-pad pt-36">
        <div className="container-premium max-w-3xl">
          <p className="eyebrow">Shipment tracking</p>
          <h1 className="heading-lg">Track your shipment.</h1>
          <p className="body-muted mt-4">
            Enter the LR / shipment number issued at booking. You'll see the
            current status and every confirmed milestone.
          </p>
          <div className="mt-10">
            <TrackingForm initialCode={code} />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
