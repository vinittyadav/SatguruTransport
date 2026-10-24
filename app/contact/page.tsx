import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ContactForm } from "@/components/business/ContactForm";
import { ButtonLink } from "@/components/ui/Button";
import {
  siteConfig,
  whatsappLink,
  phoneHref,
  emailHref,
  mapsLink,
} from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Satguru Transport for transportation inquiries, route questions and business partnerships.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | Satguru Transport",
    description:
      "Contact Satguru Transport for transportation inquiries, route questions and business partnerships.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-navy-950">
      <Navbar />
      <section className="section-pad pt-36">
        <div className="container-premium grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow">Contact</p>
            <h1 className="heading-lg">Talk to a person, not a portal.</h1>
            <p className="body-muted mt-5">
              Questions about a route, a vehicle, or an ongoing operation? Send
              a message — a member of our team responds.
            </p>

            <div className="mt-10 space-y-5">
              {[
                { icon: Phone, label: "Phone", value: siteConfig.contact.phone, href: phoneHref() },
                { icon: Mail, label: "Email", value: siteConfig.contact.email, href: emailHref() },
                { icon: MapPin, label: "Office", value: siteConfig.contact.address, href: mapsLink() },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-amber-500/25 bg-amber-500/10 text-amber-500">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-mist-400">{label}</p>
                    <a
                      href={href}
                      className="font-medium text-white hover:text-amber-500"
                      {...(href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {value}
                    </a>
                  </div>
                </div>
              ))}

              {/* WhatsApp — rendered only when configured (no invented number). */}
              {whatsappLink("Hello Satguru Transport, I have a transportation inquiry.") && (
                <a
                  href={whatsappLink("Hello Satguru Transport, I have a transportation inquiry.")!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-mist-400">WhatsApp</p>
                    <p className="font-medium text-white">Message us</p>
                    <p className="mt-0.5 text-xs text-mist-500">
                      Opens a WhatsApp chat with our team.
                    </p>
                  </div>
                </a>
              )}
            </div>

            {siteConfig.contact.hours && (
              <div className="mt-10 rounded-md border border-navy-700 bg-navy-900 p-4 text-sm text-mist-300">
                <p className="font-medium text-white">Business hours</p>
                <p className="mt-1">{siteConfig.contact.hours}</p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/quote" size="lg">
                GET A QUOTE
              </ButtonLink>
              <ButtonLink href="/tracking" variant="outline" size="lg">
                TRACK SHIPMENT
              </ButtonLink>
            </div>
          </div>

          <div className="card p-8 lg:p-10">
            <ContactForm />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
