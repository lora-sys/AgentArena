import { describe, it, expect, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/* Mocks                                                              */
/* ------------------------------------------------------------------ */

// Mock the DB client so the route handler works in tests without a real
// Postgres connection. Tests control return values via the mock state.
const mockSelectResults: Array<Array<{ id: string }>> = [[]];
const mockInsert = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/db/client", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => {
            // Pop the next preset result, or default to empty.
            return Promise.resolve(mockSelectResults.shift() ?? []);
          },
        }),
      }),
    }),
    insert: () => ({
      values: mockInsert,
    }),
  }),
}));

// Capture console.warn calls for assertions.
const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/battles", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const validIdea = "Build an AI agent that writes poetry for cats in space.";

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe("POST /api/battles", () => {
  // POST is dynamically imported inside beforeEach so that vi.resetModules()
  // clears the module-level `buckets` Map in lib/api/guards.ts. Without
  // this reset, the rate limiter state leaks between tests using the
  // "unknown" client key (no forwarded-for header) and depletes the bucket.
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();
    mockSelectResults.length = 0;
    mockInsert.mockClear();
    warnSpy.mockClear();
    const mod = await import("./route");
    POST = mod.POST;
  });

  it("returns 201 with { battleId, status: 'ready' } for a valid idea", async () => {
    const response = await POST(makeRequest({ idea: validIdea }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.status).toBe("ready");
    expect(body.battleId).toMatch(/^btl_[0-9A-HJKMNP-TV-Z]{8}$/);
    expect(body.title).toBeTruthy();
  });

  it("generates a deterministic battle_id from the idea text", async () => {
    const response = await POST(makeRequest({ idea: validIdea }));
    const body = await response.json();

    // Same idea → same battleId (PRD §8: btl_<8-char base32> is a hash).
    // R20: the low 8 bits of the hash now include real entropy (length +
    // index-mixed bytes + alternate FNV prime), so the suffix differs
    // from the pre-R20 output but is still deterministic.
    expect(body.battleId).toBe("btl_QQK7CB3D");
  });

  it("uses 'full' as the default mode when mode is omitted", async () => {
    await POST(makeRequest({ idea: validIdea }));
    expect(mockInsert).toHaveBeenCalledTimes(1);
    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.mode).toBe("full");
  });

  it("accepts mode='quick' explicitly", async () => {
    await POST(makeRequest({ idea: validIdea, mode: "quick" }));
    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.mode).toBe("quick");
  });

  it("returns 400 when idea is missing", async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(body.issues.some((s: string) => s.startsWith("idea:"))).toBe(true);
  });

  it("returns 400 when idea is too short (< 10 chars)", async () => {
    const response = await POST(makeRequest({ idea: "short" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.issues.some((s: string) => s.includes("at least 10"))).toBe(true);
  });

  it("returns 400 when idea exceeds 2000 chars", async () => {
    const longIdea = "a".repeat(2001);
    const response = await POST(makeRequest({ idea: longIdea }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.issues.some((s: string) => s.includes("at most 2000"))).toBe(true);
  });

  it("returns 400 when idea is not a string", async () => {
    const response = await POST(makeRequest({ idea: 12345 }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.issues.some((s: string) => s.startsWith("idea:"))).toBe(true);
  });

  it("returns 400 when mode is not 'quick' or 'full'", async () => {
    const response = await POST(makeRequest({ idea: validIdea, mode: "turbo" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.issues.some((s: string) => s.startsWith("mode:"))).toBe(true);
  });

  it("returns 400 for invalid JSON body", async () => {
    const response = await POST(makeRequest("not json {{{"));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid JSON body");
  });

  it("returns the existing battle_id when the same idea was submitted before (idempotency)", async () => {
    mockSelectResults.push([{ id: "btl_EXISTING1" }]);

    const response = await POST(makeRequest({ idea: validIdea }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.battleId).toBe("btl_EXISTING1");
    expect(body.status).toBe("ready");
    // Idempotent path must return the same flat shape so the client
    // form can always read data.battleId regardless of code path.
    expect(body).not.toHaveProperty("battle");
    // Should NOT have inserted a new row.
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("persists the battle row with correct fields on create", async () => {
    await POST(makeRequest({ idea: validIdea, mode: "quick" }));

    expect(mockInsert).toHaveBeenCalledTimes(1);
    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.id).toMatch(/^btl_/);
    expect(insertArg.idea).toBe(validIdea);
    expect(insertArg.mode).toBe("quick");
    expect(insertArg.status).toBe("briefing");
    expect(insertArg.type).toBe("hackathon");
    expect(insertArg.title).toBe(validIdea.slice(0, 100));
    expect(insertArg.settingsJson).toEqual({ mode: "quick" });
    expect(insertArg.originalInput).toEqual({ idea: validIdea, mode: "quick" });
  });

  /* ----- R20 Critical: battle.id is text (btl_ prefix), not UUID ----- */

  it("inserts a btl_ text id, not a UUID (R20 schema fix)", async () => {
    await POST(makeRequest({ idea: validIdea }));
    const insertArg = mockInsert.mock.calls[0][0];

    // The id must be a text string with the btl_ prefix, NOT a UUID.
    // Before R20, the schema expected uuid() which rejected btl_ strings
    // at the DB layer with a type error. The schema is now text("id").
    expect(typeof insertArg.id).toBe("string");
    expect(insertArg.id).toMatch(/^btl_[0-9A-HJKMNP-TV-Z]{8}$/);
    // Explicitly verify it's NOT a UUID format (8-4-4-4-12 hex pattern)
    expect(insertArg.id).not.toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("trims the idea before length validation — 10 spaces fails validation", async () => {
    const response = await POST(makeRequest({ idea: "          " }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.issues.some((s: string) => s.includes("at least 10"))).toBe(true);
  });

  it("stores the trimmed idea in the DB on create", async () => {
    const paddedIdea = "  Build an AI agent that writes poetry for cats in space.  ";
    await POST(makeRequest({ idea: paddedIdea }));
    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.idea).toBe(validIdea);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    // Default rate limit is 10 requests per 60s window.
    // Use a unique x-forwarded-for IP so this test is not affected by
    // other tests sharing the "unknown" bucket.
    const ip = "10.99.0.1";
    const responses: Array<{ status: number }> = [];
    for (let i = 0; i < 11; i += 1) {
      const req = new Request("http://localhost/api/battles", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": ip,
        },
        body: JSON.stringify({ idea: validIdea }),
      });
      const res = await POST(req);
      responses.push({ status: res.status });
    }
    const lastResponse = responses[responses.length - 1];
    expect(lastResponse.status).toBe(429);
  });

  it("recovers from a unique-constraint violation (TOCTOU race) and returns the existing battle id", async () => {
    // Simulate: idempotency check finds nothing (select returns []),
    // then insert throws a unique-violation error,
    // then recovery select returns the winner's row.
    mockSelectResults.length = 0;
    mockInsert.mockRejectedValueOnce(
      new Error("duplicate key value violates unique constraint"),
    );
    // Queue: [empty (idempotency check), winner row (recovery)]
    mockSelectResults.push([], [{ id: "btl_RACEFIX" }]);

    const response = await POST(makeRequest({ idea: validIdea }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.battleId).toBe("btl_RACEFIX");
    // Recovery path must return the flat { battleId, status } shape —
    // no legacy `battle` wrapper — so the client form reads it correctly.
    expect(body).not.toHaveProperty("battle");
    expect(body.status).toBe("ready");
  });

  /* ----- R22: DB write failure falls through to in-memory (201, inMemory: true) --- */

  it("returns 201 with inMemory: true when DB insert fails for a non-unique-violation reason", async () => {
    mockSelectResults.length = 0;
    mockSelectResults.push([]); // idempotency check: no existing row
    mockInsert.mockRejectedValueOnce(new Error("connection refused"));

    const response = await POST(makeRequest({ idea: validIdea }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.inMemory).toBe(true);
  });

  it("returns 201 with inMemory: true when unique-violation recovery lookup also fails", async () => {
    mockSelectResults.length = 0;
    mockSelectResults.push([]); // idempotency check: no existing row
    mockInsert.mockRejectedValueOnce(
      new Error("duplicate key value violates unique constraint"),
    );
    // Recovery select will also return empty (lookup fails)
    mockSelectResults.push([]);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(makeRequest({ idea: validIdea }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.inMemory).toBe(true);
    // Note: the in-memory fall-through path does NOT log an error (it's the
    // happy path now). errorSpy is allowed to be called zero or more times.
    errorSpy.mockRestore();
  });
});