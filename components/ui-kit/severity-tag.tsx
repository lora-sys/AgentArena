import { type CSSProperties } from "react";

type Severity = "low" | "med" | "high" | "fatal";

export interface SeverityTagProps {
  severity: Severity;
  label?: string;
  evidenceId?: string;
}

const severityConfig: Record<Severity, { color: string; bg: string; defaultLabel: string; icon: string }> = {
  low: { color: "var(--sev-low)", bg: "rgba(148, 163, 184, 0.12)", defaultLabel: "LOW", icon: "·" },
  med: { color: "var(--sev-med)", bg: "rgba(245, 158, 11, 0.12)", defaultLabel: "MED", icon: "▲" },
  high: { color: "var(--sev-high)", bg: "rgba(220, 38, 38, 0.12)", defaultLabel: "HIGH", icon: "●" },
  fatal: { color: "var(--sev-fatal)", bg: "rgba(124, 45, 18, 0.12)", defaultLabel: "FATAL", icon: "✖" },
};

export function SeverityTag({ severity, label, evidenceId }: SeverityTagProps) {
  const config = severityConfig[severity];
  const displayLabel = label ?? config.defaultLabel;

  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    height: "1.5rem",
    padding: "0 0.5rem",
    borderRadius: "var(--r-sm)",
    fontSize: "var(--t-xs)",
    fontWeight: "var(--w-bold)",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.05em",
    color: config.color,
    background: config.bg,
    cursor: "default",
  };

  return (
    <span
      style={style}
      role="status"
      aria-label={`Severity: ${displayLabel}`}
      title={evidenceId ? `Evidence: ${evidenceId}` : undefined}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span>{displayLabel}</span>
    </span>
  );
}
