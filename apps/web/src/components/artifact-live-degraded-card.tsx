import { t } from "../i18n/zh";
import styles from "./artifact-live-degraded-card.module.css";

export function ArtifactLiveDegradedCard({ onReturnVerified }: { onReturnVerified?: () => void }) {
  return <section className={styles.card} aria-labelledby="artifact-degraded-title">
    <div className={styles.signal} aria-hidden="true">!</div>
    <p>{t("artifact.degraded.eyebrow")}</p>
    <h3 id="artifact-degraded-title">{t("artifact.degraded.title")}</h3>
    <div className={styles.status}>
      <span><i className={styles.live} />{t("artifact.degraded.live_status")}</span>
      <span><i className={styles.missing} />{t("artifact.degraded.missing_status")}</span>
      <span><i className={styles.ready} />{t("artifact.degraded.verified_status")}</span>
    </div>
    <p className={styles.body}>{t("artifact.degraded.body")}</p>
    <button type="button" onClick={onReturnVerified}>{t("artifact.degraded.cta")}</button>
    <small>{t("artifact.degraded.note")}</small>
  </section>;
}
