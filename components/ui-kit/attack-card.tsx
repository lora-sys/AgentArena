import type { CSSProperties, ReactNode } from "react";

export interface AttackCardProps {
  id: string;
  attacker: string;
  target: string;
  severity: "low" | "medium" | "high" | "fatal";
  claim: string;
  evidence: string;
  suggestedFix?: string;
  eventId?: string;
  onViewInReplay?: (eventId: string) => void;
}

const severityMap: Record<string, { color: string; bg: string }> = {
  low:    { color: "var(--sev-low)",    bg: "rgba(148, 163, 184, 0.12)" },
  medium: { color: "var(--sev-med)",    bg: "rgba(245, 158, 11, 0.12)" },
  high:   { color: "var(--sev-high)",   bg: "rgba(220, 38, 38, 0.10)" },
  fatal:  { color: "var(--sev-fatal)",  bg: "rgba(124, 45, 18, 0.12)" },
};

export function AttackCard({
  id, attacker, target, severity, claim, evidence, suggestedFix, eventId, onViewInReplay,
}: AttackCardProps) {
  const sev = severityMap[severity] ?? severityMap.medium;
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "var(--r-md)",
        border: "1px solid var(--border)",
        background: "var(--bg-elev)",
        transition: "border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--sev-high)";
        (e.currentTarget as HTMLDivElement).style.background = "var(--bg-sunken)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.background = "var(--bg-elev)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "8px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--t-xs)",
            color: "var(--fg-subtle)",
          }}
        >
          {id}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "2px 8px",
            borderRadius: "var(--r-full)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--t-xs)",
            fontWeight: "var(--w-bold)",
            color: sev.color,
            background: sev.bg,
          }}
        >
          {severity.toUpperCase()}
        </span>
      </div>
      <p
        style={{
          margin: "0 0 8px",
          fontSize: "var(--t-sm)",
          lineHeight: 1.5,
          color: "var(--fg)",
        }}
      >
        <strong>{attacker} → {target}:</strong> {claim}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
          fontSize: "var(--t-xs)",
          color: "var(--fg-muted)",
        }}
      >
        <span>{attacker} → {target}</span>
        {eventId && onViewInReplay && (
          <button
            onClick={() => onViewInReplay(eventId)}
            style={{
              background: "none",
              border: 0,
              padding: 0,
              color: "var(--team-safe)",
              font: "inherit",
              fontWeight: "var(--w-medium)",
              cursor: "pointer",
            }}
          >
            View in replay →
          </button>
        )}
      </div>
      {suggestedFix && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: "var(--t-xs)",
            color: "var(--fg-muted)",
            fontStyle: "italic",
          }}
        >
          Fix: {suggestedFix}
        </p>
      )}
    </div>
  );
}
