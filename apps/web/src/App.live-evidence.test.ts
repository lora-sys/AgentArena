import { describe, expect, it } from "vitest";
import type { BattleEvent } from "@agent-arena/contracts";
import { buildLiveArtifactProjection, buildLiveEvidenceChain, buildLiveScoreDimensions, readLiveIdea } from "./App";

const base = { battleId: "live_test", createdAt: "2026-07-25T00:00:00.000Z" };

describe("live evidence projection", () => {
  it("builds a team-specific chain from the current battle only", () => {
    const events: BattleEvent[] = [
      { ...base, id: "proposal_live", round: "proposal_round", actorId: "agent_safe_builder_lead", eventType: "proposal_created", title: "学程卡提案", content: "本场提案", rawPayload: { teamId: "team_safe_v1" } },
      { ...base, id: "attack_live", round: "cross_attack_round", actorId: "agent_infra_hacker_lead", targetId: "team_safe_v1", eventType: "attack_created", title: "攻击 live_01", content: "本场攻击", rawPayload: { id: "live_01", attackerTeamId: "team_infra_v1", targetTeamId: "team_safe_v1" } },
    ];
    const chain = buildLiveEvidenceChain(events, "team_safe_v1");
    expect(chain.map((item) => item.eventId)).toEqual(["proposal_live", "attack_live"]);
    expect(JSON.stringify(chain)).not.toContain("attack_031");
    expect(JSON.stringify(chain)).not.toContain("Safari");
  });

  it("normalizes six live dimensions to an exact 100-point maximum", () => {
    const events: BattleEvent[] = [{
      ...base, id: "score_live", round: "judging_round", actorId: "judge_panel", targetId: "team_safe_v1",
      eventType: "score_created", title: "实时得分", content: "完成",
      rawPayload: { teamId: "team_safe_v1", scores: { novelty: 10, feasibility: 10, demoWow: 10, technicalDepth: 10, userValue: 10, longTermPotential: 10 }, judgeComments: ["证据充分"] },
    }];
    const scores = buildLiveScoreDimensions(events, "team_safe_v1");
    expect(Object.values(scores ?? {}).reduce((sum, item) => sum + item.max, 0)).toBe(100);
    expect(Object.values(scores ?? {}).reduce((sum, item) => sum + item.score, 0)).toBe(100);
  });

  it("restores the idea from the persisted brief event in a fresh browser", () => {
    const events: BattleEvent[] = [{
      ...base,
      id: "brief_live",
      round: "briefing",
      eventType: "brief_created",
      title: "简报下发",
      content: "用户创意：城市运动伙伴",
      rawPayload: { idea: "城市运动伙伴" },
    }];
    expect(readLiveIdea(events, "live_test")).toBe("城市运动伙伴");
  });

  it("projects a distinct proposal, revision, checks and evidence set for each team", () => {
    const events: BattleEvent[] = [
      { ...base, id: "safe_proposal", round: "proposal_round", actorId: "agent_safe_builder_lead", eventType: "proposal_created", title: "稳行提案", content: "可靠路线", rawPayload: { teamId: "team_safe_v1", productName: "稳行", oneLiner: "可靠路线", technicalHighlight: "离线兜底" } },
      { ...base, id: "viral_proposal", round: "proposal_round", actorId: "agent_viral_designer_lead", eventType: "proposal_created", title: "绿途提案", content: "传播路线", rawPayload: { teamId: "team_viral_v1", productName: "绿途", oneLiner: "传播路线", technicalHighlight: "分享卡" } },
      { ...base, id: "safe_defense", round: "defense_round", actorId: "agent_safe_builder_lead", eventType: "defense_created", title: "稳行防守", content: "增加离线缓存", rawPayload: { teamId: "team_safe_v1", attackId: "attack_safe", acceptedAttack: true, revision: "增加离线缓存" } },
      { ...base, id: "viral_defense", round: "defense_round", actorId: "agent_viral_designer_lead", eventType: "defense_created", title: "绿途防守", content: "补充分享卡", rawPayload: { teamId: "team_viral_v1", targetTeamId: "team_safe_v1", attackId: "attack_viral", acceptedAttack: true, revision: "补充分享卡" } },
      { ...base, id: "viral_artifact", round: "artifact_generation", actorId: "artifact_writer", targetId: "team_viral_v1", eventType: "artifact_created", title: "绿途 产品简报", content: "冠军最终作品", rawPayload: { teamId: "team_viral_v1", sourceEventIds: ["viral_proposal", "viral_defense"] } },
    ];

    const safe = buildLiveArtifactProjection(events, "team_safe_v1", "team_viral_v1");
    const viral = buildLiveArtifactProjection(events, "team_viral_v1", "team_viral_v1");
    expect(safe?.isChampion).toBe(false);
    expect(safe?.title).toContain("稳行");
    expect(safe?.v2Content).toContain("增加离线缓存");
    expect(safe?.v2Content).not.toContain("补充分享卡");
    expect(safe?.patch).not.toContain("补充分享卡");
    expect(safe?.evidence.map((item) => item.eventId)).toEqual(["safe_proposal", "safe_defense", "viral_defense"]);
    expect(viral?.isChampion).toBe(true);
    expect(viral?.title).toBe("绿途 产品简报");
    expect(viral?.v2Content).toContain("冠军最终作品");
    expect(viral?.evidence.map((item) => item.eventId)).toEqual(["viral_proposal", "viral_defense", "viral_artifact"]);
    expect(safe?.v2Content).not.toBe(viral?.v2Content);
  });
});
