import {
  createAdminSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/Card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";
import type { Customer } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Demo mode — connect the database"
        description="Customer management activates once Supabase is configured."
      />
    );
  }

  const db = createAdminSupabaseClient();
  const { data, error } = await db
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <EmptyState
        title="Something went wrong. Please try again."
        description={error.message}
      />
    );
  }

  const customers = (data ?? []) as Customer[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Customers</h1>
        <p className="body-muted mt-1 text-sm">
          Companies that have requested quotes or booked shipments.
        </p>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          title="No customers yet."
          description="Customers are created when quotes convert into bookings. Records can also be added directly in Supabase."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Company</TH>
              <TH>Contact</TH>
              <TH>Email</TH>
              <TH>Phone</TH>
              <TH>Since</TH>
            </TR>
          </THead>
          <TBody>
            {customers.map((c) => (
              <TR key={c.id}>
                <TD className="font-medium text-white">{c.company_name}</TD>
                <TD>{c.contact_name ?? "—"}</TD>
                <TD>{c.email ?? "—"}</TD>
                <TD>{c.phone ?? "—"}</TD>
                <TD className="text-xs">{formatDate(c.created_at)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
