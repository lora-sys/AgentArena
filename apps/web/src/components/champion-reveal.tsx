import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { TeamPassport } from "@agent-arena/contracts";
import { t } from "../i18n/zh";
import styles from "./champion-page.module.css";

export function ChampionReveal({ battleId, timestamp, passport, standings }: { battleId: string; timestamp: string; passport: TeamPassport; standings: Array<{ teamId: string; score: number }> }) {
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);
  useEffect(() => () => { if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current); }, []);
  const share = async () => {
    const url = window.location.href;
    try { await navigator.clipboard.writeText(url); } catch { /* 浏览器禁用剪贴板时保留当前页面，不伪报成功。 */ return; }
    setCopied(true);
    if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => { setCopied(false); copiedTimer.current = null; }, 1800);
  };
  const scoreFor = (teamId: string) => standings.find((team) => team.teamId === teamId)?.score ?? 0;
  return <section className={styles.reveal} aria-labelledby="champion-reveal-title">
    <div className={styles.beams} aria-hidden="true"><i /><i /><i /></div>
    <div className={styles.trophy} aria-hidden="true">🏆</div>
    <span className={styles.verified}>{t("champion.reveal.verified")}</span>
    <div className={styles.podium}>
      <article className={styles.runner}><img src="/assets/agents/safe-builder.png" alt="" /><small>{t("champion.reveal.runner_up")}</small><strong>{t("landing.agents.safe.name")}</strong><b>{scoreFor("safe_builder")}<em>/100</em></b></article>
      <article className={styles.winner}><div className={styles.crown} aria-hidden="true">♛</div><img src="/assets/agents/viral-designer.png" alt="" /><span>{t("champion.reveal.title")}</span><h1 id="champion-reveal-title">{passport.teamName}</h1><p>{t("landing.agents.viral.subtitle")}</p><strong>{passport.totalScore}<small>{t("champion.reveal.score_suffix")}</small></strong></article>
      <article className={styles.runner}><img src="/assets/agents/infra-hacker.png" alt="" /><small>{t("champion.reveal.third_place")}</small><strong>{t("landing.agents.infra.name")}</strong><b>{scoreFor("infra_hacker")}<em>/100</em></b></article>
    </div>
    <p className={styles.meta}>{battleId} · {new Date(timestamp).toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}</p>
    <div className={styles.actions}><button type="button" onClick={share}>{copied ? t("common.copied") : t("champion.reveal.share_evidence")}</button><Link to={`/battle/${battleId}?mode=verified_replay&view=replay`}>{t("champion.reveal.view_replay")}</Link></div>
  </section>;
}
