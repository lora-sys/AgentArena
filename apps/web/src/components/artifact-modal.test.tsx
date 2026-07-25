import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ArtifactModal } from "./artifact-modal";

describe("ArtifactModal", () => {
  it("renders nothing when closed", () => {
    const html = renderToStaticMarkup(
      <ArtifactModal open={false} onClose={() => {}} teamName="传播设计师" />,
    );
    expect(html).toBe("");
  });

  it("renders dialog with aria attributes when open", () => {
    const html = renderToStaticMarkup(
      <ArtifactModal open={true} onClose={() => {}} teamName="传播设计师" />,
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("传播设计师");
  });

  it("renders all four tabs in canonical order", () => {
    const html = renderToStaticMarkup(
      <ArtifactModal open={true} onClose={() => {}} teamName="x" />,
    );
    expect(html).toContain("版本对比");
    expect(html).toContain("补丁差异");
    expect(html).toContain("测试结果");
    expect(html).toContain("关联证据");
  });

  it("respects initialTab", () => {
    const html = renderToStaticMarkup(
      <ArtifactModal open={true} onClose={() => {}} teamName="x" initialTab="patch" />,
    );
    expect(html).toContain('data-tab="patch"');
  });
});
