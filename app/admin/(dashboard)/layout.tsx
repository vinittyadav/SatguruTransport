import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createAdminSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";
import type { Profile } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Demo mode: no Supabase env vars — render the shell with a warning.
  if (!isSupabaseConfigured()) {
    return (
      <AdminShell email="demo@localhost">
        <div className="mb-6 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <strong className="font-semibold">Demo mode.</strong> Supabase
          environment variables are not set — data below is illustrative and
          writes are disabled. Configure <code>.env.local</code> to enable the
          database and authentication.
        </div>
        {children}
      </AdminShell>
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Resolve role server-side. A user with no profile or a non-staff role
  // is not shown a dashboard full of service-role data — they are signed
  // out and redirected with a clear reason.
  let profile: Profile | null = null;
  try {
    const db = createAdminSupabaseClient();
    const { data } = await db
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    profile = (data as Profile) ?? null;
  } catch {
    profile = null;
  }

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    await supabase.auth.signOut();
    redirect(
      "/admin/login?error=" +
        encodeURIComponent(
          "This account does not have admin access. Ask an administrator to add your profile role.",
        ),
    );
  }

  return (
    <AdminShell email={user.email ?? "admin"} role={profile.role}>
      {children}
    </AdminShell>
  );
}
