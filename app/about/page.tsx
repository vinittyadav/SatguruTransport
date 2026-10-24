import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Section, SectionHeader } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { fallbackValuePillars } from "@/lib/config/content";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Satguru Transport is a Maharashtra-based transportation company focused on dependable commercial cargo movement with a professional fleet.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | Satguru Transport",
    description:
      "Satguru Transport is a Maharashtra-based transportation company focused on dependable commercial cargo movement with a professional fleet.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-navy-950">
      <Navbar />
      <section className="border-b border-navy-800 pt-36">
        <div className="container-premium">
          <p className="eyebrow">About us</p>
          <h1 className="heading-xl max-w-3xl">
            A transport partner, not just a truck provider.
          </h1>
          <p className="body-muted mt-6 max-w-2xl text-lg">
            Satguru Transport operates from Maharashtra, India, moving
            commercial and industrial cargo with a professional fleet and
            business-focused service.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="heading-md">Our approach</h2>
            <div className="body-muted mt-5 space-y-4">
              <p>
                Transportation is infrastructure for someone else's business.
                When a truck arrives late, a production line waits, a store
                shelf sits empty, a project schedule slips.
              </p>
              <p>
                That is why Satguru is built as an operation, not an
                arrangement: vehicles are maintained on schedule, dispatches are
                planned rather than improvised, and communication is part of the
                service — not an afterthought.
              </p>
              <p>
                We invest in systems that make status visible: digital quote
                management, shipment tracking with milestone history, and
                structured records for fleet, drivers and customers.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card h-full">
              <h3 className="heading-md">Operating principles</h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Say what we'll do, then do it.",
                  "The vehicle must match the cargo — every time.",
                  "A problem surfaced early is a problem halved.",
                  "Businesses deserve transport that behaves like a partner.",
                ].map((line) => (
                  <li key={line} className="flex gap-3 text-sm text-mist-200">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-md border border-navy-700 bg-navy-900 p-4 text-sm text-mist-300">
                <p className="font-medium text-white">Company details</p>
                <p className="mt-1.5">
                  {siteConfig.name} — {siteConfig.contact.address}
                </p>
                {siteConfig.contact.hours && (
                  <p className="mt-1">Business hours: {siteConfig.contact.hours}</p>
                )}
                <p className="mt-2 text-xs text-mist-500">
                  Registration and licensing details are being compiled and will
                  be published here.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section className="border-t border-navy-800 bg-navy-900/40">
        <SectionHeader
          eyebrow="Values"
          title="What every Satguru load gets."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {fallbackValuePillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.08}>
              <div className="card h-full">
                <h3 className="text-lg font-semibold text-white">
                  {pillar.title}
                </h3>
                <p className="body-muted mt-2 text-sm">{pillar.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="card flex flex-col items-center gap-6 border-amber-500/20 p-10 text-center lg:p-14">
          <h2 className="heading-lg max-w-2xl">
            Have cargo to move? Let's plan it properly.
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <ButtonLink href="/quote" size="lg">
              GET A QUOTE
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg">
              Contact us
            </ButtonLink>
          </div>
        </div>
      </Section>
      <Footer />
    </main>
  );
}
