import type { CSSProperties, ReactNode } from "react";

export interface DefenseCardProps {
  id: string;
  agentId: string;
  accepted: string[];
  rejected: string[];
  revisions: string[];
  remainingRisks: string[];
  onToggleExpand?: (id: string) => void;
  expanded?: boolean;
}

export function DefenseCard({
  id, agentId, accepted, rejected, revisions, remainingRisks, onToggleExpand, expanded = false,
}: DefenseCardProps) {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "var(--r-md)",
        border: "1px solid var(--border)",
        background: "var(--bg-elev)",
        transition: "border-color var(--dur-fast) var(--ease-out)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "12px",
          cursor: onToggleExpand ? "pointer" : "default",
        }}
        onClick={onToggleExpand ? () => onToggleExpand(id) : undefined}
        role={onToggleExpand ? "button" : undefined}
        tabIndex={onToggleExpand ? 0 : undefined}
        onKeyDown={onToggleExpand ? (e) => { if (e.key === "Enter" || e.key === " ") onToggleExpand(id); } : undefined}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--t-xs)",
            color: "var(--fg-subtle)",
          }}
        >
          {id} · {agentId}
        </span>
        <span
          style={{
            fontSize: "var(--t-xs)",
            color: "var(--fg-muted)",
            transition: "transform var(--dur-fast) var(--ease-out)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
          aria-hidden="true"
        >
          ▾
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--s-2)",
          marginBottom: "8px",
        }}
      >
        {accepted.map((a) => (
          <span
            key={a}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: "var(--r-full)",
              background: "rgba(5, 150, 105, 0.10)",
              color: "var(--team-infra)",
              fontSize: "var(--t-xs)",
              fontWeight: "var(--w-medium)",
            }}
          >
            ✓ {a}
          </span>
        ))}
        {rejected.map((r) => (
          <span
            key={r}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: "var(--r-full)",
              background: "rgba(220, 38, 38, 0.10)",
              color: "var(--sev-high)",
              fontSize: "var(--t-xs)",
              fontWeight: "var(--w-medium)",
            }}
          >
            ✕ {r}
          </span>
        ))}
      </div>

      {expanded && (
        <div style={{ marginTop: "var(--s-3)", display: "grid", gap: "var(--s-2)" }}>
          {revisions.length > 0 && (
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "var(--t-xs)",
                  fontWeight: "var(--w-medium)",
                  color: "var(--fg-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "4px",
                }}
              >
                Revisions
              </span>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "4px" }}>
                {revisions.map((rev) => (
                  <li
                    key={rev}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--t-xs)",
                      color: "var(--fg)",
                      padding: "4px 8px",
                      background: "var(--bg-sunken)",
                      borderRadius: "var(--r-sm)",
                    }}
                  >
                    {rev}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {remainingRisks.length > 0 && (
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "var(--t-xs)",
                  fontWeight: "var(--w-medium)",
                  color: "var(--fg-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "4px",
                }}
              >
                Remaining risks
              </span>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "4px" }}>
                {remainingRisks.map((risk) => (
                  <li
                    key={risk}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--t-xs)",
                      color: "var(--sev-high)",
                      padding: "4px 8px",
                      background: "rgba(220, 38, 38, 0.06)",
                      borderRadius: "var(--r-sm)",
                    }}
                  >
                    ⚠ {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
