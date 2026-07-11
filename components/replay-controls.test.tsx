// @vitest-environment happy-dom

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ReplayControls } from "./replay-controls";

describe("ReplayControls — progress derived from elapsed/duration (R25 fix #2)", () => {
  afterEach(() => {
    cleanup();
  });

  it("derives progress percentage from elapsed/duration props", () => {
    render(<ReplayControls elapsed="1:00" duration="2:00" />);
    const progress = screen.getByLabelText("Replay progress 50%");
    expect(progress).toBeDefined();
  });

  it("renders 0% when duration is zero (degrades gracefully)", () => {
    render(<ReplayControls elapsed="0:30" duration="0:00" />);
    const progress = screen.getByLabelText("Replay progress 0%");
    expect(progress).toBeDefined();
  });

  it("clamps progress to 100% when elapsed exceeds duration", () => {
    render(<ReplayControls elapsed="3:00" duration="2:00" />);
    const progress = screen.getByLabelText("Replay progress 100%");
    expect(progress).toBeDefined();
  });

  it("returns 0% for unparseable duration strings", () => {
    render(<ReplayControls elapsed="abc" duration="xyz" />);
    const progress = screen.getByLabelText("Replay progress 0%");
    expect(progress).toBeDefined();
  });
});