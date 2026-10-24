import { describe, expect, it } from "vitest";
import {
  quoteFormSchema,
  contactFormSchema,
  honeypotSchema,
  trackingSchema,
} from "@/lib/validation/schemas";

describe("quoteFormSchema", () => {
  const valid = {
    contact_name: "  Jane   Trader  ",
    email: "Jane@Example.COM ",
    phone: "+919876543210",
    origin_city: "Mumbai",
    destination_city: "Pune",
    cargo_description: "12 pallets of packaged FMCG goods",
  };

  it("accepts a valid request", () => {
    const r = quoteFormSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("normalizes whitespace and email casing", () => {
    const r = quoteFormSchema.parse(valid);
    expect(r.contact_name).toBe("Jane Trader");
    expect(r.email).toBe("jane@example.com");
  });

  it("rejects an invalid email", () => {
    const r = quoteFormSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("rejects a too-short cargo description", () => {
    const r = quoteFormSchema.safeParse({ ...valid, cargo_description: "box" });
    expect(r.success).toBe(false);
  });

  it("rejects a too-short name and phone", () => {
    expect(quoteFormSchema.safeParse({ ...valid, contact_name: "J" }).success).toBe(false);
    expect(quoteFormSchema.safeParse({ ...valid, phone: "123" }).success).toBe(false);
  });

  it("coerces numeric weight and allows empty", () => {
    expect(quoteFormSchema.parse({ ...valid, cargo_weight_kg: "8000" }).cargo_weight_kg).toBe(8000);
    expect(quoteFormSchema.parse({ ...valid, cargo_weight_kg: "" }).cargo_weight_kg).toBeUndefined();
  });

  it("rejects a 200-tonne weight", () => {
    const r = quoteFormSchema.safeParse({ ...valid, cargo_weight_kg: "200000" });
    expect(r.success).toBe(false);
  });

  it("accepts optional fields when empty", () => {
    const r = quoteFormSchema.parse({
      ...valid,
      company_name: "",
      vehicle_preference: "",
      service_type: "",
      preferred_pickup_date: "",
      notes: "",
    });
    expect(r.origin_city).toBe("Mumbai");
  });

  it("rejects a malformed pickup date", () => {
    const r = quoteFormSchema.safeParse({ ...valid, preferred_pickup_date: "12/05/2026" });
    expect(r.success).toBe(false);
  });
});

describe("contactFormSchema", () => {
  const valid = {
    name: "Ravi Kumar",
    email: "ravi@example.com",
    message: "Do you handle part loads between Nashik and Mumbai?",
  };

  it("accepts a valid message", () => {
    expect(contactFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a too-short message", () => {
    expect(contactFormSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
  });

  it("normalizes name whitespace", () => {
    expect(contactFormSchema.parse({ ...valid, name: "  Ravi   Kumar " }).name).toBe("Ravi Kumar");
  });

  it("allows optional phone and subject", () => {
    const r = contactFormSchema.parse({ ...valid, phone: "", subject: "" });
    expect(r.phone).toBe("");
    expect(r.subject).toBe("");
  });
});

describe("honeypotSchema", () => {
  it("passes when the honeypot is empty or missing", () => {
    expect(honeypotSchema.safeParse({ website: "" }).success).toBe(true);
    expect(honeypotSchema.safeParse({}).success).toBe(true);
  });

  it("captures filled honeypots for route-level rejection", () => {
    expect(honeypotSchema.safeParse({ website: "http://spam.example" }).success).toBe(true);
  });
});

describe("trackingSchema", () => {
  it("uppercases and trims the code", () => {
    expect(trackingSchema.parse({ tracking_code: "  sgt482913 " }).tracking_code).toBe("SGT482913");
  });

  it("rejects codes shorter than 4 characters", () => {
    expect(trackingSchema.safeParse({ tracking_code: "SG" }).success).toBe(false);
  });
});
