import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import {
  siteConfig,
  whatsappLink,
  phoneHref,
  emailHref,
  mapsLink,
} from "@/lib/config/site";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-navy-700 bg-navy-950">
      <div className="container-premium py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="body-muted mt-5 max-w-sm text-sm">
              {siteConfig.description}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-mist-500">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-mist-300 transition-colors hover:text-amber-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-mist-500">
              Get started
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/quote" className="text-mist-300 transition-colors hover:text-amber-500">
                  Get a quote
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="text-mist-300 transition-colors hover:text-amber-500">
                  Track shipment
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-mist-300 transition-colors hover:text-amber-500">
                  Admin portal
                </Link>
              </li>
            </ul>
            {siteConfig.social.length > 0 && (
              <div className="mt-6 flex gap-3">
                {siteConfig.social.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mist-400 hover:text-amber-500"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-mist-500">
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-mist-300">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <a
                  href={phoneHref()}
                  className="transition-colors hover:text-amber-500"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <a
                  href={emailHref()}
                  className="break-all transition-colors hover:text-amber-500"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <a
                  href={mapsLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-amber-500"
                >
                  {siteConfig.contact.address}
                </a>
              </li>
              {whatsappLink() && (
                <li className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <a
                    href={whatsappLink()!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-amber-500"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-800">
        <div className="container-premium flex flex-col items-center justify-between gap-3 py-6 text-xs text-mist-500 sm:flex-row">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>Transportation & logistics — Maharashtra, India</p>
        </div>
      </div>
    </footer>
  );
}
