import type { ReactNode } from "react";

export interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
  title?: string;
  fallback?: ReactNode;
}

export function ErrorBoundary({ error, reset, title = "Something went wrong", fallback }: ErrorBoundaryProps) {
  return (
    <div
      role="alert"
      style={{
        display: "grid",
        gap: "var(--s-3)",
        padding: "var(--s-6)",
        borderRadius: "var(--r-md)",
        border: "1px solid var(--sev-high)",
        background: "rgba(220, 38, 38, 0.08)",
        color: "var(--sev-high)",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      {fallback ? (
        fallback
      ) : (
        <>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontSize: "var(--t-lg)",
              fontWeight: "var(--w-bold)",
              color: "var(--sev-high)",
            }}
          >
            {title}
          </h2>
          <pre
            style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "var(--t-xs)",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {error.message}
          </pre>
          <button
            onClick={reset}
            style={{
              display: "inline-flex",
              alignSelf: "start",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              border: "1px solid var(--sev-high)",
              borderRadius: "var(--r-full)",
              background: "var(--sev-high)",
              color: "var(--bg-elev)",
              font: "inherit",
              fontWeight: "var(--w-medium)",
              fontSize: "var(--t-sm)",
              cursor: "pointer",
              transition: "opacity var(--dur-fast) var(--ease-out)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          >
            Retry
          </button>
        </>
      )}
    </div>
  );
}
