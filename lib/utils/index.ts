// Status pipeline maps live in lib/workflow.ts (single source of truth).
// Re-exported here for existing import sites.
export {
  quoteStatusLabels,
  quoteStatusStyles,
  shipmentStatusLabels,
  shipmentStatusStyles,
  shipmentStatusOrder,
  vehicleAvailabilityLabels,
} from "@/lib/workflow";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function generateReferenceCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SGT-${suffix}`;
}

export function generateTrackingCode() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `SGT${digits}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Deterministic low-contrast color from a string, for avatars/chips. */
export function colorFromString(value: string) {
  const palette = ["#f5a623", "#4f8ef7", "#34d399", "#a78bfa", "#f472b6"];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}
