import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-amber-500 text-navy-950 hover:bg-amber-soft active:bg-amber-deep shadow-[0_0_24px_rgba(245,166,35,0.25)] hover:shadow-[0_0_32px_rgba(245,166,35,0.35)]",
  outline:
    "border border-navy-500 text-mist-100 hover:border-amber-500/60 hover:text-white hover:bg-navy-800",
  ghost: "text-mist-300 hover:text-white hover:bg-navy-800",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-sm py-3.5",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn("btn-base rounded-md", variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn("btn-base rounded-md", variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
