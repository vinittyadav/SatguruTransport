import { NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminSupabaseClient } from "@/lib/supabase/server";
import { isStaffRequest } from "@/lib/auth";

/**
 * Staff-only driver roster for assignment dialogs. Driver PII (phone,
 * license) is intentionally NOT returned here — assignment UIs only need
 * id + name, and this data must never reach a non-staff caller.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ drivers: [] });
  }

  if (!(await isStaffRequest())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const db = createAdminSupabaseClient();
  const { data, error } = await db
    .from("drivers")
    .select("id, name, status")
    .order("name", { ascending: true });

  if (error) {
    console.error("[admin/drivers] Query failed:", error.message);
    return NextResponse.json({ drivers: [] }, { status: 500 });
  }

  return NextResponse.json({ drivers: data ?? [] });
}
