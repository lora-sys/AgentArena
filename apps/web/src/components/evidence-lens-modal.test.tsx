// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SixDimensionScore } from "@agent-arena/contracts";
import { EvidenceLensModal } from "./evidence-lens-modal";

afterEach(cleanup);
const dimension = { score: 13, max: 15, completeness: "full_breakdown" as const, breakdown: [{ label: "演示流畅性", delta: 15 }, { label: "覆盖偏窄", delta: -2 }] };
const scores = { feasibility_zh: { ...dimension, max: 25 }, originality: { ...dimension, max: 25 }, demoPower: { ...dimension, max: 25 }, technicalDepth: dimension, clarity: { ...dimension, max: 10, score: 8 }, riskControl: { ...dimension, max: 5, score: 4 } } satisfies SixDimensionScore;

describe("EvidenceLensModal", () => {
  it("renders full breakdown and evidence chain", () => { render(<EvidenceLensModal open teamName="传播设计师" totalScore={87} completeness="full_breakdown" scores={scores} evidenceChain={["test_022","attack_031"]} onClose={() => undefined}/>); expect(screen.getAllByText("覆盖偏窄").length).toBeGreaterThan(0); expect(screen.getByText("attack_031")).toBeTruthy(); });
  it("collapses linked evidence breakdown", () => { render(<EvidenceLensModal open teamName="传播设计师" totalScore={87} completeness="linked_evidence" scores={scores} onClose={() => undefined}/>); expect(screen.getByText("仅有关联证据，无完整分解")).toBeTruthy(); expect(screen.queryByText("覆盖偏窄")).toBeNull(); });
  it("disables score content when evidence is insufficient", () => { render(<EvidenceLensModal open teamName="实时参赛队" totalScore={0} completeness="insufficient_evidence" onClose={() => undefined}/>); expect(screen.getByText("当前演示证据不足，无法进入证据镜")).toBeTruthy(); expect(screen.queryByLabelText("六维评分明细")).toBeNull(); });
  it("closes on Escape", async () => { const onClose=vi.fn(); render(<EvidenceLensModal open teamName="传播设计师" totalScore={87} completeness="full_breakdown" scores={scores} onClose={onClose}/>); await userEvent.setup().keyboard("{Escape}"); expect(onClose).toHaveBeenCalledOnce(); });
});
