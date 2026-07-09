import type { Config } from "tailwindcss";

/* Agent Arena — Tailwind config.
   Visual direction B (Linear × sports-data). Source: docs/design.md §2.
   Tokens are defined as CSS variables in app/globals.css.
   This config maps Tailwind utilities to those CSS variables. */

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",

      /* surface */
      bg: "var(--bg)",
      "bg-elev": "var(--bg-elev)",
      "bg-sunken": "var(--bg-sunken)",
      fg: "var(--fg)",
      "fg-muted": "var(--fg-muted)",
      "fg-subtle": "var(--fg-subtle)",

      /* line */
      border: "var(--border)",
      "border-strong": "var(--border-strong)",
      ring: "var(--ring)",

      /* team */
      "team-safe": "var(--team-safe)",
      "team-viral": "var(--team-viral)",
      "team-infra": "var(--team-infra)",
      champion: "var(--champion)",

      /* severity */
      "sev-low": "var(--sev-low)",
      "sev-med": "var(--sev-med)",
      "sev-high": "var(--sev-high)",
      "sev-fatal": "var(--sev-fatal)",

      /* status */
      "status-ok": "var(--status-ok)",
      "status-warn": "var(--status-warn)",
      "status-err": "var(--status-err)",
      "status-info": "var(--status-info)"
    },
    fontFamily: {
      display: "var(--font-display)",
      body: "var(--font-body)",
      mono: "var(--font-mono)"
    },
    spacing: {
      "s-1": "var(--s-1)",
      "s-2": "var(--s-2)",
      "s-3": "var(--s-3)",
      "s-4": "var(--s-4)",
      "s-6": "var(--s-6)",
      "s-8": "var(--s-8)",
      "s-12": "var(--s-12)",
      "s-16": "var(--s-16)",
      "s-24": "var(--s-24)"
    },
    borderRadius: {
      "r-sm": "var(--r-sm)",
      "r-md": "var(--r-md)",
      "r-lg": "var(--r-lg)",
      "r-xl": "var(--r-xl)",
      full: "var(--r-full)"
    },
    boxShadow: {
      "shadow-1": "var(--shadow-1)",
      "shadow-2": "var(--shadow-2)",
      "shadow-3": "var(--shadow-3)"
    },
    transitionDuration: {
      fast: "var(--dur-fast)",
      base: "var(--dur-base)",
      slow: "var(--dur-slow)",
      stage: "var(--dur-stage)"
    },
    transitionTimingFunction: {
      "ease-out": "var(--ease-out)",
      "ease-in": "var(--ease-in)",
      "ease-spring": "var(--ease-spring)"
    }
  }
};

export default config;
