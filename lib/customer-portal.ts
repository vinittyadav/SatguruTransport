import {
  createAdminSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { getCustomerIdentity } from "@/lib/auth";
import type { QuoteRequest, Shipment, ShipmentEvent } from "@/types";

export interface CustomerShipment {
  shipment: Shipment;
  events: ShipmentEvent[];
}

export interface CustomerData {
  /** All shipments belonging to this customer, newest first. */
  shipments: CustomerShipment[];
  /** Quote requests matched by email, newest first. */
  quotes: QuoteRequest[];
}

/**
 * Real database values for the signed-in customer. Everything is scoped by
 * the authenticated user's email — the service-role client is required
 * because migration 0003 revoked broad `authenticated` grants; scoping is
 * enforced HERE, server-side, not by RLS.
 *
 * Shipment → customer linkage (any of): customer_id row with matching email,
 * or customer_name equal to the quote's company/customer name derived from
 * the same email. Quotes are matched directly by email.
 */
export async function getCustomerData(): Promise<CustomerData | null> {
  const identity = await getCustomerIdentity();
  if (!identity || !isSupabaseConfigured()) return null;

  const db = createAdminSupabaseClient();
  const email = identity.email;

  // --- Shipments linked via the customers table -----------------------
  const { data: customerRow } = await db
    .from("customers")
    .select("id, company_name, contact_name")
    .eq("email", email)
    .maybeSingle();

  let shipments: Shipment[] = [];

  if (customerRow) {
    const { data } = await db
      .from("shipments")
      .select("*")
      .eq("customer_id", (customerRow as { id: string }).id)
      .order("created_at", { ascending: false });
    shipments = (data ?? []) as Shipment[];
  }

  // Fall back to name-based linkage for shipments created before a
  // customer row existed (convertQuoteToShipment stores customer_name).
  const nameKeys = new Set<string>();
  if (customerRow) {
    const r = customerRow as { company_name: string; contact_name: string | null };
    if (r.company_name?.trim()) nameKeys.add(r.company_name.trim());
    if (r.contact_name?.trim()) nameKeys.add(r.contact_name.trim());
  }
  if (identity.fullName?.trim()) nameKeys.add(identity.fullName.trim());

  if (nameKeys.size > 0) {
    const { data } = await db
      .from("shipments")
      .select("*")
      .in("customer_name", [...nameKeys])
      .order("created_at", { ascending: false });
    const byId = new Map<string, Shipment>();
    for (const s of [...shipments, ...((data ?? []) as Shipment[])]) {
      byId.set(s.id, s);
    }
    shipments = [...byId.values()].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  // --- Events for each shipment (public timeline data) ----------------
  const shipmentsWithEvents: CustomerShipment[] = [];
  for (const shipment of shipments.slice(0, 20)) {
    const { data: events } = await db
      .from("shipment_events")
      .select("*")
      .eq("shipment_id", shipment.id)
      .order("occurred_at", { ascending: false });
    shipmentsWithEvents.push({ shipment, events: (events ?? []) as ShipmentEvent[] });
  }

  // --- Quotes matched by email ----------------------------------------
  const { data: quotes } = await db
    .from("quote_requests")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(20);

  return {
    shipments: shipmentsWithEvents,
    quotes: (quotes ?? []) as QuoteRequest[],
  };
}
