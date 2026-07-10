import { describe, expect, it } from "vitest";
import {
  advanceBattleStatus,
  battleStateFlow,
  canTransitionBattleStatus,
  getNextBattleStatus,
} from "./battle-state";
import type { Battle, BattleStatus } from "../schemas";

const makeBattle = (status: BattleStatus = "idle"): Battle => ({
  id: "btl_TESTTEST",
  title: "Test Battle",
  idea: "A test idea",
  type: "hackathon",
  status,
  constraints: {
    timeLimit: "48h",
    outputTargets: ["product_brief"],
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("battleStateFlow", () => {
  it("starts at idle and ends at completed", () => {
    expect(battleStateFlow[0]).toBe("idle");
    expect(battleStateFlow[battleStateFlow.length - 1]).toBe("completed");
  });

  it("contains all main battle stages in order", () => {
    expect(battleStateFlow).toContain("briefing");
    expect(battleStateFlow).toContain("team_generation");
    expect(battleStateFlow).toContain("proposal_round");
    expect(battleStateFlow).toContain("cross_attack_round");
    expect(battleStateFlow).toContain("defense_round");
    expect(battleStateFlow).toContain("judging_round");
    expect(battleStateFlow).toContain("artifact_generation");
    expect(battleStateFlow).toContain("replay_generation");
  });
});

describe("getNextBattleStatus", () => {
  it("returns the next status for a valid current status", () => {
    expect(getNextBattleStatus("idle")).toBe("briefing");
    expect(getNextBattleStatus("briefing")).toBe("team_generation");
    expect(getNextBattleStatus("replay_generation")).toBe("completed");
  });

  it("returns undefined at the end of the flow", () => {
    expect(getNextBattleStatus("completed")).toBeUndefined();
  });

  it("returns undefined for a status not in the flow", () => {
    expect(getNextBattleStatus("failed")).toBeUndefined();
    expect(getNextBattleStatus("cancelled")).toBeUndefined();
    expect(getNextBattleStatus("retrying")).toBeUndefined();
  });
});

describe("canTransitionBattleStatus", () => {
  it("allows forward transitions through the normal flow", () => {
    expect(canTransitionBattleStatus("idle", "briefing")).toBe(true);
    expect(canTransitionBattleStatus("proposal_round", "cross_attack_round")).toBe(true);
    expect(canTransitionBattleStatus("defense_round", "judging_round")).toBe(true);
  });

  it("disallows skipping ahead", () => {
    expect(canTransitionBattleStatus("idle", "judging_round")).toBe(false);
    expect(canTransitionBattleStatus("briefing", "proposal_round")).toBe(false);
  });

  it("disallows going backward", () => {
    expect(canTransitionBattleStatus("briefing", "idle")).toBe(false);
    expect(canTransitionBattleStatus("completed", "idle")).toBe(false);
  });

  it("allows transition to failed from any valid status", () => {
    expect(canTransitionBattleStatus("idle", "failed")).toBe(true);
    expect(canTransitionBattleStatus("proposal_round", "failed")).toBe(true);
    expect(canTransitionBattleStatus("completed", "failed")).toBe(true);
  });

  it("allows transition to retrying from any valid status", () => {
    expect(canTransitionBattleStatus("idle", "retrying")).toBe(true);
    expect(canTransitionBattleStatus("judging_round", "retrying")).toBe(true);
  });

  it("allows transition to cancelled from any valid status", () => {
    expect(canTransitionBattleStatus("idle", "cancelled")).toBe(true);
    expect(canTransitionBattleStatus("artifact_generation", "cancelled")).toBe(true);
  });

  it("rejects transitions from an invalid source status", () => {
    expect(canTransitionBattleStatus("nonexistent" as BattleStatus, "briefing")).toBe(false);
  });

  it("rejects transitions to an invalid target status", () => {
    expect(canTransitionBattleStatus("idle", "nonexistent" as BattleStatus)).toBe(false);
  });
});

describe("advanceBattleStatus", () => {
  it("returns a new battle with the updated status and updatedAt", () => {
    const battle = makeBattle("idle");
    const result = advanceBattleStatus(battle, "briefing", "2026-02-01T00:00:00.000Z");
    expect(result.status).toBe("briefing");
    expect(result.updatedAt).toBe("2026-02-01T00:00:00.000Z");
    expect(result.id).toBe(battle.id);
  });

  it("does not mutate the original battle", () => {
    const battle = makeBattle("idle");
    advanceBattleStatus(battle, "briefing", "2026-02-01T00:00:00.000Z");
    expect(battle.status).toBe("idle");
    expect(battle.updatedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("throws on an invalid forward transition", () => {
    const battle = makeBattle("idle");
    expect(() => advanceBattleStatus(battle, "judging_round", "2026-02-01T00:00:00.000Z")).toThrow(
      "Invalid battle status transition from idle to judging_round",
    );
  });

  it("allows transition to failed", () => {
    const battle = makeBattle("proposal_round");
    const result = advanceBattleStatus(battle, "failed", "2026-02-01T00:00:00.000Z");
    expect(result.status).toBe("failed");
  });

  it("allows transition to cancelled", () => {
    const battle = makeBattle("artifact_generation");
    const result = advanceBattleStatus(battle, "cancelled", "2026-02-01T00:00:00.000Z");
    expect(result.status).toBe("cancelled");
  });

  it("preserves all other battle fields", () => {
    const battle = makeBattle("briefing");
    const result = advanceBattleStatus(battle, "team_generation", "2026-02-01T00:00:00.000Z");
    expect(result.title).toBe(battle.title);
    expect(result.idea).toBe(battle.idea);
    expect(result.type).toBe(battle.type);
    expect(result.constraints).toEqual(battle.constraints);
    expect(result.createdAt).toBe(battle.createdAt);
  });
});
