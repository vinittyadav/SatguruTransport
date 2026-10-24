"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateQuoteStatus } from "@/app/admin/actions";
import { cn, quoteStatusLabels } from "@/lib/utils";
import type { QuoteStatus } from "@/types";

export function QuoteStatusSelect({
  id,
  current,
}: {
  id: string;
  current: QuoteStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative">
      <select
        className={cn(
          "input-base w-36 py-1.5 text-xs",
          pending && "opacity-50",
        )}
        value={current}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as QuoteStatus;
          startTransition(async () => {
            await updateQuoteStatus(id, next);
          });
        }}
      >
        {(Object.keys(quoteStatusLabels) as QuoteStatus[]).map((s) => (
          <option key={s} value={s} className="bg-navy-900">
            {quoteStatusLabels[s]}
          </option>
        ))}
      </select>
      {pending && (
        <Loader2 className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-mist-400" />
      )}
    </div>
  );
}
