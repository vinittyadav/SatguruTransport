import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import * as Lucide from "lucide-react";

export function Section({
  className,
  id,
  children,
}: {
  className?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("section-pad", className)}>
      <div className="container-premium">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "mb-14 max-w-3xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow && (
        <div className={cn(align === "center" && "flex justify-center")}>
          <span className="eyebrow">{eyebrow}</span>
        </div>
      )}
      <h2 className="heading-lg">{title}</h2>
      {description && <p className="body-muted mt-4">{description}</p>}
    </div>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("card", className)}>{children}</div>;
}

export function IconBadge({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-md border border-amber-500/25 bg-amber-500/10 text-amber-500",
        className,
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} />
    </div>
  );
}

export function StatusChip({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return <span className={cn("chip", className)}>{label}</span>;
}

export function EmptyState({
  icon: Icon = Lucide.Inbox,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-navy-600 bg-navy-800 text-mist-400">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <p className="font-semibold text-white">{title}</p>
      {description && <p className="body-muted max-w-sm">{description}</p>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong. Please try again.",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 border-rose-500/25 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400">
        <Lucide.AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <p className="font-semibold text-white">{title}</p>
      {description && <p className="body-muted max-w-sm">{description}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-base mt-2 rounded-md border border-navy-500 px-5 py-2 text-sm text-mist-100 hover:border-amber-500/60 hover:text-white"
        >
          Try again
        </button>
      )}
    </div>
  );
}
