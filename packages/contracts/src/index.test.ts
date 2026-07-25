import { describe, expect, it } from "vitest";
import {
  buildPlaybackBatches,
  DAMAGE_MAP,
  RECOVERY_RATIO,
  reduceArenaHp,
  SIX_DIMENSION_MAX,
  type BattleEvent,
  type SixDimensionScore,
  type TeamPassport,
} from ".";

const base = { battleId: "demo", createdAt: "2026-07-04T00:00:00Z", title: "", content: "" };

describe("DAMAGE_MAP", () => {
  it("locks the v0.5.2 tiers including fatal=50", () => {
    expect(DAMAGE_MAP).toEqual({ low: 5, medium: 15, high: 30, fatal: 50 });
    expect(RECOVERY_RATIO).toBeCloseTo(0.6);
  });
});

describe("reduceArenaHp", () => {
  it("only damages a team when the linked attack is accepted", () => {
    const events: BattleEvent[] = [
      { ...base, id: "a1", round: "attack", actorId: "safe", eventType: "attack_created", rawPayload: { id: "a1", attackerTeamId: "safe", targetTeamId: "viral", severity: "high", claim: "fatal demo risk" } },
      { ...base, id: "d1", round: "defense", actorId: "viral", eventType: "defense_created", rawPayload: { id: "d1", attackId: "a1", teamId: "viral", acceptedAttack: true, responseToAttack: "accepted" } },
    ];
    expect(reduceArenaHp(events, ["safe", "viral"]).hp).toEqual({ safe: 100, viral: 70 });
  });

  it("applies fatal=50 damage (88 → 38 curve start)", () => {
    const events: BattleEvent[] = [
      { ...base, id: "seed", round: "build", eventType: "artifact_created", rawPayload: { id: "seed_test", teamId: "viral", name: "test_001", passed: false } },
      { ...base, id: "a1", round: "attack", eventType: "attack_created", rawPayload: { id: "attack_031", attackerTeamId: "infra", targetTeamId: "viral", severity: "fatal", claim: "critical" } },
      { ...base, id: "d1", round: "defense", eventType: "defense_created", rawPayload: { id: "defense_041", attackId: "attack_031", teamId: "viral", acceptedAttack: true, responseToAttack: "patching" } },
    ];
    const { hp, damageByAttackId } = reduceArenaHp(events, ["viral", "infra"]);
    expect(damageByAttackId["attack_031"]).toBe(50);
    expect(hp.viral).toBe(50); // 100 - 50
  });

  it("recovers 60% of accepted damage on a subsequent passing test (38 → 68)", () => {
    const events: BattleEvent[] = [
      { ...base, id: "a1", round: "attack", eventType: "attack_created", rawPayload: { id: "attack_031", attackerTeamId: "infra", targetTeamId: "viral", severity: "fatal", claim: "critical" } },
      { ...base, id: "d1", round: "defense", eventType: "defense_created", rawPayload: { id: "defense_041", attackId: "attack_031", teamId: "viral", acceptedAttack: true, responseToAttack: "patching" } },
      { ...base, id: "p1", round: "defense", eventType: "artifact_created", rawPayload: { id: "patch_048", teamId: "viral", artifactId: "input_state", diffText: "..." } },
      { ...base, id: "t1", round: "verify", eventType: "artifact_created", rawPayload: { id: "test_052", teamId: "viral", name: "test_052", passed: true } },
    ];
    const { hp, damageByAttackId, recoveryByTestId } = reduceArenaHp(events, ["viral"]);
    expect(damageByAttackId["attack_031"]).toBe(50);
    expect(recoveryByTestId["test_052"]).toBe(Math.round(50 * RECOVERY_RATIO)); // 30
    expect(hp.viral).toBe(80); // 100 - 50 + 30
  });

  it("recovery fires at most once per accepted attack", () => {
    const events: BattleEvent[] = [
      { ...base, id: "a1", round: "attack", eventType: "attack_created", rawPayload: { id: "attack_031", attackerTeamId: "infra", targetTeamId: "viral", severity: "fatal", claim: "x" } },
      { ...base, id: "d1", round: "defense", eventType: "defense_created", rawPayload: { id: "d", attackId: "attack_031", teamId: "viral", acceptedAttack: true, responseToAttack: "y" } },
      { ...base, id: "t1", round: "verify", eventType: "artifact_created", rawPayload: { id: "test_052", teamId: "viral", name: "test_052", passed: true } },
      { ...base, id: "t2", round: "verify", eventType: "artifact_created", rawPayload: { id: "test_053", teamId: "viral", name: "test_053", passed: true } },
    ];
    const { hp, recoveryByTestId } = reduceArenaHp(events, ["viral"]);
    expect(Object.keys(recoveryByTestId)).toHaveLength(1);
    expect(hp.viral).toBe(80);
  });

  it("failing tests do not recover", () => {
    const events: BattleEvent[] = [
      { ...base, id: "a1", round: "attack", eventType: "attack_created", rawPayload: { id: "a1", attackerTeamId: "infra", targetTeamId: "viral", severity: "high", claim: "x" } },
      { ...base, id: "d1", round: "defense", eventType: "defense_created", rawPayload: { id: "d", attackId: "a1", teamId: "viral", acceptedAttack: true, responseToAttack: "y" } },
      { ...base, id: "t1", round: "verify", eventType: "artifact_created", rawPayload: { id: "test_022", teamId: "viral", name: "test_022", passed: false } },
    ];
    const { hp, recoveryByTestId } = reduceArenaHp(events, ["viral"]);
    expect(recoveryByTestId).toEqual({});
    expect(hp.viral).toBe(70);
  });

  it("rejected defense applies no damage", () => {
    const events: BattleEvent[] = [
      { ...base, id: "a1", round: "attack", eventType: "attack_created", rawPayload: { id: "a1", attackerTeamId: "safe", targetTeamId: "viral", severity: "fatal", claim: "x" } },
      { ...base, id: "d1", round: "defense", eventType: "defense_created", rawPayload: { id: "d", attackId: "a1", teamId: "viral", acceptedAttack: false, responseToAttack: "rebut" } },
    ];
    expect(reduceArenaHp(events, ["viral"]).hp.viral).toBe(100);
  });
});

describe("buildPlaybackBatches", () => {
  it("starts different actors in the same round together and preserves round order", () => {
    const events: BattleEvent[] = [
      { ...base, id: "p1", round: "proposal", actorId: "safe", eventType: "proposal_created" },
      { ...base, id: "p2", round: "proposal", actorId: "viral", eventType: "proposal_created" },
      { ...base, id: "p3", round: "proposal", actorId: "infra", eventType: "proposal_created" },
      { ...base, id: "a1", round: "attack", actorId: "infra", eventType: "attack_created" },
    ];
    const batches = buildPlaybackBatches(events);
    expect(batches[0]?.events.map((event) => event.actorId)).toEqual(["safe", "viral", "infra"]);
    expect(batches[1]?.events[0]?.eventType).toBe("attack_created");
    expect(events.findIndex((event) => event.eventType === "attack_created")).toBeGreaterThan(
      events.findIndex((event) => event.actorId === "infra" && event.eventType === "proposal_created"),
    );
  });

  it("reveals the champion after scoring even when the store uses one judging round", () => {
    const events: BattleEvent[] = [
      { ...base, id: "s1", round: "judging", eventType: "score_created" },
      { ...base, id: "c1", round: "judging", eventType: "champion_selected" },
    ];
    expect(buildPlaybackBatches(events).map((batch) => batch.events[0]?.eventType)).toEqual(["score_created", "champion_selected"]);
  });
});

describe("SIX_DIMENSION_MAX", () => {
  it("locks the v0.5.2 maxes", () => {
    expect(SIX_DIMENSION_MAX).toEqual({
      feasibility_zh: 25,
      originality: 25,
      demoPower: 25,
      technicalDepth: 15,
      clarity: 10,
      riskControl: 5,
    });
  });

  it("validates champion fixture dimension shape", () => {
    const scores: SixDimensionScore = {
      feasibility_zh: { score: 23, max: 25, completeness: "full_breakdown", breakdown: [{ label: "技术栈成熟", delta: 25 }, { label: "集成复杂", delta: -2 }] },
      originality: { score: 20, max: 25, completeness: "full_breakdown", breakdown: [{ label: "玩法新", delta: 22 }, { label: "参考多", delta: -2 }] },
      demoPower: { score: 19, max: 25, completeness: "full_breakdown", breakdown: [{ label: "演示流畅", delta: 22 }, { label: "覆盖偏窄", delta: -3 }] },
      technicalDepth: { score: 13, max: 15, completeness: "linked_evidence", breakdown: [{ label: "工程完整", delta: 13 }] },
      clarity: { score: 8, max: 10, completeness: "linked_evidence", breakdown: [{ label: "叙事清晰", delta: 8 }] },
      riskControl: { score: 4, max: 5, completeness: "linked_evidence", breakdown: [{ label: "修复及时", delta: 4 }] },
    };
    const total = Object.values(scores).reduce((sum, dim) => sum + dim.score, 0);
    expect(total).toBe(87); // champion fixture
    for (const [key, dim] of Object.entries(scores)) {
      const max = SIX_DIMENSION_MAX[key as keyof SixDimensionScore];
      expect(dim.max).toBe(max);
      expect(dim.score).toBeLessThanOrEqual(dim.max);
      const deltaSum = dim.breakdown.reduce((sum, line) => sum + line.delta, 0);
      expect(deltaSum).toBe(dim.score);
    }
  });
});

describe("TeamPassport", () => {
  it("shape is stable for downstream champion page", () => {
    const passport: TeamPassport = {
      teamId: "viral",
      teamName: "传播设计师",
      accentColor: "#F5567E",
      totalScore: 87,
      scores: {
        feasibility_zh: { score: 23, max: 25, completeness: "full_breakdown", breakdown: [{ label: "x", delta: 23 }] },
        originality: { score: 20, max: 25, completeness: "full_breakdown", breakdown: [{ label: "x", delta: 20 }] },
        demoPower: { score: 19, max: 25, completeness: "full_breakdown", breakdown: [{ label: "x", delta: 19 }] },
        technicalDepth: { score: 13, max: 15, completeness: "linked_evidence", breakdown: [{ label: "x", delta: 13 }] },
        clarity: { score: 8, max: 10, completeness: "linked_evidence", breakdown: [{ label: "x", delta: 8 }] },
        riskControl: { score: 4, max: 5, completeness: "linked_evidence", breakdown: [{ label: "x", delta: 4 }] },
      },
      strengths: ["演示力强"],
      weaknesses: ["技术深度"],
      improvementSuggestions: ["补强测试覆盖"],
      journey: [{ round: "proposal", eventId: "e1", title: "提案" }],
      evidenceCompleteness: "full_breakdown",
    };
    expect(passport.totalScore).toBe(87);
    expect(passport.weaknesses.length).toBeGreaterThan(0);
  });
});
