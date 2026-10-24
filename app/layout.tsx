import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/config/site";
import { OrganizationJsonLd } from "@/components/business/OrganizationJsonLd";
import { MobileActionBar } from "@/components/ui/MobileActionBar";

const display = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "transport company Maharashtra",
    "logistics India",
    "truck transportation",
    "full truckload",
    "part load transport",
    "fleet services",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#06090f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `translate="no"` + `notranslate`: browser page-translation (Chrome/Brave
    // Translate, and similar extensions) reparents every text node into <font>
    // wrappers, which corrupts React-owned DOM and crashes hydration/unmount
    // with NotFoundError: Failed to execute 'removeChild' on 'Node'. This site
    // is English-only, so opting out of automatic translation is safe.
    <html
      lang="en"
      translate="no"
      className={`notranslate ${display.variable} ${body.variable}`}
    >
      <body>
        <OrganizationJsonLd />
        {children}
        <MobileActionBar />
      </body>
    </html>
  );
}
