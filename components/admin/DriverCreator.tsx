"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createDriver } from "@/app/admin/actions";

export function DriverCreator() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await createDriver({
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? "") || null,
        license_number: String(form.get("license_number") ?? "") || null,
        license_expiry: String(form.get("license_expiry") ?? "") || null,
      });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add driver.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add driver
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add driver">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            >
              {error}
            </div>
          )}
          <Input label="Name" name="name" required />
          <Input label="Phone" name="phone" type="tel" />
          <Input label="License number" name="license_number" />
          <Input label="License expiry" name="license_expiry" type="date" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Add driver"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
