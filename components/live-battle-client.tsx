"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import type { AgentState } from "@/components/agent-status-card";
import { AppShell } from "@/components/app-shell";
import { RoundProgressBar } from "@/components/round-progress-bar";
import { BattleReplayPlayer, type BattlePlayerTeam } from "@/components/battle-replay-player";
import { connectSse, type SseClientHandle } from "@/lib/sse-client";
import type { BattleEvent } from "@/arena/schemas/types";
import type { BattleRound } from "@/lib/types";

/* ─── Event type → color mapping ─────────────────────────────────── */

const EVENT_COLORS: Record<string, { bg: string; text: string }> = {
  brief_created:       { bg: "bg-sev-info/10", text: "text-sev-info" },
  team_created:        { bg: "bg-sev-info/10", text: "text-sev-info" },
  proposal_created:    { bg: "bg-sev-warn/10", text: "text-sev-warn" },
  attack_created:      { bg: "bg-sev-high/10", text: "text-sev-high" },
  defense_created:     { bg: "bg-sev-low/10", text: "text-sev-low" },
  score_created:       { bg: "bg-sev-fatal/10", text: "text-sev-fatal" },
  champion_selected:   { bg: "bg-sev-fatal/10", text: "text-sev-fatal" },
  artifact_created:    { bg: "bg-sev-info/10", text: "text-sev-info" },
  replay_created:      { bg: "bg-sev-fatal/10", text: "text-sev-fatal" },
  passport_created:    { bg: "bg-sev-fatal/10", text: "text-sev-fatal" },
};

const EVENT_LABELS: Record<string, string> = {
  brief_created: "Brief",
  team_created: "Proposal",
  proposal_created: "Proposal",
  attack_created: "Attack",
  defense_created: "Defense",
  score_created: "Score",
  champion_selected: "Champion",
  artifact_created: "Artifact",
  replay_created: "Champion",
  passport_created: "Passport",
};

function getEventColor(eventType: string): { bg: string; text: string } {
  return EVENT_COLORS[eventType] ?? { bg: "bg-team-viral/10", text: "text-team-viral" };
}

function getEventLabel(eventType: string): string {
  return EVENT_LABELS[eventType] ?? eventType;
}

/* ─── Status API shape ──────────────────────────────────────────────────── */

type AgentStatePayload = {
  state: AgentState;
  streamedText: string;
  score: number;
};

type BattleStatus = {
  battleId: string;
  status: string;
  round: number;
  totalRounds: number;
  progress: number;
  canCancel: boolean;
  agentStates: Record<string, AgentStatePayload>;
};

const PLAYER_TEAMS: BattlePlayerTeam[] = [
  { id: "safe_builder", name: "Safe Builder", initials: "SB", color: "#49D6C8", subtitle: "FEASIBILITY" },
  { id: "viral_designer", name: "Viral Designer", initials: "VD", color: "#F5567E", subtitle: "DEMO POWER" },
  { id: "infra_hacker", name: "Infra Hacker", initials: "IH", color: "#F2B84B", subtitle: "TECHNICAL DEPTH" },
];

/* ─── SSE state (event timeline) ─────────────────────────────────────────── */

type ConnectionStatus = "connecting" | "open" | "reconnecting" | "error";

type LiveState = {
  events: BattleEvent[];
  invalidCount: number;
  status: ConnectionStatus;
};

type LiveAction =
  | { type: "event"; event: BattleEvent }
  | { type: "invalid" }
  | { type: "status"; status: ConnectionStatus }
  | { type: "reset" };

const initialLiveState: LiveState = {
  events: [],
  invalidCount: 0,
  status: "connecting",
};

const liveReducer = (state: LiveState, action: LiveAction): LiveState => {
  switch (action.type) {
    case "event":
      // Cap at 200 events to prevent unbounded memory growth.
      const next = [...state.events, action.event];
      if (next.length > 200) next.splice(0, next.length - 200);
      return { ...state, events: next };
    case "invalid":
      return { ...state, invalidCount: state.invalidCount + 1 };
    case "status":
      return { ...state, status: action.status };
    case "reset":
      return initialLiveState;
    default:
      return state;
  }
};

/* ─── Fetcher ────────────────────────────────────────────────────────────── */

const fetchStatus = async (url: string): Promise<BattleStatus> => {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Status endpoint returned HTTP ${res.status}`);
  }
  return res.json() as Promise<BattleStatus>;
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export type LiveBattleClientProps = {
  battleId: string;
};

export function LiveBattleClient({ battleId }: LiveBattleClientProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(liveReducer, initialLiveState);
  const handleRef = useRef<SseClientHandle | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playbackComplete, setPlaybackComplete] = useState(false);

  // Poll /api/battles/[id]/status every 2s via SWR
  const { data: status, error: statusError } = useSWR<BattleStatus>(
    `/api/battles/${encodeURIComponent(battleId)}/status`,
    fetchStatus,
    { refreshInterval: 2000, revalidateOnFocus: false },
  );

  // When the engine reports completion, auto-navigate to the result page.
  // The status API returns `status: "completed"` once `progress: 1.0`.
  useEffect(() => {
    if (status?.status === "completed" && status.progress >= 1 && playbackComplete) {
      const timer = setTimeout(() => {
        router.push(`/battle/${battleId}?view=result` as Parameters<typeof router.push>[0]);
      }, 1500); // 1.5s pause so the user sees "winner" briefly
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status?.status, status?.progress, playbackComplete, battleId, router]);

  // SSE event stream
  useEffect(() => {
    startedAtRef.current = Date.now();
    dispatch({ type: "reset" });

    if (handleRef.current) {
      handleRef.current.close();
      handleRef.current = null;
    }

    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }

    dispatch({ type: "status", status: "connecting" });

    const handle = connectSse({
      url: `/api/battles/${encodeURIComponent(battleId)}/events/stream`,
      onEvent: (event) => dispatch({ type: "event", event }),
      onValidationError: () => dispatch({ type: "invalid" }),
      onConnectionError: () => {
        // Clear the open timer so it doesn't overwrite "reconnecting" with "open"
        if (openTimerRef.current) {
          clearTimeout(openTimerRef.current);
          openTimerRef.current = null;
        }
        dispatch({ type: "status", status: "reconnecting" });
      },
    });

    handleRef.current = handle;

    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = null;
      dispatch({ type: "status", status: "open" });
    }, 100);

    return () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
      handle.close();
      handleRef.current = null;
    };
  }, [battleId]);

  const handleCancel = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/battles/${encodeURIComponent(battleId)}/cancel`,
        { method: "POST" },
      );
      if (!res.ok) {
        throw new Error(`Cancel endpoint returned HTTP ${res.status}`);
      }
      const { cancelled } = (await res.json()) as { cancelled: boolean };
      // Only navigate when the cancel actually signalled an in-flight battle.
      // Demo battles return cancelled: false (they complete synchronously);
      // redirecting anyway would lose the user's evidence with no feedback.
      if (cancelled) {
        router.push("/battles" as Parameters<typeof router.push>[0]);
      } else {
        console.warn("Cancel is not supported for this battle type");
      }
    } catch (error) {
      // Surface the error so the caller can show feedback; do not redirect
      // on failure (user would lose evidence and land on a stale page).
      console.error("Cancel failed:", error);
    }
  }, [battleId, router]);

  const [elapsedSec, setElapsedSec] = useState(0);

  // Tick elapsedSec every second so the timer in RoundProgressBar updates
  // without depending on SWR poll cadence or tab focus. Uses a single
  // ref-tracked interval to avoid stacking timers on re-renders.
  useEffect(() => {
    // Clear any prior interval before starting a new one
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
    }
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => {
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
        elapsedIntervalRef.current = null;
      }
    };
  }, []);

  // Use status data when available; fall back to a safe default
  const currentRound = status?.round ?? 1;
  const totalRounds = status?.totalRounds ?? 6;
  const canCancel = status?.canCancel ?? false;

  // R30 fix: derive the rail's currentRound from the last SSE event so
  // the battle flow indicator tracks the actual battle progression
  // instead of being hardcoded to "cross_attack" in the server page.
  const lastEventRound = state.events[state.events.length - 1]?.round;
  const railRound: BattleRound = (() => {
    if (!lastEventRound) return "cross_attack";
    // SSE round values look like "proposal_round", "cross_attack_round",
    // "defense_round", "judging_round". Strip the "_round" suffix and
    // map to the BattleRound type used by AppShell.
    const stripped = lastEventRound.replace(/_round$/, "");
    const valid: BattleRound[] = [
      "briefing",
      "proposal",
      "cross_attack",
      "defense",
      "judging",
      "champion",
      "artifacts",
      "passport",
    ];
    return (valid as string[]).includes(stripped)
      ? (stripped as BattleRound)
      : "cross_attack";
  })();

  return (
    <AppShell active="battle" showRail currentRound={railRound}>
      <a href="#event-log" className="skip-link">
        Skip to event log
      </a>

      {statusError ? (
        <div role="alert" className="error-banner">
          <span>Polling error: {statusError.message}</span>
        </div>
      ) : null}

      {state.status === "connecting" || state.status === "reconnecting" ? (
        <div className="skeleton-container" aria-live="polite" aria-label="Connecting to battle stream">
          <div className="skeleton-bar" />
          <div className="skeleton-bar w-3/4" />
          <div className="skeleton-bar w-1/2" />
          <p className="text-fg-muted text-sm mt-s-3">
            {state.status === "connecting" ? "Connecting to live battle..." : "Reconnecting..."}
          </p>
        </div>
      ) : state.status === "error" ? (
        <div role="alert" className="error-banner">
          <span>Connection lost. Unable to receive live events.</span>
        </div>
      ) : null}

      <RoundProgressBar
        round={currentRound}
        totalRounds={totalRounds}
        canCancel={canCancel}
        onCancel={handleCancel}
        elapsedSec={elapsedSec}
      />

      <BattleReplayPlayer
        battleId={battleId}
        title={`Battle ${battleId}`}
        teams={PLAYER_TEAMS}
        events={state.events}
        connectionState={state.status}
        onPlaybackComplete={() => setPlaybackComplete(true)}
      />

      <section
        id="event-log"
        className="round-section"
        aria-labelledby="event-log-heading"
      >
        <h2 id="event-log-heading">Event Timeline</h2>
        <p>Live event stream from the battle engine.</p>
        {state.events.length === 0 ? (
          <p className="muted">No events recorded yet.</p>
        ) : (
          <div className="overflow-hidden rounded-r-md border border-border bg-bg-elev">
            {state.events.map((event) => (
              <article
                key={event.id}
                className="grid grid-cols-[80px_100px_140px_1fr_100px] items-center gap-s-3 border-b border-border p-s-3 last:border-b-0"
              >
                <span className="font-mono text-xs text-fg-muted">
                  {new Date(event.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </span>
                {(() => {
                  const colors = getEventColor(event.eventType);
                  return (
                <span className={`inline-flex items-center justify-center rounded-full ${colors.bg} ${colors.text} px-s-3 py-s-1 text-xs font-bold`}>
                  {getEventLabel(event.eventType)}
                </span>
                  );
                })()}
                <strong className="text-sm">
                  {event.actorId ?? event.actorType ?? "engine"}
                </strong>
                <p className="m-0 text-sm text-fg">{event.title}</p>
                <span className="rounded-full bg-bg-sunken px-s-3 py-s-1 text-right text-xs font-bold text-fg-muted">
                  {event.round}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
