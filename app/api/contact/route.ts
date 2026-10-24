import { NextResponse } from "next/server";
import { contactFormSchema, honeypotSchema } from "@/lib/validation/schemas";
import { isSupabaseConfigured, createAdminSupabaseClient } from "@/lib/supabase/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  // 1. Rate limit (per IP, fixed window).
  const rl = await rateLimit(request, "contact");
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

  // 3. Honeypot.
  const hp = honeypotSchema.safeParse(body);
  if (hp.success && (hp.data.website?.length ?? 0) > 0) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const parsed = contactFormSchema.safeParse(body);
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
  const record = {
    name: values.name,
    email: values.email,
    phone: values.phone || null,
    subject: values.subject || null,
    message: values.message,
    status: "new" as const,
  };

  if (!isSupabaseConfigured()) {
    console.log("[demo] Contact message received (no database):", values.email);
    return NextResponse.json({ ok: true, demo: true }, { status: 201 });
  }

  try {
    const supabase = createAdminSupabaseClient();

    // 4. Duplicate-submission protection (same email + message, 10 min).
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("contact_messages")
      .select("id")
      .eq("email", values.email.toLowerCase())
      .eq("message", values.message)
      .gte("created_at", since)
      .limit(1);

    if (recent && recent.length > 0) {
      return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
    }

    const { error } = await supabase.from("contact_messages").insert(record);
    if (error) {
      console.error("[contact] Insert failed:", error.message);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
