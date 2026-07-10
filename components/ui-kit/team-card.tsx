import { type CSSProperties } from "react";

type Team = "safe" | "viral" | "infra";

export interface TeamCardProps {
  team: Team;
  score: number;
  version: string;
  loading?: boolean;
  winner?: boolean;
  loser?: boolean;
}

const teamConfig: Record<Team, { name: string; role: string; color: string; bg: string; initial: string }> = {
  safe: { name: "Safe Builder", role: "Convergent MVP", color: "var(--team-safe)", bg: "var(--team-safe-08)", initial: "S" },
  viral: { name: "Viral Designer", role: "Strong narrative", color: "var(--team-viral)", bg: "var(--team-viral-08)", initial: "V" },
  infra: { name: "Infra Hacker", role: "Protocol-first", color: "var(--team-infra)", bg: "var(--team-infra-08)", initial: "I" },
};

export function TeamCard({ team, score, version, loading = false, winner = false, loser = false }: TeamCardProps) {
  const config = teamConfig[team];

  const cardStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--s-3)",
    padding: "var(--s-4)",
    borderRadius: "var(--r-lg)",
    border: winner ? "2px solid var(--champion)" : "1px solid var(--border)",
    background: "var(--bg-elev)",
    boxShadow: winner ? "var(--shadow-3)" : "var(--shadow-1)",
    fontFamily: "var(--font-body)",
    minWidth: "180px",
  };

  const avatarStyle: CSSProperties = {
    display: "grid",
    placeItems: "center",
    width: "2.75rem",
    height: "2.75rem",
    borderRadius: "var(--r-full)",
    background: config.bg,
    color: config.color,
    fontWeight: "var(--w-bold)",
    fontSize: "var(--t-md)",
    fontFamily: "var(--font-display)",
  };

  const scoreStyle: CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--t-2xl)",
    fontWeight: "var(--w-bold)",
    color: winner ? "var(--champion)" : "var(--fg)",
    fontVariantNumeric: "tabular-nums",
    opacity: loser ? 0.5 : 1,
  };

  return (
    <div style={cardStyle} data-team={team} data-state={loading ? "loading" : winner ? "winner" : loser ? "loser" : "ready"}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--s-3)" }}>
        <div style={avatarStyle} aria-hidden="true">{config.initial}</div>
        <div>
          <div style={{ fontWeight: "var(--w-bold)", fontSize: "var(--t-base)" }}>{config.name}</div>
          <div style={{ fontSize: "var(--t-xs)", color: "var(--fg-muted)" }}>{config.role}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--s-2)" }}>
        <span style={scoreStyle}>{loading ? "--" : score.toFixed(1)}</span>
        <span style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}>/ 10</span>
      </div>
      <div style={{ fontSize: "var(--t-xs)", color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>
        version: {version}
      </div>
      {winner && (
        <div style={{ fontSize: "var(--t-xs)", fontWeight: "var(--w-bold)", color: "var(--champion)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Champion
        </div>
      )}
    </div>
  );
}
