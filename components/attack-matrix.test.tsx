import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AttackMatrix } from "./attack-matrix";

const makeAttack = (overrides: {
  id: string;
  actorId: string;
  targetId: string;
  content?: string;
}) => ({
  id: overrides.id,
  actorId: overrides.actorId,
  targetId: overrides.targetId,
  content: overrides.content ?? "",
});

describe("AttackMatrix - team ID format matching (F2-3)", () => {
  it("matches attacks when event actorId/targetId use hyphenated team IDs (API format)", () => {
    const attacks = [
      makeAttack({
        id: "atk-001",
        actorId: "safe-builder",
        targetId: "viral-designer",
        content: "API attack",
      }),
    ];

    render(<AttackMatrix attacks={attacks} />);

    // The cell for safe-builder -> viral-designer should have a button with aria-label
    const cellButton = screen.getByLabelText(/1 attack from Safe Builder to Viral Designer/);
    expect(cellButton).toBeDefined();
  });

  it("does not match when event actorId/targetId use a different format entirely", () => {
    const attacks = [
      makeAttack({
        id: "atk-002",
        actorId: "unknown-team-xyz",
        targetId: "other-unknown-abc",
        content: "should not match any cell",
      }),
    ];

    render(<AttackMatrix attacks={attacks} />);

    // No attack cell buttons (with "X attack(s) from" label) should exist
    const cellButtons = screen.queryAllByLabelText(/attack from/i);
    expect(cellButtons.length).toBe(0);
  });

  it("matches attacks when event actorId/targetId use underscored team IDs (R21 normalization)", () => {
    // R21 fix: event IDs with underscores (e.g. safe_builder, viral_designer)
    // must match team IDs with hyphens (e.g. safe-builder, viral-designer).
    // Previously the comparison only normalized the from/to params, so
    // events with underscored actorId/targetId were silently dropped.
    const attacks = [
      makeAttack({
        id: "atk-003",
        actorId: "safe_builder",
        targetId: "viral_designer",
        content: "underscored ID event",
      }),
    ];

    render(<AttackMatrix attacks={attacks} />);

    const cellButton = screen.getByLabelText(/1 attack from Safe Builder to Viral Designer/);
    expect(cellButton).toBeDefined();
  });

  afterEach(() => {
    cleanup();
  });
});