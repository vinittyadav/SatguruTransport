"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateContactStatus } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import type { ContactStatus } from "@/types";

const labels: Record<ContactStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  closed: "Closed",
};

export function ContactStatusSelect({
  id,
  current,
}: {
  id: string;
  current: ContactStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className={cn("input-base w-32 py-1.5 text-xs", pending && "opacity-50")}
      value={current}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as ContactStatus;
        startTransition(async () => {
          await updateContactStatus(id, next);
        });
      }}
    >
      {(Object.keys(labels) as ContactStatus[]).map((s) => (
        <option key={s} value={s} className="bg-navy-900">
          {labels[s]}
        </option>
      ))}
    </select>
  );
}
