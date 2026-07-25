import { t } from "../i18n";
import styles from "./runtime-mode-badge.module.css";

export type RuntimeMode = "verified_replay" | "live_runtime" | "demo_fallback";

export type RuntimeModeBadgeProps = {
  mode: RuntimeMode;
};

const MODE_LABEL_KEY: Record<RuntimeMode, Parameters<typeof t>[0]> = {
  verified_replay: "runtime.badge.verified_replay",
  live_runtime: "runtime.badge.live_runtime",
  demo_fallback: "runtime.badge.demo_fallback",
};

export function RuntimeModeBadge({ mode }: RuntimeModeBadgeProps) {
  return (
    <span
      className={`${styles.root} ${styles[mode]}`}
      data-testid="runtime-mode-badge"
      data-mode={mode}
      role="status"
      aria-live="polite"
    >
      <span className={styles.dot} aria-hidden="true" />
      {t(MODE_LABEL_KEY[mode])}
    </span>
  );
}
