import { Mail, MapPin, Phone, User } from "lucide-react";
import { getCustomerIdentity } from "@/lib/auth";
import {
  siteConfig,
  phoneHref,
  emailHref,
  mapsLink,
  whatsappLink,
} from "@/lib/config/site";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardProfilePage() {
  const identity = await getCustomerIdentity();

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Portal</p>
        <h1 className="heading-lg">Profile.</h1>
      </div>

      {/* Account — real session values only */}
      <section className="card" aria-label="Account">
        <h2 className="font-semibold text-white">Account</h2>
        <dl className="mt-4 space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-amber-500" />
            <div>
              <dt className="text-xs text-mist-500">Name</dt>
              <dd className="font-medium text-white">
                {identity?.fullName ?? "—"}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-amber-500" />
            <div>
              <dt className="text-xs text-mist-500">Email</dt>
              <dd className="font-medium text-white">{identity?.email ?? "—"}</dd>
            </div>
          </div>
        </dl>
        <p className="mt-5 border-t border-navy-700 pt-4 text-xs leading-relaxed text-mist-500">
          Name, company and contact details are maintained by our team when
          your account is set up. Write to us if anything needs updating.
        </p>
      </section>

      {/* Contact — official Satguru details from siteConfig */}
      <section className="card" aria-label="Contact Satguru">
        <h2 className="font-semibold text-white">Reach your operations team</h2>
        <ul className="mt-4 space-y-4 text-sm">
          <li>
            <a href={phoneHref()} className="flex items-center gap-3 text-mist-200 transition-colors hover:text-amber-500">
              <Phone className="h-4 w-4 text-amber-500" />
              {siteConfig.contact.phone}
            </a>
          </li>
          <li>
            <a href={emailHref()} className="flex items-center gap-3 break-all text-mist-200 transition-colors hover:text-amber-500">
              <Mail className="h-4 w-4 text-amber-500" />
              {siteConfig.contact.email}
            </a>
          </li>
          {whatsappLink() && (
            <li>
              <a
                href={whatsappLink()!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-mist-200 transition-colors hover:text-amber-500"
              >
                <MessageCircle className="h-4 w-4 text-amber-500" />
                WhatsApp
              </a>
            </li>
          )}
          <li>
            <a
              href={mapsLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 text-mist-200 transition-colors hover:text-amber-500"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>
                {siteConfig.contact.address}
                <span className="mt-0.5 block text-xs text-mist-500">
                  Open in Google Maps
                </span>
              </span>
            </a>
          </li>
        </ul>
        {siteConfig.contact.hours && (
          <p className="mt-5 border-t border-navy-700 pt-4 text-xs text-mist-500">
            Business hours: {siteConfig.contact.hours}
          </p>
        )}
      </section>
    </div>
  );
}
