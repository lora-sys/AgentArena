import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import {
  validateBattleId,
  validateIdea,
  withRateLimit,
  withInputValidation,
  badRequest,
} from "@/lib/api/guards";

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
    vi.useFakeTimers();
  });

  it("allows requests up to the limit", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("ok"));
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
