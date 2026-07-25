import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EvidenceLensModal } from "./evidence-lens-modal";
import type { SixDimensionScore } from "@agent-arena/contracts";

const mockScores: SixDimensionScore = {
  feasibility_zh: {
    score: 23,
    max: 25,
    completeness: "full_breakdown",
    breakdown: [
      { label: "技术栈成熟", delta: 25 },
      { label: "集成复杂", delta: -2 },
    ],
  },
  originality: { score: 20, max: 25, completeness: "linked_evidence", breakdown: [{ label: "玩法新", delta: 20 }] },
  demoPower: { score: 19, max: 25, completeness: "linked_evidence", breakdown: [{ label: "演示流畅", delta: 19 }] },
  technicalDepth: { score: 13, max: 15, completeness: "linked_evidence", breakdown: [{ label: "工程完整", delta: 13 }] },
  clarity: { score: 8, max: 10, completeness: "linked_evidence", breakdown: [{ label: "叙事清晰", delta: 8 }] },
  riskControl: { score: 4, max: 5, completeness: "linked_evidence", breakdown: [{ label: "修复及时", delta: 4 }] },
};

describe("EvidenceLensModal", () => {
  it("renders nothing when closed", () => {
    const html = renderToStaticMarkup(
      <EvidenceLensModal open={false} onClose={() => {}} teamName="x" accentColor="#fff" completeness="full_breakdown" />,
    );
    expect(html).toBe("");
  });

  it("full_breakdown shows breakdown lines for dimensions with full_breakdown", () => {
    const html = renderToStaticMarkup(
      <EvidenceLensModal
        open={true}
        onClose={() => {}}
        teamName="传播设计师"
        accentColor="var(--team-viral)"
        completeness="full_breakdown"
        scores={mockScores}
        evidenceChain={["test_022", "attack_031", "defense_041", "patch_048", "test_052"]}
      />,
    );
    expect(html).toContain("可行性");
    expect(html).toContain("+25");
    expect(html).toContain("-2");
    expect(html).toContain("test_052");
    expect(html).toContain('data-state="full_breakdown"');
  });

  it("linked_evidence shows banner and hides full breakdown", () => {
    const html = renderToStaticMarkup(
      <EvidenceLensModal
        open={true}
        onClose={() => {}}
        teamName="x"
        accentColor="#fff"
        completeness="linked_evidence"
        scores={mockScores}
      />,
    );
    expect(html).toContain("仅有关联证据");
    expect(html).toContain('data-state="linked_evidence"');
  });

  it("insufficient_evidence shows degraded state", () => {
    const html = renderToStaticMarkup(
      <EvidenceLensModal
        open={true}
        onClose={() => {}}
        teamName="x"
        accentColor="#fff"
        completeness="insufficient_evidence"
      />,
    );
    expect(html).toContain("证据不足");
    expect(html).toContain('data-state="insufficient"');
  });
});
