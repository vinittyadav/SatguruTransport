"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createAdminSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { requireStaff, requireAdmin } from "@/lib/auth";
import { assertQuoteConvertible } from "@/lib/workflow";
import { generateTrackingCode } from "@/lib/utils";
import type {
  QuoteStatus,
  ShipmentStatus,
  ContactStatus,
  QuoteRequest,
  Shipment,
} from "@/types";

function requireDb() {
  if (!isSupabaseConfigured()) {
    throw new Error("Database is not configured.");
  }
  return createAdminSupabaseClient();
}

// ---------- Auth ----------

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!isSupabaseConfigured()) {
    redirect("/admin/login?error=Database+is+not+configured.+Set+Supabase+environment+variables+in+.env.local.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin");
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login");
  }
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------- Quotes ----------

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  await requireStaff();
  const db = requireDb();
  const { error } = await db
    .from("quote_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
}

// ---------- Quote → Shipment conversion ----------

export async function convertQuoteToShipment(
  quoteId: string,
  options: {
    vehicle_id?: string | null;
    driver_id?: string | null;
    estimated_delivery?: string | null;
    notes?: string | null;
  } = {},
): Promise<{ shipment: Shipment; tracking_code: string }> {
  await requireStaff();
  const db = requireDb();

  // 1. Load the quote.
  const { data: quote, error: quoteError } = await db
    .from("quote_requests")
    .select("*")
    .eq("id", quoteId)
    .maybeSingle();
  if (quoteError) throw new Error("Could not load the quote. Please try again.");
  if (!quote) throw new Error("Quote not found.");

  const q = quote as QuoteRequest;

  // 2. Guard: status must be Confirmed/Won and no shipment may exist yet
  //    (checked here AND enforced by a unique partial index in the DB).
  const { data: existing } = await db
    .from("shipments")
    .select("id")
    .eq("quote_id", quoteId)
    .limit(1);
  const existingId = existing && existing.length > 0 ? existing[0].id : null;
  const block = assertQuoteConvertible({
    status: q.status,
    existingShipmentId: existingId,
  });
  if (block) throw new Error(block);

  // 3. Find-or-create the customer record — linked, not duplicated.
  let customerId: string | null = null;
  const customerKey = q.company_name?.trim() || q.contact_name;
  const { data: existingCustomer } = await db
    .from("customers")
    .select("id")
    .eq("company_name", customerKey)
    .maybeSingle();
  customerId = existingCustomer?.id ?? null;

  if (!customerId) {
    const { data: created, error: createError } = await db
      .from("customers")
      .insert({
        company_name: customerKey,
        contact_name: q.contact_name,
        email: q.email,
        phone: q.phone,
      })
      .select("id")
      .single();
    if (createError) {
      throw new Error("Could not create the customer record. Please try again.");
    }
    customerId = created.id;
  }

  // 4. Create the shipment with full provenance links.
  const tracking_code = generateTrackingCode();
  const { data: shipment, error: insertError } = await db
    .from("shipments")
    .insert({
      tracking_code,
      customer_name: customerKey,
      origin_city: q.origin_city,
      destination_city: q.destination_city,
      status: "booked" as ShipmentStatus,
      current_location: q.origin_city,
      estimated_delivery: options.estimated_delivery || null,
      notes:
        options.notes ||
        (q.cargo_description ? `Cargo: ${q.cargo_description}` : null),
      quote_id: quoteId,
      customer_id: customerId,
      vehicle_id: options.vehicle_id || null,
      driver_id: options.driver_id || null,
    })
    .select("*")
    .single();
  if (insertError) {
    if (insertError.code === "23505") {
      throw new Error("A shipment has already been created from this quote.");
    }
    throw new Error("Could not create the shipment. Please try again.");
  }

  // 5. Opening event so the public timeline starts with real history.
  await db.from("shipment_events").insert({
    shipment_id: shipment.id,
    status: "booked",
    location: q.origin_city,
    note: `Shipment created from quote ${q.reference_code}`,
  });

  revalidatePath("/admin/quotes");
  revalidatePath("/admin/shipments");
  revalidatePath("/admin");

  return { shipment: shipment as Shipment, tracking_code };
}

// ---------- Contact messages ----------

export async function updateContactStatus(id: string, status: ContactStatus) {
  await requireStaff();
  const db = requireDb();
  const { error } = await db
    .from("contact_messages")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

// ---------- Shipments ----------

export async function createShipment(input: {
  tracking_code: string;
  customer_name: string | null;
  origin_city: string;
  destination_city: string;
  estimated_delivery: string | null;
}) {
  await requireStaff();
  const db = requireDb();
  const { error } = await db.from("shipments").insert({
    tracking_code: input.tracking_code.toUpperCase(),
    customer_name: input.customer_name,
    origin_city: input.origin_city,
    destination_city: input.destination_city,
    estimated_delivery: input.estimated_delivery,
    status: "booked" as ShipmentStatus,
    current_location: input.origin_city,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/shipments");
  revalidatePath("/admin");
}

export async function assignShipmentResources(input: {
  shipment_id: string;
  vehicle_id: string | null;
  driver_id: string | null;
}) {
  await requireStaff();
  const db = requireDb();
  const { error } = await db
    .from("shipments")
    .update({
      vehicle_id: input.vehicle_id,
      driver_id: input.driver_id,
    })
    .eq("id", input.shipment_id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/shipments");
}

export async function addShipmentEvent(input: {
  shipment_id: string;
  status: ShipmentStatus;
  location: string | null;
  note: string | null;
  occurred_at: string | null;
}) {
  await requireStaff();
  const db = requireDb();

  const { error: eventError } = await db.from("shipment_events").insert({
    shipment_id: input.shipment_id,
    status: input.status,
    location: input.location,
    note: input.note,
    occurred_at: input.occurred_at ?? new Date().toISOString(),
  });
  if (eventError) throw new Error(eventError.message);

  // Sync the shipment row and auto-sync vehicle status with the milestone.
  const { data: shipment } = await db
    .from("shipments")
    .select("vehicle_id")
    .eq("id", input.shipment_id)
    .maybeSingle();
  const vehicleId = (shipment as { vehicle_id: string | null } | null)?.vehicle_id;

  const { error: shipmentError } = await db
    .from("shipments")
    .update({
      status: input.status,
      current_location: input.location,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.shipment_id);
  if (shipmentError) throw new Error(shipmentError.message);

  if (vehicleId) {
    const vehicleStatus =
      input.status === "delivered"
        ? "available"
        : input.status === "in_transit" || input.status === "at_destination"
          ? "in_transit"
          : input.status === "picked_up"
            ? "assigned"
            : null;
    if (vehicleStatus) {
      await db
        .from("vehicles")
        .update({ availability: vehicleStatus })
        .eq("id", vehicleId);
    }
  }

  revalidatePath("/admin/shipments");
  revalidatePath("/admin");
}

// ---------- Content management (services / vehicles / industries / faqs) ----------

type ContentTable = "services" | "vehicles" | "industries" | "faqs";

const CONTENT_TABLES: ContentTable[] = [
  "services",
  "vehicles",
  "industries",
  "faqs",
];

export async function upsertContent(
  table: ContentTable,
  values: Record<string, unknown>,
) {
  await requireStaff();
  if (!CONTENT_TABLES.includes(table)) throw new Error("Invalid table.");
  const db = requireDb();

  const payload: Record<string, unknown> = {
    ...values,
    sort_order: Number(values.sort_order ?? 99),
    status: values.status ?? "published",
  };
  if (table === "faqs") {
    payload.question = String(values.question ?? "");
    payload.answer = String(values.answer ?? "");
    delete payload.features;
  }
  if (table === "vehicles") {
    // Empty strings → null for the new ops fields.
    for (const key of [
      "vehicle_number",
      "driver_id",
      "registration_expiry",
      "insurance_expiry",
    ]) {
      if (payload[key] === "") payload[key] = null;
    }
  }
  delete payload.id;

  if (values.id) {
    const { error } = await db
      .from(table)
      .update(payload)
      .eq("id", String(values.id));
    if (error) throw new Error(error.message);
  } else {
    const { error } = await db.from(table).insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/content");
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/fleet");
  revalidatePath("/industries");
}

export async function deleteContent(table: ContentTable, id: string) {
  await requireAdmin(); // destructive → admin-only
  if (!CONTENT_TABLES.includes(table)) throw new Error("Invalid table.");
  const db = requireDb();
  const { error } = await db.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/content");
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/fleet");
  revalidatePath("/industries");
}

// ---------- Vehicles ----------

export async function updateVehicleStatus(
  id: string,
  availability: "available" | "assigned" | "in_transit" | "maintenance" | "inactive",
) {
  await requireStaff();
  const db = requireDb();
  const { error } = await db
    .from("vehicles")
    .update({ availability })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/content");
  revalidatePath("/fleet");
}

// ---------- Drivers ----------

export async function createDriver(input: {
  name: string;
  phone: string | null;
  license_number: string | null;
  license_expiry: string | null;
}) {
  await requireStaff();
  const db = requireDb();
  const { error } = await db.from("drivers").insert({
    name: input.name,
    phone: input.phone,
    license_number: input.license_number,
    license_expiry: input.license_expiry,
    status: "active",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/drivers");
}

export async function updateDriverStatus(
  id: string,
  status: "active" | "on_leave" | "inactive",
) {
  await requireStaff();
  const db = requireDb();
  const { error } = await db.from("drivers").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/drivers");
}
