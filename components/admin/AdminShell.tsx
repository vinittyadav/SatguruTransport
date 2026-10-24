"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Package,
  Settings2,
  Users,
  IdCard,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { signOut } from "@/app/admin/actions";

const NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Quotes", href: "/admin/quotes", icon: FileText },
  { label: "Shipments", href: "/admin/shipments", icon: Package },
  { label: "Messages", href: "/admin/messages", icon: ExternalLink },
  { label: "Content", href: "/admin/content", icon: Settings2 },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Drivers", href: "/admin/drivers", icon: IdCard },
];

export function AdminShell({
  email,
  role,
  children,
}: {
  email: string;
  role?: "admin" | "staff";
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-navy-700 bg-navy-900 lg:flex">
        <div className="flex h-16 items-center border-b border-navy-700 px-5">
          <Logo compact />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-amber-500/10 text-amber-500"
                    : "text-mist-300 hover:bg-navy-800 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-navy-700 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-mist-300 hover:bg-navy-800 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            View website
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-mist-300 hover:bg-navy-800 hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:pl-60">
        {/* Topbar (mobile nav is a horizontal scroll strip) */}
        <header className="sticky top-0 z-20 border-b border-navy-700 bg-navy-950/95 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-3 lg:px-8">
            <div className="flex gap-1 overflow-x-auto lg:hidden">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-xs",
                    pathname === item.href
                      ? "bg-amber-500/10 text-amber-500"
                      : "text-mist-400",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="hidden text-sm text-mist-400 lg:block">
              Signed in as <span className="font-medium text-white">{email}</span>
              {role && (
                <span
                  className={cn(
                    "chip ml-3 align-middle",
                    role === "admin"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                      : "border-navy-600 bg-navy-800 text-mist-300",
                  )}
                >
                  {role}
                </span>
              )}
            </p>
            <form action={signOut} className="lg:hidden">
              <button
                type="submit"
                className="text-xs text-mist-400 hover:text-rose-300"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
