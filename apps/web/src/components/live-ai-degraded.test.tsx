// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LiveAiDegraded } from "./live-ai-degraded";

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("LiveAiDegraded", () => {
  it("counts down to the verified showcase and can pause", async () => {
    vi.useFakeTimers();
    const onReturn = vi.fn();
    const { container } = render(<LiveAiDegraded onReturnVerified={onReturn} />);
    const page = container.querySelector("section");
    if (!page) throw new Error("missing degraded page");
    fireEvent.mouseEnter(page);
    act(() => vi.advanceTimersByTime(11_000));
    expect(onReturn).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "继续倒计时" })).toBeTruthy();
    fireEvent.mouseLeave(page);
    act(() => vi.advanceTimersByTime(10_000));
    expect(onReturn).toHaveBeenCalledOnce();
  });
});
