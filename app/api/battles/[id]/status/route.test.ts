import { describe, it, expect } from "vitest";
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
});
