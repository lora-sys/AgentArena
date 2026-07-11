// @vitest-environment happy-dom

import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
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

  it("copy handler catches clipboard rejection instead of triggering an unhandled rejection (R27)", async () => {
    // R27 fix: navigator.clipboard.writeText can reject (permissions denied,
    // insecure context, etc.). Before the fix, the error propagated as an
    // unhandled promise rejection. Now it is caught and the UI degrades gracefully.
    const writeText = vi.fn().mockRejectedValue(new Error("NotAllowedError"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    // Track that no unhandled rejection escapes.
    const unhandled: unknown[] = [];
    const onUnhandled = (event: PromiseRejectionEvent) => {
      unhandled.push(event.reason);
      event.preventDefault();
    };
    window.addEventListener("unhandledrejection", onUnhandled);

    render(<ReplayControls elapsed="0:30" duration="2:00" />);

    // Open share dialog, then click Copy.
    fireEvent.click(screen.getByText("Share"));
    const copyButton = await screen.findByText("Copy");
    fireEvent.click(copyButton);

    // The promise must resolve without throwing into the global handler.
    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });

    window.removeEventListener("unhandledrejection", onUnhandled);
    expect(unhandled).toHaveLength(0);
  });
});