import { NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminSupabaseClient } from "@/lib/supabase/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import type { Shipment, ShipmentEvent } from "@/types";

export async function GET(request: Request) {
  // Rate limit code guessing (per IP, higher allowance than form posts).
  const rl = await rateLimit(request, "tracking", 30, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code || code.length < 4) {
    return NextResponse.json(
      { error: "A tracking code is required." },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Tracking is unavailable until the database is connected." },
      { status: 503 },
    );
  }

  try {
    const supabase = createAdminSupabaseClient();

    const { data: shipment, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("tracking_code", code)
      .maybeSingle();

    if (error) {
      console.error("[tracking] Query failed:", error.message);
      return NextResponse.json(
        { error: "Unable to retrieve shipment status." },
        { status: 500 },
      );
    }

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    const { data: events, error: eventsError } = await supabase
      .from("shipment_events")
      .select("*")
      .eq("shipment_id", shipment.id)
      .order("occurred_at", { ascending: false });

    if (eventsError) {
      console.error("[tracking] Events query failed:", eventsError.message);
    }

    // Provenance for the "Quote Requested" milestone — only when this
    // shipment was converted from a quote.
    let quoteCreatedAt: string | null = null;
    const shipmentRow = shipment as Shipment;
    if (shipmentRow.quote_id) {
      const { data: quote } = await supabase
        .from("quote_requests")
        .select("created_at")
        .eq("id", shipmentRow.quote_id)
        .maybeSingle();
      quoteCreatedAt =
        (quote as { created_at: string } | null)?.created_at ?? null;
    }

    // Assigned vehicle display name — real row or null (UI shows
    // "To be assigned", never an invented value).
    let vehicle: { title: string; category: string } | null = null;
    if (shipmentRow.vehicle_id) {
      const { data: vehicleRow } = await supabase
        .from("vehicles")
        .select("title, category")
        .eq("id", shipmentRow.vehicle_id)
        .maybeSingle();
      vehicle = (vehicleRow as { title: string; category: string } | null) ?? null;
    }

    return NextResponse.json({
      shipment: shipmentRow,
      events: (events ?? []) as ShipmentEvent[],
      quote_created_at: quoteCreatedAt,
      vehicle,
    });
  } catch (err) {
    console.error("[tracking] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unable to retrieve shipment status." },
      { status: 500 },
    );
  }
}
