import { cache } from "react";
import {
  createAdminSupabaseClient,
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type { Profile } from "@/types";

/**
 * Require an authenticated user with an admin/staff profile.
 *
 * Auth alone is not authorization: most admin server actions use the
 * service-role client (which bypasses RLS), so the role check must happen
 * here, server-side, on every action. Throws (never returns a value) so
 * callers can simply `await requireStaff()`.
 */
export const requireStaff = cache(async (): Promise<Profile> => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  if (!isSupabaseConfigured()) {
    throw new Error("Database is not configured.");
  }

  const db = createAdminSupabaseClient();
  const { data: profile } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    throw new Error("Not authorized.");
  }

  return profile as Profile;
});

/**
 * Require an admin (not just staff). Used for destructive or
 * account-management operations.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireStaff();
  if (profile.role !== "admin") {
    throw new Error("Admin role required.");
  }
  return profile;
}

/**
 * True when the current request is signed in as admin/staff. Never trust
 * this in the browser — it is a render-time convenience for layout chrome.
 */
export async function isStaffRequest(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    await requireStaff();
    return true;
  } catch {
    return false;
  }
}

export interface CustomerIdentity {
  userId: string;
  email: string;
  fullName: string | null;
  /** Row in the customers table linked by email, if one exists. */
  customerId: string | null;
}

/**
 * Resolve the signed-in customer-portal user. Customers authenticate with
 * Supabase auth; their data is linked by email (quotes store email, shipments
 * store the customer row / customer_name). Returns null when signed out or
 * when the database is not configured.
 */
export const getCustomerIdentity = cache(
  async (): Promise<CustomerIdentity | null> => {
    if (!isSupabaseConfigured()) return null;
    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) return null;

      // profiles double as the full-name source when present.
      const db = createAdminSupabaseClient();
      const { data: profile } = await db
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const { data: customer } = await db
        .from("customers")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      return {
        userId: user.id,
        email: user.email,
        fullName:
          (profile as { full_name: string | null } | null)?.full_name ?? null,
        customerId: (customer as { id: string } | null)?.id ?? null,
      };
    } catch {
      return null;
    }
  },
);
