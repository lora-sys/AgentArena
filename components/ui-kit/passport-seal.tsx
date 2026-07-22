import type { CSSProperties, ReactNode } from "react";

export interface PassportSealProps {
  agentId: string;
  initials: string;
  result: "winner" | "runner-up" | "participant";
  totalScore: number;
  maxScore?: number;
}

export function PassportSeal({ initials, result, totalScore, maxScore = 10 }: PassportSealProps) {
  const sealColors: Record<string, string> = {
    winner: "var(--champion)",
    "runner-up": "var(--team-safe)",
    participant: "var(--fg-muted)",
  };

  const sealBg: Record<string, string> = {
    winner: `linear-gradient(135deg, ${sealColors.winner}, #ff9d2b)`,
    "runner-up": `linear-gradient(135deg, ${sealColors["runner-up"]}, #0067ff)`,
    participant: "var(--bg-sunken)",
  };

  return (
    <div
      style={{
        display: "inline-grid",
        placeItems: "center",
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: sealBg[result],
        color: result === "winner" ? "#050b14" : "#fff",
        boxShadow: result === "winner"
          ? "0 0 0 3px var(--champion), 0 8px 24px rgba(212, 175, 55, 0.35)"
          : "0 4px 12px rgba(0, 0, 0, 0.15)",
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "24px",
        letterSpacing: "-0.02em",
        position: "relative",
      }}
      role="img"
      aria-label={`${result} seal, ${initials}, score ${totalScore}/${maxScore}`}
    >
      {initials}
      {result === "winner" && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-4px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "8px",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#050b14",
            background: "var(--champion)",
            padding: "1px 8px",
            borderRadius: "var(--r-full)",
            boxShadow: "0 2px 6px rgba(212, 175, 55, 0.4)",
          }}
        >
          CHAMPION
        </span>
      )}
    </div>
  );
}
