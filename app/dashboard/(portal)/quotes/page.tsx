import Link from "next/link";
import { FileText } from "lucide-react";
import { getCustomerData } from "@/lib/customer-portal";
import {
  cn,
  formatDate,
  quoteStatusLabels,
  quoteStatusStyles,
} from "@/lib/utils";
import { EmptyState } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import type { QuoteRequest } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardQuotesPage() {
  const data = await getCustomerData();
  const quotes = data?.quotes ?? [];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Portal</p>
        <h1 className="heading-lg">Quotes.</h1>
        <p className="body-muted mt-2">
          Quote requests submitted with your email, newest first.
        </p>
      </div>

      {quotes.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={FileText}
            title="No quote requests yet."
            description="Requests you submit appear here with their current status."
          />
          <div className="text-center">
            <ButtonLink href="/quote">Request a quote</ButtonLink>
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {quotes.map((q: QuoteRequest) => (
            <li key={q.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-bold text-amber-500">
                    {q.reference_code}
                  </p>
                  <p className="mt-1 font-medium text-white">
                    {q.origin_city} → {q.destination_city}
                  </p>
                  <p className="mt-0.5 text-xs text-mist-500">
                    Requested {formatDate(q.created_at)}
                    {q.preferred_pickup_date
                      ? ` · Pickup ${formatDate(q.preferred_pickup_date)}`
                      : ""}
                  </p>
                </div>
                <span className={cn("chip", quoteStatusStyles[q.status])}>
                  {quoteStatusLabels[q.status]}
                </span>
              </div>
              {q.cargo_description && (
                <p className="mt-3 border-t border-navy-700 pt-3 text-sm text-mist-300">
                  {q.cargo_description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-mist-500">
        Need a new quote?{" "}
        <Link href="/quote" className="text-amber-500 hover:underline">
          Start a request →
        </Link>
      </p>
    </div>
  );
}
