import { describe, expect, it } from "vitest";
import { reduceArenaHp } from "../../packages/contracts/src";
import type { BattleEvent as ContractBattleEvent } from "../../packages/contracts/src";
import { loadVerifiedShowcase } from "./verified-showcase.loader";

describe("verified-showcase (BA-2026-0024) loader", () => {
  it("passes arena/schemas asserts and structural invariants", () => {
    const bundle = loadVerifiedShowcase();
    expect(bundle.battle.id).toBe("BA-2026-0024");
    expect(bundle.battle.winnerTeamId).toBe("team_viral_v1");
    // arena/schemas Team.score is normalized 0-10; the 0-100 totals live in
    // SixDimensionScore / TeamPassport (contracts v2).
    expect(bundle.teams.map((team) => team.score)).toEqual([7.8, 8.7, 8.4]);
  });

  it("produces the write-locked Proof HP curve 88 → 38 → 68 for viral", () => {
    const bundle = loadVerifiedShowcase();
    // Cast: arena/schemas BattleEvent has actorType but is structurally compatible with contracts BattleEvent.
    const events = bundle.events as unknown as ContractBattleEvent[];
    const { hp, damageByAttackId, recoveryByTestId } = reduceArenaHp(events, [
      "team_safe_v1",
      "team_viral_v1",
      "team_infra_v1",
    ]);

    // fatal attack_031 accepted → -50
    expect(damageByAttackId["attack_031"]).toBe(50);
    // high attack_002 accepted → -30
    expect(damageByAttackId["attack_002"]).toBe(30);
    // test_052 passes after the fatal attack → +30 (60% of 50)
    expect(recoveryByTestId["test_052"]).toBe(30);

    // Contract reduceArenaHp replays fixture events in order:
    //   evt_011 defense_041 accepts attack_031 (fatal, -50) → 100 - 50 = 50
    //   evt_012 defense_002 accepts attack_002 (high,  -30) → 50 - 30 = 20
    //   evt_015 test_032 passes → reverse-walk picks most-recent un-recovered
    //     accepted attack targeting viral (attack_002, high=30) → +18 → 38
    //   evt_016 test_052 passes → next most-recent un-recovered is attack_031
    //     (fatal=50) → +30 → 68
    // Final viral HP = 68 — matches the write-locked golden curve endpoint.
    expect(hp.team_viral_v1).toBe(68);

    // safe: 100 - 30 (attack_001 high, accepted via defense_001) = 70
    expect(hp.team_safe_v1).toBe(70);

    // infra: no accepted attacks against them in this fixture
    expect(hp.team_infra_v1).toBe(100);
  });

  it("does not leak live_runtime events into the verified_replay store", () => {
    const bundle = loadVerifiedShowcase();
    const liveKeys = ["live_runtime", "demo_fallback", "stepfun_runtime"];
    const serialized = JSON.stringify(bundle);
    for (const key of liveKeys) {
      expect(serialized).not.toContain(key);
    }
  });
});
