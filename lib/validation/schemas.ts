import { z } from "zod";

/** Server-side spam trap: hidden "website" field that only bots fill in. */
export const honeypotSchema = z.object({
  website: z.string().max(200).optional().or(z.literal("")),
});

/** Trim + collapse whitespace on all string fields before validating. */
const trimmed = (schema: z.ZodString) =>
  z.preprocess((v) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : v), schema);

export const quoteFormSchema = z.object({
  company_name: trimmed(z.string().max(120)).optional().or(z.literal("")),
  contact_name: trimmed(
    z.string().min(2, "Please enter your name.").max(120, "Name is too long."),
  ),
  email: z
    .preprocess(
      (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
      z.string().email("Please enter a valid email address."),
    ),
  phone: trimmed(
    z.string().min(8, "Please enter a valid phone number.").max(20, "Phone number is too long."),
  ),
  origin_city: trimmed(z.string().min(2, "Origin city is required.").max(80)),
  destination_city: trimmed(
    z.string().min(2, "Destination city is required.").max(80),
  ),
  cargo_description: z
    .preprocess(
      (v) => (typeof v === "string" ? v.trim() : v),
      z
        .string()
        .min(5, "Describe the cargo briefly.")
        .max(500, "Keep the description under 500 characters."),
    ),
  cargo_weight_kg: z.coerce
    .number()
    .int("Weight must be a whole number.")
    .positive("Weight must be positive.")
    .max(100000, "Contact us directly for loads above 100 tonnes.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  vehicle_preference: z.string().max(60).optional().or(z.literal("")),
  service_type: z.string().max(60).optional().or(z.literal("")),
  preferred_pickup_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker.")
    .optional()
    .or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type QuoteFormValues = z.input<typeof quoteFormSchema>;

export const contactFormSchema = z.object({
  name: trimmed(z.string().min(2, "Please enter your name.").max(120)),
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.string().email("Please enter a valid email address."),
  ),
  phone: trimmed(z.string().max(20, "Phone number is too long."))
    .optional()
    .or(z.literal("")),
  subject: trimmed(z.string().max(150)).optional().or(z.literal("")),
  message: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string().min(10, "Please write a short message.").max(2000, "Message is too long."),
  ),
});

export type ContactFormValues = z.input<typeof contactFormSchema>;

export const trackingSchema = z.object({
  tracking_code: z
    .string()
    .min(4, "Enter your tracking code.")
    .max(40, "That code looks too long.")
    .transform((v) => v.trim().toUpperCase()),
});

export type TrackingFormValues = z.input<typeof trackingSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type LoginValues = z.input<typeof loginSchema>;
