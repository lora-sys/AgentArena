import { describe, it, expect, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
//* Mocks                                                              */
/* ------------------------------------------------------------------ */

// Mock guards so we can control the cancelCurrentBattle return value
// and track calls. The route handler delegates validation and rate
// limiting to guards — we only need to verify the handler logic here.
const mockCancelCurrentBattle = vi.fn();
const mockValidateBattleId = vi.fn();
const mockBadRequest = vi.fn((msg: string) =>
  new Response(JSON.stringify({ error: msg }), { status: 400, headers: { "content-type": "application/json" } }),
);

vi.mock("@/lib/api/guards", () => ({
  validateBattleId: mockValidateBattleId,
  cancelCurrentBattle: mockCancelCurrentBattle,
  badRequest: mockBadRequest,
  withRateLimit: <T extends (...args: unknown[]) => unknown>(handler: T): T => handler,
}));

function makeRequest(): Request {
  return new Request("http://localhost/api/battles/btl_ABCDEFGH/cancel", {
    method: "POST",
  });
}

function makeCtx() {
  return { params: Promise.resolve({ id: "btl_ABCDEFGH" }) };
}

describe("POST /api/battles/[id]/cancel", () => {
  let POST: (request: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();
    mockCancelCurrentBattle.mockReset();
    mockValidateBattleId.mockReset();
    mockBadRequest.mockClear();
    const mod = await import("./route");
    POST = mod.POST as typeof POST;
  });

  it("returns 200 with cancelled=true when a battle is in-flight", async () => {
    mockValidateBattleId.mockReturnValue(true);
    mockCancelCurrentBattle.mockReturnValue(true);

    const response = await POST(makeRequest(), makeCtx());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.battleId).toBe("btl_ABCDEFGH");
    expect(body.cancelled).toBe(true);
    expect(body.status).toBe("cancelling");
  });

  it("returns 200 with cancelled=false when no battle is running", async () => {
    mockValidateBattleId.mockReturnValue(true);
    mockCancelCurrentBattle.mockReturnValue(false);

    const response = await POST(makeRequest(), makeCtx());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.cancelled).toBe(false);
    expect(body.status).toBe("demo_not_cancellable");
  });

  it("returns 400 for an invalid battle ID", async () => {
    mockValidateBattleId.mockReturnValue(false);

    const response = await POST(makeRequest(), makeCtx());

    expect(response.status).toBe(400);
    expect(mockCancelCurrentBattle).not.toHaveBeenCalled();
  });
});
