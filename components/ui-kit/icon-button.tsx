import { forwardRef, type ButtonHTMLAttributes } from "react";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  variant?: "default" | "ghost";
  size?: "sm" | "md";
}

const baseStyle: React.CSSProperties = {
  display: "inline-grid",
  placeItems: "center",
  borderRadius: "var(--r-md)",
  border: "1px solid var(--border)",
  background: "var(--bg-elev)",
  color: "var(--fg)",
  cursor: "pointer",
  transition: "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
  outlineOffset: "2px",
};

const sizeMap: Record<string, React.CSSProperties> = {
  sm: { width: "2rem", height: "2rem" },
  md: { width: "2.5rem", height: "2.5rem" },
};

const variantMap: Record<string, React.CSSProperties> = {
  default: {},
  ghost: { background: "transparent", border: "1px solid transparent" },
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "default", size = "md", disabled, style, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        aria-busy={undefined}
        style={{
          ...baseStyle,
          ...sizeMap[size],
          ...variantMap[variant],
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
          ...style,
        }}
        {...rest}
      />
    );
  }
);

IconButton.displayName = "IconButton";
