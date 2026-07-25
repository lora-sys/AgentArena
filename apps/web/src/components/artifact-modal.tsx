import { useEffect, useRef, useState, type ReactNode } from "react";
import { t } from "../i18n";
import styles from "./artifact-modal.module.css";

export type ArtifactModalTab = "versions" | "patch" | "tests" | "evidence";

export type ArtifactModalProps = {
  open: boolean;
  onClose: () => void;
  teamName: string;
  initialTab?: ArtifactModalTab;
  versionsContent?: ReactNode;
  patchContent?: ReactNode;
  testsContent?: ReactNode;
  evidenceContent?: ReactNode;
};

const TABS: readonly ArtifactModalTab[] = ["versions", "patch", "tests", "evidence"];
const TAB_LABEL: Record<ArtifactModalTab, Parameters<typeof t>[0]> = {
  versions: "artifact.tab.versions",
  patch: "artifact.tab.patch",
  tests: "artifact.tab.tests",
  evidence: "artifact.tab.evidence",
};

export function ArtifactModal({
  open,
  onClose,
  teamName,
  initialTab = "versions",
  versionsContent,
  patchContent,
  testsContent,
  evidenceContent,
}: ArtifactModalProps) {
  const [tab, setTab] = useState<ArtifactModalTab>(initialTab);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab" && dialogRef.current) {
        // Focus trap
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const content =
    tab === "versions" ? versionsContent :
    tab === "patch" ? patchContent :
    tab === "tests" ? testsContent :
    evidenceContent;

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
      data-testid="artifact-modal-backdrop"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="artifact-modal-title"
        className={styles.dialog}
        data-testid="artifact-modal"
        data-tab={tab}
      >
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{t("artifact.subtitle")}</span>
            <h2 id="artifact-modal-title" className={styles.title}>
              {t("artifact.title")} · {teamName}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label={t("common.close")}
          >
            ESC
          </button>
        </header>
        <nav className={styles.tabs} role="tablist">
          {TABS.map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              role="tab"
              aria-selected={tab === tabKey}
              className={`${styles.tabButton} ${tab === tabKey ? styles.tabActive : ""}`}
              onClick={() => setTab(tabKey)}
              data-tab={tabKey}
            >
              {t(TAB_LABEL[tabKey])}
            </button>
          ))}
        </nav>
        <div className={styles.content} role="tabpanel">
          {content ?? <p className={styles.empty}>该标签页内容尚未就绪</p>}
        </div>
      </div>
    </div>
  );
}
