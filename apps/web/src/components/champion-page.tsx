import { useEffect, useState } from "react";
import type { TeamPassport } from "@agent-arena/contracts";
import { t } from "../i18n";
import styles from "./champion-page.module.css";

export type ChampionPageProps = {
  battleId: string;
  champion: TeamPassport;
  otherTeams?: readonly { name: string; score: number; accentColor: string }[];
  /** when true, show Mini Passport unfinished state instead of champion reveal */
  liveIncomplete?: boolean;
  onBackToArena?: () => void;
  onWatchVerified?: () => void;
  onShare?: () => void;
  onBackHome?: () => void;
};

const JOURNEY_LABELS: Record<string, Parameters<typeof t>[0]> = {
  proposal: "champion.journey.proposal",
  attack: "champion.journey.attack",
  defense: "champion.journey.defense",
  patch: "champion.journey.patch",
  verify: "champion.journey.verify",
  judging: "champion.journey.judging",
};

const TEAM_PORTRAITS: Record<string, string> = {
  team_safe_v1: "/assets/agents/safe-builder.png",
  team_viral_v1: "/assets/agents/viral-designer.png",
  team_infra_v1: "/assets/agents/infra-hacker.png",
};

const OTHER_TEAM_PORTRAITS: Record<string, string> = {
  "稳健构建者": "/assets/agents/safe-builder.png",
  "传播设计师": "/assets/agents/viral-designer.png",
  "架构黑客": "/assets/agents/infra-hacker.png",
};

export function ChampionPage({
  battleId,
  champion,
  otherTeams = [],
  liveIncomplete = false,
  onBackToArena,
  onWatchVerified,
  onShare,
  onBackHome,
}: ChampionPageProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (liveIncomplete) return;
    const timer = setTimeout(() => setRevealed(true), 50);
    return () => clearTimeout(timer);
  }, [liveIncomplete]);

  if (liveIncomplete) {
    return (
      <div className={styles.root} data-testid="champion-page" data-state="mini-passport">
        <section className={styles.miniPassport}>
          <h2>{t("champion.mini.title")}</h2>
          <p>{t("champion.mini.body")}</p>
          <div className={styles.miniActions}>
            <button type="button" onClick={onBackToArena}>{t("champion.mini.back_to_arena")}</button>
            <button type="button" onClick={onWatchVerified} className={styles.primary}>
              {t("champion.mini.watch_verified")}
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.root} data-testid="champion-page" data-state="revealed">
      {/* 上半屏：Champion Reveal（1200ms Victory Reveal） */}
      <section className={`${styles.reveal} ${revealed ? styles.revealIn : ""}`}>
        <div className={styles.stageBeams} aria-hidden="true" />
        {otherTeams.length > 0 && (
          <div className={styles.otherTeams}>
            {otherTeams.map((team) => (
              <div key={team.name} className={styles.otherTeam} style={{ borderColor: team.accentColor }}>
                <img src={OTHER_TEAM_PORTRAITS[team.name] ?? "/assets/agents/safe-builder.png"} alt="" />
                <span className={styles.otherTeamName} style={{ color: team.accentColor }}>{team.name}</span>
                <span className={styles.otherTeamScore}>{team.score}</span>
                <small>{t("champion.reveal.challenger")}</small>
              </div>
            ))}
          </div>
        )}
        <div className={styles.championPortrait}>
          <img src={TEAM_PORTRAITS[champion.teamId] ?? "/assets/agents/viral-designer.png"} alt="" />
          <span aria-hidden="true">★</span>
        </div>
        <h1 className={styles.revealTitle}>
          <span className={styles.revealLabel}>{t("champion.reveal.title")}</span>
          <span className={styles.championName} style={{ color: champion.accentColor }}>
            {champion.teamName}
          </span>
          <span className={styles.championScore}>
            {champion.totalScore}
            <small>{t("champion.reveal.score_suffix")}</small>
          </span>
        </h1>
        <p className={styles.battleMeta}>
          {t("arena.header.battle_label")} {battleId}
        </p>
        <div className={styles.awardChips}>
          {champion.journey.slice(0, 6).map((step) => <span key={step.eventId}>{step.title}</span>)}
        </div>
        <div className={styles.revealActions}>
          <button type="button" onClick={onShare} className={styles.primary}>
            {t("champion.reveal.share_evidence")}
          </button>
          <button type="button" onClick={onBackToArena}>
            {t("champion.reveal.view_replay")}
          </button>
          <button type="button" onClick={onBackHome}>
            {t("champion.reveal.back_home")}
          </button>
        </div>
      </section>

      {/* 下半屏：Team Passport Snapshot */}
      <section className={styles.passport} data-testid="team-passport">
        <header className={styles.passportHeader}>
          <img src={TEAM_PORTRAITS[champion.teamId] ?? "/assets/agents/viral-designer.png"} alt="" />
          <div>
            <span className={styles.eyebrow}>{t("champion.passport.subtitle")}</span>
            <h2>{champion.teamName}</h2>
            <p>{t("champion.passport.title")} · {t("arena.header.battle_label")} {battleId}</p>
          </div>
          <div className={styles.passportSeal}><span>{t("champion.reveal.title")}</span><strong>{champion.totalScore}</strong><small>/100</small></div>
        </header>

        <div className={styles.passportGrid}>
          {/* 六维评分 */}
          <section className={styles.scoresSection}>
            {(Object.entries(champion.scores) as Array<[string, typeof champion.scores[keyof typeof champion.scores]]>).map(([key, dim]) => {
              const labelMap: Record<string, Parameters<typeof t>[0]> = {
                feasibility_zh: "evidence.dimension.feasibility",
                originality: "evidence.dimension.originality",
                demoPower: "evidence.dimension.demo_power",
                technicalDepth: "evidence.dimension.technical_depth",
                clarity: "evidence.dimension.clarity",
                riskControl: "evidence.dimension.risk_control",
              };
              return (
                <div key={key} className={styles.scoreRow}>
                  <span className={styles.scoreLabel}>{t(labelMap[key] ?? "evidence.dimension.feasibility")}</span>
                  <span className={styles.scoreValue}>
                    <strong>{dim.score}</strong>
                    <span className={styles.scoreMax}>/{dim.max}</span>
                  </span>
                </div>
              );
            })}
          </section>

          {/* 优势 + 弱点 + 改进建议 */}
          <section className={styles.textSection}>
            <div className={styles.textBlock}>
              <h3>{t("champion.passport.strengths")}</h3>
              <ul>
                {champion.strengths.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={styles.textBlock} data-tone="weak">
              <h3>{t("champion.passport.weaknesses")}</h3>
              <ul>
                {champion.weaknesses.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={styles.textBlock} data-tone="improve">
              <h3>{t("champion.passport.improvements")}</h3>
              <ul>
                {champion.improvementSuggestions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* 战斗旅程 */}
          <section className={styles.journeySection}>
            <h3>{t("champion.passport.journey")}</h3>
            <ol className={styles.journeyList}>
              {champion.journey.map((step) => (
                <li key={step.eventId}>
                  <span className={styles.journeyRound}>{t(JOURNEY_LABELS[step.round] ?? "champion.journey.proposal")}</span>
                  <span className={styles.journeyTitle}>{step.title}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <footer className={styles.passportActions}>
          <button type="button" onClick={onBackToArena}>{t("champion.reveal.view_replay")}</button>
          <button type="button" onClick={onShare}>{t("champion.reveal.share_evidence")}</button>
          <button type="button" onClick={onBackHome}>{t("champion.reveal.back_home")}</button>
        </footer>
      </section>
    </div>
  );
}
