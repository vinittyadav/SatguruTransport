import {
  createAdminSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/Card";
import { ContentManager } from "@/components/admin/ContentManager";
import type { Faq, Industry, Service, Vehicle } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Demo mode — connect the database"
        description="Content management activates once Supabase is configured. Until then the site uses the editable fallback content in lib/config/content.ts."
      />
    );
  }

  const db = createAdminSupabaseClient();

  const [servicesRes, vehiclesRes, industriesRes, faqsRes] = await Promise.all([
    db.from("services").select("*").order("sort_order"),
    db.from("vehicles").select("*").order("sort_order"),
    db.from("industries").select("*").order("sort_order"),
    db.from("faqs").select("*").order("sort_order"),
  ]);

  const services = (servicesRes.data ?? []) as Service[];
  const vehicles = (vehiclesRes.data ?? []) as Vehicle[];
  const industries = (industriesRes.data ?? []) as Industry[];
  const faqs = (faqsRes.data ?? []) as Faq[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Content</h1>
        <p className="body-muted mt-1 text-sm">
          Manage services, fleet categories, industries and FAQs. Published
          records appear on the public site; draft records are hidden.
        </p>
      </div>

      <ContentManager
        services={services}
        vehicles={vehicles}
        industries={industries}
        faqs={faqs}
      />
    </div>
  );
}
