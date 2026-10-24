import { describe, expect, it } from "vitest";
import {
  assertQuoteConvertible,
  canConvertQuote,
  latestStatusFromEvents,
  quoteStatusOrder,
  shipmentStatusOrder,
  vehicleOperationalStatuses,
} from "@/lib/workflow";
import { generateReferenceCode, generateTrackingCode } from "@/lib/utils";
import type { QuoteStatus, ShipmentEvent, ShipmentStatus } from "@/types";

describe("quote pipeline", () => {
  it("follows NEW → CONTACTED → QUOTED → CONFIRMED", () => {
    expect(quoteStatusOrder).toEqual(["new", "contacted", "quoted", "confirmed"]);
  });

  it("only converts confirmed or won quotes", () => {
    const convertible: QuoteStatus[] = ["confirmed", "won"];
    const blocked: QuoteStatus[] = ["new", "contacted", "quoted", "reviewing", "lost"];
    convertible.forEach((s) => expect(canConvertQuote(s)).toBe(true));
    blocked.forEach((s) => expect(canConvertQuote(s)).toBe(false));
  });
});

describe("shipment milestones", () => {
  it("uses the required customer-facing milestone order", () => {
    expect(shipmentStatusOrder).toEqual([
      "booked",
      "picked_up",
      "in_transit",
      "at_destination",
      "out_for_delivery",
      "delivered",
    ]);
  });
});

describe("assertQuoteConvertible", () => {
  it("blocks when a shipment already exists", () => {
    const err = assertQuoteConvertible({ status: "confirmed", existingShipmentId: "abc" });
    expect(err).toMatch(/already been created/i);
  });

  it("blocks quotes that are not confirmed", () => {
    const err = assertQuoteConvertible({ status: "new", existingShipmentId: null });
    expect(err).toMatch(/confirm the quote/i);
  });

  it("allows a confirmed quote with no existing shipment", () => {
    expect(
      assertQuoteConvertible({ status: "confirmed", existingShipmentId: null }),
    ).toBeNull();
    expect(assertQuoteConvertible({ status: "won", existingShipmentId: null })).toBeNull();
  });
});

describe("latestStatusFromEvents", () => {
  it("returns null with no events", () => {
    expect(latestStatusFromEvents([])).toBeNull();
  });

  it("returns the status of the most recent event", () => {
    const events: ShipmentEvent[] = [
      { id: "1", shipment_id: "s", status: "booked" as ShipmentStatus, location: null, note: null, occurred_at: "2026-01-01T10:00:00Z" },
      { id: "2", shipment_id: "s", status: "in_transit" as ShipmentStatus, location: "Nashik", note: null, occurred_at: "2026-01-02T10:00:00Z" },
    ];
    expect(latestStatusFromEvents(events)).toBe("in_transit");
  });
});

describe("vehicle operational statuses", () => {
  it("covers the required fleet statuses", () => {
    expect([...vehicleOperationalStatuses]).toEqual([
      "available",
      "assigned",
      "in_transit",
      "maintenance",
      "inactive",
    ]);
  });
});

describe("code generators", () => {
  it("reference codes match SGT-XXXXXX with unambiguous characters", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateReferenceCode();
      expect(code).toMatch(/^SGT-[A-HJ-NP-Z2-9]{6}$/);
    }
  });

  it("tracking codes match SGT######", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateTrackingCode()).toMatch(/^SGT\d{6}$/);
    }
  });
});
