"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validation/schemas";

export function ContactForm() {
  const [state, setState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [honeypot, setHoneypot] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setState("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: honeypot }),
      });
      if (!res.ok) throw new Error();
      setState("success");
      reset();
    } catch {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="py-10 text-center">
        <CheckCircle2
          className="mx-auto h-10 w-10 text-emerald-400"
          strokeWidth={1.5}
        />
        <h2 className="heading-md mt-4">Message sent</h2>
        <p className="body-muted mx-auto mt-2 max-w-sm text-sm">
          Thank you for reaching out. We'll get back to you shortly.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setState("idle")}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {state === "error" && (
        <div
          role="alert"
          className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          Something went wrong. Please try again.
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Name *" error={errors.name?.message} {...register("name")} />
        <Input
          label="Email *"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Phone" type="tel" error={errors.phone?.message} {...register("phone")} />
        <Input label="Subject" error={errors.subject?.message} {...register("subject")} />
      </div>
      <Textarea
        label="Message *"
        placeholder="How can we help?"
        error={errors.message?.message}
        {...register("message")}
      />
      <Button
        type="submit"
        size="lg"
        disabled={state === "submitting"}
        className="w-full sm:w-auto"
      >
        {state === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send message"
        )}
      </Button>

      {/* Honeypot — see QuoteForm for rationale. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>
    </form>
  );
}
