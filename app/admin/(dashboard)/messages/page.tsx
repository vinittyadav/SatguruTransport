import {
  createAdminSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/Card";
import { ContactStatusSelect } from "@/components/admin/ContactStatusSelect";
import { formatDateTime, cn } from "@/lib/utils";
import type { ContactMessage } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Demo mode — connect the database"
        description="Message management activates once Supabase is configured."
      />
    );
  }

  const db = createAdminSupabaseClient();
  const { data, error } = await db
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <EmptyState
        title="Something went wrong. Please try again."
        description={error.message}
      />
    );
  }

  const messages = (data ?? []) as ContactMessage[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Messages</h1>
        <p className="body-muted mt-1 text-sm">
          Contact form submissions from the website.
        </p>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          title="No messages yet."
          description="Contact form submissions will appear here."
        />
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white">
                    {m.subject || "General inquiry"}
                  </p>
                  <p className="mt-0.5 text-sm text-mist-400">
                    {m.name} · {m.email}
                    {m.phone ? ` · ${m.phone}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-mist-500">
                    {formatDateTime(m.created_at)}
                  </span>
                  <ContactStatusSelect id={m.id} current={m.status} />
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap rounded-md border border-navy-700 bg-navy-900 p-4 text-sm leading-relaxed text-mist-200">
                {m.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
