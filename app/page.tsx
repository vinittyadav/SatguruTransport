import { ArrowRight, CheckCircle2, MessageCircle, PackageSearch, Phone } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Section, SectionHeader } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Hero3D } from "@/components/3d/Hero3D";
import { FleetViewer } from "@/components/3d/FleetViewer";
import { ServiceCard, IndustryCard } from "@/components/business/ServiceCard";
import { FaqSection } from "@/components/business/FaqSection";
import { RouteVisualization } from "@/components/3d/RouteVisualization";
import { fallbackValuePillars } from "@/lib/config/content";
import { getServices, getIndustries, getFaqs, getVehicles } from "@/lib/content";
import { siteConfig, phoneHref, whatsappLink } from "@/lib/config/site";

export default async function HomePage() {
  const [services, industries, faqs, vehicles] = await Promise.all([
    getServices(),
    getIndustries(),
    getFaqs(),
    getVehicles(),
  ]);

  return (
    <main className="bg-navy-950">
      <Navbar />

      {/* ============================================================
          SECTION 1 — CINEMATIC 3D HERO
      ============================================================ */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <Hero3D />

        {/* Gradient overlays for text legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-950 to-transparent" />

        <div className="container-premium relative z-10 py-32">
          <Reveal>
            <p className="eyebrow">Satguru Transport — Maharashtra, India</p>
            <h1 className="heading-xl max-w-2xl">
              Moving Business Forward.
            </h1>
            <p className="body-muted mt-6 max-w-xl text-lg">
              Reliable transportation solutions built around your cargo, your
              schedule, and your business.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink href="/quote" size="lg">
                GET A QUOTE
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/tracking" variant="outline" size="lg">
                <PackageSearch className="h-4 w-4 text-amber-500" />
                TRACK SHIPMENT
              </ButtonLink>
              <ButtonLink href="/services" variant="ghost" size="lg">
                Explore services
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        {/* Scroll cue */}
        <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-navy-500 p-1.5">
            <div className="h-2 w-1 animate-bounce rounded-full bg-amber-500" />
          </div>
        </div>
      </section>

      {/* ============================================================
          SYSTEM STRIP — one connected transportation system:
          route → shipment → tracking → quote
      ============================================================ */}
      <section aria-label="How Satguru works" className="border-y border-navy-800 bg-navy-900/60">
        <div className="container-premium grid gap-px sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Plan your route",
              body: "Preview your corridor before you commit it.",
              href: "/services",
              cta: "Explore services",
            },
            {
              step: "02",
              title: "Track every milestone",
              body: "One code shows confirmed status — never guesses.",
              href: "/tracking",
              cta: "Track a shipment",
            },
            {
              step: "03",
              title: "Get a tailored quote",
              body: "Route, cargo, timing — five quick steps.",
              href: "/quote",
              cta: "Start a quote",
            },
          ].map((item) => (
            <Link
              key={item.step}
              href={item.href}
              className="group border-navy-800 p-6 transition-colors hover:bg-navy-850 sm:border-r sm:last:border-r-0 lg:p-8"
            >
              <span className="step-numeral text-xs font-semibold tracking-[0.3em] text-amber-500">
                {item.step}
              </span>
              <p className="mt-2 font-display text-lg font-semibold text-white">{item.title}</p>
              <p className="body-muted mt-1 text-sm">{item.body}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-500 transition-transform group-hover:translate-x-0.5">
                {item.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 2 — VALUE PROPOSITION
      ============================================================ */}
      <Section>
        <SectionHeader
          eyebrow="Why Satguru"
          title="Transportation built for businesses that can't afford delays."
          description="Every load is planned, communicated and delivered with the same standard — because your operation depends on it."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {fallbackValuePillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.08}>
              <div className="card h-full">
                <div className="flex h-11 w-11 items-center justify-center rounded-md border border-amber-500/25 bg-amber-500/10 text-amber-500">
                  {/* Icons resolved server-side via simple map */}
                  <PillarIcon name={pillar.icon} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {pillar.title}
                </h3>
                <p className="body-muted mt-2 text-sm">{pillar.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ============================================================
          SECTION 3 — SERVICES
      ============================================================ */}
      <Section className="border-y border-navy-800 bg-navy-900/40">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow="Services"
            title="Transportation, arranged around your operation."
            description="From a single truck to coordinated multi-leg movements."
          />
          <Reveal className="mb-14">
            <ButtonLink href="/services" variant="outline">
              All services
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </Reveal>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 4).map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </Section>

      {/* ============================================================
          SECTION 4 — 3D ROUTE VISUALIZATION
      ============================================================ */}
      <Section>
        <SectionHeader
          eyebrow="Route Visualization"
          title="See your corridor before you commit it."
          description="An interactive preview of key Maharashtra corridors. Planning aid — not live tracking, and not a coverage claim."
        />
        <RouteVisualization />
      </Section>

      {/* ============================================================
          SECTION 5 — FLEET
      ============================================================ */}
      <Section className="border-y border-navy-800 bg-navy-900/40">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow="Fleet"
            title="The right vehicle for every load."
            description="Rotate, zoom and inspect the vehicle categories we operate."
          />
          <Reveal className="mb-14">
            <ButtonLink href="/fleet" variant="outline">
              Explore fleet
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </Reveal>
        </div>
        <FleetViewer vehicles={vehicles} />
      </Section>

      {/* ============================================================
          SECTION 6 — INDUSTRIES
      ============================================================ */}
      <Section>
        <SectionHeader
          eyebrow="Industries"
          title="Built for the cargo Maharashtra moves."
          description="Different industries, different pressures — same dependable execution."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {industries.slice(0, 8).map((industry, i) => (
            <IndustryCard key={industry.id} industry={industry} index={i} />
          ))}
        </div>
      </Section>

      {/* ============================================================
          SECTION 7 — LOGISTICS TECHNOLOGY
      ============================================================ */}
      <section className="section-pad grid-texture border-y border-navy-800 bg-navy-900/60">
        <div className="container-premium">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <p className="eyebrow">Logistics Technology</p>
              <h2 className="heading-lg">
                A modern operation behind every shipment.
              </h2>
              <p className="body-muted mt-5">
                Satguru runs on a digital operations platform: quotes, shipments,
                fleet and customers managed in one system — so status questions
                get answered in seconds, not phone calls.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Digital quote management with reference codes",
                  "Shipment tracking with milestone history",
                  "Fleet and driver records in one place",
                  "Structured customer records for repeat business",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-mist-200">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-4">
                <ButtonLink href="/tracking" variant="outline">
                  Try shipment tracking
                </ButtonLink>
                <ButtonLink href="/quote">GET A QUOTE</ButtonLink>
              </div>
            </Reveal>

            {/* Control-center concept UI */}
            <Reveal delay={0.15}>
              <div className="rounded-lg border border-navy-700 bg-navy-950/90 shadow-2xl">
                <div className="flex items-center gap-2 border-b border-navy-700 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-navy-600" />
                  <span className="h-2.5 w-2.5 rounded-full bg-navy-600" />
                  <span className="h-2.5 w-2.5 rounded-full bg-navy-600" />
                  <span className="ml-3 text-xs text-mist-500">
                    Satguru Operations — Platform
                  </span>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  {[
                    { label: "Quotes", value: "Logged with reference codes" },
                    { label: "Shipments", value: "Milestone history per shipment" },
                    { label: "Fleet", value: "Vehicle register with availability" },
                    { label: "Customers", value: "Structured records for repeat business" },
                  ].map((tile) => (
                    <div
                      key={tile.label}
                      className="rounded-md border border-navy-700 bg-navy-850 p-4"
                    >
                      <p className="text-xs uppercase tracking-wider text-mist-500">
                        {tile.label}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-mist-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {tile.value}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="border-t border-navy-700 px-4 py-3 text-[11px] text-mist-500">
                  The internal operations platform. Customer data stays private
                  to Satguru staff.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 8 — TRACKING TEASER
      ============================================================ */}
      <Section>
        <div className="card relative overflow-hidden border-navy-600 p-10 lg:p-14">
          <div className="grid-texture pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Shipment Tracking</p>
              <h2 className="heading-lg">Know where your cargo stands.</h2>
              <p className="body-muted mt-4">
                Every booked shipment gets a tracking code. Enter it to see the
                current status and the full milestone history.
              </p>
              <ButtonLink href="/tracking" className="mt-8">
                Track a shipment
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
            <div className="rounded-md border border-navy-700 bg-navy-900 p-6">
              <p className="text-xs uppercase tracking-wider text-mist-500">
                Example code format
              </p>
              <p className="mt-2 font-mono text-2xl font-bold tracking-wider text-amber-500">
                SGT482913
              </p>
              <p className="body-muted mt-3 text-xs">
                Codes are issued at booking. Status reflects confirmed milestones
                only — never estimated positions.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ============================================================
          SECTION 9 — ABOUT TEASER
      ============================================================ */}
      <Section className="border-y border-navy-800 bg-navy-900/40">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">About</p>
            <h2 className="heading-lg">
              A transport partner, not just a truck provider.
            </h2>
            <p className="body-muted mt-5">
              Satguru Transport operates from Maharashtra with a focus on
              dependable commercial transportation — clear communication,
              maintained vehicles, and service built around business
              requirements.
            </p>
            <ButtonLink href="/about" variant="outline" className="mt-8">
              Our story
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Reliable Operations",
                "Professional Fleet",
                "Responsive Communication",
                "Business-Focused Service",
              ].map((value) => (
                <div key={value} className="card">
                  <CheckCircle2 className="h-5 w-5 text-amber-500" />
                  <p className="mt-3 font-medium text-white">{value}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ============================================================
          SECTION 10 — QUOTE CTA
      ============================================================ */}
      <Section>
        <div className="relative overflow-hidden rounded-lg border border-amber-500/20 bg-gradient-to-br from-navy-800 to-navy-900 p-10 text-center lg:p-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
          <Reveal>
            <h2 className="heading-lg">Ready to move your cargo?</h2>
            <p className="body-muted mx-auto mt-4 max-w-xl">
              Tell us the route, the cargo and the timing. We respond with a
              tailored quote and a clear plan.
            </p>
            <div className="mt-8 flex justify-center">
              <ButtonLink href="/quote" size="lg">
                GET A QUOTE
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ============================================================
          SECTION 11 — FAQ
      ============================================================ */}
      <Section className="border-t border-navy-800">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions, answered."
          align="center"
        />
        <FaqSection faqs={faqs} />
      </Section>

      {/* ============================================================
          SECTION 12 — FINAL CTA
      ============================================================ */}
      <section className="section-pad relative overflow-hidden border-t border-navy-800">
        <div className="grid-texture absolute inset-0 opacity-30" />
        <div className="container-premium relative text-center">
          <Reveal>
            <p className="eyebrow justify-center">Satguru Transport</p>
            <h2 className="heading-xl mx-auto max-w-3xl">
              Not just moving trucks and cargo. Building a modern transportation
              operation.
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <ButtonLink href="/quote" size="lg">
                GET A QUOTE
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline" size="lg">
                Contact us
              </ButtonLink>
              <a
                href={phoneHref()}
                className="inline-flex items-center gap-2 px-2 text-sm font-medium text-mist-300 transition-colors hover:text-amber-500"
              >
                <Phone className="h-4 w-4" />
                {siteConfig.contact.phone}
              </a>
              {whatsappLink() && (
                <a
                  href={whatsappLink()!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-2 text-sm font-medium text-mist-300 transition-colors hover:text-amber-500"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function PillarIcon({ name }: { name: string }) {
  // Simple server-side icon mapping (no client JS needed).
  const map: Record<string, React.ReactNode> = {
    ShieldCheck: <ShieldCheckIcon />,
    Truck: <TruckIcon />,
    MessagesSquare: <MessagesIcon />,
    Briefcase: <BriefcaseIcon />,
  };
  return map[name] ?? <TruckIcon />;
}

function ShieldCheckIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18h-5" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}
function MessagesIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}
