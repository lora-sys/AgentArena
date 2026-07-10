import { type CSSProperties, type ReactNode } from "react";

type BadgeTone =
  | "neutral"
  | "team-safe"
  | "team-viral"
  | "team-infra"
  | "champion"
  | "sev-low"
  | "sev-med"
  | "sev-high"
  | "sev-fatal";

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

const toneStyles: Record<BadgeTone, CSSProperties> = {
  neutral: { background: "var(--bg-sunken)", color: "var(--fg-muted)" },
  "team-safe": { background: "var(--team-safe-08)", color: "var(--team-safe)" },
  "team-viral": { background: "var(--team-viral-08)", color: "var(--team-viral)" },
  "team-infra": { background: "var(--team-infra-08)", color: "var(--team-infra)" },
  champion: { background: "rgba(212, 175, 55, 0.12)", color: "var(--champion)" },
  "sev-low": { background: "rgba(148, 163, 184, 0.12)", color: "var(--sev-low)" },
  "sev-med": { background: "rgba(245, 158, 11, 0.12)", color: "var(--sev-med)" },
  "sev-high": { background: "rgba(220, 38, 38, 0.12)", color: "var(--sev-high)" },
  "sev-fatal": { background: "rgba(124, 45, 18, 0.12)", color: "var(--sev-fatal)" },
};

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: "1.5rem",
        padding: "0 0.5rem",
        borderRadius: "var(--r-full)",
        fontSize: "var(--t-xs)",
        fontWeight: "var(--w-medium)",
        fontFamily: "var(--font-body)",
        whiteSpace: "nowrap",
        ...toneStyles[tone],
      }}
    >
      {children}
    </span>
  );
}
