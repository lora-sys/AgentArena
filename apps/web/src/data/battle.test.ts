import { describe, expect, it, vi } from "vitest";
import { demoEvents } from "./demo";
import { loadBattleEvents } from "./battle";

describe("loadBattleEvents", () => {
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
