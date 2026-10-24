import {
  createAdminSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/Card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";
import { DriverCreator } from "@/components/admin/DriverCreator";
import { DriverStatusSelect } from "@/components/admin/DriverStatusSelect";
import type { Driver } from "@/types";

export const dynamic = "force-dynamic";

const EXPIRY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/** Server-side freshness check — Date.now() at request time is intended here (RSC). */
function isExpiringSoon(driver: Driver): boolean {
  return (
    !!driver.license_expiry &&
    new Date(driver.license_expiry).getTime() - Date.now() < EXPIRY_WINDOW_MS
  );
}

export default async function AdminDriversPage() {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Demo mode — connect the database"
        description="Driver management activates once Supabase is configured."
      />
    );
  }

  const db = createAdminSupabaseClient();
  const { data, error } = await db
    .from("drivers")
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

  const drivers = (data ?? []) as Driver[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Drivers</h1>
          <p className="body-muted mt-1 text-sm">
            Driver register with license tracking. License expiry is highlighted
            when within 30 days.
          </p>
        </div>
        <DriverCreator />
      </div>

      {drivers.length === 0 ? (
        <EmptyState
          title="No drivers registered yet."
          description="Add drivers to track licenses and availability."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Phone</TH>
              <TH>License</TH>
              <TH>Expiry</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {drivers.map((d) => {
              const expiringSoon = isExpiringSoon(d);
              return (
                <TR key={d.id}>
                  <TD className="font-medium text-white">{d.name}</TD>
                  <TD>{d.phone ?? "—"}</TD>
                  <TD className="font-mono text-xs">{d.license_number ?? "—"}</TD>
                  <TD className={expiringSoon ? "text-amber-400" : ""}>
                    {formatDate(d.license_expiry)}
                    {expiringSoon && " ⚠"}
                  </TD>
                  <TD>
                    <DriverStatusSelect id={d.id} current={d.status} />
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}
    </div>
  );
}
