import { forwardRef, useEffect, useRef } from "react";

export interface EventLedgerProps {
  events: Array<{
    id: string;
    type: string;
    timestamp: string;
    actor: string;
    summary: string;
  }>;
  maxHeight?: number | string;
  ariaLabel?: string;
  emptyMessage?: string;
  style?: React.CSSProperties;
}

export const EventLedger = forwardRef<HTMLDivElement, EventLedgerProps>(
  ({ events, maxHeight = 400, ariaLabel = "Event stream", emptyMessage = "No events yet", ...rest }, ref) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [events.length]);

    return (
      <div
        ref={ref}
        role="list"
        aria-label={ariaLabel}
        aria-live="polite"
        style={{
          maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
          overflowY: "auto",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          background: "var(--bg)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--t-xs)",
        }}
        {...rest}
      >
        {events.length === 0 ? (
          <div
            style={{
              padding: "var(--s-6)",
              textAlign: "center",
              color: "var(--fg-muted)",
            }}
          >
            {emptyMessage}
          </div>
        ) : (
          events.map((ev, i) => (
            <div
              key={ev.id}
              role="listitem"
              style={{
                display: "grid",
                gridTemplateColumns: "80px 130px 140px 1fr",
                gap: "14px",
                alignItems: "center",
                padding: "10px 16px",
                borderBottom: i < events.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background var(--dur-fast) var(--ease-out)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-elev)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >
              <span style={{ color: "var(--fg-subtle)", letterSpacing: "0.04em", fontSize: "var(--t-xs)" }}>{ev.timestamp}</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "3px 10px",
                  borderRadius: "var(--r-full)",
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  width: "fit-content",
                }}
              >
                {ev.type}
              </span>
              <span style={{ color: "var(--fg-muted)", fontWeight: 600 }}>{ev.actor}</span>
              <span
                style={{
                  color: "var(--fg)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {ev.summary}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    );
  }
);

EventLedger.displayName = "EventLedger";
