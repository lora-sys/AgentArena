import { Link } from "react-router-dom";
import type { TeamPassport as TeamPassportData } from "@agent-arena/contracts";
import { t } from "../i18n/zh";
import styles from "./champion-page.module.css";

const dimensions: Array<[keyof TeamPassportData["scores"], Parameters<typeof t>[0]]> = [
  ["feasibility_zh", "evidence.dimension.feasibility"], ["originality", "evidence.dimension.originality"], ["demoPower", "evidence.dimension.demo_power"],
  ["technicalDepth", "evidence.dimension.technical_depth"], ["clarity", "evidence.dimension.clarity"], ["riskControl", "evidence.dimension.risk_control"],
];

export function TeamPassport({ battleId, passport }: { battleId: string; passport: TeamPassportData }) {
  return <section className={styles.passport} aria-labelledby="team-passport-title">
    <header className={styles.passportHeader}><div><span>{t("champion.passport.subtitle")}</span><h2 id="team-passport-title">{t("champion.passport.title")}</h2></div><div className={styles.seal}><i aria-hidden="true">✓</i><span>{t("champion.passport.verified")}</span></div></header>
    <div className={styles.identity}><img src="/assets/agents/viral-designer.png" alt="" /><div><span>{t("champion.passport.champion_team")}</span><h3>{passport.teamName}</h3><p>{t("landing.agents.viral.subtitle")}</p></div><strong>{passport.totalScore}<small>/100</small></strong></div>
    <section className={styles.scores} aria-label={t("champion.passport.six_scores")}>{dimensions.map(([key, label]) => { const value = passport.scores[key]; return <article key={key}><div><span>{t(label)}</span><b>{value.score}<small>/{value.max}</small></b></div><i><em style={{ width: `${value.score / value.max * 100}%` }} /></i></article>; })}</section>
    <div className={styles.passportGrid}>
      <PassportList title={t("champion.passport.strengths")} items={passport.strengths} tone="positive" />
      <PassportList title={t("champion.passport.weaknesses")} items={passport.weaknesses} tone="negative" />
      <PassportList title={t("champion.passport.improvements")} items={passport.improvementSuggestions} tone="neutral" />
    </div>
    <section className={styles.journey}><header><span>{t("champion.passport.journey")}</span><small>{t("champion.passport.journey_hint")}</small></header><ol>{passport.journey.map((step, index) => <li key={step.eventId}><Link to={`/battle/${battleId}?mode=verified_replay&event=${step.eventId}`}><i>{String(index + 1).padStart(2, "0")}</i><div><span>{step.round}</span><strong>{step.title}</strong><small>{step.eventId}</small></div></Link></li>)}</ol></section>
  </section>;
}

function PassportList({ title, items, tone }: { title: string; items: string[]; tone: "positive" | "negative" | "neutral" }) {
  return <article className={`${styles.traits} ${styles[tone]}`}><h3>{title}</h3>{items.map((item) => <p key={item}><i aria-hidden="true" />{item}</p>)}</article>;
}
