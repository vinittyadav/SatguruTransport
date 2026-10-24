"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Faq } from "@/types";

export function FaqSection({ faqs }: { faqs: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-navy-700 rounded-lg border border-navy-700 bg-navy-850">
      {faqs.map((faq, i) => {
        const open = openIndex === i;
        return (
          <div key={faq.id}>
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={open}
            >
              <span
                className={cn(
                  "font-medium transition-colors",
                  open ? "text-white" : "text-mist-200",
                )}
              >
                {faq.question}
              </span>
              <Plus
                className={cn(
                  "h-4 w-4 shrink-0 text-amber-500 transition-transform duration-200",
                  open && "rotate-45",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="body-muted px-6 pb-6 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
