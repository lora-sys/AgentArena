import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import {
  validateBattleId,
  validateIdea,
  withInputValidation,
  badRequest,
} from "@/lib/api/guards";

// Note: `withRateLimit` is intentionally NOT imported statically.
// Each test in the withRateLimit describe block uses dynamic
// `await import("@/lib/api/guards")` after `vi.resetModules()` so the
// module-level `buckets` Map is fresh per test. Without this, tests
// using the "unknown" fallback key would collide across runs.

/* ------------------------------------------------------------------ */
/* validateBattleId                                                    */
/* ------------------------------------------------------------------ */

describe("validateBattleId", () => {
  it("accepts a valid battle ID", () => {
    expect(validateBattleId("btl_ABCDEFGH")).toBe(true);
  });

  it("accepts digits in the base32 portion", () => {
    expect(validateBattleId("btl_01234567")).toBe(true);
  });

  it("accepts mixed alphanumeric base32", () => {
    expect(validateBattleId("btl_K3M9N2RT")).toBe(true);
  });

  it("rejects missing prefix", () => {
    expect(validateBattleId("ABCDEFGH")).toBe(false);
  });

  it("rejects wrong prefix", () => {
    expect(validateBattleId("bt_ABCDEFGH")).toBe(false);
  });

  it("rejects too few characters", () => {
    expect(validateBattleId("btl_ABCDE")).toBe(false);
  });

  it("rejects too many characters", () => {
    expect(validateBattleId("btl_ABCDEFGHJ")).toBe(false);
  });

  it("rejects excluded Crockford letters (I, L, O, U)", () => {
    expect(validateBattleId("btl_ABCDIFGH")).toBe(false);
    expect(validateBattleId("btl_ABCDLFGH")).toBe(false);
    expect(validateBattleId("btl_ABCDOFGH")).toBe(false);
    expect(validateBattleId("btl_ABCDEUGH")).toBe(false);
  });

  it("rejects lowercase", () => {
    expect(validateBattleId("btl_abcdefgh")).toBe(false);
  });

  it("rejects non-string values", () => {
    expect(validateBattleId(null)).toBe(false);
    expect(validateBattleId(undefined)).toBe(false);
    expect(validateBattleId(123)).toBe(false);
    expect(validateBattleId({})).toBe(false);
  });

  it("rejects path-traversal attempts", () => {
    expect(validateBattleId("btl_../../../")).toBe(false);
    expect(validateBattleId("../../etc/passwd")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validateBattleId("")).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* validateIdea                                                        */
/* ------------------------------------------------------------------ */

describe("validateIdea", () => {
  it("accepts a normal-length idea", () => {
    const result = validateIdea("Build a decentralized social network for creators");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("Build a decentralized social network for creators");
    }
  });

  it("trims whitespace before length check", () => {
    const result = validateIdea("   short idea    ");
    // After trim, "short idea" is 10 chars — passes
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("short idea");
    }
  });

  it("rejects ideas shorter than 10 chars after trim", () => {
    const result = validateIdea("  short  ");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/at least 10/);
    }
  });

  it("rejects ideas longer than 2000 chars after trim", () => {
    const result = validateIdea("a".repeat(2001));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/at most 2000/);
    }
  });

  it("accepts ideas at the 2000-char boundary", () => {
    const result = validateIdea("a".repeat(2000));
    expect(result.ok).toBe(true);
  });

  it("accepts ideas at the 10-char boundary", () => {
    const result = validateIdea("a".repeat(10));
    expect(result.ok).toBe(true);
  });

  it("rejects non-string ideas", () => {
    expect(validateIdea(42).ok).toBe(false);
    expect(validateIdea(null).ok).toBe(false);
    expect(validateIdea(undefined).ok).toBe(false);
    expect(validateIdea({}).ok).toBe(false);
    expect(validateIdea([]).ok).toBe(false);
  });

  it("rejects ideas with control characters", () => {
    expect(validateIdea("hello\x00world!").ok).toBe(false);
    expect(validateIdea("hello\x07world!").ok).toBe(false);
    expect(validateIdea("hello\x1Bworld!").ok).toBe(false);
  });

  it("accepts newlines and tabs (not control chars in the excluded set)", () => {
    // \x09 (tab) and \x0A (newline) are NOT in the excluded range
    // \x0B and \x0C ARE excluded — verify
    expect(validateIdea("line1\nline2 line3!").ok).toBe(true);
  });

  it("rejects \x0B and \x0C specifically", () => {
    expect(validateIdea("hello\x0Bworld!!").ok).toBe(false);
    expect(validateIdea("hello\x0Cworld!!").ok).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* withRateLimit                                                       */
/* ------------------------------------------------------------------ */

describe("withRateLimit", () => {
  beforeEach(() => {
    // Reset the module to clear the module-level `buckets` Map and
    // `lastCleanup` timestamp so each test starts with a clean rate
    // limiter state. Without this, tests using "unknown" as a key
    // collide with each other.
    vi.resetModules();
    vi.useFakeTimers();
  });

  it("allows requests up to the limit", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("ok"));
    const { withRateLimit } = await import("@/lib/api/guards");
    const wrapped = withRateLimit(handler, { max: 3, windowMs: 60_000 });

    const req = new Request("http://localhost/test", {
      headers: { "x-forwarded-for": "10.0.0.1" },
    });

    const r1 = await wrapped(req);
    const r2 = await wrapped(req);
    const r3 = await wrapped(req);

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r3.status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it("returns 429 when the limit is exceeded", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("ok"));
    const { withRateLimit } = await import("@/lib/api/guards");
    const wrapped = withRateLimit(handler, { max: 2, windowMs: 60_000 });

    const req = new Request("http://localhost/test", {
      headers: { "x-forwarded-for": "10.0.0.2" },
    });

    await wrapped(req);
    await wrapped(req);
    const r3 = await wrapped(req);

    expect(r3.status).toBe(429);
    expect(r3.headers.get("Retry-After")).toBeTruthy();
    const body = await r3.json();
    expect(body.error).toBe("Rate limit exceeded");
    expect(body.retryAfter).toBeGreaterThan(0);
  });

  it("resets the bucket after the window elapses", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("ok"));
    const { withRateLimit } = await import("@/lib/api/guards");
    const wrapped = withRateLimit(handler, { max: 1, windowMs: 1_000 });

    const req = new Request("http://localhost/test", {
      headers: { "x-forwarded-for": "10.0.0.3" },
    });

    await wrapped(req);
    const blocked = await wrapped(req);
    expect(blocked.status).toBe(429);

    // Advance past the window
    vi.advanceTimersByTime(1_100);

    const allowed = await wrapped(req);
    expect(allowed.status).toBe(200);
  });

  it("uses defaults of 10 requests per 60s", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("ok"));
    const { withRateLimit } = await import("@/lib/api/guards");
    const wrapped = withRateLimit(handler);

    const req = new Request("http://localhost/test", {
      headers: { "x-forwarded-for": "10.0.0.4" },
    });

    for (let i = 0; i < 10; i += 1) {
      const r = await wrapped(req);
      expect(r.status).toBe(200);
    }

    const blocked = await wrapped(req);
    expect(blocked.status).toBe(429);
  });

  /* ----- Critical #2: spoofable x-forwarded-for bypass --------------- */

  it("ignores spoofed first value in x-forwarded-for and uses a valid IP", async () => {
    // Vercel appends the real client IP to the end of the chain.
    // The first value is attacker-controlled and must not be trusted.
    const handler = vi.fn().mockResolvedValue(new Response("ok"));
    const { withRateLimit } = await import("@/lib/api/guards");
    const wrapped = withRateLimit(handler, { max: 2, windowMs: 60_000 });

    const req = new Request("http://localhost/test", {
      headers: { "x-forwarded-for": "999.999.999.999, 10.0.0.50" },
    });

    const r1 = await wrapped(req);
    const r2 = await wrapped(req);
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);

    // Third request from same real IP (10.0.0.50) should be blocked
    // — proving the spoofed first value did NOT create a separate bucket.
    const blocked = await wrapped(req);
    expect(blocked.status).toBe(429);
  });

  it("falls back to 'unknown' when x-forwarded-for contains no valid IP", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("ok"));
    const { withRateLimit } = await import("@/lib/api/guards");
    const wrapped = withRateLimit(handler, { max: 1, windowMs: 60_000 });

    const req = new Request("http://localhost/test", {
      headers: { "x-forwarded-for": "not-an-ip, also-not-an-ip" },
    });

    const r1 = await wrapped(req);
    expect(r1.status).toBe(200);

    // Second request shares the "unknown" bucket → blocked.
    const blocked = await wrapped(req);
    expect(blocked.status).toBe(429);
  });

  it("does not create a fresh bucket per non-IP header value (falls back to 'unknown')", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("ok"));
    const { withRateLimit } = await import("@/lib/api/guards");
    const wrapped = withRateLimit(handler, { max: 1, windowMs: 60_000 });

    // First request — non-IP header value → "unknown" bucket.
    const r1 = await wrapped(
      new Request("http://localhost/test", {
        headers: { "x-forwarded-for": "not-an-ip" },
      }),
    );
    expect(r1.status).toBe(200);

    // Second request — different non-IP header value. Both map to
    // "unknown", so they share the bucket and the second is blocked.
    const r2 = await wrapped(
      new Request("http://localhost/test", {
        headers: { "x-forwarded-for": "also-not-an-ip" },
      }),
    );
    expect(r2.status).toBe(429);
  });

  /* ----- Critical #3: full burst on window boundary ------------------ */

  it("does not allow 2*max burst across a window boundary (continuous refill)", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("ok"));
    const max = 5;
    const { withRateLimit } = await import("@/lib/api/guards");
    const wrapped = withRateLimit(handler, { max, windowMs: 1_000 });

    const req = new Request("http://localhost/test", {
      headers: { "x-forwarded-for": "10.0.0.99" },
    });

    // Exhaust the bucket at the start of the window.
    for (let i = 0; i < max; i += 1) {
      const r = await wrapped(req);
      expect(r.status).toBe(200);
    }

    // Immediately try one more — should be blocked (tokens < 1).
    const blockedImmediate = await wrapped(req);
    expect(blockedImmediate.status).toBe(429);

    // Advance just past the window. With continuous refill, only a
    // proportional number of tokens regenerate — NOT the full max.
    // A drained bucket refills to `max` over `windowMs`, so after
    // 1100ms it should be fully restored. But the bug was that even
    // 1ms past the boundary gave a full max — verify we need ~windowMs
    // to recover by advancing only half the window.
    vi.advanceTimersByTime(500);

    const halfRefill = await wrapped(req);
    // At 500ms into the window with max=5/windowMs=1000ms, refill rate
    // is 5 tokens/sec. After 500ms from the last request (which left
    // tokens=0), we have ~2.5 tokens. A single request should succeed.
    expect(halfRefill.status).toBe(200);
  });

  /* ----- Critical #1: unbounded memory growth ------------------------ */

  it("cleans up idle buckets after the window elapses", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("ok"));
    const { withRateLimit } = await import("@/lib/api/guards");
    const wrapped = withRateLimit(handler, { max: 1, windowMs: 1_000 });

    // Create a bucket for one IP.
    await wrapped(
      new Request("http://localhost/test", {
        headers: { "x-forwarded-for": "10.0.0.200" },
      }),
    );

    // Advance far past the windowMs to make the bucket eligible for
    // eviction, AND past the CLEANUP_INTERVAL_MS (60s) to trigger the
    // cleanup pass.
    vi.advanceTimersByTime(70_000);

    // New request from a different IP — triggers cleanupExpiredBuckets.
    await wrapped(
      new Request("http://localhost/test", {
        headers: { "x-forwarded-for": "10.0.0.201" },
      }),
    );

    // Now the old IP (10.0.0.200) should have a fresh bucket (got
    // evicted during cleanup), so it gets full max=1 tokens again.
    const afterCleanup = await wrapped(
      new Request("http://localhost/test", {
        headers: { "x-forwarded-for": "10.0.0.200" },
      }),
    );
    expect(afterCleanup.status).toBe(200);
  });
});

/* ------------------------------------------------------------------ */
/* withInputValidation                                                 */
/* ------------------------------------------------------------------ */

describe("withInputValidation", () => {
  const schema = z.object({
    idea: z.string().min(1),
    count: z.number().int().positive(),
  });

  it("passes valid data to the handler", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("ok"));
    const wrapped = withInputValidation(schema, handler);

    const req = new Request("http://localhost/test", {
      method: "POST",
      body: JSON.stringify({ idea: "test", count: 5 }),
      headers: { "content-type": "application/json" },
    });

    const res = await wrapped(req);
    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalledWith(
      { idea: "test", count: 5 },
      req,
    );
  });

  it("returns 400 for invalid JSON", async () => {
    const handler = vi.fn();
    const wrapped = withInputValidation(schema, handler);

    const req = new Request("http://localhost/test", {
      method: "POST",
      body: "not-json{",
      headers: { "content-type": "application/json" },
    });

    const res = await wrapped(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/valid JSON/);
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns 400 with issues for schema violations", async () => {
    const handler = vi.fn();
    const wrapped = withInputValidation(schema, handler);

    const req = new Request("http://localhost/test", {
      method: "POST",
      body: JSON.stringify({ idea: "", count: -1 }),
      headers: { "content-type": "application/json" },
    });

    const res = await wrapped(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Input validation failed");
    expect(body.issues).toBeDefined();
    expect(body.issues.length).toBeGreaterThan(0);
    expect(handler).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/* withGlobalConcurrency                                               */
/* ------------------------------------------------------------------ */

describe("withGlobalConcurrency", () => {
  beforeEach(() => {
    // p-queue uses real timers internally. The withRateLimit block
    // above activates vi.useFakeTimers() in its beforeEach, which
    // persists across describes unless explicitly reverted. Without
    // vi.useRealTimers(), p-queue's setTimeout(0) never fires and
    // queued tasks hang until the test timeout.
    vi.useRealTimers();
  });

  it("caps concurrent in-flight requests to maxConcurrent (FIFO queue)", async () => {
    const { withGlobalConcurrency } = await import("@/lib/api/guards");

    let active = 0;
    let maxObserved = 0;
    const handler = vi.fn(async (_request: Request) => {
      active += 1;
      maxObserved = Math.max(maxObserved, active);
      // Simulate a slow async operation (OpenAI call latency).
      await new Promise((resolve) => setTimeout(resolve, 20));
      active -= 1;
      return new Response("ok");
    });

    const wrapped = withGlobalConcurrency(handler, { maxConcurrent: 2 });

    // Fire 5 requests simultaneously. With concurrency=2, at most 2
    // should be in-flight at any time.
    const requests = Array.from({ length: 5 }, () =>
      new Request("http://localhost/test", {
        headers: { "x-forwarded-for": "10.1.0.1" },
      }),
    );

    const responses = await Promise.all(requests.map((req) => wrapped(req)));

    // All requests should ultimately succeed.
    for (const r of responses) {
      expect(r.status).toBe(200);
    }

    // No more than maxConcurrent handlers should have been active simultaneously.
    expect(maxObserved).toBeLessThanOrEqual(2);
    // All 5 handlers should have been called (none dropped).
    expect(handler).toHaveBeenCalledTimes(5);
  });

  it("uses default concurrency of 6 when no options provided", async () => {
    const { withGlobalConcurrency } = await import("@/lib/api/guards");

    let active = 0;
    let maxObserved = 0;
    const handler = vi.fn(async () => {
      active += 1;
      maxObserved = Math.max(maxObserved, active);
      await new Promise((resolve) => setTimeout(resolve, 15));
      active -= 1;
      return new Response("ok");
    });

    const wrapped = withGlobalConcurrency(handler);

    const requests = Array.from({ length: 4 }, () =>
      new Request("http://localhost/test", {
        headers: { "x-forwarded-for": "10.1.0.2" },
      }),
    );

    const responses = await Promise.all(requests.map((req) => wrapped(req)));

    for (const r of responses) {
      expect(r.status).toBe(200);
    }

    // 4 < 6 default, so all should run concurrently.
    expect(maxObserved).toBe(4);
    expect(handler).toHaveBeenCalledTimes(4);
  });

  it("resolves queued requests as slots free up (does not reject)", async () => {
    const { withGlobalConcurrency } = await import("@/lib/api/guards");

    const handler = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return new Response("ok");
    });

    const wrapped = withGlobalConcurrency(handler, { maxConcurrent: 1 });

    // 3 requests with concurrency=1 → they run sequentially, all succeed.
    const results = await Promise.all(
      Array.from({ length: 3 }, () =>
        wrapped(
          new Request("http://localhost/test", {
            headers: { "x-forwarded-for": "10.1.0.3" },
          }),
        ),
      ),
    );

    expect(results.every((r) => r.status === 200)).toBe(true);
    expect(handler).toHaveBeenCalledTimes(3);
  });
});

/* ------------------------------------------------------------------ */
/* badRequest helper                                                   */
/* ------------------------------------------------------------------ */
describe("badRequest", () => {
  it("returns a 400 response with the given message", async () => {
    const res = badRequest("Invalid battle ID");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid battle ID");
  });

  it("includes issues array when provided", async () => {
    const res = badRequest("Validation failed", ["field: too short", "field: required"]);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.issues).toEqual(["field: too short", "field: required"]);
  });
});
