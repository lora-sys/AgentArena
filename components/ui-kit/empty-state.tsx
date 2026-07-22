import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  hint?: string;
  icon?: ReactNode;
  cta?: ReactNode;
}

export function EmptyState({ title, hint, icon, cta }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--s-4)",
        padding: "var(--s-12) var(--s-6)",
        textAlign: "center",
      }}
    >
      {icon && (
        <span
          style={{
            display: "inline-grid",
            placeItems: "center",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "var(--bg-sunken)",
            color: "var(--fg-muted)",
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div>
        <h3
          style={{
            margin: "0 0 var(--s-2)",
            fontFamily: "var(--font-display)",
            fontSize: "var(--t-xl)",
            fontWeight: "var(--w-bold)",
            color: "var(--fg)",
          }}
        >
          {title}
        </h3>
        {hint && (
          <p style={{ margin: 0, color: "var(--fg-muted)", fontSize: "var(--t-sm)", lineHeight: 1.5 }}>
            {hint}
          </p>
        )}
      </div>
      {cta && <div style={{ marginTop: "var(--s-2)" }}>{cta}</div>}
    </div>
  );
}
