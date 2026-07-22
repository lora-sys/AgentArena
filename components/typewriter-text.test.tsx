import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TypewriterText } from "./typewriter-text";

describe("TypewriterText", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

  it("reveals complete text over time and removes the cursor", () => {
    render(<TypewriterText text="Arena" runKey="one" speedMs={10} />);
    expect(screen.queryByText("Arena")).toBeNull();
    act(() => vi.advanceTimersByTime(50));
    expect(screen.getByText("Arena")).toBeDefined();
  });

  it("shows complete text immediately for reduced motion", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    render(<TypewriterText text="Evidence remains readable" runKey="reduced" />);
    expect(screen.getByText("Evidence remains readable")).toBeDefined();
  });
});
