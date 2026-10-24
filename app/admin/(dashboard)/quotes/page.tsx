import Link from "next/link";
import {
  createAdminSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/Card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { QuoteStatusSelect } from "@/components/admin/QuoteStatusSelect";
import { formatDateTime, quoteStatusLabels, quoteStatusStyles, cn } from "@/lib/utils";
import type { QuoteRequest, QuoteStatus } from "@/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status = "all", q = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Demo mode — connect the database"
        description="Quote management activates once Supabase is configured."
      />
    );
  }

  const db = createAdminSupabaseClient();
  const search = q.trim();

  // Full list (sorted newest first). Result volume is admin-facing; pagination
  // is applied client of the query via count + range when large.
  let query = db
    .from("quote_requests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }
  if (search) {
    const safe = search.replace(/[%_,()]/g, "");
    query = query.or(
      `reference_code.ilike.%${safe}%,contact_name.ilike.%${safe}%,email.ilike.%${safe}%,company_name.ilike.%${safe}%,origin_city.ilike.%${safe}%,destination_city.ilike.%${safe}%`,
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);

  if (error) {
    return (
      <EmptyState
        title="Something went wrong. Please try again."
        description={error.message}
      />
    );
  }

  const quotes = (data ?? []) as QuoteRequest[];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (search) params.set("q", search);
    params.set("page", String(p));
    return `/admin/quotes?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Quote requests</h1>
          <p className="body-muted mt-1 text-sm">
            {total} request{total === 1 ? "" : "s"} · update status as your team works them.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <form action="/admin/quotes" method="get" className="flex items-center gap-2">
            {status !== "all" && <input type="hidden" name="status" value={status} />}
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Search reference, name, email, city…"
              className="input-base w-64 py-2 text-sm"
              aria-label="Search quotes"
            />
            <button
              type="submit"
              className="btn-base h-10 rounded-md border border-navy-500 px-4 text-sm text-mist-100 hover:border-amber-500/60 hover:text-white"
            >
              Search
            </button>
          </form>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <Link
                key={f.value}
                href={f.value === "all" ? "/admin/quotes" : `/admin/quotes?status=${f.value}`}
                className={cn(
                  "chip cursor-pointer",
                  status === f.value
                    ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                    : "border-navy-600 bg-navy-800 text-mist-400 hover:text-white",
                )}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {quotes.length === 0 ? (
        <EmptyState
          title={search || status !== "all" ? "No matching quotes." : "No quote requests yet."}
          description={
            search || status !== "all"
              ? "Try a different search term or status filter."
              : "Submitted quote forms will appear here with full route and cargo details."
          }
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Reference</TH>
                <TH>Customer</TH>
                <TH>Route</TH>
                <TH>Cargo</TH>
                <TH>Received</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {quotes.map((quote) => (
                <TR key={quote.id}>
                  <TD>
                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className="font-mono text-xs text-amber-500 hover:underline"
                    >
                      {quote.reference_code}
                    </Link>
                  </TD>
                  <TD>
                    <p className="font-medium text-white">{quote.contact_name}</p>
                    <p className="text-xs text-mist-500">
                      {quote.company_name ?? "—"} · {quote.phone}
                    </p>
                  </TD>
                  <TD className="whitespace-nowrap">
                    {quote.origin_city} → {quote.destination_city}
                  </TD>
                  <TD className="max-w-56">
                    <p className="truncate text-mist-200">{quote.cargo_description}</p>
                  </TD>
                  <TD className="whitespace-nowrap text-xs">
                    {formatDateTime(quote.created_at)}
                  </TD>
                  <TD>
                    <QuoteStatusSelect id={quote.id} current={quote.status} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex items-center justify-between text-sm text-mist-400">
              <p>
                Page {page} of {pageCount} · {total} total
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={pageHref(page - 1)} className="btn-base h-9 rounded-md border border-navy-500 px-4 hover:border-amber-500/60 hover:text-white">
                    ← Prev
                  </Link>
                )}
                {page < pageCount && (
                  <Link href={pageHref(page + 1)} className="btn-base h-9 rounded-md border border-navy-500 px-4 hover:border-amber-500/60 hover:text-white">
                    Next →
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
