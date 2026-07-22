import { describe, it, expect, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/* Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockHasBundle = vi.fn();
const mockLoadBundle = vi.fn();

vi.mock("@/lib/battle-store", () => ({
  hasBundle: mockHasBundle,
  loadBundle: mockLoadBundle,
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
    mockHasBundle.mockReset();
    mockLoadBundle.mockReset();
    const mod = await import("./route");
    GET = mod.GET;
  });

  function makeCtx(id: string) {
    return { params: Promise.resolve({ id }) };
  }

  function makeRequest(id = "btl_ABCDEFGH"): Request {
    return new Request(`http://localhost/api/battles/${id}/events`, {
      method: "GET",
    });
  }

  it("returns 400 for an invalid battle ID format", async () => {
    const response = await GET(makeRequest("../../etc/passwd"), makeCtx("../../etc/passwd"));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Invalid battle ID format/);
    expect(mockHasBundle).not.toHaveBeenCalled();
  });

  it("returns 400 for a missing battle ID prefix", async () => {
    const response = await GET(makeRequest("ABCDEFGH"), makeCtx("ABCDEFGH"));

    expect(response.status).toBe(400);
  });

  it("returns 200 with events for a battle ID in the store", async () => {
    mockHasBundle.mockReturnValue(true);
    mockLoadBundle.mockReturnValue({
      events: [{ type: "proposal_created", data: {} }],
    } as any);

    const response = await GET(makeRequest(), makeCtx("btl_ABCDEFGH"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.battleId).toBe("btl_ABCDEFGH");
    expect(body.events).toHaveLength(1);
  });

  it("returns 200 with empty events when battle not in store (never 500 for valid battle ID)", async () => {
    mockHasBundle.mockReturnValue(false);
    mockLoadBundle.mockReturnValue(undefined);

    const response = await GET(makeRequest(), makeCtx("btl_ABCDEFGH"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.battleId).toBe("btl_ABCDEFGH");
    expect(body.events).toEqual([]);
  });
});
