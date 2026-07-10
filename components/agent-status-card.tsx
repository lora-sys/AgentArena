"use client";

import {
  CircleAlert,
  CircleDashed,
  CircleDot,
  CircleSlash,
  CheckCircle2,
  PauseCircle,
} from "lucide-react";

/**
 * AgentStatusCard — 5-state progress card for a contestant team during a
 * live battle. Renders above-the-round content on /battle/[id]/live.
 *
 * 5 states (per docs/design.md §4.1 wireframe + Sprint 2 stage 2 spec):
 *   pending   — team has not started its turn yet
 *   in_flight — engine has dispatched the call; waiting on model response
 *   streaming — model is streaming tokens; streamedText is growing
 *   complete  — output finished; score (optional) is shown
 *   fallback  — AI failed/cancelled; engine fell back to mock
 *
 * All visual state colors are derived from design tokens — never raw hex.
 */

export type AgentState = "pending" | "in_flight" | "streaming" | "complete" | "fallback";

export type AgentStatusCardProps = {
  teamId: string;
  teamName: string;
  state: AgentState;
  streamedText?: string;
  score?: number;
};

const STATE_LABEL: Record<AgentState, string> = {
  pending: "Pending",
  in_flight: "In flight",
  streaming: "Streaming",
  complete: "Complete",
  fallback: "Fallback",
};

const STATE_PILL_CLASS: Record<AgentState, string> = {
  pending: "bg-bg-sunken text-fg-muted",
  in_flight: "bg-status-info/10 text-status-info",
  streaming: "bg-team-viral/10 text-team-viral",
  complete: "bg-status-ok/10 text-status-ok",
  fallback: "bg-sev-med/10 text-sev-med",
};

const STATE_ICON_CLASS: Record<AgentState, string> = {
  pending: "text-fg-muted",
  in_flight: "text-status-info",
  streaming: "text-team-viral",
  complete: "text-status-ok",
  fallback: "text-sev-med",
};

function StateIcon({ state }: { state: AgentState }) {
  switch (state) {
    case "pending":
      return <CircleDashed size={16} aria-hidden="true" />;
    case "in_flight":
      return <CircleDot size={16} aria-hidden="true" />;
    case "streaming":
      return <PauseCircle size={16} aria-hidden="true" />;
    case "complete":
      return <CheckCircle2 size={16} aria-hidden="true" />;
    case "fallback":
      return <CircleAlert size={16} aria-hidden="true" />;
    default:
      return <CircleSlash size={16} aria-hidden="true" />;
  }
}

export function AgentStatusCard({
  teamId,
  teamName,
  state,
  streamedText = "",
  score,
}: AgentStatusCardProps) {
  const label = STATE_LABEL[state];
  const pillClass = STATE_PILL_CLASS[state];
  const iconClass = STATE_ICON_CLASS[state];
  const isLive = state === "in_flight" || state === "streaming";
  const showStream = state === "streaming" || state === "complete" || state === "fallback";

  return (
    <article
      className="agent-status-card"
      data-team={teamId}
      data-state={state}
      aria-label={`${teamName} agent status: ${label}`}
    >
      <header className="agent-status-head">
        <strong className="agent-status-name">{teamName}</strong>
        <span
          className={`agent-status-pill ${pillClass}`}
          role="status"
          aria-live="polite"
        >
          <span className={iconClass}>
            <StateIcon state={state} />
          </span>
          {label}
        </span>
      </header>

      {showStream ? (
        <p
          className={`agent-status-stream ${state === "streaming" ? "is-streaming" : ""}`}
          aria-live={state === "streaming" ? "polite" : undefined}
        >
          {streamedText || (state === "fallback" ? "Engine fell back to mock output." : " ")}
        </p>
      ) : (
        <p className="agent-status-stream muted" aria-live="polite">
          {state === "pending" ? "Waiting for turn…" : "Dispatching to model…"}
        </p>
      )}

      <footer className="agent-status-foot">
        <span className="agent-status-team-id">team {teamId}</span>
        {score !== undefined ? (
          <span className="agent-status-score" aria-label={`Score ${score.toFixed(1)}`}>
            <strong>{score.toFixed(1)}</strong>
            <small>/100</small>
          </span>
        ) : null}
      </footer>

      {isLive ? (
        <span className="agent-status-pulse" aria-hidden="true" />
      ) : null}
    </article>
  );
}