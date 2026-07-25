import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LiveAiDegraded } from "./live-ai-degraded";

describe("LiveAiDegraded", () => {
  it("removes fixed battle results and exposes an honest recovery path", () => {
    const html = renderToStaticMarkup(<LiveAiDegraded onReturnVerified={() => undefined} />);
    expect(html).toContain("实时 AI 证据不足");
    expect(html).toContain("10s");
    expect(html).toContain("立即切回已验证演示");
    expect(html).not.toContain("87/100");
    expect(html).not.toContain("冠军");
  });
});
