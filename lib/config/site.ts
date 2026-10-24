// ============================================================
// CENTRAL SITE CONFIGURATION
// All business copy lives here so it can be edited in one place
// without touching components. Replace every `PLACEHOLDER:` value
// with confirmed company information before launch.
// ============================================================

export const siteConfig = {
  name: "Satguru Transport",
  logoLines: ["SATGURU", "TRANSPORT"],
  tagline: "Moving Business Forward.",
  description:
    "Transportation and logistics services in Maharashtra, India. Satguru Transport moves commercial and industrial cargo with a professional fleet and business-focused service.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  // International phone in tel:+-format for clickable links (derived from
  // contact.phone — do not hard-code elsewhere).
  phoneIntl: "+917081129429",

  // Confirmed business contact details (single source of truth).
  contact: {
    // Visible text shows the local format; links use tel:+91... (see phoneHref below).
    phone: "7081129429",
    email: "vinityadav4122@gmail.com",
    address: "Gala No. 3284, Opp. Piramal Company, Ambernath, Maharashtra, India",
    // Business hours are intentionally NOT configured: we don't publish
    // opening hours we cannot confirm. When the owner confirms them, set a
    // string here — every UI surface that shows hours checks for it first.
    hours: undefined as string | undefined,
    // WhatsApp destination, digits only (country code + number, no '+',
    // spaces or dashes). Empty string hides WhatsApp actions everywhere.
    whatsapp: "917081129429",
  },

  navigation: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Fleet", href: "/fleet" },
    { label: "Industries", href: "/industries" },
    { label: "Tracking", href: "/tracking" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  cta: { label: "GET A QUOTE", href: "/quote" },

  social: [] as Array<{ label: string; href: string }>,
} as const;

// Maharashtra locations used by the route visualization. Ambernath (home
// base) sits at the center. Presence here does NOT confirm service coverage —
// copy on the route section explicitly labels it as a visualization, not a
// claim. Positions are schematic, not geographic.
export const routeLocations = [
  { id: "ambernath", name: "Ambernath", x: 0, z: 0 },
  { id: "mumbai", name: "Mumbai", x: -2.2, z: 0.6 },
  { id: "thane", name: "Thane", x: -1.5, z: 1.1 },
  { id: "pune", name: "Pune", x: -0.6, z: 2.4 },
  { id: "nashik", name: "Nashik", x: -1.2, z: -1.6 },
  { id: "nagpur", name: "Nagpur", x: 2.6, z: -1.0 },
] as const;

export type RouteLocationId = (typeof routeLocations)[number]["id"];

/**
 * wa.me deep link built from the configured WhatsApp number.
 * Returns null when WhatsApp is not configured (UI hides the button).
 */
export function whatsappLink(message?: string): string | null {
  const digits = siteConfig.contact.whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

/** Clickable tel: link built from the international number. */
export function phoneHref(): string {
  return `tel:${siteConfig.phoneIntl}`;
}

/** Clickable mailto: link. */
export function emailHref(): string {
  return `mailto:${siteConfig.contact.email}`;
}

/**
 * Google Maps search link built from the configured address — a plain search
 * query, deliberately NOT a Place ID or coordinates (we don't invent those).
 */
export function mapsLink(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${siteConfig.name} ${siteConfig.contact.address}`,
  )}`;
}

export const quoteServiceTypes = [
  "Full Truckload",
  "Part Load",
  "Dedicated Transportation",
  "Industrial Transportation",
  "Commercial Goods",
  "Fleet Solutions",
  "Long-Distance",
  "Logistics Coordination",
  "Not sure yet",
] as const;

export const vehiclePreferences = [
  "Heavy Truck",
  "Medium Truck",
  "Light Commercial Vehicle",
  "Specialized Vehicle",
  "No preference",
] as const;
