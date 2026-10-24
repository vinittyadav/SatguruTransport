"use client";

import { useTransition } from "react";
import { updateDriverStatus } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const labels = {
  active: "Active",
  on_leave: "On leave",
  inactive: "Inactive",
} as const;

export function DriverStatusSelect({
  id,
  current,
}: {
  id: string;
  current: keyof typeof labels;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className={cn("input-base w-32 py-1.5 text-xs", pending && "opacity-50")}
      value={current}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as keyof typeof labels;
        startTransition(async () => {
          await updateDriverStatus(id, next);
        });
      }}
    >
      {(Object.keys(labels) as Array<keyof typeof labels>).map((s) => (
        <option key={s} value={s} className="bg-navy-900">
          {labels[s]}
        </option>
      ))}
    </select>
  );
}
