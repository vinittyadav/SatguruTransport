import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Section, SectionHeader } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { FleetViewer } from "@/components/3d/FleetViewer";
import { getVehicles } from "@/lib/content";
import type { Vehicle } from "@/types";

export const metadata: Metadata = {
  title: "Fleet",
  description:
    "Explore the Satguru Transport fleet: heavy trucks, medium trucks, light commercial vehicles and specialized vehicles.",
  alternates: { canonical: "/fleet" },
  openGraph: {
    title: "Fleet | Satguru Transport",
    description:
      "Explore the Satguru Transport fleet: heavy trucks, medium trucks, light commercial vehicles and specialized vehicles.",
    url: "/fleet",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  heavy: "Heavy Trucks",
  medium: "Medium Trucks",
  light: "Light Commercial",
  specialized: "Specialized",
};

export default async function FleetPage() {
  const vehicles = await getVehicles();

  return (
    <main className="min-h-screen bg-navy-950">
      <Navbar />
      <section className="border-b border-navy-800 pt-36">
        <div className="container-premium">
          <p className="eyebrow">Fleet</p>
          <h1 className="heading-xl max-w-3xl">
            Vehicles matched to the cargo they carry.
          </h1>
          <p className="body-muted mt-6 max-w-2xl text-lg">
            Inspect our vehicle categories in 3D. Specifications update as the
            fleet register is confirmed.
          </p>
        </div>
      </section>

      <Section>
        <FleetViewer vehicles={vehicles} />
      </Section>

      <Section className="border-t border-navy-800 bg-navy-900/40">
        <SectionHeader eyebrow="Register" title="Vehicle categories" />
        <div className="overflow-x-auto rounded-lg border border-navy-700">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-navy-700 bg-navy-800/60 text-xs uppercase tracking-wider text-mist-400">
              <tr>
                <th className="px-4 py-3.5 font-medium">Vehicle</th>
                <th className="px-4 py-3.5 font-medium">Category</th>
                <th className="px-4 py-3.5 font-medium">Capacity</th>
                <th className="px-4 py-3.5 font-medium">Cargo suitability</th>
                <th className="px-4 py-3.5 font-medium">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {vehicles.map((v: Vehicle) => (
                <tr key={v.id} className="transition-colors hover:bg-navy-800/40">
                  <td className="px-4 py-4 font-medium text-white">{v.title}</td>
                  <td className="px-4 py-4 text-mist-300">
                    {CATEGORY_LABELS[v.category] ?? v.category}
                  </td>
                  <td className="px-4 py-4 text-mist-300">
                    {v.capacity ?? "To be configured"}
                  </td>
                  <td className="px-4 py-4 text-mist-300">
                    {v.cargo_suitability ?? "To be configured"}
                  </td>
                  <td className="px-4 py-4 text-mist-300 capitalize">
                    {v.availability.replace("_", " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Footer />
    </main>
  );
}
