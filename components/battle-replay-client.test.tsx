// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * R24 fix verification for components/battle-replay-client.tsx:
 *
 * Passport evidence links use ?event=<id> to deep-link into the
 * replay. Before the fix, the replay page ignored the query param
 * and never opened the event drawer. This test verifies that when
 * the URL contains ?event=<id>, the component sets selectedEventId
 * after events are loaded, causing the drawer to open.
 */

const mockFetchEvents = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => {
    const url = new URL(window.location.href);
    return {
      get: (key: string) => url.searchParams.get(key),
    };
  },
}));

describe("BattleReplayClient — ?event= deep-link (R24 fix)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Reset URL between tests.
    window.history.replaceState(null, "", "/battle/test/replay");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("auto-selects event from ?event= param after events load", async () => {
    // Set the deep-link param before mounting.
    window.history.replaceState(
      null,
      "",
      "/battle/test/replay?event=evt_42",
    );

    // Mock the fetch to return matching events.
    mockFetchEvents.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        events: [
          { id: "evt_42", eventType: "attack_created", title: "T1", round: 4, createdAt: "2025-01-01T00:00:00Z" },
          { id: "evt_99", eventType: "defense_created", title: "T2", round: 5, createdAt: "2025-01-01T00:01:00Z" },
        ],
      }),
    });

    vi.stubGlobal("fetch", mockFetchEvents);

    const { BattleReplayClient } = await import("./battle-replay-client");
    const { act } = await import("@testing-library/react");
    const { createRoot } = await import("react-dom/client");
    const React = await import("react");

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(BattleReplayClient, { battleId: "test" }));
    });

    // Let the fetch resolve and effects run.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // The EventDrawer should be open with the matching event.
    // EventDrawer renders a .drawer-backdrop when open=true.
    expect(container.querySelector(".drawer-backdrop")).not.toBeNull();

    root.unmount();
    container.remove();
    vi.unstubAllGlobals();
  });

  it("does not open drawer when ?event= param does not match any event", async () => {
    window.history.replaceState(
      null,
      "",
      "/battle/test/replay?event=evt_nonexistent",
    );

    mockFetchEvents.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        events: [
          { id: "evt_42", eventType: "attack_created", title: "T1", round: 4, createdAt: "2025-01-01T00:00:00Z" },
        ],
      }),
    });

    vi.stubGlobal("fetch", mockFetchEvents);

    const { BattleReplayClient } = await import("./battle-replay-client");
    const { act } = await import("@testing-library/react");
    const { createRoot } = await import("react-dom/client");
    const React = await import("react");

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(BattleReplayClient, { battleId: "test" }));
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // No event matches → drawer should not open.
    // EventDrawer renders a .drawer-backdrop only when open=true.
    expect(container.querySelector(".drawer-backdrop")).toBeNull();

    root.unmount();
    container.remove();
    vi.unstubAllGlobals();
  });
});