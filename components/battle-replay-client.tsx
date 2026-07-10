"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EventDrawer } from "@/components/event-drawer";
import type { BattleEvent } from "@/arena/schemas/types";

const ROW_HEIGHT = 64;
const OVERSCAN = 5;
const DEFAULT_VIEWPORT_HEIGHT = 600;

type FetchState = "loading" | "ready" | "error";

const formatTimestamp = (iso: string): string => {
  try {
    return new Date(iso).toISOString().replace("T", " ").replace("Z", " UTC");
  } catch {
    return iso;
  }
};

const eventTypeColor: Record<string, string> = {
  brief_created: "var(--status-info)",
  team_created: "var(--team-safe)",
  proposal_created: "var(--team-safe)",
  attack_created: "var(--sev-high)",
  defense_created: "var(--team-infra)",
  score_created: "var(--team-viral)",
  champion_selected: "var(--team-viral)",
  artifact_created: "var(--team-viral)",
  replay_created: "var(--status-ok)",
  passport_created: "var(--status-ok)",
  error: "var(--sev-fatal)",
};

type BattleReplayClientProps = {
  battleId: string;
};

export function BattleReplayClient({ battleId }: BattleReplayClientProps) {
  const [events, setEvents] = useState<BattleEvent[]>([]);
  const [status, setStatus] = useState<FetchState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(DEFAULT_VIEWPORT_HEIGHT);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const attackIdParam = searchParams.get("attack");
  const eventIdParam = searchParams.get("event");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);

    fetch(`/api/battles/${encodeURIComponent(battleId)}/events`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load events (${response.status})`);
        }
        const data = (await response.json()) as { events: BattleEvent[] };
        if (!cancelled) {
          setEvents(data.events);
          setStatus("ready");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [battleId]);

  // Resolve ?attack= or ?event= query params to a real BattleEvent.id and
  // auto-open the drawer. Runs after events load.
  const lastResolvedParamsRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "ready" || events.length === 0) return;
    if (!attackIdParam && !eventIdParam) return;

    // Only re-run when URL params actually change — not on every events re-fetch
    // or selectedEventId update. This prevents the feedback loop where the effect
    // sets selectedEventId, triggers a re-render, and re-executes scroll logic.
    const paramsKey = `${attackIdParam ?? ""}|${eventIdParam ?? ""}`;
    if (paramsKey === lastResolvedParamsRef.current) return;

    let resolvedId: string | null = null;

    if (eventIdParam) {
      // Direct event ID match
      const direct = events.find((e) => e.id === eventIdParam);
      if (direct) resolvedId = direct.id;
    } else if (attackIdParam) {
      // Domain attack ID — scan attack_created events for matching rawPayload.id
      const matched = events.find(
        (e) =>
          e.eventType === "attack_created" &&
          typeof e.rawPayload === "object" &&
          e.rawPayload !== null &&
          "id" in e.rawPayload &&
          (e.rawPayload as { id: string }).id === attackIdParam,
      );
      if (matched) resolvedId = matched.id;
    }

    if (resolvedId) {
      lastResolvedParamsRef.current = paramsKey;
      setSelectedEventId(resolvedId);
      // Scroll to the matching event — center it in the measured viewport
      const eventIndex = events.findIndex((e) => e.id === resolvedId);
      if (eventIndex >= 0 && scrollContainerRef.current) {
        const targetTop = eventIndex * ROW_HEIGHT - viewportHeight / 2 + ROW_HEIGHT / 2;
        scrollContainerRef.current.scrollTop = Math.max(0, targetTop);
      }
    } else {
      // Params present but no match — still mark as processed to avoid
      // re-scanning on every render.
      lastResolvedParamsRef.current = paramsKey;
    }
  }, [status, events, attackIdParam, eventIdParam, viewportHeight]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setViewportHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [status]);

  const totalHeight = events.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN * 2;
  const endIndex = Math.min(events.length, startIndex + visibleCount);
  const visibleEvents = useMemo(
    () => events.slice(startIndex, endIndex),
    [events, startIndex, endIndex],
  );

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedEventId(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedEventId(null);
  }, []);

  if (status === "loading") {
    return (
      <AppShell active="battle" showRail currentRound="cross_attack">
        <div className="replay-header">
          <h1>Battle Replay</h1>
          <p>Loading events for {battleId}...</p>
        </div>
      </AppShell>
    );
  }

  if (status === "error") {
    return (
      <AppShell active="battle" showRail currentRound="cross_attack">
        <div className="replay-header">
          <h1>Battle Replay</h1>
          <p role="alert">Error: {error}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="battle" showRail currentRound="cross_attack">
      <div className="replay-header">
        <div>
          <h1>Battle Replay</h1>
          <p className="replay-subtitle">
            {events.length} events from {battleId}
          </p>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="replay-timeline"
        role="list"
        aria-label="Battle event timeline"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        style={{ height: `${DEFAULT_VIEWPORT_HEIGHT}px`, overflowY: "auto" }}
      >
        <div style={{ height: `${totalHeight}px`, position: "relative" }}>
          {visibleEvents.map((event, index) => {
            const rowTop = (startIndex + index) * ROW_HEIGHT;
            return (
              <button
                key={event.id}
                type="button"
                role="listitem"
                className="timeline-row"
                aria-label={`${event.eventType}: ${event.title}`}
                onClick={() => handleSelect(event.id)}
                style={{
                  position: "absolute",
                  top: `${rowTop}px`,
                  left: 0,
                  right: 0,
                  height: `${ROW_HEIGHT}px`,
                }}
              >
                <span
                  className="timeline-marker"
                  style={{ background: eventTypeColor[event.eventType] ?? "var(--fg-muted)" }}
                  aria-hidden="true"
                />
                <span className="timeline-time">{formatTimestamp(event.createdAt)}</span>
                <span className="timeline-type">{event.eventType}</span>
                <span className="timeline-title">{event.title}</span>
                <span className="timeline-round">{event.round}</span>
              </button>
            );
          })}
        </div>
      </div>

      <EventDrawer
        event={selectedEvent}
        open={selectedEvent !== null}
        onClose={handleClose}
        allEvents={events}
      />
    </AppShell>
  );
}