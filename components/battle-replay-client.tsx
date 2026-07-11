"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    // Only set up the ResizeObserver once after we've reached the ready
    // state. Previously this effect re-ran on every status change, which
    // caused stale-ref issues (observing a node that had been replaced
    // by the loading→ready re-render).
    if (status !== "ready") return;
    if (resizeObserverRef.current) return; // already set up

    const el = scrollContainerRef.current ?? containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setViewportHeight(entry.contentRect.height);
    });
    observer.observe(el);
    resizeObserverRef.current = observer;

    return () => {
      observer.disconnect();
      resizeObserverRef.current = null;
    };
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
        <div ref={containerRef}>
          <div className="replay-header">
            <h1>Battle Replay</h1>
            <p>Loading events for {battleId}...</p>
          </div>
          <div
            className="replay-timeline"
            role="list"
            aria-label="Battle event timeline"
            data-testid="replay-timeline"
            style={{ height: `${DEFAULT_VIEWPORT_HEIGHT}px`, overflowY: "auto" }}
          />
        </div>
      </AppShell>
    );
  }

  if (status === "error") {
    return (
      <AppShell active="battle" showRail currentRound="cross_attack">
        <div ref={containerRef}>
          <div className="replay-header">
            <h1>Battle Replay</h1>
            <p role="alert">Error: {error}</p>
          </div>
          <div
            className="replay-timeline"
            role="list"
            aria-label="Battle event timeline"
            data-testid="replay-timeline"
            style={{ height: `${DEFAULT_VIEWPORT_HEIGHT}px`, overflowY: "auto" }}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="battle" showRail currentRound="cross_attack">
      <div ref={containerRef}>
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
      </div>
    </AppShell>
  );
}