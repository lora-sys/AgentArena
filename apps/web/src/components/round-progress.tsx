import { useEffect, useState } from "react";
import { t } from "../i18n";
import styles from "./round-progress.module.css";

export type RoundStage =
  | "brief"
  | "proposal"
  | "build"
  | "attack"
  | "defense"
  | "verify"
  | "judgment";

export const ROUND_STAGES: readonly RoundStage[] = [
  "brief",
  "proposal",
  "build",
  "attack",
  "defense",
  "verify",
  "judgment",
];

const STAGE_LABEL_KEY: Record<RoundStage, Parameters<typeof t>[0]> = {
  brief: "round.stage.brief",
  proposal: "round.stage.proposal",
  build: "round.stage.build",
  attack: "round.stage.attack",
  defense: "round.stage.defense",
  verify: "round.stage.verify",
  judgment: "round.stage.judgment",
};

export type RoundProgressProps = {
  currentStage: RoundStage;
  /** color for completed stages; defaults to current team accent */
  accentColor?: string;
};

export function RoundProgress({ currentStage, accentColor = "var(--team-safe)" }: RoundProgressProps) {
  const currentIndex = ROUND_STAGES.indexOf(currentStage);
  return (
    <ol className={styles.root} data-testid="round-progress" aria-label="战斗进度">
      {ROUND_STAGES.map((stage, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "future";
        return (
          <li
            key={stage}
            className={`${styles.stage} ${styles[state]}`}
            data-stage={stage}
            data-state={state}
            style={state === "done" ? { borderColor: accentColor, color: accentColor } : undefined}
          >
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.label}>{t(STAGE_LABEL_KEY[stage])}</span>
          </li>
        );
      })}
    </ol>
  );
}

export type RoundBannerProps = {
  currentStage: RoundStage;
};

export function RoundBanner({ currentStage }: RoundBannerProps) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(timer);
  }, [currentStage]);
  return (
    <div
      className={`${styles.banner} ${visible ? styles.bannerVisible : ""}`}
      data-testid="round-banner"
      data-stage={currentStage}
    >
      {t(STAGE_LABEL_KEY[currentStage])}
    </div>
  );
}
