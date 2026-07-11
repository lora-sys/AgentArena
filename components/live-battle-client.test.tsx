import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { LiveBattleClient } from "./live-battle-client";

// Mock next/navigation's useRouter
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock SWR to avoid real network calls. Use a long refreshInterval so
// the test doesn't loop on the SWR poll cycle.
vi.mock("swr", () => ({
  default: () => ({
    data: {
      battleId: "battle-42",
      round: 1,
      totalRounds: 6,
      progress: 0.1,
      canCancel: true,
      agentStates: {
        "safe-builder": { state: "in_flight", streamedText: "", score: undefined },
        "viral-designer": { state: "in_flight", streamedText: "", score: undefined },
        "infra-hacker": { state: "in_flight", streamedText: "", score: undefined },
      },
    },
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
  }),
}));

// Mock sse-client so it does not try to open a real EventSource
vi.mock("@/lib/sse-client", () => ({
  connectSse: () => ({ close: vi.fn() }),
}));

describe("LiveBattleClient", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPush.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("updates elapsedSec via setInterval after 1 second", () => {
    render(<LiveBattleClient battleId="battle-42" />);

    // Initially the timer shows 0:00
    expect(screen.getByText(/0:00 elapsed/)).toBeDefined();

    // Advance time by 3 seconds and flush React state updates
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText(/0:03 elapsed/)).toBeDefined();
  });

  it("does not redirect to /battles when cancel fetch fails", async () => {
    // Mock fetch to reject
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(() =>
      Promise.reject(new Error("network down")),
    ) as unknown as typeof fetch;

    // Suppress expected console.error from the catch path
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<LiveBattleClient battleId="battle-42" />);

    const cancelButton = screen.getByRole("button", { name: /cancel battle/i });

    // Click and advance enough to let the catch path resolve
    await act(async () => {
      fireEvent.click(cancelButton);
      await vi.advanceTimersByTimeAsync(100);
    });

    // Should NOT have redirected since the fetch failed
    expect(mockPush).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    globalThis.fetch = originalFetch;
  });

  it("does not redirect when server returns cancelled: false (demo battle)", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ battleId: "battle-42", cancelled: false, status: "demo_not_cancellable" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    ) as unknown as typeof fetch;

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<LiveBattleClient battleId="battle-42" />);

    const cancelButton = screen.getByRole("button", { name: /cancel battle/i });

    await act(async () => {
      fireEvent.click(cancelButton);
      await vi.advanceTimersByTimeAsync(100);
    });

    // Should NOT have redirected since cancelled was false
    expect(mockPush).not.toHaveBeenCalled();

    warnSpy.mockRestore();
    globalThis.fetch = originalFetch;
  });

  it("reads totalRounds from the status API response (FE-1 fix)", () => {
    // Critical fix: totalRounds must come from the API, not be hardcoded.
    // The RoundProgressBar shows "Round X of Y" where Y = totalRounds.
    render(<LiveBattleClient battleId="battle-42" />);

    // SWR mock returns totalRounds: 6 — the progress bar should show "of 6".
    expect(screen.getByText(/Round \d+ of 6/)).toBeDefined();
  });
});
