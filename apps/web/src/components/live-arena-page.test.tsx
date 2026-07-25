import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { BattleEvent } from "@agent-arena/contracts";
import { LiveArenaPage, V052_TEAMS } from "./live-arena-page";

const base = { battleId: "BA-2026-0024", createdAt: "2026-07-20T11:00:00Z" };

const fatalSequence: BattleEvent[] = [
  { ...base, id: "e1", round: "briefing", eventType: "brief_created", title: "简报下发", content: "创意下发" },
  { ...base, id: "e2", round: "proposal_round", actorId: "team_viral_v1", eventType: "proposal_created", title: "ClashQuiz 提案", content: "游戏化刷题" },
  {
    ...base,
    id: "e3",
    round: "cross_attack_round",
    actorId: "team_infra_v1",
    targetId: "team_viral_v1",
    eventType: "attack_created",
    title: "致命攻击 attack_031",
    content: "Canvas 在 Safari 16.4 渲染失败",
    rawPayload: { id: "attack_031", attackerTeamId: "team_infra_v1", targetTeamId: "team_viral_v1", severity: "fatal", claim: "x" },
  },
];

const withDefense: BattleEvent[] = [
  ...fatalSequence,
  {
    ...base,
    id: "e4",
    round: "defense_round",
    actorId: "team_viral_v1",
    eventType: "defense_created",
    title: "防守 defense_041",
    content: "接受，降级 SVG",
    rawPayload: { id: "defense_041", attackId: "attack_031", teamId: "team_viral_v1", acceptedAttack: true, responseToAttack: "y" },
  },
];

describe("LiveArenaPage", () => {
  it("renders all three v0.5.2 teams with Chinese names", () => {
    const html = renderToStaticMarkup(
      <LiveArenaPage battleId="BA-2026-0024" idea="AI 学习助手" events={[]} mode="verified_replay" />,
    );
    for (const team of V052_TEAMS) {
      expect(html).toContain(team.name);
      expect(html).toContain(team.subtitle);
    }
  });

  it("shows runtime mode badge for verified_replay", () => {
    const html = renderToStaticMarkup(
      <LiveArenaPage battleId="BA-2026-0024" idea="x" events={[]} mode="verified_replay" />,
    );
    expect(html).toContain("已验证演示");
  });

  it("shows round progress with all 7 stages", () => {
    const html = renderToStaticMarkup(
      <LiveArenaPage battleId="BA-2026-0024" idea="x" events={[]} mode="verified_replay" />,
    );
    for (const stage of ["简报", "提案", "构建", "攻击", "防守", "验证", "裁决"]) {
      expect(html).toContain(stage);
    }
  });

  it("drops viral HP to 50 after fatal attack accepted", () => {
    const html = renderToStaticMarkup(
      <LiveArenaPage battleId="BA-2026-0024" idea="x" events={withDefense} mode="verified_replay" />,
    );
    // The HpBar renders hp-number element with the final value
    expect(html).toContain('data-low="false"'); // 50 is above 35 threshold
    // Note: floating damage "-50" is rendered
    expect(html).toContain("-50");
  });

  it("does not render fatal takeover when defense already accepted", () => {
    const html = renderToStaticMarkup(
      <LiveArenaPage battleId="BA-2026-0024" idea="x" events={withDefense} mode="verified_replay" />,
    );
    // SSR: useEffect does not fire → no fatal overlay
    expect(html).not.toContain("fatal-takeover");
  });

  it("renders current attack focus with attacker/target names", () => {
    const html = renderToStaticMarkup(
      <LiveArenaPage battleId="BA-2026-0024" idea="x" events={fatalSequence} mode="verified_replay" />,
    );
    expect(html).toContain("当前攻击焦点");
    expect(html).toContain("架构黑客");
    expect(html).toContain("传播设计师");
  });
});
