import { useEffect, useState } from "react";
import { teams } from "../data/demo";
import { t } from "../i18n";
import { RuntimeModeBadge } from "./runtime-mode-badge";
import styles from "./live-ai-degraded.module.css";

export function LiveAiDegraded({ onReturnVerified }: { onReturnVerified: () => void }) {
  const [seconds, setSeconds] = useState(10);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setSeconds((current) => {
      if (current <= 1) {
        window.clearInterval(timer);
        return 0;
      }
      return current - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [paused]);
  useEffect(() => { if (seconds === 0) onReturnVerified(); }, [onReturnVerified, seconds]);
  return <main className={styles.wrap}><div className={styles.mode}><RuntimeModeBadge mode="demo_fallback" /></div><section className={styles.page} aria-labelledby="degraded-title" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
    <div className={styles.scene} aria-hidden="true">{teams.map((team) => <img key={team.id} src={team.portrait} alt="" />)}</div>
    <div className={styles.warning} aria-hidden="true">△</div>
    <span className={styles.eyebrow}>{t("arena.degraded.status")}</span>
    <h1 id="degraded-title">{t("arena.degraded.title")}</h1>
    <p>{t("arena.degraded.body")}</p>
    <div className={styles.audit}>
      <article><h2>{t("arena.degraded.available")}</h2><p>✓ {t("arena.degraded.events")}</p><p>✓ {t("arena.degraded.attacks")}</p><p>✓ {t("arena.degraded.defenses")}</p></article>
      <article><h2>{t("arena.degraded.missing")}</h2><p>× {t("arena.degraded.score")}</p><p>× {t("arena.degraded.tests")}</p><p>× {t("arena.degraded.chain")}</p></article>
    </div>
    <aside className={styles.actions}><span>{t("arena.degraded.recommendation")}</span><button type="button" onClick={onReturnVerified}>{t("arena.degraded.back_now")}</button><small>{t("arena.degraded.retry")}</small></aside>
    <div className={styles.countdown} aria-live="polite"><strong>{seconds}s</strong><span>{t("arena.degraded.countdown_prefix")}</span><button type="button" onClick={() => setPaused((current) => !current)}>{paused ? t("arena.degraded.resume") : t("arena.degraded.pause")}</button></div>
  </section></main>;
}
