import { describe, expect, it } from "vitest";
import { trialTemplates } from "./home";

describe("trial templates", () => {
  it("ships four selectable briefs with legal round counts", () => {
    expect(trialTemplates).toHaveLength(4);
    expect(trialTemplates.every((template) => template.brief.length > 20 && template.rounds >= 4 && template.rounds <= 6)).toBe(true);
  });
});
