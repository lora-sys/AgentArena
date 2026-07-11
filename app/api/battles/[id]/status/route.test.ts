import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

describe("GET /api/battles/[id]/status", () => {
  it("returns agent states for any battle id (MVP: static complete)", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/battles/demo/status"),
      { params: Promise.resolve({ id: "demo" }) },
    );
    const body = await response.json();
    expect(body.battleId).toBe("demo");
    expect(body.round).toBe(6);
    expect(body.totalRounds).toBe(8);
    expect(body.progress).toBe(1.0);
    expect(body.canCancel).toBe(false);
    expect(body.agentStates["safe-builder"].state).toBe("complete");
    expect(body.agentStates["safe-builder"].score).toBe(8.4);
    expect(body.agentStates["viral-designer"].state).toBe("complete");
    expect(body.agentStates["infra-hacker"].state).toBe("complete");
  });

  it("catch block includes status field (R24: no missing-field regression)", async () => {
    // R24 fix: the DB-unavailable catch block must include a `status`
    // field with a default value so polling clients always see a
    // consistent shape. Before this fix, the catch returned agentStates
    // without `status`, breaking the live page's polling contract.
    vi.resetModules();
    vi.doMock("@/lib/db/repo/battle-repo", () => ({
      findById: vi.fn().mockRejectedValue(new Error("DB down")),
      recentEvents: vi.fn().mockRejectedValue(new Error("DB down")),
    }));
    const { GET: GETmocked } = await import("./route");

    const response = await GETmocked(
      new Request("http://localhost:3000/api/battles/btl_FAIL/status"),
      { params: Promise.resolve({ id: "btl_FAIL" }) },
    );
    const body = await response.json();

    // Must include a status field with a safe default.
    expect(body.status).toBeDefined();
    expect(body.status).toBe("unknown");
    expect(body.battleId).toBe("btl_FAIL");
    expect(body.round).toBe(1);
    expect(body.progress).toBe(0);
    expect(body.agentStates).toBeDefined();
    expect(Object.keys(body.agentStates)).toHaveLength(3);

    vi.doUnmock("@/lib/db/repo/battle-repo");
  });

  it("falls through to default state (not 404) when battle not found in DB (R26: in-memory battle contract)", async () => {
    // R26 fix: POST /api/battles may return 201 + inMemory: true when the
    // DB insert fails. The client then polls /status — but findById
    // returns null because the row was never persisted. Previously this
    // returned 404, breaking the create-then-poll contract. Now it
    // returns the same default state as the DB-unavailable path.
    vi.resetModules();
    vi.doMock("@/lib/db/repo/battle-repo", () => ({
      findById: vi.fn().mockResolvedValue(null),
      recentEvents: vi.fn().mockResolvedValue([]),
    }));
    const { GET: GETmocked } = await import("./route");

    const response = await GETmocked(
      new Request("http://localhost:3000/api/battles/btl_INMEM/status"),
      { params: Promise.resolve({ id: "btl_INMEM" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.battleId).toBe("btl_INMEM");
    expect(body.status).toBe("unknown");
    expect(body.round).toBe(1);
    expect(body.progress).toBe(0);
    expect(body.canCancel).toBe(true);
    expect(Object.keys(body.agentStates)).toHaveLength(3);

    vi.doUnmock("@/lib/db/repo/battle-repo");
  });
});
