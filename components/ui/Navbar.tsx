"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, MessageCircle, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig, phoneHref, whatsappLink } from "@/lib/config/site";
import { Logo } from "./Logo";
import { ButtonLink } from "./Button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route change — adjust state during render when
  // the previous pathname differs (React's derived-state pattern).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  // Lock body scroll while mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Hide the site navbar inside /admin (admin has its own chrome).
  if (isAdmin) return null;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          scrolled
            ? "border-b border-navy-700 bg-navy-950/95 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav className="container-premium flex h-16 items-center justify-between lg:h-18">
          <Logo />

          <div className="hidden items-center gap-7 lg:flex">
            {siteConfig.navigation.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    active ? "text-white" : "text-mist-400 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-1.5 lg:flex">
            <a
              href={phoneHref()}
              aria-label="Call Satguru Transport"
              className="flex h-9 w-9 items-center justify-center rounded-md text-mist-300 transition-colors hover:bg-navy-800 hover:text-amber-500"
            >
              <Phone className="h-4 w-4" />
            </a>
            {whatsappLink() && (
              <a
                href={whatsappLink()!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Message Satguru Transport on WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-md text-mist-300 transition-colors hover:bg-navy-800 hover:text-amber-500"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
            <ButtonLink href={siteConfig.cta.href} size="sm" className="ml-2">
              {siteConfig.cta.label}
            </ButtonLink>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-md text-mist-200 hover:bg-navy-800 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-navy-950 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <div className="container-premium flex h-16 items-center justify-between lg:h-18">
              <Logo />
              <button
                className="flex h-10 w-10 items-center justify-center rounded-md text-mist-200 hover:bg-navy-800"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="container-premium mt-6 flex flex-col gap-1 pb-8">
              {siteConfig.navigation.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.25 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-md px-3 py-3.5 font-display text-2xl font-semibold",
                      pathname === item.href ? "text-amber-500" : "text-white hover:bg-navy-800",
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-6">
                <ButtonLink href={siteConfig.cta.href} className="w-full">
                  {siteConfig.cta.label}
                </ButtonLink>
              </div>
              <div className="mt-4 flex gap-3">
                <a
                  href={phoneHref()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md border border-navy-600 bg-navy-850 py-3 text-sm font-medium text-white transition-colors hover:border-navy-500"
                >
                  <Phone className="h-4 w-4 text-amber-500" />
                  Call
                </a>
                {whatsappLink() && (
                  <a
                    href={whatsappLink()!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-md border border-navy-600 bg-navy-850 py-3 text-sm font-medium text-white transition-colors hover:border-navy-500"
                  >
                    <MessageCircle className="h-4 w-4 text-amber-500" />
                    WhatsApp
                  </a>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
