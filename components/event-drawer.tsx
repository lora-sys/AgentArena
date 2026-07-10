"use client";

import { useCallback, useEffect, useRef } from "react";
import type { BattleEvent, Score } from "@/arena/schemas/types";

type EventDrawerProps = {
  event: BattleEvent | null;
  open: boolean;
  onClose: () => void;
  allEvents: BattleEvent[];
};

const isScorePayload = (payload: unknown): payload is Score => {
  if (typeof payload !== "object" || payload === null) return false;
  const record = payload as Record<string, unknown>;
  return (
    typeof record.teamId === "string" &&
    typeof record.scores === "object" &&
    record.scores !== null &&
    Array.isArray(record.judgeComments)
  );
};

const findLinkedEventIds = (event: BattleEvent, allEvents: BattleEvent[]): string[] => {
  const links: string[] = [];
  const payload = event.rawPayload;

  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    if (typeof record.attackId === "string") {
      const defense = allEvents.find(
        (e) => e.eventType === "defense_created" && e.rawPayload &&
          typeof (e.rawPayload as Record<string, unknown>).attackId === "string" &&
          (e.rawPayload as Record<string, unknown>).attackId === record.attackId,
      );
      if (defense) links.push(defense.id);
    }
    if (typeof record.teamId === "string" && event.eventType === "score_created") {
      const proposal = allEvents.find(
        (e) => e.eventType === "proposal_created" && e.actorId === record.teamId,
      );
      if (proposal) links.push(proposal.id);
    }
    if (typeof record.winnerTeamId === "string" && event.eventType === "champion_selected") {
      const championProposal = allEvents.find(
        (e) => e.eventType === "proposal_created" && e.actorId === record.winnerTeamId,
      );
      if (championProposal) links.push(championProposal.id);
    }
  }

  if (event.targetId) {
    const targetEvents = allEvents.filter(
      (e) => e.actorId === event.targetId && e.eventType === "proposal_created",
    );
    for (const te of targetEvents) {
      if (!links.includes(te.id)) links.push(te.id);
    }
  }

  return links;
};

const extractJudgeReasoning = (event: BattleEvent): string | null => {
  if (!isScorePayload(event.rawPayload)) return null;
  const score = event.rawPayload;
  const reasons: string[] = [];
  if (score.winningReason) reasons.push(`Winning: ${score.winningReason}`);
  if (score.losingReason) reasons.push(`Losing: ${score.losingReason}`);
  for (const comment of score.judgeComments) {
    reasons.push(comment);
  }
  return reasons.length > 0 ? reasons.join("\n\n") : null;
};

const formatTimestamp = (iso: string): string => {
  try {
    return new Date(iso).toISOString().replace("T", " ").replace("Z", " UTC");
  } catch {
    return iso;
  }
};

export function EventDrawer({ event, open, onClose, allEvents }: EventDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    if (open) {
      drawerRef.current?.focus();
    }
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [open]);

  if (!open || !event) return null;

  const linkedIds = findLinkedEventIds(event, allEvents);
  const judgeReasoning = extractJudgeReasoning(event);

  return (
    <div
      className="drawer-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={drawerRef}
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-drawer-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <header className="drawer-header">
          <div>
            <span className="drawer-event-id">{event.id}</span>
            <h2 id="event-drawer-title">{event.title}</h2>
            <div className="drawer-meta">
              <span>{event.eventType}</span>
              <span>{event.round}</span>
              <span>{event.actorType}{event.actorId ? `: ${event.actorId}` : ""}</span>
              <span className="drawer-timestamp">{formatTimestamp(event.createdAt)}</span>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close"
            aria-label="Close event drawer"
            onClick={onClose}
          >
            Esc
          </button>
        </header>

        <div className="drawer-body">
          <section>
            <h3>Summary</h3>
            <p>{event.content}</p>
          </section>

          {judgeReasoning && (
            <section>
              <h3>Judge Reasoning</h3>
              <pre className="drawer-reasoning">{judgeReasoning}</pre>
            </section>
          )}

          <section>
            <h3>Full Payload</h3>
            <pre className="drawer-payload">
              {event.rawPayload !== undefined
                ? JSON.stringify(event.rawPayload, null, 2)
                : "(no payload)"}
            </pre>
          </section>

          {linkedIds.length > 0 && (
            <section>
              <h3>Linked Events</h3>
              <ul className="drawer-links">
                {linkedIds.map((id) => (
                  <li key={id}>
                    <code>{id}</code>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}