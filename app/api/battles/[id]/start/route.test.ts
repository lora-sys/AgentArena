import { describe, it, expect, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/* Mocks                                                              */
/* ------------------------------------------------------------------ */

// Use vi.hoisted to define mock references that can be used in the
// vi.mock factory (which is itself hoisted to the top of the file).
const mocks = vi.hoisted(() => ({
  mockWithRateLimit: vi.fn(<T extends (...args: unknown[]) => unknown>(handler: T): T => handler),
  mockWithGlobalConcurrency: vi.fn(<T extends (...args: unknown[]) => unknown>(handler: T): T => handler),
  mockRegisterAbortController: vi.fn(),
  mockClearAbortController: vi.fn(),
}));

vi.mock("@/lib/api/guards", () => ({
  withRateLimit: mocks.mockWithRateLimit,
  withGlobalConcurrency: mocks.mockWithGlobalConcurrency,
  withInputValidation: vi.fn(
    <S extends { parse: (v: unknown) => unknown }, A extends unknown[]>(
      _schema: S,
      handler: (data: unknown, request: Request, ...args: A) => Promise<Response>,
    ) => {
      return async (request: Request, ...args: A): Promise<Response> => {
        // Minimal inline validation for the test — parse the JSON body
        // and pass it through, but with the idea field only.
        const raw = (await request.json()) as { idea?: unknown };
        const data = { idea: String(raw.idea ?? "") };
        return handler(data, request, ...args);
      };
    },
  ),
  badRequest: (msg: string) =>
    new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { "content-type": "application/json" },
    }),
  validateBattleId: (id: unknown) =>
    typeof id === "string" && /^btl_[0-9A-HJKMNP-TV-Z]{8}$/.test(id),
  validateIdea: (idea: unknown) => {
    if (typeof idea !== "string") return { ok: false, error: "must be string" };
    const trimmed = idea.trim();
    if (trimmed.length < 10) return { ok: false, error: "too short" };
    return { ok: true, value: trimmed };
  },
  registerAbortController: mocks.mockRegisterAbortController,
  clearAbortController: mocks.mockClearAbortController,
  __resetAbortControllers: vi.fn(),
  cancelCurrentBattle: vi.fn(),
}));

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function makeRequest(idea: string): Request {
  return new Request("http://localhost/api/battles/btl_ABCDEFGH/start", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idea }),
  });
}

const validIdea = "Build an AI agent that writes poetry for cats in space.";

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe("POST /api/battles/[id]/start", () => {
  let POST: (request: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();
    mocks.mockWithRateLimit.mockClear();
    mocks.mockWithGlobalConcurrency.mockClear();
    mocks.mockRegisterAbortController.mockClear();
    mocks.mockClearAbortController.mockClear();
    const mod = await import("./route");
    POST = mod.POST as typeof POST;
  });

  it("wraps the handler with withRateLimit and withGlobalConcurrency", async () => {
    await POST(makeRequest(validIdea), {
      params: Promise.resolve({ id: "btl_ABCDEFGH" }),
    });
    // Both wrappers should have been called at module load time
    // (they are applied when the route module is imported and the POST
    // export is created). The module import in beforeEach triggers them.
    expect(mocks.mockWithRateLimit).toHaveBeenCalled();
    expect(mocks.mockWithGlobalConcurrency).toHaveBeenCalled();
  });

  it("registers an AbortController for the battle ID (critical fix: cancel wiring)", async () => {
    await POST(makeRequest(validIdea), {
      params: Promise.resolve({ id: "btl_ABCDEFGH" }),
    });
    // registerAbortController should be called with the battle ID
    // from the route params so the cancel endpoint can find it.
    expect(mocks.mockRegisterAbortController).toHaveBeenCalledWith("btl_ABCDEFGH");
  });

  it("clears the AbortController after the battle completes (no memory leak)", async () => {
    await POST(makeRequest(validIdea), {
      params: Promise.resolve({ id: "btl_ABCDEFGH" }),
    });
    // clearAbortController should be called in the finally block
    // to prevent unbounded growth of the registry.
    expect(mocks.mockClearAbortController).toHaveBeenCalledWith("btl_ABCDEFGH");
  });

  it("returns 200 with a battle bundle on success", async () => {
    const response = await POST(makeRequest(validIdea), {
      params: Promise.resolve({ id: "btl_ABCDEFGH" }),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.battleId).toBe("btl_ABCDEFGH");
  });
});
