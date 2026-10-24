"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { upsertContent, deleteContent } from "@/app/admin/actions";
import type { Faq, Industry, Service, Vehicle } from "@/types";

type Tab = "services" | "vehicles" | "industries" | "faqs";

const TABS: { id: Tab; label: string }[] = [
  { id: "services", label: "Services" },
  { id: "vehicles", label: "Fleet" },
  { id: "industries", label: "Industries" },
  { id: "faqs", label: "FAQs" },
];

export function ContentManager({
  services,
  vehicles,
  industries,
  faqs,
}: {
  services: Service[];
  vehicles: Vehicle[];
  industries: Industry[];
  faqs: Faq[];
}) {
  const [tab, setTab] = useState<Tab>("services");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<{ id: string; title: string } | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const lists: Record<Tab, Record<string, unknown>[]> = {
    services: services as unknown as Record<string, unknown>[],
    vehicles: vehicles as unknown as Record<string, unknown>[],
    industries: industries as unknown as Record<string, unknown>[],
    faqs: faqs as unknown as Record<string, unknown>[],
  };

  async function handleSave(values: Record<string, unknown>) {
    setPending(true);
    setError(null);
    try {
      await upsertContent(tab, values);
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletePending(true);
    setError(null);
    try {
      await deleteContent(tab, id);
      setDeleting(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeletePending(false);
    }
  }

  const items = lists[tab];

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-amber-500/10 text-amber-500"
                : "text-mist-400 hover:bg-navy-800 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {error}
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="card text-sm text-mist-400">
            Nothing here yet. Seed the table via the SQL migration, or add an
            item.
          </div>
        )}
        {items.map((item) => {
          const id = String(item.id);
          const title =
            (item.title as string) ??
            (item.question as string) ??
            "Untitled";
          const status = (item.status as string) ?? "draft";
          const desc =
            (item.short_description as string) ??
            (item.description as string) ??
            (item.answer as string) ??
            (item.challenge as string) ??
            "";
          return (
            <div
              key={id}
              className="card flex flex-wrap items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-white">{title}</p>
                  <span
                    className={`chip ${
                      status === "published"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-navy-600 bg-navy-800 text-mist-400"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                {desc && (
                  <p className="mt-1 line-clamp-1 text-sm text-mist-400">{desc}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(item)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-400 hover:text-rose-300"
                  aria-label={`Delete ${title}`}
                  onClick={() => setDeleting({ id, title })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <Button onClick={() => setEditing({})}>
          <Plus className="h-4 w-4" />
          Add {tab === "faqs" ? "FAQ" : tab === "vehicles" ? "vehicle" : "item"}
        </Button>
      </div>

      <ContentEditorModal
        tab={tab}
        values={editing}
        pending={pending}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && handleDelete(deleting.id)}
        title="Delete item"
        message={`Delete "${deleting?.title ?? ""}"? This cannot be undone. If it is published on the public site, it disappears immediately.`}
        confirmLabel="Delete"
        pending={deletePending}
      />
    </div>
  );
}

function ContentEditorModal({
  tab,
  values,
  pending,
  onClose,
  onSave,
}: {
  tab: Tab;
  values: Record<string, unknown> | null;
  pending: boolean;
  onClose: () => void;
  onSave: (v: Record<string, unknown>) => void;
}) {
  if (!values) return null;
  const isEdit = Boolean(values.id);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const out: Record<string, unknown> = {
      id: values?.id,
      ...raw,
      features: String(raw.features ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    onSave(out);
  }

  const v = (k: string) => (values[k] == null ? "" : String(values[k]));

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={`${isEdit ? "Edit" : "Add"} ${
        tab === "faqs" ? "FAQ" : tab.slice(0, -1)
      }`}
    >
      <form onSubmit={submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {tab === "services" && (
          <>
            <Input label="Title" name="title" defaultValue={v("title")} required />
            <Input label="Slug" name="slug" defaultValue={v("slug")} required />
            <Textarea
              label="Short description"
              name="short_description"
              defaultValue={v("short_description")}
              required
            />
            <Textarea
              label="Full description"
              name="description"
              defaultValue={v("description")}
            />
            <Input
              label="Icon (lucide name, e.g. Truck)"
              name="icon"
              defaultValue={v("icon") || "Truck"}
            />
            <Textarea
              label="Features (one per line)"
              name="features"
              defaultValue={Array.isArray(values.features) ? (values.features as string[]).join("\n") : ""}
            />
          </>
        )}

        {tab === "vehicles" && (
          <>
            <Input label="Title" name="title" defaultValue={v("title")} required />
            <Input label="Slug" name="slug" defaultValue={v("slug")} required />
            <div>
              <label className="label-base">Category</label>
              <select name="category" className="input-base" defaultValue={v("category") || "heavy"}>
                <option value="heavy" className="bg-navy-900">Heavy</option>
                <option value="medium" className="bg-navy-900">Medium</option>
                <option value="light" className="bg-navy-900">Light</option>
                <option value="specialized" className="bg-navy-900">Specialized</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Vehicle number"
                name="vehicle_number"
                defaultValue={v("vehicle_number")}
                placeholder="e.g. MH-12-AB-3456"
              />
              <Input label="Driver ID (optional)" name="driver_id" defaultValue={v("driver_id")} placeholder="uuid" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Registration expiry"
                name="registration_expiry"
                type="date"
                defaultValue={v("registration_expiry")}
              />
              <Input
                label="Insurance expiry"
                name="insurance_expiry"
                type="date"
                defaultValue={v("insurance_expiry")}
              />
            </div>
            <Input label="Capacity" name="capacity" defaultValue={v("capacity")} placeholder="e.g. 25 tonnes" />
            <Input
              label="Cargo suitability"
              name="cargo_suitability"
              defaultValue={v("cargo_suitability")}
              placeholder="e.g. Construction materials, machinery"
            />
            <div>
              <label className="label-base">Status</label>
              <select name="availability" className="input-base" defaultValue={v("availability") || "available"}>
                <option value="available" className="bg-navy-900">Available</option>
                <option value="assigned" className="bg-navy-900">Assigned</option>
                <option value="in_transit" className="bg-navy-900">In Transit</option>
                <option value="maintenance" className="bg-navy-900">Maintenance</option>
                <option value="inactive" className="bg-navy-900">Inactive</option>
              </select>
            </div>
            <Textarea label="Description" name="description" defaultValue={v("description")} />
            <Input label="Showroom color (hex)" name="color" defaultValue={v("color") || "#f5a623"} />
          </>
        )}

        {tab === "industries" && (
          <>
            <Input label="Title" name="title" defaultValue={v("title")} required />
            <Input label="Slug" name="slug" defaultValue={v("slug")} required />
            <Textarea label="Challenge" name="challenge" defaultValue={v("challenge")} required />
            <Textarea label="Solution" name="solution" defaultValue={v("solution")} required />
            <Input label="Icon (lucide name)" name="icon" defaultValue={v("icon") || "Factory"} />
          </>
        )}

        {tab === "faqs" && (
          <>
            <Input label="Question" name="question" defaultValue={v("question")} required />
            <Textarea label="Answer" name="answer" defaultValue={v("answer")} required />
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Sort order"
            name="sort_order"
            type="number"
            defaultValue={v("sort_order") || "99"}
          />
          <div>
            <label className="label-base">Status</label>
            <select name="status" className="input-base" defaultValue={v("status") || "published"}>
              <option value="published" className="bg-navy-900">Published</option>
              <option value="draft" className="bg-navy-900">Draft</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
