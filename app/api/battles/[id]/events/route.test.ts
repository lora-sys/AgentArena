import { describe, it, expect, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/* Mocks                                                              */
/* ------------------------------------------------------------------ */

// Mock the battle-api module so we can control runBattleFromPayload behavior.
const mockRunBattleFromPayload = vi.fn();

vi.mock("@/lib/battle-api", () => ({
  runBattleFromPayload: mockRunBattleFromPayload,
}));

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe("GET /api/battles/[id]/events", () => {
  let GET: (
    request: Request,
    ctx: { params: Promise<{ id: string }> },
  ) => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();
    mockRunBattleFromPayload.mockReset();
    const mod = await import("./route");
    GET = mod.GET;
  });

  function makeCtx(id: string) {
    return { params: Promise.resolve({ id }) };
  }

  function makeRequest(): Request {
    return new Request("http://localhost/api/battles/btl_ABCDEFGH/events", {
      method: "GET",
    });
  }

  it("returns 400 for an invalid battle ID format", async () => {
    const response = await GET(makeRequest(), makeCtx("../../etc/passwd"));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Invalid battle ID format/);
    expect(mockRunBattleFromPayload).not.toHaveBeenCalled();
  });

  it("returns 400 for a missing battle ID prefix", async () => {
    const response = await GET(makeRequest(), makeCtx("ABCDEFGH"));

    expect(response.status).toBe(400);
  });

  it("returns 200 with events for a valid battle ID", async () => {
    mockRunBattleFromPayload.mockReturnValue({
      events: [{ type: "proposal_created", data: {} }],
    });

    const response = await GET(makeRequest(), makeCtx("btl_ABCDEFGH"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.battleId).toBe("btl_ABCDEFGH");
    expect(body.events).toHaveLength(1);
  });

  it("returns 200 with empty events when runBattleFromPayload throws (R26: never 500 for valid battle ID)", async () => {
    mockRunBattleFromPayload.mockImplementation(() => {
      throw new Error("boom");
    });

    // Suppress the expected console.error output
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await GET(makeRequest(), makeCtx("btl_ABCDEFGH"));
    const body = await response.json();

    // R26 fix: in-memory battles (POST returned inMemory: true) may poll
    // this route. A 500 would break the create-then-poll contract.
    // Return 200 with empty events instead so the client can continue.
    expect(response.status).toBe(200);
    expect(body.battleId).toBe("btl_ABCDEFGH");
    expect(body.events).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
