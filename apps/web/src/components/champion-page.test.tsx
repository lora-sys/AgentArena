import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { TeamPassport } from "@agent-arena/contracts";
import { ChampionPage } from "./champion-page";

const mockPassport: TeamPassport = {
  teamId: "team_viral_v1",
  teamName: "传播设计师",
  accentColor: "var(--team-viral)",
  totalScore: 87,
  scores: {
    feasibility_zh: { score: 23, max: 25, completeness: "full_breakdown", breakdown: [{ label: "x", delta: 23 }] },
    originality: { score: 20, max: 25, completeness: "linked_evidence", breakdown: [{ label: "x", delta: 20 }] },
    demoPower: { score: 19, max: 25, completeness: "linked_evidence", breakdown: [{ label: "x", delta: 19 }] },
    technicalDepth: { score: 13, max: 15, completeness: "linked_evidence", breakdown: [{ label: "x", delta: 13 }] },
    clarity: { score: 8, max: 10, completeness: "linked_evidence", breakdown: [{ label: "x", delta: 8 }] },
    riskControl: { score: 4, max: 5, completeness: "linked_evidence", breakdown: [{ label: "x", delta: 4 }] },
  },
  strengths: ["演示力最强"],
  weaknesses: ["技术深度一般"],
  improvementSuggestions: ["补强测试覆盖"],
  journey: [
    { round: "proposal", eventId: "e1", title: "提案" },
    { round: "attack", eventId: "e2", title: "致命攻击" },
    { round: "defense", eventId: "e3", title: "防守" },
    { round: "judging", eventId: "e4", title: "夺冠" },
  ],
  evidenceCompleteness: "full_breakdown",
};

describe("ChampionPage", () => {
  it("renders champion name and score", () => {
    const html = renderToStaticMarkup(<ChampionPage battleId="BA-2026-0024" champion={mockPassport} />);
    expect(html).toContain("传播设计师");
    expect(html).toContain("87");
    expect(html).toContain("/100");
    expect(html).toContain("BA-2026-0024");
  });

  it("renders all six dimensions with chinese labels", () => {
    const html = renderToStaticMarkup(<ChampionPage battleId="x" champion={mockPassport} />);
    expect(html).toContain("可行性");
    expect(html).toContain("原创性");
    expect(html).toContain("演示力");
    expect(html).toContain("技术深度");
    expect(html).toContain("讲解清晰");
    expect(html).toContain("风险控制");
  });

  it("renders strengths AND weaknesses AND improvements", () => {
    const html = renderToStaticMarkup(<ChampionPage battleId="x" champion={mockPassport} />);
    expect(html).toContain("优势");
    expect(html).toContain("弱点");
    expect(html).toContain("改进建议");
    expect(html).toContain("演示力最强");
    expect(html).toContain("技术深度一般");
    expect(html).toContain("补强测试覆盖");
  });

  it("renders journey timeline", () => {
    const html = renderToStaticMarkup(<ChampionPage battleId="x" champion={mockPassport} />);
    expect(html).toContain("战斗旅程");
    expect(html).toContain("提案");
    expect(html).toContain("致命攻击");
    expect(html).toContain("防守");
    expect(html).toContain("夺冠");
  });

  it("liveIncomplete shows mini-passport instead", () => {
    const html = renderToStaticMarkup(
      <ChampionPage battleId="x" champion={mockPassport} liveIncomplete={true} />,
    );
    expect(html).toContain("本场战斗尚未产生完整护照快照");
    expect(html).toContain("返回 Live Arena");
    expect(html).toContain("观看已验证演示");
    expect(html).toContain('data-state="mini-passport"');
  });

  it("data-state revealed when not incomplete", () => {
    const html = renderToStaticMarkup(<ChampionPage battleId="x" champion={mockPassport} />);
    expect(html).toContain('data-state="revealed"');
  });

  it("uses the portrait that belongs to the champion team", () => {
    const safeChampion = { ...mockPassport, teamId: "team_safe_v1", teamName: "稳健构建者" };
    const html = renderToStaticMarkup(<ChampionPage battleId="x" champion={safeChampion} />);
    expect(html).toContain('/assets/agents/safe-builder.png');
    expect(html).not.toContain('/assets/agents/viral-designer.png');
  });
});
