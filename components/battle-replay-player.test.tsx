import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runDemoBattle } from "@/arena/engine/demo-battle";
import { BattleReplayPlayer, type BattlePlayerTeam } from "./battle-replay-player";

const teams: BattlePlayerTeam[] = [
  { id: "safe_builder", name: "Safe Builder", initials: "SB", color: "#49D6C8" },
  { id: "viral_designer", name: "Viral Designer", initials: "VD", color: "#F5567E" },
  { id: "infra_hacker", name: "Infra Hacker", initials: "IH", color: "#F2B84B" },
];

describe("BattleReplayPlayer", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("renders all three proposal writers in the same round", () => {
    const bundle = runDemoBattle();
    const proposals = bundle.events.filter((event) => event.eventType === "proposal_created");
    render(<BattleReplayPlayer battleId="demo" title="Demo" teams={teams} events={proposals} timing={{ characterMs: 10 }} />);
    expect(screen.getByText("PROPOSAL")).toBeDefined();
    expect(screen.getByLabelText(/Safe Builder agent status/)).toBeDefined();
    expect(screen.getByLabelText(/Viral Designer agent status/)).toBeDefined();
    expect(screen.getByLabelText(/Infra Hacker agent status/)).toBeDefined();
    act(() => vi.advanceTimersByTime(10));
    expect(screen.getAllByText(/\S/).length).toBeGreaterThan(3);
  });

  it("shows final HP without animation when autoPlay is disabled", () => {
    const bundle = runDemoBattle();
    render(<BattleReplayPlayer battleId="demo" title="Demo" teams={teams} events={bundle.events} autoPlay={false} />);
    expect(screen.getAllByLabelText(/70 health points/).length).toBeGreaterThan(0);
  });

  it("restarts a completed highlight when loop is enabled", () => {
    const bundle = runDemoBattle();
    const proposals = bundle.events.filter((event) => event.eventType === "proposal_created");
    const onComplete = vi.fn();
    render(
      <BattleReplayPlayer
        battleId="hero"
        title="Hero"
        teams={teams}
        events={proposals}
        loop
        timing={{ characterMs: 1, eventGapMs: 0, roundTransitionMs: 0 }}
        onPlaybackComplete={onComplete}
      />,
    );
    act(() => vi.advanceTimersByTime(10_000));
    expect(onComplete).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(1_201));
    act(() => vi.advanceTimersByTime(10_000));
    expect(onComplete).toHaveBeenCalledTimes(2);
  });
});
