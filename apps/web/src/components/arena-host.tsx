import { t } from "../i18n";
import styles from "./arena-host.module.css";

export type ArenaHostProps = {
  round: string;
  activeTeamId?: string;
  /** optional live commentary line; falls back to round-keyed copy */
  line?: string;
};

const ROUND_LINE: Record<string, string> = {
  briefing: "三队就位，简报已下发。",
  team_generation: "队伍组建完成，准备进入提案。",
  proposal_round: "提案进行中 — 三队各亮核心思路。",
  cross_attack_round: "攻防开启 — 谁能找出对方死穴？",
  defense_round: "防守时刻 — 被攻方是否能自圆其说？",
  judging_round: "六维评分落定，冠军即将揭晓。",
};

export function ArenaHost({ round, activeTeamId, line }: ArenaHostProps) {
  const displayLine = line ?? ROUND_LINE[round] ?? "比赛进行中。";
  return (
    <aside className={styles.root} data-testid="arena-host" data-round={round} data-team={activeTeamId}>
      <div className={styles.avatar} aria-hidden="true">
        <svg viewBox="0 0 64 64" width="48" height="48" role="img" aria-label="主持人头像">
          <circle cx="32" cy="32" r="30" fill="var(--bg-panel-2)" stroke="var(--team-safe)" strokeWidth="2" />
          <circle cx="32" cy="24" r="8" fill="var(--team-safe)" />
          <path d="M 16 48 Q 32 36 48 48 L 48 52 L 16 52 Z" fill="var(--team-safe)" opacity="0.7" />
        </svg>
      </div>
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.title}>{t("arena.host.title")}</span>
          <span className={styles.subtitle}>{t("arena.host.subtitle")}</span>
        </div>
        <p className={styles.line} key={round}>
          {displayLine}
        </p>
        <div className={styles.waveform} aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i} className={styles.bar} style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      </div>
    </aside>
  );
}
