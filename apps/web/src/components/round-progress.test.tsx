import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RoundProgress, RoundBanner, ROUND_STAGES } from "./round-progress";

describe("RoundProgress", () => {
  it("has exactly 7 stages in canonical order", () => {
    expect(ROUND_STAGES).toEqual(["brief", "proposal", "build", "attack", "defense", "verify", "judgment"]);
  });

  it("marks stages before current as done, current as current, after as future", () => {
    const html = renderToStaticMarkup(<RoundProgress currentStage="attack" />);
    const expected: Record<string, string> = {
      brief: "done",
      proposal: "done",
      build: "done",
      attack: "current",
      defense: "future",
      verify: "future",
      judgment: "future",
    };
    for (const [stage, state] of Object.entries(expected)) {
      expect(html).toContain(`data-stage="${stage}" data-state="${state}"`);
    }
  });

  it("renders chinese labels from i18n", () => {
    const html = renderToStaticMarkup(<RoundProgress currentStage="proposal" />);
    expect(html).toContain("简报");
    expect(html).toContain("提案");
    expect(html).toContain("构建");
    expect(html).toContain("攻击");
    expect(html).toContain("防守");
    expect(html).toContain("验证");
    expect(html).toContain("裁决");
  });
});

describe("RoundBanner", () => {
  it("renders the current stage label", () => {
    const html = renderToStaticMarkup(<RoundBanner currentStage="attack" />);
    expect(html).toContain("攻击");
    expect(html).toContain('data-stage="attack"');
  });
});
