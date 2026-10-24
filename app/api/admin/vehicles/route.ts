import { NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminSupabaseClient } from "@/lib/supabase/server";
import { isStaffRequest } from "@/lib/auth";

/**
 * Staff-only vehicle roster for assignment dialogs.
 * Requires an authenticated admin/staff profile — public callers get 401/403.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ vehicles: [] });
  }

  if (!(await isStaffRequest())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const db = createAdminSupabaseClient();
  const { data, error } = await db
    .from("vehicles")
    .select("id, title, vehicle_number, availability")
    .order("vehicle_number", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("[admin/vehicles] Query failed:", error.message);
    return NextResponse.json({ vehicles: [] }, { status: 500 });
  }

  return NextResponse.json({ vehicles: data ?? [] });
}
