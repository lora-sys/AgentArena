import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RuntimeModeBadge } from "./runtime-mode-badge";

describe("RuntimeModeBadge", () => {
  it("renders verified_replay", () => {
    const html = renderToStaticMarkup(<RuntimeModeBadge mode="verified_replay" />);
    expect(html).toContain("已验证演示");
    expect(html).toContain('data-mode="verified_replay"');
  });

  it("renders live_runtime", () => {
    const html = renderToStaticMarkup(<RuntimeModeBadge mode="live_runtime" />);
    expect(html).toContain("实时 AI 竞技");
    expect(html).toContain('data-mode="live_runtime"');
  });

  it("renders demo_fallback", () => {
    const html = renderToStaticMarkup(<RuntimeModeBadge mode="demo_fallback" />);
    expect(html).toContain("演示兜底");
    expect(html).toContain('data-mode="demo_fallback"');
  });
});
