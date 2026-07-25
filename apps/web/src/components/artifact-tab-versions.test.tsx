// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ArtifactBundle } from "@agent-arena/contracts";
import { ArtifactTabVersions } from "./artifact-tab-versions";

afterEach(cleanup);

const artifact: ArtifactBundle = {
  artifactId: "input_state.ts",
  teamId: "viral_designer",
  title: "input_state.ts",
  currentVersion: 2,
  versions: [
    { version: 1, label: "v1 · 初版", contentText: "return canvas.toDataURL('image/png');", createdAt: "2026-07-20T10:20:00.000Z", linkedEventId: "evt_006" },
    { version: 2, label: "v2 · 修复版", contentText: "return renderSvgFallback(data);", createdAt: "2026-07-20T11:35:00.000Z", linkedEventId: "evt_013" },
  ],
  testResults: [],
  linkedEvidenceEventIds: ["evt_006", "evt_013"],
};

describe("ArtifactTabVersions", () => {
  it("renders fixture v1 and v2 side by side", () => {
    render(<ArtifactTabVersions artifact={artifact} />);

    expect(screen.getByRole("article", { name: "v1 · 初版" }).textContent).toContain("canvas.toDataURL");
    expect(screen.getByRole("article", { name: "v2 · 修复版" }).textContent).toContain("renderSvgFallback");
  });
});
