"use client";

import Link from "next/link";
import * as Lucide from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Industry, Service } from "@/types";
import { Reveal } from "@/components/ui/Reveal";

function resolveIcon(name: string): LucideIcon {
  const candidates = Lucide as unknown as Record<string, LucideIcon | undefined>;
  return candidates[name] ?? Lucide.Truck;
}

/** Static Lucide namespace — safe for JSX lookups inside components. */
const iconByName = Lucide as unknown as Record<string, LucideIcon | undefined>;

/**
 * Module-level icon renderer: components must not be created during render,
 * so the dynamic Lucide lookup lives in its own component.
 */
function ResolveIcon({
  name,
  className = "",
  strokeWidth = 1.75,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = iconByName[name] ?? Lucide.Truck;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}

export function ServiceCard({
  service,
  index = 0,
}: {
  service: Service;
  index?: number;
}) {
  return (
    <Reveal delay={index * 0.06}>
      <div className="card-interactive group flex h-full flex-col">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-md border border-amber-500/25 bg-amber-500/10 text-amber-500">
            <ResolveIcon name={service.icon} className="h-5 w-5" />
          </div>
          <Lucide.ArrowUpRight className="h-4 w-4 text-mist-500 transition-all group-hover:translate-x-0.5 group-hover:text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-white">{service.title}</h3>
        <p className="body-muted mt-2 flex-1 text-sm leading-relaxed">
          {service.short_description}
        </p>
        <Link
          href={`/services#${service.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-500 transition-colors hover:text-amber-soft"
        >
          Learn more
          <Lucide.ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Reveal>
  );
}

export function IndustryCard({
  industry,
  index = 0,
}: {
  industry: Industry;
  index?: number;
}) {
  return (
    <Reveal delay={index * 0.06}>
      <div className="card-interactive flex h-full flex-col">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-md border border-navy-600 bg-navy-800 text-amber-500">
            <ResolveIcon name={industry.icon} className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">{industry.title}</h3>
        </div>
        <div className="space-y-4 text-sm leading-relaxed">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-mist-500">
              Challenge
            </p>
            <p className="text-mist-300">{industry.challenge}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-500/80">
              How we help
            </p>
            <p className="text-mist-200">{industry.solution}</p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
