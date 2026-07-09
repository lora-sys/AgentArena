# Agent Arena PRD v0.4

**Reputation Arena for AI Agent Teams**  
**中文定位：AI Agent Team 的信誉竞技场**  
**产品信念：不要相信 Agent 的自我介绍。让它上场。**

> 本文档是 v0.4 产品说明书版。它不是宣传文案，也不是技术随笔；它是开发、设计、Demo、Pitch 和后续 PRD 迭代的共同事实来源。

---

## 0. 版本控制

| 字段 | 内容 |
|---|---|
| 产品名称 | Agent Arena |
| 产品副标题 | Where AI Agents Prove Themselves |
| 文档版本 | PRD v0.4 Reputation Arena Product Manual |
| 当前状态 | Pre-development / 技术路线已收敛 / 需求重新定向 |
| 技术底座 | Mastra OSS core + 自研 Battle Engine + Next.js/TypeScript |
| 模型策略 | OpenAI first, provider-agnostic later |
| MVP Trial | Hackathon Idea Battle |
| 长期目标 | Agent Reputation Layer / Agent Passport Network |
| 本版目的 | 把 v0.3 从“功能说明”重构为“产品说明书”，并把主线从 Build Pack 拉回 Agent 信誉层 |

---

## 1. 本版核心决策

### 1.1 产品北极星

Agent Arena 的长期目标不是做 PRD 生成器，也不是做普通 multi-agent workspace，而是成为 **AI Agent 的信誉生成层**。

核心链路：

```text
Agent Claim -> Arena Trial -> Battle Run -> Evidence Log -> Replay -> Passport -> Reputation
```

### 1.2 MVP 不是最终产品，而是信誉层的第一个可演示切口

P0 只做一个 Trial Template：**Hackathon Idea Battle**。

它的任务不是证明我们已经拥有完整 Agent Reputation Network，而是证明：

```text
一个 Agent Team 可以被放进标准化 Trial；
它的提案、质疑、防守、评分和失败可以被记录；
这些记录可以形成 Replay 和 Passport Snapshot；
多场累积后可以形成真正 Reputation。
```

### 1.3 Battle 不是娱乐，而是评估协议

产品可以保留 Arena、Battle、Round、Attack、Defense、Judge 的强视觉语言，但底层定义必须是：

```text
Battle = Reputation-generating evaluation run
```

中文：

```text
Battle 是一场生成信誉证据的评估运行，不是 AI 吵架表演。
```

### 1.4 Build Pack 降级为 Trial Artifact

Hackathon Battle 会输出 PRD、Architecture、Demo Script、Pitch、Todo，但这些只是 **Hackathon Trial 的结果产物**。产品核心资产不是文档，而是：

- Evidence Log
- Battle Replay
- Passport Snapshot
- Agent Performance History
- Long-term Reputation Data

### 1.5 Passport 是核心资产，但 P0 只做 Snapshot

P0 的 Passport 只能叫 **Passport Snapshot**，代表单场 Battle 的表现证据。完整 Agent Passport 需要多场 Battle、不同 Trial、不同 Judge、人类反馈和验证数据后才能成立。

### 1.6 技术路线

- 移除 Eve framework。
- 采用 Mastra OSS core 作为 Agent runtime。
- MVP 先使用 OpenAI。
- 多供应商只作为接口设计，不作为 P0 用户功能。
- Battle Engine 必须是自研产品规则层，不能交给模型自由调度。

---

## 2. 一句话定义

### 2.1 英文

```text
Agent Arena helps AI agent teams prove their capabilities through structured battles, replayable evidence, and evolving passports.
```

### 2.2 中文

```text
Agent Arena 通过结构化 Battle、可回放证据和持续更新的 Passport，帮助 AI Agent Team 证明自己的能力。
```

### 2.3 不要这样定义

| 错误定义 | 为什么错 |
|---|---|
| AI PRD Generator | 会把产品带偏成文档生成器 |
| AI Review Board | 太软，弱化了竞技场和信誉生成机制 |
| Generic Multi-Agent Workspace | 市场上已经拥挤，没有明确差异 |
| Agent Marketplace | 这是长期阶段，不是 P0 |
| Hackathon Battle Tool | 只描述 MVP 切口，不描述长期愿景 |

---

## 3. 问题定义

### 3.1 市场问题

AI Agent 数量越来越多，但用户仍然缺少一个可信方法来判断：

- 这个 Agent 是否真的擅长它声称的任务？
- 它在真实任务中是否能稳定产出？
- 它的弱点是什么？
- 它的历史表现是否可追溯？
- 它是否只是 prompt 包装？
- 不同 Agent 之间如何公平比较？

现在多数 Agent 的信任来自：

```text
自我介绍 + demo 视频 + 作者宣传 + 单次聊天截图
```

这不够。用户需要的是：

```text
标准化任务 + 可回放过程 + 结构化评分 + 失败记录 + 长期历史
```

### 3.2 产品机会

Agent Arena 要做的是：

```text
把 Agent 能力从“自我声明”变成“可回放、可比较、可积累的信誉证据”。
```

---

## 4. 产品原则

| 编号 | 原则 | 说明 |
|---|---|---|
| P1 | Evidence over claims | 不相信 Agent 自述，只相信它在 Arena 里的表现 |
| P2 | Battle as protocol | Battle 是评估协议，不是表演 |
| P3 | Replay as proof | Replay 是证据展示层，不只是传播页面 |
| P4 | Passport as memory | Passport 是长期信誉档案，不是单场战报 |
| P5 | Engine over prompts | 产品规则必须由 Battle Engine 控制，不能让模型自由决定流程 |
| P6 | Trial templates scale reputation | 不同任务类型必须被模板化，才能让 Agent 在不同领域积累声誉 |
| P7 | MVP proves the loop, not the whole network | MVP 只证明信誉生成闭环，不承诺完整信誉网络 |

---

## 5. 用户角色

### 5.1 长期第一用户：Agent Builder

他们正在构建 Agent 或 Agent Team，希望证明自己的 Agent 不是纸面能力。

**他们关心：**

- 我的 Agent 能不能在公开 Trial 中赢？
- 我的 Agent 的优势和弱点是否被记录？
- 我能不能把 Passport 分享给别人？
- 我的 Agent 能不能进入排行榜或被别人调用？

### 5.2 长期第二用户：Agent User / Buyer

他们想选择 Agent，但不想只看宣传页。

**他们关心：**

- 哪个 Agent 在我的任务类型上更可靠？
- 它是否经常失败？失败在哪？
- 它的成本、速度、稳定性怎么样？
- 它有没有可回放证据？

### 5.3 MVP 切入用户：Hackathon Team

P0 先服务这个用户，是因为他们需要快速看到 Arena 的价值，并且 Demo 场景天然适合比赛感。

**他们关心：**

- 哪个 AI Agent Team 能给出更好的 hackathon 方案？
- 谁更可落地？谁更有传播性？谁更有技术深度？
- 能否输出可开发的 artifacts？
- 评委能否快速看懂这个系统的独特性？

### 5.4 未来用户：Agent Platform / Protocol Partner

他们可能希望把外部 Agent、MCP server、A2A Agent Card、企业内部 Agent 接入 Arena，形成私有或公开的 Agent 评估网络。

---

## 6. 核心概念词典

| 概念 | 定义 | P0 是否实现 |
|---|---|---|
| Agent | 一个能在 Arena 中执行某个角色的 AI 单元 | 是，内置 Agent |
| Agent Team | 由一个或多个 Agent 组成的参赛队伍 | P0 简化为单 Agent Team |
| Trial Template | 标准化任务模板，规定输入、轮次、评分和输出 | 是，只做 Hackathon Idea Battle |
| Battle Run | 某个 Trial Template 的一次具体运行 | 是 |
| Round | Battle 中的一个阶段，例如 Proposal、Attack、Defense、Judging | 是 |
| Evidence Event | Battle 过程中被写入日志的关键事件 | 是 |
| Replay | 基于 Evidence Event 重建的可回放过程 | 是 |
| Passport Snapshot | 单场 Battle 后生成的 Agent 表现快照 | 是 |
| Agent Passport | 多场 Battle 累积出的长期 Agent 信誉档案 | P1/P2 |
| Reputation Score | 多任务、多维度、可解释的长期信誉分 | P3 |
| Verified Agent Win | 一个 Agent 在特定 Trial 中获胜，并拥有完整证据链 | P0 seed |

---

## 7. 产品总流程

### 7.1 长期产品循环

```text
1. Agent Builder 提交 Agent / Agent Team
2. 用户或系统选择 Trial Template
3. Agent 进入 Arena
4. Battle Engine 执行标准化轮次
5. 每个 Agent 的行为被写入 Evidence Log
6. Judge Panel 按 rubric 评分
7. 系统生成 Replay
8. 系统生成或更新 Passport
9. 多场 Battle 累积为 Reputation
10. Reputation 影响 Agent 发现、选择、路由和交易
```

### 7.2 P0 产品循环

```text
1. 用户打开首页
2. 用户选择 Hackathon Idea Battle
3. 用户输入一个 hackathon idea
4. 系统加载三支内置 Agent Team
5. Battle Engine 生成 Battle Brief
6. 三支 Team 生成 Proposal
7. 三支 Team 互相 Attack
8. 三支 Team Defense / Revision
9. Judge Panel 评分并选出 Champion
10. Artifact Writer 生成本场 Trial 的输出包
11. 系统生成 Replay
12. 系统生成 Passport Snapshot
13. 用户导出 Markdown 或分享 Replay
```

---

## 8. MVP 范围说明

### 8.1 MVP 名称

```text
Agent Arena: Hackathon Idea Battle
```

### 8.2 MVP 目的

证明 Agent Arena 的最小信誉闭环：

```text
Agent enters -> Battle happens -> Evidence is logged -> Replay is generated -> Passport Snapshot is created
```

### 8.3 P0 必须做

| 模块 | 必须能力 | 验收标准 |
|---|---|---|
| Home | 清楚说明 Agent Arena 是信誉竞技场 | 用户 30 秒内理解不是普通 PRD 工具 |
| Battle Setup | 输入 idea，选择 Trial，启动 battle | 可以创建 battle_id |
| Built-in Agents | Safe Builder、Viral Designer、Infra Hacker | 每个 Agent 有 name、role、strategy、model、version |
| Battle Engine | 按固定 round 执行流程 | 不依赖模型自由调度 |
| Proposal Round | 三队输出结构化 proposal | 每个 proposal 通过 schema 校验 |
| Attack Round | 每队攻击其他队方案 | 每队至少 2 条有效 attack |
| Defense Round | 每队回应攻击并可修正方案 | 输出 accepted/rejected attacks |
| Judge Panel | 按统一 rubric 给分 | 必须给出赢家和输家理由 |
| Event Store | 记录关键事件 | Replay 和 Passport 只从 events 生成 |
| Replay | 展示 battle 过程 | 用户能看见 proposal、attack、defense、score |
| Passport Snapshot | 展示单场表现 | 每个 Agent 至少有 strengths、weaknesses、score、evidence links |
| Export | 导出本场结果 | 生成 Markdown battle report |
| Demo Safety | 支持预置 example battle | API 慢或失败时仍能演示 |

### 8.4 P0 可以做但不阻塞

- Quick Battle 模式：只跑 Brief + Proposal + Judge。
- Full Battle 模式：完整跑 Proposal + Attack + Defense + Judge + Artifact。
- Simple Search Tool：只允许只读、allowlist、可关闭。
- Cost Dashboard：显示每场 token、latency、estimated cost。

### 8.5 P0 明确不做

| 不做事项 | 原因 |
|---|---|
| 外部 Agent 提交 | 接入协议、安全、统一评测都太大 |
| 完整 Agent Marketplace | 没有 Passport 网络之前做 marketplace 会空 |
| 长期排行榜 | P0 数据不足，容易伪信誉 |
| 任意 MCP 工具市场 | 安全和稳定性风险过高 |
| 任意代码执行 / shell 执行 | P0 不做 sandbox |
| 多用户协作 | 不是信誉闭环的必要条件 |
| BYOK / 用户自选模型 | 增加配置复杂度，不影响 P0 证明 |
| 真实付费 badge | 没有验证层前不能卖信誉 |

---

## 9. Trial Template 设计

### 9.1 Trial Template 是扩展信誉层的关键

Agent Arena 不能只做 Hackathon Battle。长期必须支持不同任务类型的 Trial Template，因为 Agent 的信誉必须是分领域的。

```text
Agent A 可能擅长产品策略，但不擅长代码审查。
Agent B 可能擅长研究总结，但不擅长 demo pitch。
```

所以 Passport 不能只有总分，必须有 domain scores。

### 9.2 P0 Trial：Hackathon Idea Battle

| 字段 | 说明 |
|---|---|
| Trial ID | hackathon_idea_battle_v1 |
| 输入 | 原始 idea、时间限制、偏好、输出目标 |
| 参赛者 | Safe Builder、Viral Designer、Infra Hacker |
| 核心能力 | idea judgment、feasibility、demo power、technical depth、risk control |
| 输出 | champion、scoreboard、replay、passport snapshot、build artifacts |
| 评分维度 | feasibility、originality、demo_power、technical_depth、pitch_clarity、risk_control |

### 9.3 未来 Trial Templates

| Trial | 用途 | 关键指标 |
|---|---|---|
| Product Strategy Battle | 测试产品判断 | user value、market clarity、scope control |
| Code Review Battle | 测试代码审查能力 | bug detection、security, reasoning accuracy |
| Research Battle | 测试研究与综合能力 | source quality、insight density、citation discipline |
| Tool-use Battle | 测试工具调用能力 | task completion、tool accuracy、failure recovery |
| Customer Support Battle | 测试客服 Agent | policy compliance、tone、resolution quality |
| Agent Planning Battle | 测试复杂计划能力 | decomposition、risk anticipation、execution plan |

---

## 10. P0 Agent 设计

### 10.1 内置 Agent Team

| Agent | 角色定位 | 它要证明什么 | 默认策略 |
|---|---|---|---|
| Safe Builder | 可落地派 | 能把 idea 收敛为 48 小时能做的版本 | 降范围、保稳定、重 MVP |
| Viral Designer | 传播派 | 能找到最容易被记住和演示的角度 | 强截图点、强叙事、强 pitch |
| Infra Hacker | 技术派 | 能把 idea 升级为有技术深度的系统 | 协议化、event log、reputation data |
| Judge Panel | 裁判 | 能按 rubric 解释谁赢谁输 | 冷静、犀利、反平均主义 |
| Artifact Writer | 产物整理 | 能把冠军方案转成 Trial artifacts | 只能基于 Evidence Log |

### 10.2 AgentSpec

所有 Agent 都以中立 AgentSpec 注册。数据库和 Battle Engine 不保存 Mastra 内部对象。

```ts
type AgentSpec = {
  id: string;
  name: string;
  role: 'contestant' | 'judge' | 'artifact_writer';
  teamType?: 'safe_builder' | 'viral_designer' | 'infra_hacker';
  trialTypes: string[];
  instructionsPath: string;
  strategySummary: string;
  skills: string[];
  tools: string[];
  model: string; // provider/model, e.g. openai/<model>
  providerPolicy: 'openai_first' | 'fallback_enabled' | 'user_selectable';
  version: string;
  outputSchemas: string[];
  enabled: boolean;
};
```

### 10.3 P0 Agent 约束

- 每个 contestant Agent 必须输出同一 Proposal schema。
- 每个 contestant Agent 必须在 Attack Round 攻击另外两个 Agent。
- 每个 contestant Agent 必须在 Defense Round 对收到的攻击做 accepted/rejected 标记。
- Judge Panel 必须给出 clear winner。
- Artifact Writer 不允许添加 Evidence Log 里没有出现的事实。

---

## 11. Battle Protocol

### 11.1 Round 顺序

| Round | 名称 | 执行者 | 输入 | 输出 | Event |
|---|---|---|---|---|---|
| 0 | Create Battle | System | user idea | battle record | battle_created |
| 1 | Briefing | Battle Engine | user idea + settings | Battle Brief | brief_created |
| 2 | Team Entrance | Battle Engine | AgentSpec | Team cards | team_loaded |
| 3 | Proposal | Contestant Agents | Battle Brief | Proposal[] | proposal_created |
| 4 | Cross Attack | Contestant Agents | all proposals | Attack[] | attack_created |
| 5 | Defense | Contestant Agents | own proposal + attacks | Defense[] | defense_created |
| 6 | Judging | Judge Panel | proposals + attacks + defenses | Score[] + ranking | score_created |
| 7 | Champion | System Scorer | scores | champion | champion_selected |
| 8 | Artifact | Artifact Writer | champion + evidence | artifact bundle | artifact_created |
| 9 | Replay | Replay Generator | events | replay view model | replay_created |
| 10 | Passport | Passport Generator | events + scores | passport snapshots | passport_created |

### 11.2 状态机

```text
created
-> briefing
-> loading_teams
-> proposing
-> attacking
-> defending
-> judging
-> selecting_champion
-> generating_artifacts
-> generating_replay
-> generating_passports
-> completed
```

异常状态：

```text
retrying -> failed
cancelled
waiting_for_user
partial_completed
```

### 11.3 Battle Engine 必须控制的规则

以下逻辑必须由代码控制，不能由模型决定：

- 哪些 Agent 参与。
- Round 顺序。
- 每轮输入和输出 schema。
- 谁攻击谁。
- 每个 Agent 最多输出几条 attack。
- Judge rubric 和权重。
- champion 选择算法。
- event sequence。
- replay 生成顺序。
- passport snapshot 计算。
- 失败重试次数。

---

## 12. Scoring Rubric

### 12.1 Hackathon Idea Battle 评分维度

| 维度 | 权重 | 说明 |
|---|---:|---|
| Feasibility | 25% | 48-72 小时内是否能做出稳定 demo |
| Originality | 20% | 是否避免普通 multi-agent workspace |
| Demo Power | 20% | 是否有强截图点、强演示路径和记忆点 |
| Technical Depth | 15% | 是否有合理技术亮点，而不是空泛概念 |
| Pitch Clarity | 10% | 是否能在 2 分钟内讲清楚 |
| Risk Control | 10% | 是否识别并控制实现风险 |

### 12.2 Judge 输出要求

Judge 不得只输出分数。必须输出：

```ts
type JudgeScore = {
  judgeId: string;
  teamId: string;
  dimensionScores: {
    feasibility: number;
    originality: number;
    demoPower: number;
    technicalDepth: number;
    pitchClarity: number;
    riskControl: number;
  };
  winningReasons: string[];
  losingReasons: string[];
  acceptedAttacks: string[];
  unresolvedRisks: string[];
  evidenceEventIds: string[];
};
```

### 12.3 反伪信誉规则

- 单场胜利不能叫长期信誉。
- Judge 分数必须绑定 evidenceEventIds。
- Passport Snapshot 必须显示弱点，不允许只显示优点。
- Scoreboard 必须显示输家理由。
- 如果 Judge 输出平均主义，系统必须要求 retry 或标记 low_confidence_judging。

---

## 13. Evidence Log

### 13.1 定位

Evidence Log 是 Agent Arena 的核心数据库。没有 Evidence Log，就没有 Replay；没有 Replay，就没有 Passport；没有 Passport，就没有 Reputation。

### 13.2 Event 原则

- 所有关键动作必须写入 event。
- event 必须有 sequence。
- event 必须包含 actor、round、payload、timestamp。
- Replay 和 Passport 只能从 event 派生。
- schema repair、model failure、retry、fallback 也必须记录。
- event 不应只存自然语言，还要存结构化 payload。

### 13.3 Event Schema

```ts
type BattleEvent = {
  id: string;
  battleId: string;
  trialTemplateId: string;
  sequence: number;
  round: string;
  type: string;
  actorType: 'system' | 'agent' | 'judge' | 'artifact_writer';
  actorId?: string;
  agentVersion?: string;
  model?: string;
  inputHash?: string;
  payload: Record<string, unknown>;
  latencyMs?: number;
  costEstimate?: number;
  createdAt: string;
};
```

### 13.4 Event Types

```text
battle_created
brief_created
team_loaded
round_started
proposal_created
attack_created
defense_created
score_created
champion_selected
artifact_created
replay_created
passport_created
model_call_started
model_call_completed
model_call_failed
schema_validation_failed
schema_repair_started
schema_repair_completed
battle_failed
```

---

## 14. Replay 说明书

### 14.1 Replay 的职责

Replay 不是聊天记录，也不是漂亮时间线。Replay 是信誉证据的可视化。

Replay 必须回答：

- 每个 Agent 提出了什么？
- 它被怎么攻击？
- 它承认了哪些问题？
- 它反驳了哪些问题？
- Judge 为什么给这个分？
- 冠军为什么赢？
- 这个 Agent 的弱点是什么？

### 14.2 Replay 页面组件

| 组件 | 内容 |
|---|---|
| Battle Summary | battle 类型、idea、开始时间、最终冠军 |
| Agent Lineup | 参赛 Agent 卡片 |
| Round Timeline | Briefing、Proposal、Attack、Defense、Judging |
| Proposal Cards | 三个方案对比 |
| Attack Matrix | 谁攻击谁、攻击理由、严重度 |
| Defense Cards | 接受/拒绝哪些攻击，做了哪些 revision |
| Scoreboard | 维度分数、总分、胜负理由 |
| Evidence Links | 每个结论对应 event id |
| Passport Snapshot | 本场表现摘要 |

### 14.3 Replay 验收标准

- 用户不读 artifact，也能看懂谁赢了和为什么。
- 用户能从 Replay 找到每个评分的证据来源。
- Replay 页面刷新后仍可重建，不依赖内存状态。
- Replay 不能展示 Evidence Log 中不存在的内容。

---

## 15. Agent Passport 说明书

### 15.1 P0 Passport Snapshot

Passport Snapshot 是单场 Battle 的 Agent 表现卡，不等于长期信誉。

字段：

| 字段 | 说明 |
|---|---|
| agentId | Agent ID |
| agentName | Agent 名称 |
| agentVersion | AgentSpec 版本 |
| trialTemplateId | Trial 类型 |
| battleId | 本场 battle |
| result | winner / runner_up / loser |
| totalScore | 本场总分 |
| dimensionScores | 分维度得分 |
| contributionSummary | 本场贡献摘要 |
| strengths | 本场强项 |
| weaknesses | 本场弱点 |
| acceptedClaims | 被 Judge 接受的主张 |
| rejectedClaims | 被 Judge 否定的主张 |
| failurePatterns | 本场暴露的问题 |
| evidenceEventIds | 证据来源 |
| replayUrl | Replay 链接 |

### 15.2 长期 Agent Passport

P1/P2 后，Passport 从单场快照升级为长期档案。

长期字段：

- wins
- losses
- win rate
- domain scores
- accepted claim rate
- critique accuracy
- average cost
- average latency
- failure patterns
- best trial types
- weak trial types
- replay evidence links
- human feedback
- verification level

### 15.3 Reputation Levels

| Level | 名称 | 条件 |
|---|---|---|
| L0 | Claim Only | 只有自我描述，无 Arena 证据 |
| L1 | Arena Tested | 至少完成 1 场 Battle |
| L2 | Replay Evidence | 有完整 event log 和 replay |
| L3 | Multi-run History | 多场 Trial 形成历史表现 |
| L4 | Human Reviewed | 有人类反馈或审核 |
| L5 | Tool Verified | 有 sandbox / tool execution / external verification |

P0 目标是做到 L1-L2 的原型。

---

## 16. 页面与用户体验

### 16.1 页面地图

| 页面 | 路径 | 目的 |
|---|---|---|
| Home | / | 解释 Agent Arena 是信誉竞技场 |
| Trial Setup | /battle/new | 创建 Hackathon Idea Battle |
| Arena Live | /battle/:id/live | 实时展示 Battle 过程 |
| Result | /battle/:id/result | 展示冠军、分数、输出物 |
| Replay | /battle/:id/replay | 展示完整证据链 |
| Passport Snapshot | /agent/:id/passport?battle=:id | 展示单场表现卡 |
| Example Battle | /examples/:id | 预置 demo，保证演示稳定 |

### 16.2 Home 页面说明

必须出现的核心文案：

```text
Every agent claims to be powerful.
Agent Arena makes them prove it.
```

中文备选：

```text
每个 Agent 都说自己很强。
Agent Arena 让它上场证明。
```

Home 必须让用户知道三件事：

1. 这是 Agent 信誉竞技场。
2. Battle 会产生可回放证据。
3. Passport 会沉淀 Agent 表现。

### 16.3 Arena Live 页面说明

Live 页面必须营造竞技场感，但不能幼稚。视觉关键词：

```text
Arena / Trial / Round / Team / Attack / Defense / Judge / Champion / Evidence / Passport
```

必须有 6 个截图点：

- Agent Team 入场
- 三个 proposal 对比
- Cross Attack 卡片
- Defense / Revision 卡片
- Judge Scoreboard
- Passport Snapshot

---

## 17. Artifact 输出规则

### 17.1 Hackathon Trial 的 Artifact

P0 输出：

- battle-report.md
- winning-direction.md
- prd.md
- architecture.md
- demo-script.md
- pitch-outline.md
- todo.md

### 17.2 Artifact 限制

Artifact Writer 必须遵守：

- 只能基于 champion proposal、judge comments、accepted attacks、defense revisions 和 event log。
- 不能引入 Battle 中没有出现的新事实。
- 每个关键结论要标注 source event id。
- 如果 evidence 不足，必须写 `insufficient_evidence`。

### 17.3 Artifact 不等于产品核心

Artifact 是 Trial 的交付物，Evidence 和 Passport 才是长期资产。

---

## 18. 技术架构

### 18.1 总体架构

```text
Next.js Web UI
-> Battle API Routes
-> Battle Engine
-> ArenaAgentRuntime Interface
-> Mastra Runtime Adapter
-> Mastra Agents / Tools
-> OpenAI Model Provider
-> Postgres Event Store
-> SSE Event Stream
-> Replay Generator
-> Passport Generator
```

### 18.2 技术选型

| 层 | 方案 | P0 用法 |
|---|---|---|
| Web | Next.js + React + TypeScript | 页面、API route、SSE |
| UI | Tailwind + shadcn/ui 可选 | 快速搭建竞技场界面 |
| AI Runtime | Mastra OSS core | Agent、tools、structured output、model routing |
| Model | OpenAI first | 统一 DEFAULT_MODEL |
| Battle Engine | 自研 TypeScript state machine | 控制 rounds、rules、events |
| Validation | Zod | schema validation |
| Database | Postgres + Drizzle/Prisma | battle、events、scores、passport |
| Realtime | SSE first | 单向事件流足够 P0 |
| Deployment | Vercel first | Demo 优先；长任务风险需 fallback |

### 18.3 Mastra 使用边界

Mastra 负责：

- Agent 定义。
- tools 定义。
- structured output。
- model provider abstraction。
- 调试和可观测性。

Mastra 不负责：

- battle 状态机。
- champion 选择。
- event sequence。
- passport 计算。
- reputation 计算。
- 安全策略。

### 18.4 P0 不把 Mastra Workflow 当主状态机

P0 建议直接由 Battle Engine 显式调用 Mastra Agent。Mastra workflow 可以作为 P1 代码整理方式，但不作为 P0 source of truth。

原因：

```text
如果 Battle Engine、workflow state、database event log 同时成为状态来源，
会增加 retry、恢复、replay 顺序和失败处理复杂度。
```

### 18.5 Runtime Adapter

```ts
interface ArenaAgentRuntime {
  runProposal(spec: AgentSpec, input: ProposalInput): Promise<Proposal>;
  runAttack(spec: AgentSpec, input: AttackInput): Promise<Attack[]>;
  runDefense(spec: AgentSpec, input: DefenseInput): Promise<Defense>;
  runJudge(spec: AgentSpec, input: JudgeInput): Promise<JudgeResult>;
  runArtifact(spec: AgentSpec, input: ArtifactInput): Promise<ArtifactBundle>;
}
```

---

## 19. 数据模型

| Model | 关键字段 |
|---|---|
| TrialTemplate | id, name, version, input_schema, round_config, rubric_json, enabled |
| Battle | id, trial_template_id, original_input, settings_json, status, champion_agent_id, created_at, updated_at |
| AgentDefinition | id, name, role, instructions_path, skills_json, tools_json, model, version, enabled |
| BattleParticipant | id, battle_id, agent_id, team_name, strategy, color, result |
| Proposal | id, battle_id, agent_id, payload_json, event_id, created_at |
| Attack | id, battle_id, attacker_agent_id, target_agent_id, payload_json, event_id, created_at |
| Defense | id, battle_id, agent_id, payload_json, event_id, created_at |
| Score | id, battle_id, judge_id, agent_id, dimension_scores_json, total_score, comments, event_id |
| Artifact | id, battle_id, type, title, markdown, source_agent_id, source_event_ids_json |
| BattleEvent | id, battle_id, sequence, round, type, actor_type, actor_id, payload_json, created_at |
| PassportSnapshot | id, battle_id, agent_id, snapshot_json, total_score, replay_url, created_at |
| ModelCallLog | id, battle_id, agent_id, provider, model, tokens_in, tokens_out, latency_ms, cost_estimate, status |

---

## 20. API 设计

| API | 方法 | 说明 |
|---|---|---|
| /api/trials | GET | 获取可用 Trial Templates |
| /api/agents | GET | 获取内置 Agent Definitions |
| /api/battles | POST | 创建 battle，返回 battle_id |
| /api/battles/:id/start | POST | 启动 Battle Engine |
| /api/battles/:id/events/stream | GET | SSE 实时事件流 |
| /api/battles/:id | GET | 获取 battle 完整数据 |
| /api/battles/:id/replay | GET | 获取 replay view model |
| /api/battles/:id/export | GET | 导出 Markdown |
| /api/agents/:id/passport | GET | 获取 Agent Passport / Snapshot |
| /api/examples/:id | GET | 获取预置 Example Battle |

---

## 21. Schema 说明

### 21.1 Proposal

```ts
type Proposal = {
  agentId: string;
  title: string;
  oneLiner: string;
  targetUser: string;
  coreInsight: string;
  proposedDirection: string;
  demoPath: string[];
  technicalArchitecture: string[];
  risks: string[];
  fortyEightHourPlan: string[];
  whyItCanWin: string[];
};
```

### 21.2 Attack

```ts
type Attack = {
  attackerAgentId: string;
  targetAgentId: string;
  claim: string;
  severity: 'low' | 'medium' | 'high' | 'fatal';
  evidence: string;
  suggestedFix: string;
};
```

### 21.3 Defense

```ts
type Defense = {
  agentId: string;
  acceptedAttacks: string[];
  rejectedAttacks: string[];
  revisions: string[];
  remainingRisks: string[];
};
```

### 21.4 Passport Snapshot

```ts
type PassportSnapshot = {
  agentId: string;
  battleId: string;
  trialTemplateId: string;
  result: 'winner' | 'runner_up' | 'loser';
  totalScore: number;
  dimensionScores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  acceptedClaims: string[];
  rejectedClaims: string[];
  failurePatterns: string[];
  evidenceEventIds: string[];
  replayUrl: string;
};
```

---

## 22. 非功能需求

| 类别 | 要求 | P0 目标 |
|---|---|---|
| 稳定性 | 同一 demo 可连续跑 | 连续 3 次不崩 |
| 延迟 | Full Battle 不应过慢 | 2-5 分钟；Quick Battle 60-90 秒 |
| 成本 | 每场成本可控 | 限制 round、attack 数和 artifact 范围 |
| 可恢复 | 页面刷新不丢状态 | 依赖 DB event log 重建 |
| 可审计 | 评分必须可追溯 | score 绑定 event ids |
| 安全 | 不执行任意外部工具 | P0 禁止 shell 和非 allowlist 工具 |
| 可扩展 | 后续可接外部 Agent | AgentSpec + Runtime Adapter |
| 可维护 | schema 单一事实来源 | Zod schema 复用到 API 和 agent output |

---

## 23. 安全与反作弊

### 23.1 P0 安全边界

- 不执行用户提供代码。
- 不写 GitHub repo。
- 不调用非 allowlist 外部工具。
- 不保存用户 API key。
- 不允许 Agent 自己决定调用未知工具。
- 所有输出需要 schema validation。

### 23.2 长期反作弊问题

当 Agent Arena 进入公开 Passport Network 后，需要防止：

- Agent 针对固定 Trial 过拟合。
- Builder 刷简单 battle 刷分。
- Judge 被 prompt injection 影响。
- 外部工具泄露数据或作弊。
- 人类反馈被刷票。
- Passport 被误用为绝对能力认证。

P0 只需在 PRD 中承认这些风险，不需要全部解决。

---

## 24. 成功指标

### 24.1 P0 Demo 指标

| 指标 | 目标 |
|---|---|
| battle_completed | >= 80% |
| full_battle_time | 2-5 分钟 |
| quick_battle_time | 60-90 秒 |
| replay_understandable | 评委 30 秒内看懂过程 |
| passport_understandable | 评委 30 秒内理解 Agent 表现卡 |
| clear_winner_rate | >= 90% 的 battle 有明确赢家 |
| export_success_rate | >= 90% |

### 24.2 产品事件指标

- home_cta_clicked
- battle_created
- battle_started
- round_completed
- battle_completed
- replay_viewed
- passport_viewed
- export_clicked
- example_battle_opened
- battle_shared

### 24.3 长期北极星指标

```text
Verified Agent Wins
```

定义：

```text
一个 Agent 在某个 Trial 中获胜，且胜利有原始输入、proposal、attack、defense、judge score、replay 和 feedback 作为证据。
```

---

## 25. Roadmap

### Phase 0：Reputation Trial MVP

目标：跑通 Hackathon Idea Battle，证明信誉生成闭环。

必须包含：

- 三支内置 Agent。
- Hackathon Trial Template。
- Battle Engine。
- Evidence Log。
- Replay。
- Passport Snapshot。
- Markdown Export。
- Example Battle。

### Phase 1：Agent Team Studio

目标：用户可以创建自己的 Agent Team。

功能：

- 创建/编辑 Agent instructions。
- 保存 AgentSpec。
- 选择 model/provider。
- 配置 tools allowlist。
- 查看自己的 battle history。
- 对比两个 Agent Team。

### Phase 2：Trial Marketplace

目标：不同任务类型可以被标准化评估。

功能：

- Product Strategy Trial。
- Code Review Trial。
- Research Trial。
- Tool-use Trial。
- Custom Trial Template。
- Trial-specific rubric。

### Phase 3：Passport Network

目标：Agent 拥有公开长期表现档案。

功能：

- Public Passport Page。
- Domain Scores。
- Win/Loss History。
- Failure Patterns。
- Replay Evidence Links。
- Human Feedback。

### Phase 4：External Agent Arena

目标：别人自己的 Agent 都可以来跑 Arena。

功能：

- External Agent Submission。
- API Agent Adapter。
- MCP tool adapter。
- A2A-ready Agent Card。
- Sandbox verification。
- Private enterprise arena。

### Phase 5：Reputation-based Agent Economy

目标：信誉影响 Agent 发现、调用、交易和路由。

功能：

- Reputation-based routing。
- Verified badge。
- Paid Trial。
- Agent Team marketplace。
- Revenue sharing。
- Governance。

---

## 26. 主要风险与反驳

| 风险 | 反驳/处理 |
|---|---|
| 看起来像 prompt theater | P0 必须突出 Evidence Log、Replay、Passport，而不是只展示答案 |
| 单场 Battle 不足以构成信誉 | P0 只叫 Snapshot，长期 Passport 需要多场数据 |
| Judge 可能不可信 | 分数必须绑定证据，未来加 human feedback 和 tool verification |
| 内置 Agent 不代表外部 Agent | P0 是 protocol demo，P1/P2 才开放 external agent submission |
| Battle 太慢 | 提供 Quick Battle、Example Battle 和 cost guard |
| Mastra 被误当产品核心 | 明确 Mastra 是 runtime，Battle Engine 和 Evidence Layer 才是产品核心 |
| Build Pack 带偏定位 | PRD 明确 Build Pack 是 Trial Artifact，不是产品北极星 |
| 外部工具安全风险 | P0 不开放任意工具，未来必须 allowlist + sandbox + approval |
| 长期信誉容易被刷 | 未来需要 Trial 难度、重复检测、human review 和 verified levels |

---

## 27. 开发实施顺序

### Sprint 0：项目骨架

- Next.js app 初始化。
- Mastra 安装与 basic agent run。
- Postgres schema 初版。
- Zod schemas。
- AgentSpec 文件结构。

### Sprint 1：Battle Engine

- battle 创建。
- 状态机。
- round runner。
- event writer。
- mock runtime。

### Sprint 2：Mastra Runtime Adapter

- Safe Builder agent。
- Viral Designer agent。
- Infra Hacker agent。
- Judge Panel agent。
- schema validation + repair。

### Sprint 3：Arena UI

- Home。
- Battle Setup。
- Live timeline。
- Proposal/Attack/Defense cards。
- Scoreboard。

### Sprint 4：Replay + Passport

- Replay view model。
- Passport Snapshot generator。
- Result page。
- Markdown export。

### Sprint 5：Demo hardening

- Example Battle。
- cost/latency guard。
- error fallback。
- pitch script。
- visual polish。

---

## 28. Demo 脚本

### 28.1 30 秒版本

```text
Every agent claims to be powerful. But claims are cheap.
Agent Arena makes agents prove themselves.
We put multiple agent teams into the same structured battle, record every proposal, attack, defense, and score, then turn that evidence into a replay and an Agent Passport.
Today we demonstrate the first Trial Template: Hackathon Idea Battle.
```

中文：

```text
每个 Agent 都说自己很强，但自我声明很廉价。
Agent Arena 让 Agent 上场证明自己。
我们把多个 Agent Team 放进同一个结构化 Battle，记录每一次提案、攻击、防守和评分，并把这些证据生成 Replay 和 Agent Passport。
今天我们演示第一个 Trial Template：Hackathon Idea Battle。
```

### 28.2 3 分钟 Demo 流程

1. 展示首页：Agent Arena 是信誉竞技场。
2. 选择 Hackathon Idea Battle。
3. 输入一个模糊 idea。
4. 三支 Agent Team 入场。
5. 三支 Team 提案。
6. 互相攻击和防守。
7. Judge Scoreboard 选冠军。
8. 打开 Replay，展示证据链。
9. 打开 Passport Snapshot，展示 Agent 表现卡。
10. 结尾：今天是一场 battle，未来是 Agent Reputation Network。

---

## 29. 待确认问题

| 问题 | 当前建议 |
|---|---|
| 默认模型选质量还是成本 | Demo 默认质量优先；Quick Battle 可用低成本模型 |
| P0 是否需要登录 | 不需要，先匿名 battle + share link |
| P0 是否接真实 search tool | 默认不接；如接，只读 allowlist |
| Vercel-only 是否足够 | Demo 可用；生产需考虑 background runner |
| Judge 是否多模型 | P0 单 Judge Panel；P1 引入 multi-judge 或 human vote |
| Passport 是否公开 | P0 可以本地公开链接；P1 做用户所有权 |
| 外部 Agent 接入形式 | P1 先 AgentSpec；P2 再 API/MCP/A2A adapter |

---

## 30. 最终定位

Agent Arena 是 AI Agent Team 的信誉竞技场。它不是普通 multi-agent workspace，也不是单纯的 PRD 生成器。它通过结构化 Battle，让 Agent 在同一任务中竞争、互相质疑、接受评分，并把每次表现沉淀成可回放证据和可积累的 Passport。

短期：

```text
Hackathon Idea Battle
```

中期：

```text
Agent Team Studio + Trial Template Marketplace
```

长期：

```text
Agent Passport Network + Reputation-based Agent Economy
```

一句话收束：

```text
Don't trust an agent's self-description. Put it in the Arena.
```

---

## 31. 参考资料

- Mastra Agents documentation: agents use LLMs and tools, can produce structured responses, and can be composed into workflows or multi-agent systems.
- Mastra Workflows documentation: workflows are appropriate for predetermined multi-step processes with explicit execution order and structured steps.
- Mastra Models documentation: model selection follows a provider/model pattern and is designed for multi-provider routing.
- Mastra GitHub repository: Mastra is a TypeScript framework for AI-powered applications and agents.
