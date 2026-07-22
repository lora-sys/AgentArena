import type { CSSProperties, ReactNode } from "react";

export interface ScoreCellProps {
  dim: string;
  value: number;
  max?: number;
  judgeId?: string;
  evidenceEventId?: string;
}

export function ScoreCell({ dim, value, max = 10, judgeId, evidenceEventId }: ScoreCellProps) {
  const pct = Math.round((value / max) * 100);
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "4px",
        padding: "4px 6px",
        borderRadius: "var(--r-sm)",
        cursor: "pointer",
        outline: "none",
        transition: "background var(--dur-fast) var(--ease-out)",
        ...(judgeId ? { title: `Judge ${judgeId} — ${evidenceEventId ?? ""}` } : {}),
      }}
      tabIndex={0}
      role="gridcell"
      aria-label={`${dim}: ${value}/${max}`}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--t-sm)",
          fontWeight: "var(--w-medium)",
          color: "var(--fg)",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          position: "absolute",
          bottom: "calc(100% + 4px)",
          left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
          padding: "4px 8px",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-sm)",
          background: "var(--bg-elev)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--t-xs)",
          color: "var(--fg)",
          boxShadow: "var(--shadow-2)",
          pointerEvents: "none",
          display: "none",
          zIndex: 10,
        }}
        className="score-cell-tooltip"
      >
        {judgeId && <span style={{ color: "var(--fg-muted)" }}>Judge: {judgeId}</span>}
        {evidenceEventId && <span style={{ marginLeft: "var(--s-2)", color: "var(--team-safe)" }}>{evidenceEventId}</span>}
      </span>
      <span
        style={{
          display: "block",
          height: "3px",
          width: "100%",
          borderRadius: "999px",
          background: "var(--fg-subtle)",
          opacity: 0.4,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            borderRadius: "999px",
            background: "var(--fg)",
            width: `${pct}%`,
            transition: `width var(--dur-stage) var(--ease-out)`,
          }}
        />
      </span>
    </div>
  );
}
