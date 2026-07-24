/**
 * 中文文案唯一来源（Issue #27 / 计划 #06 · workstream E · owner P2）
 *
 * ⚠️ 共触区草案：本文件是 P1 为解锁 #31/#32/#33 而起草的 **初版**，
 * 仅收录 A 线组件当前需要的 key。合并前需 P2 sign-off 并与 D/E 线补全。
 * 权威口径：docs/DEV-STANDARDS.md §4（中文优先）· §7（数值/文案）。
 *
 * 硬规矩：组件内禁止硬编码用户可见字符串，一律从这里取。
 * 中文主标题 + 可选英文副标题（如 "战斗直播 Live Arena"）。
 */

export const zh = {
  /** 顶栏 / 通用 */
  common: {
    launch: "进入竞技场",
    replay: "回放",
    result: "结果",
    live: "直播",
    pause: "暂停",
    resume: "继续",
  },

  /** Live Arena 页面 */
  arena: {
    liveBattle: "战斗直播",
    liveBattleEn: "Live Arena",
    arenaName: "智能体竞技场",
    battleId: "对战编号",
    liveCommentary: "现场解说",
    evidenceChain: "证据链",
    hp: "证明值",
    standingBy: "待命中",
    waitingSignal: "等待回合信号…",
    typing: "生成中",
    evidenceLocked: "证据待锁定",
    accepted: "已接受",
    rejected: "已驳回",
    proposalTag: "方案",
    /** 回合序号显示：ROUND x / y —— 数字前缀保留英文缩写作副标题 */
    roundOf: (index: number, count: number) => `第 ${index} / ${count} 回合`,
  },

  /**
   * RoundBanner 七段展示进度条（#31）
   * 展示层七段；Engine 状态机仅四段（提案/攻击/防守/裁决）。
   */
  roundBanner: {
    /** 七段标签（简报/提案/构建/攻击/防守/验证/裁决） */
    segments: ["简报", "提案", "构建", "攻击", "防守", "验证", "裁决"] as const,
    /** 大标题：按 Engine 回合 key 映射 */
    titleByRound: {
      proposal_round: "提案回合",
      cross_attack_round: "交叉攻击回合",
      defense_round: "防守回合",
      scoring_round: "评分裁决回合",
      champion_round: "冠军揭晓",
    } as Record<string, string>,
    degraded: "证据不足",
  },

  /**
   * RuntimeModeBadge 三态徽标（#33）
   * verified_replay（已验证演示）/ live_runtime（实时 AI 竞技）/ demo_fallback（演示兜底）
   */
  runtimeMode: {
    verified_replay: { label: "已验证演示", sub: "Verified Replay" },
    live_runtime: { label: "实时 AI 竞技", sub: "Live Runtime" },
    demo_fallback: { label: "演示兜底", sub: "Demo Fallback" },
  } as Record<string, { label: string; sub: string }>,
} as const;

export type Zh = typeof zh;
