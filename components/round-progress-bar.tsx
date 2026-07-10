"use client";

import { Clock3, XCircle } from "lucide-react";

/**
 * RoundProgressBar — round X of Y header + elapsed timer + optional cancel.
 * Renders at the top of the live page above the agent status cards.
 *
 * Props:
 *   round       — current round number (1-indexed)
 *   totalRounds — total rounds in this battle
 *   canCancel   — when true, show the Cancel button
 *   onCancel    — invoked when the user clicks Cancel
 *   elapsedSec  — seconds elapsed in the current round
 *
 * All colors come from design tokens (bg-team-safe, text-fg-muted, etc.) —
 * no raw hex per CLAUDE.md design direction B.
 */
export type RoundProgressBarProps = {
  round: number;
  totalRounds: number;
  canCancel: boolean;
  onCancel: () => void;
  elapsedSec: number;
};

function formatElapsed(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function RoundProgressBar({
  round,
  totalRounds,
  canCancel,
  onCancel,
  elapsedSec,
}: RoundProgressBarProps) {
  const safeRound = Math.max(1, Math.min(round, totalRounds));
  const progressPct = totalRounds > 0 ? (safeRound / totalRounds) * 100 : 0;

  return (
    <section className="round-progress-bar" aria-label="Round progress">
      <div className="round-progress-bar-row">
        <div className="round-progress-bar-info">
          <strong className="round-progress-bar-label">
            Round {safeRound} of {totalRounds}
          </strong>
          <span className="round-progress-bar-elapsed" aria-live="polite">
            <Clock3 size={16} aria-hidden="true" />
            {formatElapsed(elapsedSec)} elapsed
          </span>
        </div>

        {canCancel ? (
          <button
            type="button"
            className="round-progress-bar-cancel"
            onClick={onCancel}
            aria-label="Cancel battle"
          >
            <XCircle size={16} aria-hidden="true" />
            Cancel
          </button>
        ) : null}
      </div>

      <div className="round-progress-bar-track" aria-hidden="true">
        <span
          className="round-progress-bar-fill"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </section>
  );
}