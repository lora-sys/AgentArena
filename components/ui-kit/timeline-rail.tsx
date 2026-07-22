export interface TimelineRailProps {
  rounds: Array<{
    id: string;
    label: string;
    status: "pending" | "active" | "completed";
  }>;
  current?: string;
}

export function TimelineRail({ rounds, current }: TimelineRailProps) {
  return (
    <nav
      aria-label="Battle round progress"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--s-1)",
        flexWrap: "wrap",
        padding: "var(--s-3) 0",
      }}
    >
      {rounds.map((round, i) => {
        const isActive = round.id === current;
        const isCompleted = round.status === "completed";
        return (
          <div key={round.id} style={{ display: "flex", alignItems: "center", gap: "var(--s-1)" }}>
            {i > 0 && (
              <span
                aria-hidden="true"
                style={{
                  width: "24px",
                  height: "1px",
                  background: isCompleted ? "var(--fg-muted)" : "var(--border)",
                  flexShrink: 0,
                }}
              />
            )}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "var(--r-full)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--t-xs)",
                fontWeight: "var(--w-medium)",
                letterSpacing: "0.04em",
                background: isCompleted
                  ? "var(--team-safe-08)"
                  : isActive
                    ? "var(--team-viral-08)"
                    : "var(--bg-sunken)",
                color: isCompleted
                  ? "var(--team-safe)"
                  : isActive
                    ? "var(--team-viral)"
                    : "var(--fg-muted)",
                border: isActive ? "1px solid var(--team-viral)" : "1px solid transparent",
              }}
            >
              {isCompleted && "✓ "}
              {isActive && "◉ "}
              {round.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
