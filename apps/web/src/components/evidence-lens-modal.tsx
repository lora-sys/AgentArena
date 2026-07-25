import { useEffect, useRef } from "react";
import type { EvidenceCompleteness, SixDimensionScore } from "@agent-arena/contracts";
import { t } from "../i18n/zh";
import styles from "./evidence-lens-modal.module.css";

type TranslationKey = Parameters<typeof t>[0];
const dimensions: Array<[keyof SixDimensionScore, TranslationKey]> = [
  ["feasibility_zh", "evidence.dimension.feasibility"], ["originality", "evidence.dimension.originality"],
  ["demoPower", "evidence.dimension.demo_power"], ["technicalDepth", "evidence.dimension.technical_depth"],
  ["clarity", "evidence.dimension.clarity"], ["riskControl", "evidence.dimension.risk_control"],
];
const chainLabels: Record<string, TranslationKey> = { test: "evidence.chain.test", attack: "evidence.chain.attack", defense: "evidence.chain.defense", patch: "evidence.chain.patch" };

export interface EvidenceLensModalProps {
  open: boolean; teamName: string; totalScore: number; completeness: EvidenceCompleteness;
  scores?: SixDimensionScore; evidenceChain?: string[]; onClose: () => void;
}

export function EvidenceLensModal({ open, teamName, totalScore, completeness, scores, evidenceChain = [], onClose }: EvidenceLensModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [onClose, open]);
  if (!open) return null;
  const insufficient = completeness === "insufficient_evidence" || !scores;
  return <div className={styles.backdrop} onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <div ref={panelRef} className={`${styles.modal} ${insufficient ? styles.insufficient : ""}`} role="dialog" aria-modal="true" aria-labelledby="evidence-title">
      <header className={styles.header}><div><span>{t("evidence.subtitle")}</span><h2 id="evidence-title">{t("evidence.title")}</h2><p>{teamName}</p></div><div className={styles.total}><b>{totalScore}</b><small>/100</small></div><button ref={closeRef} type="button" onClick={onClose} aria-label={t("evidence.close")}>×</button></header>
      {insufficient ? <section className={styles.empty}><i aria-hidden="true">◇</i><h3>{t("evidence.state.insufficient")}</h3><p>{t("evidence.insufficient_note")}</p></section> : <div className={styles.content}>
        <section className={styles.scorecard} aria-label={t("evidence.score_breakdown")}>
          {dimensions.map(([key, labelKey]) => { const dimension = scores[key]; const lines = completeness === "linked_evidence" ? dimension.breakdown.slice(0, 1) : dimension.breakdown; return <article key={key}>
            <div className={styles.dimension}><strong>{t(labelKey)}</strong><span><b>{dimension.score}</b>/{dimension.max}</span></div>
            <div className={styles.meter}><i style={{ width: `${Math.min(100, dimension.score / dimension.max * 100)}%` }} /></div>
            <ul>{lines.map((line) => <li key={`${line.label}-${line.delta}`} className={line.delta < 0 ? styles.negative : ""}><b>{line.delta > 0 ? "+" : ""}{line.delta}</b><span>{line.label}</span></li>)}</ul>
          </article>; })}
          {completeness === "linked_evidence" && <p className={styles.linkedNote}>{t("evidence.state.linked")}</p>}
        </section>
        <aside className={styles.chain}><span>{t("evidence.chain_title")}</span><h3>{t("evidence.chain_verified")}</h3><ol>{evidenceChain.map((id, index) => <li key={id}><i>{String(index + 1).padStart(2, "0")}</i><div><b>{id}</b><small>{t(chainLabels[id.split("_")[0]] ?? "evidence.recorded")}</small></div></li>)}</ol></aside>
      </div>}
    </div>
  </div>;
}
