import { zh } from "../i18n/zh";

/**
 * RoundBanner — 回合横幅 + 七段展示进度条（Issue #31 / 计划 #10）
 *
 * 权威口径：`ui/Agent_Arena_v0.5.2_最终交付包.md` §139 —— 七段（简报/提案/构建/攻击/防守/验证/裁决）
 * 为 **Presentation 层展示**，Engine 状态机仅四段。回合切换转场 350ms（token --motion-round-banner）。
 *
 * 供 A 线 ArenaStage 消费的接口：
 * - `round`：Engine 回合 key（proposal_round / cross_attack_round / defense_round / scoring_round / champion_round）。
 * - `roundIndex`：0 基回合序号（用于 ROUND x / y 与转场 key）。
 * - `roundCount`：总回合数。
 * - `degraded`：实时模式下该阶段无真实证据时，标题降级为“证据不足”。
 */
export interface RoundBannerProps {
  round: string;
  roundIndex: number;
  roundCount: number;
  degraded?: boolean;
}

/** Engine 回合 → 七段进度条中「已抵达」的段索引（0..6） */
const REACHED_INDEX: Record<string, number> = {
  proposal_round: 1,      // 简报✓ → 提案(当前)
  cross_attack_round: 3,  // 简报✓ 提案✓ 构建✓ → 攻击(当前)
  defense_round: 4,       // → 防守(当前)
  scoring_round: 6,       // 验证✓ → 裁决(当前)
  champion_round: 6,      // 裁决完成
};

export function RoundBanner({ round, roundIndex, roundCount, degraded = false }: RoundBannerProps) {
  const reached = REACHED_INDEX[round] ?? 0;
  const title = zh.roundBanner.titleByRound[round] ?? zh.roundBanner.titleByRound.proposal_round;

  return (
    <div className="round-banner-wrap">
      <ol className="round-progress" aria-label="回合进度">
        {zh.roundBanner.segments.map((label, i) => {
          const state = i < reached ? "done" : i === reached ? "active" : "pending";
          return (
            <li key={label} className={`round-seg ${state}`}>
              <span className="round-seg-dot" aria-hidden="true" />
              <b>{label}</b>
            </li>
          );
        })}
      </ol>
      <div className="round-banner" key={`${round}-${roundIndex}`}>
        <span>{zh.arena.roundOf(roundIndex + 1, roundCount)}</span>
        <h2>{degraded ? zh.roundBanner.degraded : title}</h2>
      </div>
    </div>
  );
}
