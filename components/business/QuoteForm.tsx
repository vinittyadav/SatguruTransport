"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { quoteFormSchema, type QuoteFormValues } from "@/lib/validation/schemas";
import { quoteServiceTypes, vehiclePreferences } from "@/lib/config/site";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; reference: string }
  | { kind: "error"; message: string };

const toOption = (v: string) => ({ value: v, label: v });

/**
 * Five-step quote flow — one decision per screen:
 * 01 Route → 02 Cargo → 03 Vehicle → 04 Contact → 05 Review.
 * The wire format is identical to the previous single-page form
 * (same schema, same POST /api/quotes payload incl. honeypot).
 */
const STEPS = [
  {
    id: 1,
    numeral: "01",
    label: "Route",
    caption: "Where does your cargo travel?",
    fields: ["origin_city", "destination_city"] as const,
  },
  {
    id: 2,
    numeral: "02",
    label: "Cargo",
    caption: "What are we moving?",
    fields: [
      "cargo_description",
      "cargo_weight_kg",
      "service_type",
      "preferred_pickup_date",
    ] as const,
  },
  {
    id: 3,
    numeral: "03",
    label: "Vehicle",
    caption: "Any vehicle requirement?",
    fields: ["vehicle_preference", "notes"] as const,
  },
  {
    id: 4,
    numeral: "04",
    label: "Contact",
    caption: "Who should we reach with the quote?",
    fields: ["contact_name", "company_name", "email", "phone"] as const,
  },
  {
    id: 5,
    numeral: "05",
    label: "Review",
    caption: "Confirm the details and submit.",
    fields: [] as const,
  },
] as const;

export function QuoteForm({ defaults }: { defaults?: Partial<QuoteFormValues> }) {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const [honeypot, setHoneypot] = useState("");
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    watch,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    mode: "onTouched",
    defaultValues: {
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      origin_city: defaults?.origin_city ?? "",
      destination_city: defaults?.destination_city ?? "",
      cargo_description: "",
      cargo_weight_kg: "",
      vehicle_preference: "No preference",
      service_type: "Not sure yet",
      preferred_pickup_date: "",
      notes: "",
      ...defaults,
    },
  });

  const values = watch();
  const currentStep = STEPS.find((s) => s.id === step) ?? STEPS[0];

  const goNext = async () => {
    const fields = [...currentStep.fields] as unknown as Array<
      keyof QuoteFormValues
    >;
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (vals: QuoteFormValues) => {
    setState({ kind: "submitting" });
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...vals, website: honeypot }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({
          kind: "error",
          message: data?.error ?? "Something went wrong. Please try again.",
        });
        return;
      }
      // Duplicate guard: the server returns the original reference.
      setState({ kind: "success", reference: data.reference_code });
      reset();
      setStep(1);
    } catch {
      setState({
        kind: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Enter advances a step instead of half-submitting the form.
    if (e.key === "Enter" && step < STEPS.length) {
      e.preventDefault();
      void goNext();
    }
  };

  if (state.kind === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card border-emerald-500/30 bg-emerald-500/5 text-center"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" strokeWidth={1.5} />
        <h3 className="heading-md mt-4">Quote request received.</h3>
        <p className="body-muted mx-auto mt-2 max-w-md text-sm">
          Your quote request has been logged. Our team will review the route and
          cargo details and respond shortly.
        </p>
        <div className="mt-5 inline-flex items-center gap-3 rounded-md border border-navy-600 bg-navy-900 px-4 py-2.5">
          <span className="text-xs uppercase tracking-wider text-mist-400">
            Reference
          </span>
          <span className="font-mono text-sm font-bold text-amber-500">
            {state.reference}
          </span>
        </div>
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setState({ kind: "idle" });
              setStep(1);
            }}
          >
            Submit another request
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={onKeyDown}
      className="space-y-6"
      noValidate
    >
      {/* ===== Progress: 01 → 02 → 03 → 04 → 05 ===== */}
      <ol className="flex items-center gap-1.5" aria-label="Quote progress">
        {STEPS.map((s, i) => {
          const done = s.id < step;
          const active = s.id === step;
          return (
            <li key={s.id} className="flex flex-1 items-center gap-1.5">
              <button
                type="button"
                onClick={() => done && setStep(s.id)}
                disabled={!done}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "step-numeral flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-semibold transition-colors",
                  active && "border-amber-500 bg-amber-500 text-navy-950",
                  done &&
                    "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
                  !done && !active && "border-navy-600 bg-navy-900 text-mist-500",
                )}
              >
                {s.numeral}
                <span className="sr-only">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  className={cn(
                    "h-px flex-1",
                    s.id < step ? "bg-amber-500/60" : "bg-navy-600",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* ===== Step header ===== */}
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-mist-500">
          Step {currentStep.numeral} / 05 — {currentStep.label}
        </p>
        <h3 className="heading-md mt-1">{currentStep.caption}</h3>
      </div>

      {state.kind === "error" && (
        <div
          role="alert"
          className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {state.message}
        </div>
      )}

      {/* ===== Step body ===== */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="space-y-5"
        >
          {step === 1 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Pickup city *"
                placeholder="e.g. Ambernath"
                error={errors.origin_city?.message}
                {...register("origin_city")}
              />
              <Input
                label="Destination city *"
                placeholder="e.g. Pune"
                error={errors.destination_city?.message}
                {...register("destination_city")}
              />
            </div>
          )}

          {step === 2 && (
            <>
              <Textarea
                label="Cargo description *"
                placeholder="What are we moving? Type of goods, packaging, any handling requirements."
                error={errors.cargo_description?.message}
                {...register("cargo_description")}
              />
              <div className="grid gap-5 sm:grid-cols-3">
                <Input
                  label="Approx. weight (kg)"
                  type="number"
                  placeholder="e.g. 8000"
                  error={errors.cargo_weight_kg?.message}
                  {...register("cargo_weight_kg")}
                />
                <Select
                  label="Service type"
                  options={quoteServiceTypes.map(toOption)}
                  error={errors.service_type?.message}
                  {...register("service_type")}
                />
                <Input
                  label="Preferred pickup date"
                  type="date"
                  error={errors.preferred_pickup_date?.message}
                  {...register("preferred_pickup_date")}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Select
                label="Vehicle preference"
                options={vehiclePreferences.map(toOption)}
                error={errors.vehicle_preference?.message}
                {...register("vehicle_preference")}
              />
              <Textarea
                label="Additional notes"
                placeholder="Loading/unloading constraints, timing windows, special instructions…"
                error={errors.notes?.message}
                {...register("notes")}
              />
            </>
          )}

          {step === 4 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Your name *"
                placeholder="Full name"
                autoComplete="name"
                error={errors.contact_name?.message}
                {...register("contact_name")}
              />
              <Input
                label="Company"
                placeholder="Company name (optional)"
                autoComplete="organization"
                error={errors.company_name?.message}
                {...register("company_name")}
              />
              <Input
                label="Email *"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Phone *"
                type="tel"
                placeholder="+91 98765 43210"
                autoComplete="tel"
                error={errors.phone?.message}
                {...register("phone")}
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <dl className="divide-y divide-navy-700 rounded-md border border-navy-700 bg-navy-900 text-sm">
                {(
                  [
                    ["Route", `${values.origin_city || "—"} → ${values.destination_city || "—"}`],
                    ["Cargo", values.cargo_description || "—"],
                    [
                      "Weight",
                      values.cargo_weight_kg ? `${values.cargo_weight_kg} kg` : "Not specified",
                    ],
                    ["Service type", values.service_type || "—"],
                    ["Vehicle preference", values.vehicle_preference || "—"],
                    [
                      "Preferred pickup",
                      values.preferred_pickup_date || "Not specified",
                    ],
                    ["Contact", `${values.contact_name || "—"} · ${values.phone || "—"}`],
                    ["Email", values.email || "—"],
                    ["Company", values.company_name || "—"],
                    ["Notes", values.notes || "—"],
                  ] as Array<[string, string]>
                ).map(([term, def]) => (
                  <div
                    key={term}
                    className="grid gap-1 px-4 py-3 sm:grid-cols-[140px_1fr] sm:gap-4"
                  >
                    <dt className="text-xs uppercase tracking-wider text-mist-500">{term}</dt>
                    <dd className="break-words text-mist-100">{def}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-mist-500">
                Submitting logs this request with a reference code. Our team
                responds with a tailored quote — no payment is taken at this
                step.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ===== Controls ===== */}
      <div className="flex items-center gap-3 border-t border-navy-700 pt-5">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <div className="flex-1" />
        {step < STEPS.length ? (
          <Button type="button" onClick={() => void goNext()}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={state.kind === "submitting"}
            className="min-w-44"
          >
            {state.kind === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                Submit request
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Honeypot — hidden from humans, announced to screen readers as off-limits.
          Bots that autofill every field get silently dropped server-side. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
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
