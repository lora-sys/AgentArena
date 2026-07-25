import { t } from "../i18n";
import styles from "./runtime-mode-badge.module.css";

export type RuntimeMode = "verified_replay" | "live_runtime" | "demo_fallback";

export type RuntimeModeBadgeProps = {
  mode: RuntimeMode;
  completed?: boolean;
  replaying?: boolean;
};

const MODE_LABEL_KEY: Record<RuntimeMode, Parameters<typeof t>[0]> = {
  verified_replay: "runtime.badge.verified_replay",
  live_runtime: "runtime.badge.live_runtime",
  demo_fallback: "runtime.badge.demo_fallback",
};

export function RuntimeModeBadge({ mode, completed = false, replaying = false }: RuntimeModeBadgeProps) {
  const label = mode === "live_runtime" && replaying
    ? t("runtime.badge.live_replay")
    : mode === "live_runtime" && completed
    ? t("runtime.badge.live_complete")
    : t(MODE_LABEL_KEY[mode]);
  return (
    <span
      className={`${styles.root} ${styles[mode]}`}
      data-testid="runtime-mode-badge"
      data-mode={mode}
      role="status"
      aria-live="polite"
    >
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  );
}
