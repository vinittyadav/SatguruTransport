import Link from "next/link";
import { siteConfig } from "@/lib/config/site";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Satguru Transport home">
      <span className="flex h-9 w-9 items-center justify-center rounded-md border border-amber-500/40 bg-navy-800">
        <span className="font-display text-lg font-bold text-amber-500">S</span>
        <span className="sr-only">S</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-bold tracking-[0.18em] text-white">
          {siteConfig.logoLines[0]}
        </span>
        <span className="font-display text-[10px] font-semibold tracking-[0.42em] text-amber-500">
          {siteConfig.logoLines[1]}
        </span>
      </span>
      {compact && <span className="sr-only">compact</span>}
    </Link>
  );
}
