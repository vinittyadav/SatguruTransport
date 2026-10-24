"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, PackageSearch, Phone, Plus } from "lucide-react";
import { phoneHref, whatsappLink } from "@/lib/config/site";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/hooks";

/**
 * Mobile bottom action bar — app-like primary actions for customer surfaces.
 * Hidden on /admin + /dashboard (they have their own chrome/tab bars) and on
 * lg+ screens. Fixed at the bottom; body padding creates breathing room.
 */
export function MobileActionBar() {
  const pathname = usePathname();
  const wa = whatsappLink();

  // Slide-in after mount so the bar never flashes during hydration.
  const mounted = useMounted();

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-navy-700 bg-navy-950/95 backdrop-blur-md transition-transform duration-300 lg:hidden",
        mounted ? "translate-y-0" : "translate-y-full",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <nav className="grid grid-cols-3" aria-label="Quick actions">
        <a
          href={phoneHref()}
          className="flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-mist-300 transition-colors active:text-amber-500"
        >
          <Phone className="h-5 w-5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Call</span>
        </a>
        <Link
          href="/tracking"
          className="flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-mist-300 transition-colors active:text-amber-500"
        >
          <PackageSearch className="h-5 w-5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Track</span>
        </Link>
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-mist-300 transition-colors active:text-amber-500"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">WhatsApp</span>
          </a>
        ) : (
          <Link
            href="/quote"
            className="flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-mist-300 transition-colors active:text-amber-500"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Quote</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
