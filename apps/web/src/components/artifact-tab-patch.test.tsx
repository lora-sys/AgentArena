// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ArtifactTabPatch } from "./artifact-tab-patch";

afterEach(cleanup);

const diff = "--- a/input_state.ts\n+++ b/input_state.ts\n@@ -12,2 +12,5 @@\n export function renderShareCard() {\n-  return canvas();\n+  if (legacySafari()) return svg();\n+  return canvas();\n }";

describe("ArtifactTabPatch", () => {
  it("renders removed and added fixture lines in separate columns", () => {
    render(<ArtifactTabPatch diffText={diff} />);

    expect(screen.getByRole("article", { name: "v1 删除内容" }).textContent).toContain("return canvas()");
    expect(screen.getByRole("article", { name: "v2 添加内容" }).textContent).toContain("legacySafari");
    expect(document.querySelectorAll('[data-diff-kind="removed"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-diff-kind="added"]')).toHaveLength(2);
  });
});
