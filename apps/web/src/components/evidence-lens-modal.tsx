import { useEffect, useRef } from "react";
import type { SixDimensionScore, EvidenceCompleteness } from "@agent-arena/contracts";
import { t } from "../i18n";
import styles from "./evidence-lens-modal.module.css";

export type EvidenceLensModalProps = {
  open: boolean;
  onClose: () => void;
  teamName: string;
  accentColor: string;
  completeness: EvidenceCompleteness;
  scores?: SixDimensionScore;
  /** ordered evidence event IDs forming the chain */
  evidenceChain?: readonly string[];
};

const DIMENSION_LABEL: Record<keyof SixDimensionScore, Parameters<typeof t>[0]> = {
  feasibility_zh: "evidence.dimension.feasibility",
  originality: "evidence.dimension.originality",
  demoPower: "evidence.dimension.demo_power",
  technicalDepth: "evidence.dimension.technical_depth",
  clarity: "evidence.dimension.clarity",
  riskControl: "evidence.dimension.risk_control",
};

export function EvidenceLensModal({
  open,
  onClose,
  teamName,
  accentColor,
  completeness,
  scores,
  evidenceChain = [],
}: EvidenceLensModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  if (completeness === "insufficient_evidence") {
    return (
      <div className={styles.backdrop} onMouseDown={(e) => e.currentTarget === e.target && onClose()}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          className={`${styles.dialog} ${styles.insufficient}`}
          data-testid="evidence-lens-modal"
          data-state="insufficient"
        >
          <header className={styles.header}>
            <h2>{t("evidence.title")} · {teamName}</h2>
            <button ref={closeButtonRef} type="button" onClick={onClose} aria-label={t("common.close")}>{t("common.close_shortcut")}</button>
          </header>
          <div className={styles.insufficientBody}>
            <p>{t("evidence.state.insufficient")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.backdrop} onMouseDown={(e) => e.currentTarget === e.target && onClose()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className={styles.dialog}
        data-testid="evidence-lens-modal"
        data-state={completeness}
        style={{ borderColor: accentColor }}
      >
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{t("evidence.subtitle")}</span>
            <h2>{t("evidence.title")} · {teamName}</h2>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label={t("common.close")}>{t("common.close_shortcut")}</button>
        </header>

        {completeness === "linked_evidence" && (
          <div className={styles.linkedBanner}>{t("evidence.state.linked")}</div>
        )}

        {scores && (
          <section className={styles.scoresSection}>
            {(Object.entries(scores) as Array<[keyof SixDimensionScore, typeof scores[keyof SixDimensionScore]]>).map(([key, dim]) => (
              <div key={key} className={styles.dimensionRow}>
                <header className={styles.dimensionHeader}>
                  <span className={styles.dimensionLabel}>{t(DIMENSION_LABEL[key])}</span>
                  <span className={styles.dimensionScore}>
                    <strong>{dim.score}</strong>
                    <span className={styles.dimensionMax}>/{dim.max}</span>
                  </span>
                </header>
                {dim.completeness === "full_breakdown" && (
                  <ul className={styles.breakdownList}>
                    {dim.breakdown.map((line, index) => (
                      <li key={index} data-sign={line.delta >= 0 ? "plus" : "minus"}>
                        <span className={styles.breakdownDelta}>
                          {line.delta >= 0 ? `+${line.delta}` : line.delta}
                        </span>
                        <span className={styles.breakdownLabel}>{line.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {evidenceChain.length > 0 && (
          <section className={styles.chainSection}>
            <h3>{t("evidence.chain_title")}</h3>
            <ol className={styles.chainList}>
              {evidenceChain.map((eventId) => (
                <li key={eventId}><code>{eventId}</code></li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
