import { describe, expect, it } from "vitest";
import { isFatalHpHit } from "./hp-bar";

describe("isFatalHpHit", () => {
  it("fires for a fatal hit that actually drains HP", () => {
    expect(isFatalHpHit(88, 38, "fatal")).toBe(true);
  });

  it("does not re-fire while HP recovers under a linked fatal attack", () => {
    expect(isFatalHpHit(38, 68, "fatal")).toBe(false);
  });

  it("does not fire on the initial render", () => {
    expect(isFatalHpHit(undefined, 38, "fatal")).toBe(false);
  });
});
