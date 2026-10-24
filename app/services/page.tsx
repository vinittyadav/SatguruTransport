import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Section, SectionHeader } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceCard } from "@/components/business/ServiceCard";
import { getServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Full truckload, part load, dedicated transportation, industrial and commercial goods movement, fleet solutions and logistics coordination.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services | Satguru Transport",
    description:
      "Full truckload, part load, dedicated transportation, industrial and commercial goods movement, fleet solutions and logistics coordination.",
    url: "/services",
  },
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <main className="min-h-screen bg-navy-950">
      <Navbar />
      <section className="border-b border-navy-800 pt-36">
        <div className="container-premium">
          <p className="eyebrow">Services</p>
          <h1 className="heading-xl max-w-3xl">
            Transportation, arranged around your operation.
          </h1>
          <p className="body-muted mt-6 max-w-2xl text-lg">
            Eight service lines, one standard of execution. Every option below
            can be combined with dedicated vehicles or part-load economics.
          </p>
          <div className="mt-10 flex gap-4">
            <ButtonLink href="/quote" size="lg">
              GET A QUOTE
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </Section>

      {/* Detail sections for deep-links */}
      <Section className="border-t border-navy-800 bg-navy-900/40">
        <SectionHeader
          eyebrow="In detail"
          title="What each service involves."
        />
        <div className="space-y-5">
          {services.map((service) => (
            <Reveal key={service.id}>
              <div id={service.slug} className="card scroll-mt-24">
                <h3 className="text-xl font-semibold text-white">
                  {service.title}
                </h3>
                <p className="body-muted mt-3 max-w-3xl">
                  {service.description ?? service.short_description}
                </p>
                {service.features?.length > 0 && (
                  <ul className="mt-5 grid gap-2 sm:grid-cols-3">
                    {service.features.map((f) => (
                      <li
                        key={f}
                        className="rounded-md border border-navy-700 bg-navy-900 px-3 py-2.5 text-sm text-mist-200"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                <ButtonLink
                  href={`/quote?service=${encodeURIComponent(service.title)}`}
                  variant="outline"
                  size="sm"
                  className="mt-5"
                >
                  Request this service
                </ButtonLink>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
      <Footer />
    </main>
  );
}
