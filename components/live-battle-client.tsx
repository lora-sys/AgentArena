"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  AgentStatusCard,
  type AgentState,
} from "@/components/agent-status-card";
import { RoundProgressBar } from "@/components/round-progress-bar";
import { connectSse, type SseClientHandle } from "@/lib/sse-client";
import type { BattleEvent } from "@/arena/schemas/types";

/* ─── Status API shape ──────────────────────────────────────────────────── */

type AgentStatePayload = {
  state: AgentState;
  streamedText: string;
  score: number;
};

type BattleStatus = {
  battleId: string;
  round: number;
  progress: number;
  canCancel: boolean;
  agentStates: Record<string, AgentStatePayload>;
};

const TEAMS: Array<{ id: string; key: string; name: string }> = [
  { id: "safe-builder", key: "safe-builder", name: "Safe Builder" },
  { id: "viral-designer", key: "viral-designer", name: "Viral Designer" },
  { id: "infra-hacker", key: "infra-hacker", name: "Infra Hacker" },
];

const TOTAL_ROUNDS = 6;

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
      return { ...state, events: [...state.events, action.event] };
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

  // Poll /api/battles/[id]/status every 2s via SWR
  const { data: status, error: statusError } = useSWR<BattleStatus>(
    `/api/battles/${encodeURIComponent(battleId)}/status`,
    fetchStatus,
    { refreshInterval: 2000, revalidateOnFocus: false },
  );

  // SSE event stream
  useEffect(() => {
    startedAtRef.current = Date.now();
    dispatch({ type: "reset" });

    if (handleRef.current) {
      handleRef.current.close();
      handleRef.current = null;
    }

    dispatch({ type: "status", status: "connecting" });

    const handle = connectSse({
      url: `/api/battles/${encodeURIComponent(battleId)}/events/stream`,
      onEvent: (event) => dispatch({ type: "event", event }),
      onValidationError: () => dispatch({ type: "invalid" }),
      onConnectionError: () =>
        dispatch({ type: "status", status: "reconnecting" }),
    });

    handleRef.current = handle;

    const openTimer = setTimeout(() => {
      dispatch({ type: "status", status: "open" });
    }, 100);

    return () => {
      clearTimeout(openTimer);
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
      router.push("/battles" as Parameters<typeof router.push>[0]);
    } catch (error) {
      // Surface the error so the caller can show feedback; do not redirect
      // on failure (user would lose evidence and land on a stale page).
      console.error("Cancel failed:", error);
    }
  }, [battleId, router]);

  const [elapsedSec, setElapsedSec] = useState(0);

  // Tick elapsedSec every second so the timer in RoundProgressBar updates
  // without depending on SWR poll cadence or tab focus.
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Use status data when available; fall back to a safe default
  const currentRound = status?.round ?? 1;
  const canCancel = status?.canCancel ?? false;
  const agentStates = status?.agentStates ?? {};

  return (
    <>
      {statusError ? (
        <div role="alert" className="error-banner">
          <span>Polling error: {statusError.message}</span>
        </div>
      ) : null}

      <RoundProgressBar
        round={currentRound}
        totalRounds={TOTAL_ROUNDS}
        canCancel={canCancel}
        onCancel={handleCancel}
        elapsedSec={elapsedSec}
      />

      <section className="agent-status-grid" aria-label="Contestant agent states">
        {TEAMS.map((team) => {
          const payload = agentStates[team.id];
          return (
            <AgentStatusCard
              key={team.id}
              teamId={team.id}
              teamName={team.name}
              state={payload?.state ?? "pending"}
              streamedText={payload?.streamedText ?? ""}
              score={payload?.score}
            />
          );
        })}
      </section>

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
                <span className="inline-flex items-center justify-center rounded-full bg-team-viral/10 px-s-3 py-s-1 text-xs font-bold text-team-viral">
                  {event.eventType}
                </span>
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
    </>
  );
}