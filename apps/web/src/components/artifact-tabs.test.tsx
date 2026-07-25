import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  EvidenceLinks,
  LiveDegradedCard,
  MiniAppDemo,
  PatchDiff,
  TestResultsTable,
  VersionCompare,
} from "./artifact-tabs";

describe("VersionCompare", () => {
  it("renders v1/v2 side by side", () => {
    const html = renderToStaticMarkup(<VersionCompare v1Content="A" v2Content="B" />);
    expect(html).toContain("v1");
    expect(html).toContain("v2");
    expect(html).toContain("A");
    expect(html).toContain("B");
  });
});

describe("PatchDiff", () => {
  it("marks added/removed/hunk/context lines", () => {
    const diff = `--- a/x.ts
+++ b/x.ts
@@ -1,2 +1,2 @@
-old
+new
 context`;
    const html = renderToStaticMarkup(<PatchDiff diffText={diff} />);
    expect(html).toContain('data-diff="del"');
    expect(html).toContain('data-diff="add"');
    expect(html).toContain('data-diff="hunk"');
    expect(html).toContain('data-diff="ctx"');
  });
});

describe("TestResultsTable", () => {
  it("renders three golden tests", () => {
    const html = renderToStaticMarkup(
      <TestResultsTable
        rows={[
          { id: "test_022", name: "share_card_initial", input: "Chrome", expected: "✅", actual: "✅", passed: true },
          { id: "test_032", name: "share_card_regression", input: "Safari 17", expected: "✅", actual: "✅", passed: true },
          { id: "test_052", name: "safari_fallback", input: "Safari 16.4", expected: "SVG", actual: "SVG", passed: true },
        ]}
      />,
    );
    expect(html).toContain("test_022");
    expect(html).toContain("test_032");
    expect(html).toContain("test_052");
    expect(html).toContain("通过");
  });

  it("marks failed rows", () => {
    const html = renderToStaticMarkup(
      <TestResultsTable rows={[{ id: "t1", name: "x", input: "", expected: "", actual: "", passed: false }]} />,
    );
    expect(html).toContain('data-passed="false"');
    expect(html).toContain("未通过");
  });
});

describe("EvidenceLinks", () => {
  it("renders clickable evidence chain", () => {
    const html = renderToStaticMarkup(
      <EvidenceLinks links={[{ eventId: "evt_013", label: "patch_048" }]} />,
    );
    expect(html).toContain("evt_013");
    expect(html).toContain("patch_048");
  });
});

describe("LiveDegradedCard", () => {
  it("renders degraded notice in Chinese", () => {
    const html = renderToStaticMarkup(<LiveDegradedCard />);
    expect(html).toContain("实时演示证据不完整");
    expect(html).toContain("返回已验证演示");
  });
});

describe("MiniAppDemo", () => {
  it("renders controls without crashing", () => {
    const html = renderToStaticMarkup(<MiniAppDemo />);
    expect(html).toContain("难度");
    expect(html).toContain("题目数量");
  });
});
