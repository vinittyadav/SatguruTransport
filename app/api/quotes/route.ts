import { NextResponse } from "next/server";
import { quoteFormSchema, honeypotSchema } from "@/lib/validation/schemas";
import { generateReferenceCode } from "@/lib/utils";
import { isSupabaseConfigured, createAdminSupabaseClient } from "@/lib/supabase/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

// Guard against oversized bodies before parsing.
const MAX_BODY_BYTES = 16 * 1024; // 16 KB is generous for this form

export async function POST(request: Request) {
  // 1. Rate limit (per IP, fixed window).
  const rl = await rateLimit(request, "quotes");
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  // 2. Request size limit.
  const declared = request.headers.get("content-length");
  if (declared && Number(declared) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // 3. Honeypot: bots filling the hidden "website" field are silently
  //    dropped with a fake success so they don't adapt.
  const hp = honeypotSchema.safeParse(body);
  if (hp.success && (hp.data.website?.length ?? 0) > 0) {
    return NextResponse.json(
      { ok: true, reference_code: generateReferenceCode() },
      { status: 201 },
    );
  }

  const parsed = quoteFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please correct the highlighted fields.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const values = parsed.data;
  const reference_code = generateReferenceCode();

  const record = {
    reference_code,
    company_name: values.company_name || null,
    contact_name: values.contact_name,
    email: values.email,
    phone: values.phone,
    origin_city: values.origin_city,
    destination_city: values.destination_city,
    cargo_description: values.cargo_description,
    cargo_weight_kg: values.cargo_weight_kg ?? null,
    vehicle_preference: values.vehicle_preference || null,
    service_type: values.service_type || null,
    preferred_pickup_date: values.preferred_pickup_date || null,
    notes: values.notes || null,
    status: "new" as const,
  };

  if (!isSupabaseConfigured()) {
    // Demo mode: accept but don't persist.
    console.log("[demo] Quote request received (no database):", reference_code);
    return NextResponse.json({ ok: true, reference_code, demo: true }, { status: 201 });
  }

  try {
    const supabase = createAdminSupabaseClient();

    // 4. Duplicate-submission protection: same email + route + cargo within
    //    10 minutes is treated as a re-submission, not a new lead.
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("quote_requests")
      .select("reference_code")
      .eq("email", values.email.toLowerCase())
      .eq("origin_city", values.origin_city)
      .eq("destination_city", values.destination_city)
      .eq("cargo_description", values.cargo_description)
      .gte("created_at", since)
      .limit(1);

    if (recent && recent.length > 0) {
      const dup = recent[0] as { reference_code: string };
      return NextResponse.json(
        {
          ok: true,
          reference_code: dup.reference_code,
          duplicate: true,
        },
        { status: 200 },
      );
    }

    const { error } = await supabase.from("quote_requests").insert(record);
    if (error) {
      console.error("[quotes] Insert failed:", error.message);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, reference_code }, { status: 201 });
  } catch (err) {
    console.error("[quotes] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
