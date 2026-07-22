import type { ReactNode, CSSProperties } from "react";

export interface StatPillProps {
  label: string;
  value: string | number;
  delta?: { value: number; label: string };
  tone?: "neutral" | "positive" | "negative" | "team-safe" | "team-viral" | "team-infra" | "champion";
  icon?: ReactNode;
}

const toneStyles: Record<string, React.CSSProperties> = {
  neutral: { color: "var(--fg-muted)", background: "var(--bg-sunken)" },
  positive: { color: "var(--status-ok)", background: "rgba(5, 150, 105, 0.10)" },
  negative: { color: "var(--status-err)", background: "rgba(220, 38, 38, 0.10)" },
  "team-safe": { color: "var(--team-safe)", background: "var(--team-safe-08)" },
  "team-viral": { color: "var(--team-viral)", background: "var(--team-viral-08)" },
  "team-infra": { color: "var(--team-infra)", background: "var(--team-infra-08)" },
  champion: { color: "var(--champion)", background: "var(--champion-bg)" },
};

export function StatPill({ label, value, delta, tone = "neutral", icon }: StatPillProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--s-3)",
        padding: "var(--s-2) var(--s-3)",
        borderRadius: "var(--r-full)",
        border: "1px solid var(--border)",
        background: "var(--bg-elev)",
        fontFamily: "var(--font-body)",
        whiteSpace: "nowrap",
      }}
    >
      {icon && <span style={{ display: "inline-flex", color: "var(--fg-muted)", flexShrink: 0 }} aria-hidden="true">{icon}</span>}
      <div style={{ display: "grid", gap: "1px", minWidth: 0 }}>
        <span
          style={{
            fontSize: "var(--t-xs)",
            color: "var(--fg-muted)",
            fontWeight: "var(--w-medium)",
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--t-sm)",
            fontWeight: "var(--w-bold)",
            color: "var(--fg)",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1.3,
          }}
        >
          {value}
          {delta && (
            <span
              style={{
                marginLeft: "var(--s-1)",
                fontSize: "var(--t-xs)",
                fontWeight: "var(--w-medium)",
                ...toneStyles[delta.value >= 0 ? "positive" : "negative"],
                padding: "1px 6px",
                borderRadius: "var(--r-full)",
              }}
            >
              {delta.value >= 0 ? "+" : ""}{delta.value} {delta.label}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
