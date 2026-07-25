import { describe, expect, it } from "vitest";
import { verifiedShowcaseArtifactBundle } from "./verified-showcase";

describe("verifiedShowcaseArtifactBundle", () => {
  it("restores input_state.ts v1 and v2 from fixture patch_048", () => {
    const bundle = verifiedShowcaseArtifactBundle("viral_designer");

    expect(bundle?.artifactId).toBe("input_state.ts");
    expect(bundle?.versions[0].contentText).toContain("canvas.toDataURL");
    expect(bundle?.versions[0].contentText).not.toContain("renderSvgFallback");
    expect(bundle?.versions[1].contentText).toContain("renderSvgFallback");
    expect(bundle?.versions[1].linkedEventId).toBe("evt_013");
  });

  it("does not invent an artifact for teams missing version evidence", () => {
    expect(verifiedShowcaseArtifactBundle("safe_builder")).toBeUndefined();
  });
});
