import { describe, expect, it } from "vitest";
import { loadHackathon001 } from "./hackathon-001.loader";

describe("hackathon-001 fixture loader", () => {
  it("loader returns a completed battle bundle object", () => {
    const bundle = loadHackathon001();
    expect(bundle).toBeDefined();
    expect(bundle.battle).toBeDefined();
    expect(bundle.battle.id).toBe("btl_hack001");
    expect(bundle.teams).toHaveLength(3);
    expect(bundle.proposals).toHaveLength(3);
    expect(bundle.attacks.length).toBeGreaterThanOrEqual(3);
    expect(bundle.defenses.length).toBeGreaterThanOrEqual(3);
    expect(bundle.scores).toHaveLength(3);
    expect(bundle.artifacts).toHaveLength(3);
    expect(bundle.events.length).toBeGreaterThanOrEqual(10);
    expect(bundle.events.length).toBeLessThanOrEqual(15);
  });

  it("all sections pass schema validators", () => {
    const bundle = loadHackathon001();
    expect(bundle.battle.winnerTeamId).toBe("team_safe_v1");
    expect(bundle.teams.map((t) => t.id)).toEqual([
      "team_safe_v1",
      "team_viral_v1",
      "team_infra_v1",
    ]);
    expect(bundle.proposals.every((p) => p.teamId && p.productName)).toBe(true);
    expect(bundle.attacks.every((a) => a.id && a.attackerTeamId && a.targetTeamId)).toBe(true);
    expect(bundle.defenses.every((d) => d.id && d.attackId && d.teamId)).toBe(true);
    expect(bundle.scores.every((s) => s.teamId && s.scores)).toBe(true);
    expect(bundle.artifacts.every((a) => a.id && a.battleId && a.title)).toBe(true);
    expect(bundle.passports).toHaveLength(3);
    expect(bundle.replay.segments.length).toBeGreaterThan(0);
    expect(bundle.exportMarkdown.length).toBeGreaterThan(0);
  });

  it("two calls return equal deep-equal objects", () => {
    const a = loadHackathon001();
    const b = loadHackathon001();
    expect(a).toEqual(b);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});