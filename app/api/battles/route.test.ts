import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

/* ------------------------------------------------------------------ */
/* Mocks                                                              */
/* ------------------------------------------------------------------ */

// Mock the DB client so the route handler works in tests without a real
// Postgres connection. Tests control return values via the mock state.
const mockSelectResult: Array<{ id: string }> = [];
const mockInsert = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/db/client", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(mockSelectResult),
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
  beforeEach(() => {
    mockSelectResult.length = 0;
    mockInsert.mockClear();
    warnSpy.mockClear();
  });

  it("returns 201 with { battleId, status: 'created' } for a valid idea", async () => {
    const response = await POST(makeRequest({ idea: validIdea }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.status).toBe("created");
    expect(body.battleId).toMatch(/^btl_[0-9A-HJKMNP-TV-Z]{8}$/);
    expect(body.battle).toEqual({ id: body.battleId });
  });

  it("generates a deterministic battle_id from the idea text", async () => {
    const response = await POST(makeRequest({ idea: validIdea }));
    const body = await response.json();

    // Same idea → same battleId (PRD §8: btl_<8-char base32> is a hash).
    expect(body.battleId).toBe("btl_QQK7CB1C");
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
    mockSelectResult.push({ id: "btl_EXISTING1" });

    const response = await POST(makeRequest({ idea: validIdea }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.battleId).toBe("btl_EXISTING1");
    expect(body.status).toBe("created");
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
    expect(insertArg.status).toBe("idle");
    expect(insertArg.type).toBe("hackathon");
    expect(insertArg.title).toBe(validIdea.slice(0, 100));
    expect(insertArg.settingsJson).toEqual({ mode: "quick" });
    expect(insertArg.originalInput).toEqual({ idea: validIdea, mode: "quick" });
  });

  it("logs a TODO for rate limiting", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await POST(makeRequest({ idea: validIdea }));
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("rate-limit"),
    );
    logSpy.mockRestore();
  });
});