import { describe, expect, it, vi } from "vitest";
import { demoEvents } from "./demo";
import { buildDashboardMetrics, loadBattleArchive, loadBattleEvents, loadPassport } from "./battle";

describe("loadBattleEvents", () => {
  it("loads the verified BA-2026-0024 storyline without calling the API", async () => {
    const fetcher = vi.fn();
    const result = await loadBattleEvents("BA-2026-0024", fetcher);
    const fatal = result.events.find((event) => (event.rawPayload as { id?: string } | undefined)?.id === "attack_031");
    const champion = result.events.find((event) => event.eventType === "champion_selected");

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.source).toBe("fixture");
    expect((fatal?.rawPayload as { severity?: string }).severity).toBe("fatal");
    expect(fatal?.actorId).toBe("infra_hacker");
    expect(champion?.targetId).toBe("viral_designer");
    expect(champion?.title).toContain("传播设计师 87/100");
  });

  it("uses API event-store data when available", async () => {
    const remote = [{ ...demoEvents[0], id: "remote-1" }];
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ source: "event-store", events: remote }) });
    await expect(loadBattleEvents("battle-1", fetcher)).resolves.toMatchObject({ source: "event-store", events: remote });
  });

  it("falls back to deterministic demo events on network failure", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("offline"));
    const result = await loadBattleEvents("demo", fetcher);
    expect(result.source).toBe("fallback");
    expect(result.events).toEqual(demoEvents);
  });
});

describe("dashboard metrics", () => {
  it("derives summary values from recorded battles without inventing history", () => {
    const metrics = buildDashboardMetrics([{ id: "b1", title: "One", idea: "", status: "completed", winnerName: "Safe Builders", agents: ["A","B","C"], eventCount: 22, updatedAt: "2026-06-01T00:00:00Z" }]);
    expect(metrics).toMatchObject({ totalBattles: 1, completedRate: 100, evidenceEvents: 22 });
    expect(metrics.series).toHaveLength(1);
  });
});

describe("battle product data", () => {
  it("loads archive and passport through their public API seams", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ battles: [{ id: "demo", title: "Battle", status: "completed" }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ passport: { agentId: "infra-hacker", strengths: ["Depth"], weaknesses: ["Clarity"] } }) });
    expect((await loadBattleArchive(fetcher))[0]?.id).toBe("demo");
    expect((await loadPassport("infra-hacker", fetcher)).weaknesses).toEqual(["Clarity"]);
  });
});
