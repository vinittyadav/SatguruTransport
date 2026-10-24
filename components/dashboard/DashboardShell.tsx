"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, LogOut, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { customerSignOut } from "@/app/dashboard/actions";

const NAV = [
  { label: "Overview", short: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Shipments", short: "Shipments", href: "/dashboard/shipments", icon: Package },
  { label: "Quotes", short: "Quotes", href: "/dashboard/quotes", icon: FileText },
  { label: "Profile", short: "Profile", href: "/dashboard/profile", icon: User },
];

/**
 * Customer portal chrome. Mobile: fixed bottom tab bar (app-like, replaces
 * the site-wide MobileActionBar, which hides itself on /dashboard).
 * Desktop: top navigation strip.
 */
export function DashboardShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-navy-950">
      <header className="sticky top-0 z-30 border-b border-navy-700 bg-navy-950/95 backdrop-blur-md">
        <div className="container-premium flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "text-amber-500"
                      : "text-mist-300 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-mist-500 sm:block">{email}</span>
            <form action={customerSignOut}>
              <button
                type="submit"
                className="flex h-9 items-center gap-2 rounded-md border border-navy-600 px-3 text-xs text-mist-300 transition-colors hover:border-navy-500 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container-premium py-8 pb-24 md:pb-12">{children}</main>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Portal navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-700 bg-navy-950/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 py-2 transition-colors",
                  isActive(item.href) ? "text-amber-500" : "text-mist-400",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  {item.short}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
