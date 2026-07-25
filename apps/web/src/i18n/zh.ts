/**
 * Agent Arena v0.5.2 中文文案唯一权威表。
 *
 * 硬规矩（docs/DEV-STANDARDS.md §5）：
 *  - 所有用户可见字符串必须从这里取，禁止组件硬编码中文 / 裸英文。
 *  - 中文为主标题，英文只作副标题（小字、灰色、可省略）。
 *  - 新增 key 时同步在 docs/DEV-STANDARDS.md 的 i18n 章节登记。
 *
 * Key 命名：`{页面}.{区域}.{语义}`，全小写，下划线分词。
 */

export const zh = {
  // -------------------------------------------------------------------------
  // 通用
  // -------------------------------------------------------------------------
  "common.app_name": "Agent Arena",
  "common.app_tagline": "智能体竞技场",
  "common.loading": "加载中",
  "common.retry": "重试",
  "common.close": "关闭",
  "common.back": "返回",
  "common.continue": "继续",
  "common.copy_link": "复制链接",
  "common.copied": "已复制",
  "common.nav.arena": "竞技场",
  "common.nav.battles": "战斗记录",
  "common.nav.passport": "护照",
  "common.launch": "进入竞技场",

  // -------------------------------------------------------------------------
  // Landing 页
  // -------------------------------------------------------------------------
  "landing.hero.title": "看三个智能体团队现场造产品",
  "landing.hero.subtitle": "Watch three agent teams build under fire",
  "landing.hero.description": "同一份简报，三个团队实时提案、互相攻击、修复、评分。你能看到每一步证据。",
  "landing.cta.watch_replay": "观看 90 秒已验证演示",
  "landing.cta.live_battle": "实时开战（Beta）",
  "landing.fairness.title": "公平协议",
  "landing.fairness.item1": "三队看到同一份简报",
  "landing.fairness.item2": "同一模型，同一 token 预算",
  "landing.fairness.item3": "评分绑定证据事件 ID，可回放",
  "landing.agents.title": "三支参赛队伍",
  "landing.agents.safe.name": "稳健构建者",
  "landing.agents.safe.subtitle": "Safe Builders",
  "landing.agents.safe.tagline": "正确性优先，每一行代码都可解释。",
  "landing.agents.viral.name": "传播设计师",
  "landing.agents.viral.subtitle": "Viral Designers",
  "landing.agents.viral.tagline": "演示力优先，让产品自带传播势能。",
  "landing.agents.infra.name": "架构黑客",
  "landing.agents.infra.subtitle": "Infra Hackers",
  "landing.agents.infra.tagline": "技术深度优先，正面硬刚难题。",
  "landing.idea_input.label": "你的创意",
  "landing.idea_input.placeholder": "例：帮助大学生准备考试的 AI 学习助手",
  "landing.idea_input.submit": "实时开战",
  "landing.idea_input.too_long": "创意最长 300 字",
  "landing.idea_input.empty": "请输入创意",

  // -------------------------------------------------------------------------
  // Runtime Mode Badge（三态）
  // -------------------------------------------------------------------------
  "runtime.badge.verified_replay": "已验证演示 · 固定证据 · 可重复回放",
  "runtime.badge.live_runtime": "实时 AI 竞技 · 真实智能体正在运行",
  "runtime.badge.demo_fallback": "演示兜底 · 当前演示不对应刚才输入的创意",

  // -------------------------------------------------------------------------
  // Round 进度条（七段 · 对应设计稿 02 顶部）
  // -------------------------------------------------------------------------
  "round.stage.brief": "简报",
  "round.stage.proposal": "提案",
  "round.stage.build": "构建",
  "round.stage.attack": "攻击",
  "round.stage.defense": "防守",
  "round.stage.verify": "验证",
  "round.stage.judgment": "裁决",

  // -------------------------------------------------------------------------
  // Live Arena 页
  // -------------------------------------------------------------------------
  "arena.header.battle_label": "Battle",
  "arena.header.live": "LIVE",
  "arena.header.rules": "规则",
  "arena.header.share": "分享",
  "arena.idea_prefix": "创意",
  "arena.current_attack.title": "当前攻击焦点",
  "arena.current_attack.attacker": "攻击方",
  "arena.current_attack.target": "目标",
  "arena.evidence_chain.title": "证据链",
  "arena.event_stream.title": "事件流",
  "arena.host.title": "主持人解说",
  "arena.host.subtitle": "Arena Host",
  "arena.agent_card.build": "构建",
  "arena.agent_card.review": "审查",
  "arena.agent_card.defend": "防守",
  "arena.agent_card.proof_label": "证明值",
  "arena.agent_card.view_artifact": "查看作品",
  "arena.agent_card.view_evidence": "查看证据",
  "arena.view.live": "直播",
  "arena.view.result": "结果",
  "arena.view.replay": "回放",
  "arena.loading": "正在连接事件存储",
  "arena.event.proposal_created": "提案已生成",
  "arena.event.attack_created": "攻击已生成",
  "arena.event.defense_created": "防守已提交",
  "arena.event.artifact_created": "作品已更新",
  "arena.event.score_created": "评分已记录",
  "arena.event.champion_selected": "冠军已选出",

  // 致命攻击接管态（设计稿 03）
  "arena.fatal.banner": "致命攻击 CRITICAL ATTACK DETECTED",
  "arena.fatal.attacker_side": "攻击方",
  "arena.fatal.defender_side": "目标方",
  "arena.fatal.proof_delta_label": "证明值变化",

  // Live AI Degraded 页（设计稿 08）
  "arena.degraded.banner": "演示兜底 · 当前演示不对应刚才输入的创意",
  "arena.degraded.countdown_prefix": "秒后自动切回已验证演示",
  "arena.degraded.pause_hint": "悬停或按键暂停倒计时",
  "arena.degraded.back_now": "立即切回已验证演示",

  // -------------------------------------------------------------------------
  // Evidence Lens Modal（设计稿 04）
  // -------------------------------------------------------------------------
  "evidence.title": "证据镜",
  "evidence.subtitle": "Evidence Lens",
  "evidence.dimension.feasibility": "可行性",
  "evidence.dimension.originality": "原创性",
  "evidence.dimension.demo_power": "演示力",
  "evidence.dimension.technical_depth": "技术深度",
  "evidence.dimension.clarity": "讲解清晰",
  "evidence.dimension.risk_control": "风险控制",
  "evidence.chain_title": "证据链",
  "evidence.state.full": "完整证据链已就绪",
  "evidence.state.linked": "仅有关联证据，无完整分解",
  "evidence.state.insufficient": "当前演示证据不足，无法进入证据镜",
  "evidence.event_summary": "事件摘要",
  "evidence.attack_signal": "攻击信号",
  "evidence.defense_verdict": "防守裁决",
  "evidence.verified_payload": "已验证载荷",
  "evidence.recorded": "证据已记录在本场战斗链中。",
  "evidence.no_payload": "没有附加载荷。",
  "evidence.close": "关闭证据镜",
  "evidence.score_breakdown": "六维评分明细",
  "evidence.chain_verified": "从测试失败到修复验证",
  "evidence.insufficient_note": "本场尚未产出可验证的评分分解与事件链。",
  "evidence.chain.test": "测试结果",
  "evidence.chain.attack": "攻击信号",
  "evidence.chain.defense": "防守裁决",
  "evidence.chain.patch": "修复补丁",

  // -------------------------------------------------------------------------
  // Artifact Viewer Modal（设计稿 05）
  // -------------------------------------------------------------------------
  "artifact.title": "作品查看",
  "artifact.subtitle": "Artifact Viewer",
  "artifact.tab.versions": "版本对比",
  "artifact.tab.patch": "补丁差异",
  "artifact.tab.tests": "测试结果",
  "artifact.tab.evidence": "关联证据",
  "artifact.trigger": "作品",
  "artifact.close": "关闭作品查看",
  "artifact.team_prefix": "参赛作品",
  "artifact.empty.versions": "版本对比内容将在下一阶段接入",
  "artifact.empty.patch": "补丁差异内容将在下一阶段接入",
  "artifact.empty.tests": "测试结果内容将在下一阶段接入",
  "artifact.empty.evidence": "关联证据内容将在下一阶段接入",
  "artifact.version.v1": "v1 · 初版",
  "artifact.version.v2": "v2 · 修复版",
  "artifact.version.current": "当前版本",
  "artifact.version.evidence_prefix": "来源事件",
  "artifact.versions.compare_label": "作品版本并排对比",
  "artifact.mini.badge": "AI",
  "artifact.mini.title": "AI 学习助手",
  "artifact.mini.subtitle": "90 秒生成专属练习",
  "artifact.mini.difficulty.label": "选择难度",
  "artifact.mini.difficulty.easy": "简单",
  "artifact.mini.difficulty.medium": "中等",
  "artifact.mini.difficulty.hard": "难",
  "artifact.mini.count.label": "题目数量",
  "artifact.mini.generate": "生成题目",
  "artifact.mini.difficulty.result_prefix": "难度",
  "artifact.mini.generated_prefix": "已生成",
  "artifact.mini.generated_suffix": "道题目",
  "artifact.mini.question.1": "识别需求中的核心约束",
  "artifact.mini.question.2": "选择最稳健的实现路径",
  "artifact.mini.question.3": "解释答案并关联知识点",
  "artifact.mini.local_only": "本地交互演示 · 不会发起外部请求",
  "artifact.test.id": "测试 ID",
  "artifact.test.name": "用例名",
  "artifact.test.input": "输入",
  "artifact.test.expected": "期望",
  "artifact.test.actual": "实际",
  "artifact.test.result": "结果",
  "artifact.test.pass": "通过",
  "artifact.test.fail": "未通过",
  "artifact.test.unknown": "fixture 未记录",
  "artifact.tests.table_label": "作品测试结果",
  "artifact.patch.before": "v1 删除内容",
  "artifact.patch.after": "v2 添加内容",
  "artifact.test.022.input": "Chrome / Safari 16.4",
  "artifact.test.032.input": "Chrome / Safari 17",
  "artifact.test.052.input": "Safari 16.4",
  "artifact.test.expected.share_card": "均可生成分享卡",
  "artifact.test.022.actual": "Chrome 通过 / Safari 16.4 失败",
  "artifact.test.032.actual": "Chrome 与 Safari 17 均通过",
  "artifact.test.052.expected": "使用 SVG 降级路径",
  "artifact.test.052.actual": "SVG 降级路径通过",
  "artifact.evidence.verified": "已验证关联事件",
  "artifact.evidence.recorded": "记录于 BA-2026-0024 事件存储",
  "artifact.evidence.jump": "定位事件",
  "artifact.degraded.title": "实时演示证据不完整",
  "artifact.degraded.body": "当前实时运行未产出可查看的作品版本对比，请返回观看已验证演示以获得完整证据链。",
  "artifact.degraded.cta": "返回已验证演示",
  "artifact.degraded.eyebrow": "LIVE AI · EVIDENCE INCOMPLETE",
  "artifact.degraded.live_status": "实时智能体运行中",
  "artifact.degraded.missing_status": "作品载荷缺失",
  "artifact.degraded.verified_status": "已验证演示可用",
  "artifact.degraded.note": "不会把固定 fixture 冒充为本次实时运行的证据",

  // -------------------------------------------------------------------------
  // Champion 页（设计稿 06 + 07）
  // -------------------------------------------------------------------------
  "champion.reveal.title": "冠军",
  "champion.reveal.score_suffix": "/100",
  "champion.reveal.share_evidence": "分享证据链",
  "champion.reveal.view_replay": "查看战斗回放",
  "champion.reveal.verified": "冠军已验证",
  "champion.reveal.runner_up": "第二名",
  "champion.reveal.third_place": "第三名",
  "champion.reveal.open": "进入冠军揭晓",
  "champion.passport.title": "团队护照快照",
  "champion.passport.subtitle": "Team Passport Snapshot",
  "champion.passport.strengths": "优势",
  "champion.passport.weaknesses": "弱点",
  "champion.passport.improvements": "改进建议",
  "champion.passport.journey": "战斗旅程",
  "champion.passport.verified": "已验证护照快照",
  "champion.passport.champion_team": "冠军团队",
  "champion.passport.six_scores": "六维评分",
  "champion.passport.journey_hint": "点击节点返回本场战斗证据",
  "champion.mini.title": "本场战斗尚未产生完整护照快照",
  "champion.mini.body": "实时演示未完成到裁决阶段，请继续观看或返回观看已验证演示的完整护照。",
  "champion.mini.back_to_arena": "返回 Live Arena",
  "champion.mini.watch_verified": "观看已验证演示",

  // -------------------------------------------------------------------------
  // 错误 & 边界
  // -------------------------------------------------------------------------
  "error.generic": "出了点问题，请稍后重试",
  "error.rate_limited": "操作过于频繁，请稍后再试",
  "error.feature_disabled": "实时 AI 竞技当前未开启，请观看已验证演示",
  "error.battle_not_found": "找不到该战斗",
} as const;

/**
 * Live Arena 组件所需的结构化文案。
 * 新页面优先使用上方扁平 key；该结构仅用于已交付的 A 线组件平滑接入统一文案源。
 */
export const liveArenaZh = {
  common: {
    replay: "回放",
    result: "结果",
    live: "直播",
    pause: "暂停",
    resume: "继续",
  },
  arena: {
    hp: zh["arena.agent_card.proof_label"],
    battle: zh["arena.header.battle_label"],
    rules: zh["arena.header.rules"],
    share: zh["arena.header.share"],
    idea: "创意：帮助大学生准备考试的 AI 学习助手",
    currentAttack: zh["arena.current_attack.title"],
    attacker: zh["arena.current_attack.attacker"],
    target: zh["arena.current_attack.target"],
    evidenceChain: zh["arena.evidence_chain.title"],
    eventStream: zh["arena.event_stream.title"],
    roles: [zh["arena.agent_card.build"], zh["arena.agent_card.review"], zh["arena.agent_card.defend"]] as const,
    eventType: {
      proposal_created: zh["arena.event.proposal_created"],
      attack_created: zh["arena.event.attack_created"],
      defense_created: zh["arena.event.defense_created"],
      artifact_created: zh["arena.event.artifact_created"],
      score_created: zh["arena.event.score_created"],
      champion_selected: zh["arena.event.champion_selected"],
    } as Record<string, string>,
    standingBy: "待命中",
    waitingSignal: "等待回合信号…",
    typing: "生成中…",
    evidenceLocked: "证据已锁定",
    accepted: "已接受",
    rejected: "已驳回",
    roundOf: (index: number, count: number) => `第 ${index} / ${count} 回合`,
  },
  roundBanner: {
    segments: [
      zh["round.stage.brief"],
      zh["round.stage.proposal"],
      zh["round.stage.build"],
      zh["round.stage.attack"],
      zh["round.stage.defense"],
      zh["round.stage.verify"],
      zh["round.stage.judgment"],
    ] as const,
    titleByRound: {
      proposal_round: "提案回合",
      cross_attack_round: "交叉攻击回合",
      defense_round: "防守回合",
      scoring_round: "评分裁决回合",
      champion_round: "冠军揭晓",
    } as Record<string, string>,
    degraded: "证据不足",
  },
  runtimeMode: {
    verified_replay: { label: "已验证演示", sub: "Verified Replay" },
    live_runtime: { label: "实时 AI 竞技", sub: "Live Runtime" },
    demo_fallback: { label: "演示兜底", sub: "Demo Fallback" },
  } as Record<string, { label: string; sub: string }>,
  host: {
    name: "解说 AI",
    label: zh["arena.host.title"],
    standby: "竞技场系统待命中。",
    proposal: "三支队伍同时落笔，每一句主张都会成为可回放的证据。",
    scoring: "评委正在把分数绑定到已记录的证据链上。",
    attack: (title: string) => `${title}。目标方现在必须正面回应这条证据。`,
    champion: (title: string) => `${title}。声誉已依据本场证据更新。`,
  },
  fatal: {
    critical: "致命攻击",
    criticalEn: "Critical Attack Detected",
    attacker: zh["arena.fatal.attacker_side"],
    target: zh["arena.fatal.defender_side"],
    attackEvent: "致命载荷",
    before: "命中前",
    after: "命中后",
    proofDamage: zh["arena.fatal.proof_delta_label"],
    viewEvidence: zh["arena.agent_card.view_evidence"],
    dismiss: zh["common.close"],
  },
} as const;

export type ZhKey = keyof typeof zh;

/** Lookup with English fallback to key itself (for missing entries during migration). */
export function t(key: ZhKey): string {
  return zh[key] ?? key;
}
