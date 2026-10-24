import { siteConfig } from "@/lib/config/site";

/**
 * Organization structured data. Contact fields come exclusively from
 * siteConfig — real confirmed values are emitted as-is. No invented ratings,
 * hours, coverage claims or certifications are ever included.
 */
export function OrganizationJsonLd() {
  const base = siteConfig.url.replace(/\/$/, "");

  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    description: siteConfig.description,
    url: base,
    logo: `${base}/icon.svg`,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.address,
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
    />
  );
}
