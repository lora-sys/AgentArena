import { useEffect, useRef, useState } from "react";
import type { ArtifactBundle } from "@agent-arena/contracts";
import { t } from "../i18n/zh";
import styles from "./artifact-modal.module.css";
import { ArtifactTabVersions } from "./artifact-tab-versions";
import { ArtifactTabPatch } from "./artifact-tab-patch";
import { ArtifactTabTests } from "./artifact-tab-tests";
import { ArtifactTabEvidence } from "./artifact-tab-evidence";

const tabs = [
  { id: "versions", label: t("artifact.tab.versions"), empty: t("artifact.empty.versions") },
  { id: "patch", label: t("artifact.tab.patch"), empty: t("artifact.empty.patch") },
  { id: "tests", label: t("artifact.tab.tests"), empty: t("artifact.empty.tests") },
  { id: "evidence", label: t("artifact.tab.evidence"), empty: t("artifact.empty.evidence") },
] as const;

type ArtifactTab = (typeof tabs)[number]["id"];

export interface ArtifactModalProps {
  open: boolean;
  teamName: string;
  artifact?: ArtifactBundle;
  onEvidenceSelect?: (eventId: string) => void;
  onClose: () => void;
}

export function ArtifactModal({ open, teamName, artifact, onEvidenceSelect, onClose }: ArtifactModalProps) {
  const [activeTab, setActiveTab] = useState<ArtifactTab>("versions");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) setActiveTab("versions");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return <div className={styles.backdrop} onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <div ref={panelRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="artifact-modal-title">
      <header className={styles.header}>
        <div><span>{t("artifact.team_prefix")} · {teamName}</span><h2 id="artifact-modal-title">{artifact?.title ?? t("artifact.title")}</h2></div>
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label={t("artifact.close")}>×</button>
      </header>
      <div className={styles.tabs} role="tablist" aria-label={t("artifact.title")}>
        {tabs.map((tab) => <button key={tab.id} id={`artifact-tab-${tab.id}`} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls="artifact-tabpanel" tabIndex={activeTab === tab.id ? 0 : -1} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
      </div>
      <section id="artifact-tabpanel" role="tabpanel" aria-labelledby={`artifact-tab-${active.id}`} className={`${styles.panel} ${artifact ? styles.panelPopulated : ""}`}>
        {artifact && active.id === "versions" ? <ArtifactTabVersions artifact={artifact} />
          : artifact && active.id === "patch" && artifact.patchDiffText ? <ArtifactTabPatch diffText={artifact.patchDiffText} />
          : artifact && active.id === "tests" ? <ArtifactTabTests results={artifact.testResults} />
          : artifact && active.id === "evidence" ? <ArtifactTabEvidence eventIds={artifact.linkedEvidenceEventIds} onSelect={onEvidenceSelect} /> : <>
          <div className={styles.emptyIcon} aria-hidden="true">◇</div>
          <strong>{active.label}</strong>
          <p>{active.empty}</p>
        </>}
      </section>
    </div>
  </div>;
}
