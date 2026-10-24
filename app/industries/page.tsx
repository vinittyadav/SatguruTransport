import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Section, SectionHeader } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { IndustryCard } from "@/components/business/ServiceCard";
import { Reveal } from "@/components/ui/Reveal";
import { getIndustries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Satguru Transport serves manufacturing, automotive, construction, retail, FMCG, industrial equipment, agriculture and e-commerce cargo.",
  alternates: { canonical: "/industries" },
  openGraph: {
    title: "Industries | Satguru Transport",
    description:
      "Satguru Transport serves manufacturing, automotive, construction, retail, FMCG, industrial equipment, agriculture and e-commerce cargo.",
    url: "/industries",
  },
};

export default async function IndustriesPage() {
  const industries = await getIndustries();

  return (
    <main className="min-h-screen bg-navy-950">
      <Navbar />
      <section className="border-b border-navy-800 pt-36">
        <div className="container-premium">
          <p className="eyebrow">Industries</p>
          <h1 className="heading-xl max-w-3xl">
            Built for the cargo Maharashtra moves.
          </h1>
          <p className="body-muted mt-6 max-w-2xl text-lg">
            Different industries face different logistics pressures. Here is how
            our service adapts to each.
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((industry, i) => (
            <IndustryCard key={industry.id} industry={industry} index={i} />
          ))}
        </div>
      </Section>

      <Section className="border-t border-navy-800 bg-navy-900/40">
        <SectionHeader
          eyebrow="Approach"
          title="One standard across every industry."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Assess the load",
              body: "Cargo type, weight, handling needs and timing — established before a vehicle is assigned.",
            },
            {
              title: "Match the vehicle",
              body: "The fleet is matched to the requirement, never the other way around.",
            },
            {
              title: "Communicate status",
              body: "Confirmed milestones, honest timelines, and a person reachable when it matters.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="card h-full">
                <span className="font-display text-3xl font-bold text-amber-500/40">
                  0{i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="body-muted mt-2 text-sm">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
      <Footer />
    </main>
  );
}
