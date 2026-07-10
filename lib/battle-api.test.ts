import { describe, expect, it } from "vitest";
import { makeBattleId, normalizeBattleCreateInput, runBattleFromPayload, summarizeBattleBundle } from "./battle-api";

describe("makeBattleId", () => {
  it("produces a btl_ prefix", () => {
    const id = makeBattleId("some idea");
    expect(id.startsWith("btl_")).toBe(true);
  });

  it("produces exactly 8 base32 characters after the prefix", () => {
    const id = makeBattleId("some idea");
    const suffix = id.slice("btl_".length);
    expect(suffix).toHaveLength(8);
  });

  it("uses only Crockford base32 characters (no I, L, O, U)", () => {
    // Test across many seeds to increase chance of hitting excluded letters.
    const excluded = new Set(["I", "L", "O", "U"]);
    for (let i = 0; i < 200; i += 1) {
      const id = makeBattleId(`seed-${i}-${Math.random()}`);
      const suffix = id.slice("btl_".length);
      for (const char of suffix) {
        expect(excluded.has(char)).toBe(false);
      }
      // Every char must be a valid Crockford base32 char
      expect(/^[0-9A-HJKMNPQRSTVWXYZ]{8}$/.test(suffix)).toBe(true);
    }
  });

  it("is deterministic for the same input", () => {
    expect(makeBattleId("hello")).toBe(makeBattleId("hello"));
  });

  it("produces different IDs for different inputs", () => {
    const a = makeBattleId("idea-a");
    const b = makeBattleId("idea-b");
    expect(a).not.toBe(b);
  });

  it("falls back to a default seed when idea is undefined", () => {
    const id = makeBattleId(undefined);
    expect(id).toMatch(/^btl_[0-9A-HJKMNPQRSTVWXYZ]{8}$/);
  });
});

describe("normalizeBattleCreateInput", () => {
  it("trims idea and applies defaults for missing settings", () => {
    const result = normalizeBattleCreateInput({ idea: "  hello world  " });
    expect(result.idea).toBe("hello world");
    expect(result.settings).toBeDefined();
  });

  it("rejects empty idea", () => {
    const result = normalizeBattleCreateInput({ idea: "   " });
    expect(result.idea).toBeUndefined();
  });
});

describe("runBattleFromPayload", () => {
  it("uses the provided battleId when given", () => {
    const bundle = runBattleFromPayload({ idea: "test" }, "btl_a1b2c3d4");
    expect(bundle.battle.id).toBe("btl_a1b2c3d4");
  });

  it("generates a btl_ ID when none is provided", () => {
    const bundle = runBattleFromPayload({ idea: "test" });
    expect(bundle.battle.id).toMatch(/^btl_[0-9A-HJKMNPQRSTVWXYZ]{8}$/);
  });
});

describe("summarizeBattleBundle", () => {
  it("returns summary fields from a completed bundle", () => {
    const bundle = runBattleFromPayload({ idea: "test" }, "btl_00000000");
    const summary = summarizeBattleBundle(bundle);
    expect(summary.id).toBe("btl_00000000");
    expect(summary.eventCount).toBeGreaterThan(0);
    expect(summary.teamCount).toBeGreaterThan(0);
  });
});
