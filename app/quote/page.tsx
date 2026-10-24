import type { Metadata } from "next";
import { MessageCircle, Phone } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { QuoteForm } from "@/components/business/QuoteForm";
import {
  siteConfig,
  phoneHref,
  whatsappLink,
} from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Request a transportation quote from Satguru Transport. Share your route, cargo and timing for a tailored response.",
  alternates: { canonical: "/quote" },
  openGraph: {
    title: "Get a Quote | Satguru Transport",
    description:
      "Request a transportation quote from Satguru Transport. Share your route, cargo and timing for a tailored response.",
    url: "/quote",
  },
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{
    origin?: string;
    destination?: string;
    service?: string;
  }>;
}) {
  const { origin, destination, service } = await searchParams;

  return (
    <main className="min-h-screen bg-navy-950">
      <Navbar />
      <section className="section-pad pt-36">
        <div className="container-premium grid gap-14 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow">Get a quote</p>
            <h1 className="heading-lg">Tell us about your shipment.</h1>
            <p className="body-muted mt-5">
              Route, cargo and timing is all we need to start. A tailored quote
              follows once our team reviews the details.
            </p>

            <div className="mt-10 space-y-5">
              {[
                {
                  title: "Response with context",
                  body: "Every request gets a reference code so follow-ups stay simple.",
                },
                {
                  title: "The right vehicle",
                  body: "Vehicle selection is matched to your cargo, not guessed.",
                },
                {
                  title: "Clear planning",
                  body: "Pickup windows and transit expectations are confirmed upfront.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-amber-500/25 bg-amber-500/10 font-display text-sm font-bold text-amber-500">
                    {item.title.charAt(0)}
                  </span>
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="body-muted mt-1 text-sm">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Prefer to speak directly? — secondary contact actions. The quote
                form remains the primary path (right column). */}
            <div className="mt-10 rounded-md border border-navy-700 bg-navy-900 p-5">
              <p className="font-medium text-white">Prefer to speak directly?</p>
              <p className="body-muted mt-1 text-sm">
                Skip the form and reach us at {siteConfig.contact.phone}.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={phoneHref()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-navy-600 bg-navy-850 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-amber-500/50 sm:flex-none"
                >
                  <Phone className="h-4 w-4 text-amber-500" />
                  Call {siteConfig.contact.phone}
                  </a>
                {whatsappLink(
                  "Hello Satguru Transport, I have a shipment to quote.",
                ) && (
                  <a
                    href={whatsappLink(
                      "Hello Satguru Transport, I have a shipment to quote.",
                    )!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-navy-600 bg-navy-850 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-amber-500/50 sm:flex-none"
                  >
                    <MessageCircle className="h-4 w-4 text-amber-500" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="card p-6 sm:p-8 lg:p-10">
            <QuoteForm
              defaults={{
                origin_city: origin ?? "",
                destination_city: destination ?? "",
                service_type: service ?? undefined,
              }}
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
