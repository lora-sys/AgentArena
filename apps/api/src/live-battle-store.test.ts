import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { BattleEvent } from "@agent-arena/contracts";
import { LocalLiveBattleStore, resolveLiveBattleRoot } from "./live-battle-store";

const event: BattleEvent = {
  id: "event_1", battleId: "live_test", round: "briefing", eventType: "brief_created",
  title: "简报下发", content: "测试", createdAt: "2026-07-25T00:00:00.000Z",
};

describe("LocalLiveBattleStore", () => {
  it("resolves the default data directory from the API module, not process.cwd", () => {
    const root = resolveLiveBattleRoot({} as NodeJS.ProcessEnv, "file:///C:/workspace/apps/api/src/live-battle-store.ts");
    expect(root.replaceAll("\\", "/")).toBe("C:/workspace/apps/api/.data/live-battles/");
  });
  it("persists battle events and terminal status across store instances", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "agent-arena-store-"));
    const writer = new LocalLiveBattleStore(root);
    await writer.create("live_test", "测试创意");
    await writer.append("live_test", event);
    await writer.finish("live_test", "completed");

    const reader = new LocalLiveBattleStore(root);
    const restored = await reader.get("live_test");
    expect(restored).toMatchObject({ battleId: "live_test", idea: "测试创意", status: "completed" });
    expect(restored?.events).toHaveLength(1);
    expect(restored?.events[0]).toMatchObject({ id: "event_1", sequence: 1 });
    expect(JSON.parse(await readFile(path.join(root, "live_test.json"), "utf8"))).toMatchObject({ status: "completed" });
  });

  it("deduplicates repeated event ids", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "agent-arena-store-"));
    const store = new LocalLiveBattleStore(root);
    await store.create("live_test", "测试创意");
    await store.append("live_test", event);
    await store.append("live_test", event);
    expect((await store.get("live_test"))?.events).toHaveLength(1);
  });
});
