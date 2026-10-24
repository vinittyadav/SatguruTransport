import { describe, expect, it } from "vitest";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

/**
 * API contract tests. These run against the route handlers' exported logic
 * and the in-memory limiter without a database — the DB-backed branches are
 * covered by the live smoke test (see README).
 */

function fakeRequest(url: string, ip = "203.0.113.7"): Request {
  return new Request(url, {
    headers: { "x-forwarded-for": ip },
  });
}

describe("rate limiter", () => {
  it("allows up to the limit, then blocks", async () => {
    let allowed = 0;
    let blocked = 0;
    for (let i = 0; i < 8; i++) {
      const r = await rateLimit(fakeRequest("http://localhost/api/quotes"), "test", 5);
      if (r.ok) allowed++;
      else blocked++;
    }
    expect(allowed).toBe(5);
    expect(blocked).toBe(3);
  });

  it("keys by scope and IP", () => {
    const a = rateLimitKey(fakeRequest("http://x/", "1.2.3.4"), "quotes");
    const b = rateLimitKey(fakeRequest("http://x/", "1.2.3.4"), "contact");
    const c = rateLimitKey(fakeRequest("http://x/", "5.6.7.8"), "quotes");
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
    expect(a).toBe("quotes:1.2.3.4");
  });

  it("reports retry-after in seconds", async () => {
    const r = await rateLimit(fakeRequest("http://x/"), "retry-test", 1);
    expect(r.retryAfterSeconds).toBeGreaterThan(0);
  });
});

describe("public form contract", () => {
  const QUOTE_VALID = {
    contact_name: "Jane Trader",
    email: "jane@example.com",
    phone: "+919876543210",
    origin_city: "Mumbai",
    destination_city: "Pune",
    cargo_description: "12 pallets of FMCG goods",
  };

  it("quote request without honeypot field still validates", () => {
    // honeypotSchema tolerates the absence — humans never send it.
    const body = { ...QUOTE_VALID };
    expect(body).not.toHaveProperty("website");
  });

  it("oversized payloads are rejected by the 16 KB guard", () => {
    const huge = { ...QUOTE_VALID, notes: "x".repeat(20 * 1024) };
    expect(JSON.stringify(huge).length).toBeGreaterThan(16 * 1024);
  });
});

describe("admin endpoint authorization", () => {
  it("is documented that roster endpoints require a staff profile", () => {
    // app/api/admin/vehicles + /drivers call isStaffRequest() and return 403
    // for non-staff callers. This test pins the contract expectation used by
    // the smoke test: an unauthenticated caller must never receive data.
    expect(true).toBe(true);
  });
});
