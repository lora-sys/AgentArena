import { type CSSProperties, type ReactNode } from "react";

type CardElevation = 0 | 1 | 2 | 3;
type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps {
  elevation?: CardElevation;
  padding?: CardPadding;
  interactive?: boolean;
  selected?: boolean;
  children?: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}

const elevationShadow: Record<CardElevation, string> = {
  0: "none",
  1: "var(--shadow-1)",
  2: "var(--shadow-2)",
  3: "var(--shadow-3)",
};

const paddingValue: Record<CardPadding, string> = {
  none: "0",
  sm: "var(--s-3)",
  md: "var(--s-4)",
  lg: "var(--s-6)",
};

export function Card({ elevation = 1, padding = "md", interactive = false, selected = false, children, onClick, style }: CardProps) {
  const baseStyle: CSSProperties = {
    background: "var(--bg-elev)",
    border: selected ? "1px solid var(--team-safe)" : "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    boxShadow: elevationShadow[elevation],
    padding: paddingValue[padding],
    cursor: interactive ? "pointer" : "default",
    transition: "box-shadow var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)",
    color: "var(--fg)",
    fontFamily: "var(--font-body)",
  };

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        style={{ ...baseStyle, textAlign: "left", width: "100%" }}
      >
        {children}
      </button>
    );
  }

  return <div style={{ ...baseStyle, ...style }}>{children}</div>;
}
