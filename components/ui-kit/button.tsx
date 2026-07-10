import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: "2rem", padding: "0 0.75rem", fontSize: "var(--t-sm)" },
  md: { height: "2.5rem", padding: "0 1rem", fontSize: "var(--t-base)" },
  lg: { height: "3rem", padding: "0 1.5rem", fontSize: "var(--t-md)" },
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--team-safe)",
    color: "#FFFFFF",
    border: "1px solid var(--team-safe)",
  },
  secondary: {
    background: "var(--bg-elev)",
    color: "var(--fg)",
    border: "1px solid var(--border)",
  },
  ghost: {
    background: "transparent",
    color: "var(--fg)",
    border: "1px solid transparent",
  },
  danger: {
    background: "var(--sev-high)",
    color: "#FFFFFF",
    border: "1px solid var(--sev-high)",
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, disabled, children, style, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          borderRadius: "var(--r-md)",
          fontFamily: "var(--font-body)",
          fontWeight: "var(--w-medium)",
          cursor: disabled || loading ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
          outlineOffset: "2px",
          ...sizeStyles[size],
          ...variantStyles[variant],
          ...style,
        }}
        {...rest}
      >
        {loading && <span aria-hidden="true" style={{ display: "inline-block", width: "1em", height: "1em", border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
