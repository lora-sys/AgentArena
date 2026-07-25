import { t } from "../i18n/zh";
import styles from "./artifact-detail-tabs.module.css";

export function ArtifactTabEvidence({ eventIds, onSelect }: { eventIds: string[]; onSelect?: (eventId: string) => void }) {
  return <div className={styles.evidence}>
    <header><span>{t("artifact.evidence.verified")}</span><strong>{eventIds.length}</strong></header>
    <ol>{eventIds.map((eventId, index) => <li key={eventId}>
      <i>{String(index + 1).padStart(2, "0")}</i>
      <div><strong>{eventId}</strong><small>{t("artifact.evidence.recorded")}</small></div>
      <button type="button" disabled={!onSelect} onClick={() => onSelect?.(eventId)} aria-label={`${t("artifact.evidence.jump")} ${eventId}`}>{t("artifact.evidence.jump")}</button>
    </li>)}</ol>
  </div>;
}
