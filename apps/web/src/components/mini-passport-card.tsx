import { Link } from "react-router-dom";
import { t } from "../i18n/zh";
import styles from "./mini-passport-card.module.css";

export function MiniPassportCard({ battleId, hasRecordedEvents = false }: { battleId: string; hasRecordedEvents?: boolean }) {
  const encodedBattleId = encodeURIComponent(battleId);
  return <main className={styles.page}>
    <section className={styles.banner}><span>{t("champion.mini.banner")}</span><b>{battleId}</b></section>
    <article className={styles.card} aria-labelledby="mini-passport-title">
      <div className={styles.icon} aria-hidden="true">◇</div>
      <span className={styles.eyebrow}>{t("champion.mini.eyebrow")}</span>
      <h1 id="mini-passport-title">{t("champion.mini.title")}</h1>
      <p>{t("champion.mini.body")}</p>
      <div className={styles.status} aria-label={t("champion.mini.status_label")}>
        <div><i className={hasRecordedEvents ? styles.active : undefined} /><span>{hasRecordedEvents ? t("champion.mini.recorded") : t("champion.mini.awaiting_events")}</span></div>
        <div><i /><span>{t("champion.mini.judging_pending")}</span></div>
        <div><i /><span>{t("champion.mini.passport_pending")}</span></div>
      </div>
      <div className={styles.actions}><Link to={`/battle/${encodedBattleId}?mode=live_runtime`}>{t("champion.mini.back_to_arena")}</Link><Link className={styles.verified} to="/battle/BA-2026-0024/champion?mode=verified_replay">{t("champion.mini.watch_verified")}</Link></div>
      <small>{t("champion.mini.honesty_note")}</small>
    </article>
  </main>;
}
