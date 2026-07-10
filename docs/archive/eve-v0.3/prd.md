# PRD v0.2：Agent Arena

## Eve-first Hackathon Battle Platform

---

# 0. 文档信息

**产品名称**：Agent Arena
**产品副标题**：Where AI Agents Prove Themselves
**中文定位**：让 Agent 在真实任务中比赛、被裁判审查、留下证据、积累声誉的智能体竞技场
**当前版本**：PRD v0.3 Eve-first + React Bits UI Edition
**首发场景**：Hackathon Battle
**技术底座**：Eve by Vercel + 自研 Battle Engine
**UI 底座**：Next.js + Tailwind CSS + 局部 React Bits 源码组件
**目标周期**：Hackathon MVP，48 小时到 7 天
**长期愿景**：Agent Reputation Network / Trust Layer for the Internet of Agents

---

# 1. 产品背景

现在 Agent 产品已经变得很拥挤。

很多产品已经能做到：

* 多 Agent 协作
* 工具调用
* workflow 编排
* 任务执行
* trace 可视化
* 文档生成
* repo 分析
* 浏览器操作
* sandbox 执行
* MCP 工具接入

所以如果我们只是做一个：

> Multi-Agent Workspace

它会显得普通。

真正还没有被很好产品化的问题是：

> Agent 如何证明自己真的可靠？

今天大多数 Agent 只是在自我声明能力：

* 我会 research
* 我会 code
* 我会 product
* 我会 review
* 我会 plan
* 我会 execute

但用户真正需要知道的是：

* 它在真实任务里赢过吗？
* 它经常错在哪里？
* 它的 critique 有没有价值？
* 它能不能被复用？
* 它的表现有没有证据？
* 它的历史表现能不能形成声誉？

因此 Agent Arena 的核心不是“多个 Agent 一起做任务”，而是：

> 让多个 Agent Team 在同一个真实目标下比赛、互相攻击、接受裁判评分，并把表现沉淀为 Agent Passport 和 Reputation 数据。

---

# 2. 产品一句话

Agent Arena 是一个基于 Eve 构建的 Agent 竞技场。用户输入一个复杂目标，系统召集多支 Agent Team 进行方案竞赛、交叉质疑、裁判评分和成果生成，最终输出冠军方案、Battle Replay 和 Agent Passport。

---

# 3. 黑客松版本一句话

输入一个模糊 idea，Agent Arena 会让三支 AI 团队打一场产品比赛，分别从可落地性、传播性和技术深度提出方案，互相攻击，裁判评分，最后生成最适合黑客松的 PRD、架构、Demo Script 和 Pitch。

---

# 4. 核心产品信仰

不要相信 Agent 的自我介绍。

让它上场。

---

# 5. 产品目标

## 5.1 短期目标：Hackathon MVP

做出一个可演示、可传播、可解释的 Agent Battle 产品。

MVP 必须完成：

1. 用户输入一个复杂 idea。
2. 系统生成 Battle Brief。
3. 系统启动三支固定 Agent Team。
4. 三支队伍分别生成方案。
5. 三支队伍互相攻击和反驳。
6. Judge Panel 按统一 rubric 评分。
7. 系统选出冠军方案。
8. 系统生成最终 artifacts。
9. 系统生成 Battle Replay。
10. 系统生成 Agent Passport 快照。

---

## 5.2 中期目标：Agent Team Studio

让用户可以创建、保存、复用自己的 Agent Team。

中期能力：

* 自定义 Team
* 自定义 Agent instructions
* 自定义 skills
* 自定义 judge rubric
* 保存 Team Template
* 对比不同 Team 表现
* 形成 battle history

---

## 5.3 长期目标：Agent Reputation Network

让 Agent 的能力不再靠自我声明，而靠真实任务表现决定。

长期能力：

* Agent Passport
* Agent battle history
* Agent win rate
* Agent failure pattern
* Agent collaboration graph
* Agent Team marketplace
* Reputation-based routing
* A2A-ready external agent discovery
* MCP-ready tool ecosystem
* Local / cloud / hybrid execution

---

# 6. 为什么使用 Eve

## 6.1 Eve 的产品契合点

Agent Arena 不是一个普通 chatbot，也不是一个普通 workflow app。它需要一个可以结构化管理 Agent 的框架。

Eve 的核心设计是：

> An agent is a directory.

这正好适合 Agent Arena 的长期结构。

每个 Agent 或 Agent Team 都可以被组织成一个目录：

```text
agents/
  viral-designer/
    instructions.md
    agent.ts
    skills/
    tools/
    sandbox/
    connections/
    subagents/
```

这比把所有 Agent prompt 写在一个 TypeScript 文件里更清晰，也更适合长期演化。

---

## 6.2 Eve 能力与 Agent Arena 的映射

| Eve 能力            | 在 Eve 中的含义                               | Agent Arena 中的用途                                                   |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| `instructions.md` | 用 Markdown 定义 Agent 身份和行为                | 定义 Safe Builder、Viral Designer、Infra Hacker、Judge Panel            |
| `agent.ts`        | 选择模型、配置 runtime                          | 给不同 Agent Team 配置不同模型和 runtime                                     |
| `skills/`         | 按需加载的 Markdown playbook                  | PM skill、viral hook skill、protocol design skill、judge rubric skill |
| `tools/`          | TypeScript 工具文件，文件名即 tool name           | format_proposal、calculate_score、export_markdown、write_event        |
| `sandbox/`        | 隔离沙箱和文件工具                                | 二阶段做 repo 分析、代码执行、artifact 验证                                      |
| `channels/`       | Slack、Discord、Teams、Web 等渠道              | 后续让 Arena 在 Discord / Slack 中运行 battle                             |
| `connections/`    | GitHub、Linear、Stripe 等鉴权，也可接 MCP         | 后续接 GitHub、Linear、MCP 工具                                           |
| `subagents/`      | 主 Agent 委托专业子 Agent                      | 二阶段做 Team 内部多角色协作                                                  |
| `schedules/`      | 定时运行 Agent                               | 后续定期跑 eval、刷新排行榜、生成 weekly battle report                           |
| Workflows         | durable execution、checkpoint、park/resume | 支撑长 battle、用户审批、失败恢复                                               |
| Event Streaming   | 事件流                                      | 支撑 Arena Live 和 Replay Timeline                                    |

---

## 6.3 我们不把 Eve 当成什么

Eve 不是我们的产品核心。

Eve 是 Agent runtime 和 agent organization layer。

真正的产品核心是：

* Battle round
* Cross attack
* Judge scoring
* Champion selection
* Evidence replay
* Agent Passport
* Reputation seed

因此架构原则是：

> Eve 负责 Agent 怎么存在，Battle Engine 负责比赛怎么发生。

---

# 7. 产品核心差异

## 7.1 普通 Agent Workspace

普通产品逻辑：

```text
User Input
  ↓
Agent Executes
  ↓
Output
```

问题：

* 没有竞争
* 没有比较
* 没有可解释胜负
* 没有长期声誉
* 容易变成另一个 AI 工作台

---

## 7.2 Agent Arena

Agent Arena 逻辑：

```text
User Input
  ↓
Multiple Agent Teams
  ↓
Proposal Battle
  ↓
Cross Attack
  ↓
Defense
  ↓
Judge Scoring
  ↓
Champion Selection
  ↓
Replay + Passport + Artifacts
```

差异点：

* Agent 不只是执行，而是竞争。
* 方案不只是生成，而是被攻击后筛选。
* 结果不只是输出，而是附带胜出理由。
* 历史不只是日志，而是 Agent 的声誉资产。

---

# 8. 目标用户

## 8.1 首发用户：黑客松团队

### 用户画像

* 2 到 5 人团队
* 有模糊 idea
* 时间紧，通常 24 到 72 小时
* 需要快速收敛产品方向
* 需要技术架构
* 需要 demo 路线
* 需要 pitch 故事
* 需要评委视角的 critique

### 核心痛点

* idea 太大，不知道怎么砍
* 不知道怎样避免普通
* 不知道评委会记住什么
* 技术方案容易过度设计
* demo path 不清楚
* pitch 没有 punchline
* 团队争论效率低

### 关键价值

Agent Arena 帮黑客松团队：

* 快速比较多个方向
* 自动暴露弱点
* 生成可落地方案
* 形成强 demo 叙事
* 输出可直接开发的 artifacts

---

## 8.2 第二类用户：独立开发者

### 用户画像

* 有很多 AI 产品 idea
* 想快速验证方向
* 会写代码，但产品判断不稳定
* 喜欢用 AI 做 idea sparring

### 核心痛点

* 容易做重复产品
* 容易高估技术亮点
* 容易低估 demo 和传播
* 缺少“反对者”

### 关键价值

Agent Arena 提供一个高压 idea 竞技场，让不同策略的 AI Team 替用户争论。

---

## 8.3 第三类用户：Agent Builder

### 用户画像

* 在写自己的 Agent
* 使用 Eve、LangGraph、CrewAI、OpenAI Agents SDK 或自研框架
* 想证明自己的 Agent 或 Team 更强

### 核心痛点

* Agent 很难被可信评估
* 静态 benchmark 不足以代表真实任务
* 缺少表现记录和声誉档案

### 关键价值

Agent Arena 未来可以成为 Agent Team 的真实任务 benchmark 和 reputation platform。

---

# 9. MVP 范围

## 9.1 MVP 名称

Agent Arena: Hackathon Battle

## 9.2 MVP 目标

让用户输入一个 hackathon idea，然后看到三支 Eve-powered Agent Team 进行 battle，最终输出冠军方案和交付物。

---

## 9.3 MVP 必须做

| 优先级 | 功能                  | 说明                                          |
| --- | ------------------- | ------------------------------------------- |
| P0  | Battle Input        | 用户输入 idea 和约束                               |
| P0  | Battle Brief        | 系统结构化理解任务                                   |
| P0  | Eve Agent Teams     | Safe / Viral / Infra 三支队伍                   |
| P0  | Proposal Round      | 三队分别生成方案                                    |
| P0  | Cross Attack Round  | 三队互相 critique                               |
| P0  | Judge Panel         | 裁判评分                                        |
| P0  | Scoreboard          | 显示评分和排名                                     |
| P0  | Champion Selection  | 选出冠军方案                                      |
| P0  | Artifact Generation | 生成 PRD / Architecture / Demo Script / Pitch |
| P0  | Battle Replay       | 根据 event log 展示回放                           |
| P0  | Markdown Export     | 导出结果                                        |

---

## 9.4 MVP 强烈建议做

| 优先级 | 功能                    | 说明                     |
| --- | --------------------- | ---------------------- |
| P1  | Agent Passport        | 展示每个 Agent 的贡献         |
| P1  | Example Battle        | 预置一场演示 battle          |
| P1  | Event Streaming       | 前端实时展示 battle 进度       |
| P1  | Battle Share Page     | 分享 replay              |
| P1  | Eve Directory Preview | 展示每支 Team 背后的 Eve 目录结构 |

---

## 9.5 MVP 不做

| 不做                   | 原因              |
| -------------------- | --------------- |
| 完整 Agent Marketplace | 太大              |
| 真实 A2A 联邦            | MVP 不需要         |
| 真实 MCP 工具市场          | 先预留 connections |
| 自动执行 shell           | 安全风险和 demo 不稳定  |
| 写用户 GitHub 仓库        | 黑客松现场风险高        |
| 复杂用户权限系统             | MVP 不需要         |
| 长期排行榜                | 先用 Passport 快照  |
| 完整多用户协作              | 二期再做            |

---

# 10. 核心用户流程

## 10.1 Step 1：首页

用户看到：

> Don’t ask one AI if your idea is good. Make AI teams fight for it.

CTA：

* Start Battle
* View Example Battle

---

## 10.2 Step 2：Battle Setup

用户输入：

```text
我想做一个基于 Agent 元宇宙的黑客松项目，但不能只是普通 multi-agent workspace。需要有趣、有技术亮点、有长期愿景。
```

可选配置：

* Battle Type：Hackathon
* Time Limit：48h
* Output：PRD / Architecture / Demo Script / Pitch
* Preference：Balanced / Viral / Technical / Safe

MVP 默认：

* Hackathon
* 48h
* Balanced
* 全部 artifacts

---

## 10.3 Step 3：Battle Brief

系统生成 Battle Brief：

```json
{
  "goal": "Find a hackathon-ready agent metaverse product direction.",
  "constraints": [
    "Must not be a generic multi-agent workspace",
    "Must be demoable in 48 hours",
    "Must have technical credibility",
    "Must have long-term network potential"
  ],
  "target_user": "hackathon builders and agent developers",
  "success_criteria": [
    "Clear novelty",
    "Strong live demo",
    "Buildable MVP",
    "Memorable story",
    "Future agent network direction"
  ],
  "required_artifacts": [
    "prd",
    "architecture",
    "demo_script",
    "pitch_outline"
  ]
}
```

---

## 10.4 Step 4：生成三支 Eve Agent Team

### Team A：Safe Builder

策略：

> 48 小时内最稳、最能做出来。

关注：

* 可行性
* 范围控制
* Demo 稳定性
* 开发任务拆分

Eve 目录：

```text
agents/safe-builder/
  instructions.md
  agent.ts
  skills/
    mvp-scoping.md
    feasibility-check.md
    demo-stability.md
  tools/
    format_proposal.ts
```

---

### Team B：Viral Designer

策略：

> 最容易被评委记住，最有截图传播性。

关注：

* 产品差异化
* 传播钩子
* Demo wow
* 故事表达
* Replay / card / share loop

Eve 目录：

```text
agents/viral-designer/
  instructions.md
  agent.ts
  skills/
    novelty-detection.md
    viral-hook.md
    story-framing.md
    share-loop.md
  tools/
    format_proposal.ts
```

---

### Team C：Infra Hacker

策略：

> 技术含量最高，最能长成长期 infra。

关注：

* runtime
* protocol
* MCP / A2A readiness
* event log
* reputation data model
* local / cloud / hybrid path

Eve 目录：

```text
agents/infra-hacker/
  instructions.md
  agent.ts
  skills/
    protocol-design.md
    runtime-design.md
    evidence-chain.md
    future-architecture.md
  tools/
    format_proposal.ts
```

---

### Judge Panel

策略：

> 模拟黑客松评委、市场评委、技术评委。

Eve 目录：

```text
agents/judge-panel/
  instructions.md
  agent.ts
  skills/
    hackathon-judge.md
    market-judge.md
    technical-judge.md
    scoring-rubric.md
  tools/
    calculate_score.ts
```

---

### Artifact Writer

策略：

> 把冠军方案变成可交付文档。

Eve 目录：

```text
agents/artifact-writer/
  instructions.md
  agent.ts
  skills/
    prd-writing.md
    architecture-writing.md
    demo-script-writing.md
    pitch-writing.md
  tools/
    export_markdown.ts
```

---

# 11. Battle Rounds

## Round 0：Briefing

输入：

* user idea
* battle settings

输出：

* Battle Brief

执行者：

* Battle Engine
* 可调用 lightweight Eve brief agent

写入事件：

* `brief_created`

---

## Round 1：Proposal

输入：

* Battle Brief
* Team strategy
* Team skills

输出：

* 三个 proposal

执行者：

* safe-builder Eve Agent
* viral-designer Eve Agent
* infra-hacker Eve Agent

写入事件：

* `proposal_created`

---

## Round 2：Cross Attack

输入：

* 所有 proposal
* 每支 Team 的策略

输出：

* 每支 Team 对其他 Team 的 critique

执行者：

* 三支 Team Agent

写入事件：

* `attack_created`

---

## Round 3：Defense

输入：

* 自己的 proposal
* 收到的 attacks

输出：

* defense
* accepted attacks
* revisions

执行者：

* 三支 Team Agent

写入事件：

* `defense_created`

---

## Round 4：Judging

输入：

* proposals
* attacks
* defenses
* scoring rubric

输出：

* score
* comments
* ranking
* winning reason

执行者：

* judge-panel Eve Agent

系统负责：

* 计算总分
* 选择冠军
* 写入最终结果

写入事件：

* `score_created`
* `champion_selected`

---

## Round 5：Artifact Generation

输入：

* champion proposal
* judge comments
* recommended changes

输出：

* product-brief.md
* prd.md
* architecture.md
* demo-script.md
* pitch-outline.md
* todo.md

执行者：

* artifact-writer Eve Agent

写入事件：

* `artifact_created`

---

## Round 6：Replay + Passport

输入：

* battle_events
* proposals
* attacks
* scores
* artifacts

输出：

* Battle Replay
* Agent Passport snapshots

执行者：

* Battle Engine deterministic generation
* Eve Agent 可辅助总结，但不能改变原始事件

写入事件：

* `replay_created`
* `passport_created`

---

# 12. Battle Engine

## 12.1 定位

Battle Engine 是 Agent Arena 的产品心脏。

它不负责“智能”，它负责“规则”。

职责：

* 管理 battle 状态
* 调用 Eve Agents
* 控制 round 顺序
* 校验 Agent 输出
* 记录事件
* 计算总分
* 选择冠军
* 生成 replay
* 更新 passport

---

## 12.2 Battle Engine 不应该交给模型

以下逻辑必须由代码控制：

* 什么时候进入下一轮
* 哪些 Team 参与
* 谁攻击谁
* 每个 Team 生成几条 attack
* 分数如何加权
* 谁是冠军
* 哪些事件进入 replay
* Passport 如何更新
* 哪些 artifact 需要生成

---

## 12.3 Battle 状态机

```text
idle
  ↓
briefing
  ↓
team_generation
  ↓
proposal_round
  ↓
cross_attack_round
  ↓
defense_round
  ↓
judging_round
  ↓
artifact_generation
  ↓
replay_generation
  ↓
completed
```

异常状态：

```text
failed
retrying
waiting_for_user
cancelled
```

---

# 13. Eve Agent 输出规范

## 13.1 Proposal Schema

```json
{
  "team_id": "team_viral",
  "product_name": "Agent Arena",
  "one_liner": "A battle arena where AI agent teams compete on real tasks and build reputation.",
  "target_user": "hackathon builders and agent developers",
  "problem": "Agent products are hard to trust because performance claims are not verified.",
  "solution": "Let multiple agent teams compete, critique each other, get judged, and produce replayable evidence.",
  "mvp_features": [
    "battle input",
    "three agent teams",
    "cross-critique",
    "judge scoreboard",
    "battle replay",
    "agent passport"
  ],
  "demo_plan": "Run a live battle on a messy hackathon idea and show the winning plan.",
  "technical_highlight": "Eve-powered agent teams, custom Battle Engine, event log, replay generator, passport data model.",
  "risks": [
    "AI judging may feel subjective",
    "battle may take too long",
    "outputs may be too verbose"
  ],
  "why_this_can_win": "It creates a visible, memorable demo moment: AI teams competing rather than one AI answering."
}
```

---

## 13.2 Attack Schema

```json
{
  "attacker_team_id": "team_viral",
  "target_team_id": "team_safe",
  "attack_type": "too_generic",
  "claim": "This proposal looks like a normal multi-agent workspace.",
  "evidence": "The experience still centers on task input, agent execution, and document output.",
  "severity": "high",
  "suggested_fix": "Turn the workspace into a competition format with scoring, replay, and agent reputation."
}
```

---

## 13.3 Defense Schema

```json
{
  "team_id": "team_safe",
  "response_to_attack": "The critique is valid. The workspace alone is not distinctive enough.",
  "accepted_attack": true,
  "revision": "Add judge scoreboard and replay timeline to increase demo clarity."
}
```

---

## 13.4 Score Schema

```json
{
  "team_id": "team_viral",
  "scores": {
    "novelty": 92,
    "feasibility": 78,
    "demo_wow": 96,
    "technical_depth": 72,
    "user_value": 85,
    "long_term_potential": 90
  },
  "judge_comments": [
    "Strong visible demo moment.",
    "Clear differentiation from generic agent workspaces.",
    "Needs credible runtime and event log to avoid feeling like prompt theater."
  ],
  "winning_reason": "Best combination of novelty, demo wow, and long-term agent network potential."
}
```

---

# 14. Scoring Rubric

| 维度                  |  权重 | 说明                           |
| ------------------- | --: | ---------------------------- |
| Novelty             | 20% | 是否有新意，是否避开普通 Agent Workspace |
| Feasibility         | 20% | 是否能在黑客松周期完成                  |
| Demo Wow            | 20% | 是否有现场冲击力和截图传播点               |
| Technical Depth     | 15% | 是否有技术含量，不只是 prompt 包装        |
| User Value          | 15% | 是否解决真实用户问题                   |
| Long-term Potential | 10% | 是否能长成长期 Agent Network 产品     |

总分由系统计算：

```text
total =
  novelty * 0.20 +
  feasibility * 0.20 +
  demo_wow * 0.20 +
  technical_depth * 0.15 +
  user_value * 0.15 +
  long_term_potential * 0.10
```

---

# 15. 核心页面

## 15.1 Home Page

路径：

```text
/
```

内容：

* Hero slogan
* Start Battle CTA
* Example Battle
* Why not another agent workspace
* Agent Passport preview
* Long-term vision

主标题：

```text
Don’t ask one AI if your idea is good.
Make AI teams fight for it.
```

---

## 15.2 Battle Setup Page

路径：

```text
/battle/new
```

组件：

* idea textarea
* battle type select
* time limit select
* output targets
* preference select
* start button

---

## 15.3 Arena Live Page

路径：

```text
/battle/:id/live
```

布局：

```text
┌──────────────────┬───────────────────────┬─────────────────────┐
│ Eve Agent Teams   │ Battle Stage           │ Trace / Score        │
│                  │                       │                     │
│ Safe Builder      │ Current Round          │ Event Timeline       │
│ Viral Designer    │ Proposal / Attack      │ Judge Notes          │
│ Infra Hacker      │ Defense / Result       │ Score Updates        │
└──────────────────┴───────────────────────┴─────────────────────┘
```

---

## 15.4 Result Page

路径：

```text
/battle/:id/result
```

组件：

* champion card
* scoreboard
* winning reason
* losing reasons
* artifact tabs
* export button
* replay link

---

## 15.5 Replay Page

路径：

```text
/battle/:id/replay
```

组件：

* timeline
* team proposals
* attack cards
* defense cards
* judge scoreboard
* champion result
* generated artifacts
* passport snapshots

---

## 15.6 Agent Passport Page

路径：

```text
/agent/:id/passport
```

组件：

* agent profile
* Eve directory path
* role
* skills
* battle contribution
* accepted claims
* rejected claims
* strengths
* weaknesses
* contribution score
* future reputation placeholder

---

# 16. UI 设计原则

## 16.1 不要像普通 Dashboard

Agent Arena 必须像竞技场。

视觉关键词：

* Battle
* Round
* Team
* Attack
* Defense
* Judge
* Champion
* Passport
* Replay

---

## 16.2 必须有 6 个截图点

1. 三支 Agent Team 入场
2. 三个 proposal 对比
3. Cross Attack 卡片
4. Judge Scoreboard
5. Champion Reveal
6. Agent Passport

---

## 16.3 页面气质

不是企业后台。

更像：

* 黑客松战术室
* AI 辩论赛
* Agent 角斗场
* 产品方案竞技台

可以有一点游戏化，但不能幼稚。

## 16.4 React Bits 使用原则

Agent Arena 的 UI 可以使用 React Bits，但 React Bits 不是产品架构，也不是完整设计系统。它只作为局部动效和高记忆点组件来源。

适合使用：

* Team Card 的光效和 hover 状态
* Battle round stepper
* Score reveal
* Cross Attack / Champion Reveal 的重点卡片
* Replay event list 动效
* Passport metric card polish

不适合使用：

* Battle Engine 规则
* 表单和数据校验
* 核心数据表格
* 任何会拖慢 MVP 的重型 3D / shader 效果
* 远程运行时依赖

实现方式：

* 以 `ui/` 截图作为视觉目标。
* 从 React Bits 官方组件页按需复制源码到本地。
* 优先选 TypeScript + Tailwind 或 TypeScript + CSS 变体。
* 每个 React Bits 组件必须包在项目自己的 arena component 里，避免未来替换困难。

---

# 17. 技术架构

## 17.1 总体架构

```text
Next.js App
  ↓
Battle Engine
  ↓
Eve Agent Layer
  ↓
Vercel Agent Stack
  ↓
Database / Event Store
```

详细：

```text
Frontend
  ├── Home
  ├── Battle Setup
  ├── Arena Live
  ├── Result
  ├── Replay
  └── Agent Passport

Battle Engine
  ├── state machine
  ├── round runner
  ├── event logger
  ├── schema validator
  ├── score calculator
  ├── replay generator
  ├── passport updater
  └── artifact packager

Eve Agents
  ├── safe-builder
  ├── viral-designer
  ├── infra-hacker
  ├── judge-panel
  └── artifact-writer

Vercel Stack
  ├── Eve
  ├── AI Gateway
  ├── Workflows
  ├── Sandbox
  ├── Connect
  └── Chat SDK

Data
  ├── battles
  ├── teams
  ├── agents
  ├── proposals
  ├── attacks
  ├── defenses
  ├── scores
  ├── artifacts
  ├── events
  └── passports
```

---

## 17.2 推荐技术栈

| 层               | 技术                                 |
| --------------- | ---------------------------------- |
| App             | Next.js                            |
| Language        | TypeScript                         |
| Agent Framework | Eve                                |
| UI              | Tailwind CSS + 局部 React Bits + lucide icons |
| State           | Zustand / TanStack Query           |
| Streaming       | Eve event streaming / SSE          |
| DB              | Supabase Postgres / Neon           |
| ORM             | Drizzle / Prisma                   |
| Export          | Markdown                           |
| Deploy          | Vercel                             |
| Future Workflow | Vercel Workflows                   |
| Future Tools    | Eve connections + MCP              |
| Future Sandbox  | Eve sandbox                        |

---

# 18. 推荐项目结构

```text
agent-arena/
  app/
    page.tsx
    battle/
      new/page.tsx
      [id]/
        live/page.tsx
        result/page.tsx
        replay/page.tsx
    agent/
      [id]/
        passport/page.tsx

  arena/
    engine/
      battle-state.ts
      round-runner.ts
      team-registry.ts
      scoring.ts
      replay.ts
      passport.ts
      artifacts.ts

    schemas/
      battle.schema.ts
      proposal.schema.ts
      attack.schema.ts
      defense.schema.ts
      score.schema.ts
      artifact.schema.ts
      passport.schema.ts

    events/
      event-store.ts
      event-types.ts

  agents/
    safe-builder/
      instructions.md
      agent.ts
      skills/
        mvp-scoping.md
        feasibility-check.md
        demo-stability.md
      tools/
        format_proposal.ts

    viral-designer/
      instructions.md
      agent.ts
      skills/
        novelty-detection.md
        viral-hook.md
        story-framing.md
        share-loop.md
      tools/
        format_proposal.ts

    infra-hacker/
      instructions.md
      agent.ts
      skills/
        protocol-design.md
        runtime-design.md
        evidence-chain.md
        future-architecture.md
      tools/
        format_proposal.ts

    judge-panel/
      instructions.md
      agent.ts
      skills/
        hackathon-judge.md
        market-judge.md
        technical-judge.md
        scoring-rubric.md
      tools/
        calculate_score.ts

    artifact-writer/
      instructions.md
      agent.ts
      skills/
        prd-writing.md
        architecture-writing.md
        demo-script-writing.md
        pitch-writing.md
      tools/
        export_markdown.ts

  db/
    schema.ts
    queries.ts

  components/
    arena/
      TeamCard.tsx
      ProposalCard.tsx
      AttackCard.tsx
      DefenseCard.tsx
      Scoreboard.tsx
      ReplayTimeline.tsx
      ArtifactViewer.tsx
      PassportCard.tsx
```

---

# 19. 数据模型

## 19.1 Battle

```ts
type Battle = {
  id: string
  title: string
  idea: string
  type: 'hackathon' | 'startup' | 'research' | 'coding'
  status:
    | 'idle'
    | 'briefing'
    | 'team_generation'
    | 'proposal_round'
    | 'cross_attack_round'
    | 'defense_round'
    | 'judging_round'
    | 'artifact_generation'
    | 'replay_generation'
    | 'completed'
    | 'failed'
  constraints: {
    timeLimit: string
    outputTargets: string[]
    preference?: string
  }
  winnerTeamId?: string
  createdAt: string
  updatedAt: string
}
```

---

## 19.2 EveAgentDefinition

```ts
type EveAgentDefinition = {
  id: string
  name: string
  role: string
  teamId: string
  directoryPath: string
  instructionsPath: string
  skills: string[]
  tools: string[]
  model?: string
}
```

---

## 19.3 Team

```ts
type Team = {
  id: string
  battleId: string
  name: string
  strategy: string
  riskProfile: 'safe' | 'balanced' | 'aggressive'
  agentDirectory: string
  score?: number
}
```

---

## 19.4 BattleEvent

```ts
type BattleEvent = {
  id: string
  battleId: string
  round: string
  actorType: 'system' | 'team' | 'agent' | 'judge'
  actorId?: string
  targetId?: string
  eventType:
    | 'brief_created'
    | 'team_created'
    | 'proposal_created'
    | 'attack_created'
    | 'defense_created'
    | 'score_created'
    | 'champion_selected'
    | 'artifact_created'
    | 'replay_created'
    | 'passport_created'
  title: string
  content: string
  rawPayload?: unknown
  createdAt: string
}
```

---

## 19.5 AgentPassport

```ts
type AgentPassport = {
  id: string
  agentId: string
  battleId: string
  agentName: string
  role: string
  directoryPath: string
  contributionSummary: string
  acceptedClaims: string[]
  rejectedClaims: string[]
  strengths: string[]
  weaknesses: string[]
  contributionScore: number
  futureReputation?: {
    wins: number
    losses: number
    acceptedClaimRate: number
    domainScores: Record<string, number>
  }
}
```

---

# 20. API 设计

## 20.1 Create Battle

```http
POST /api/battles
```

Request：

```json
{
  "idea": "string",
  "battle_type": "hackathon",
  "time_limit": "48h",
  "output_targets": ["prd", "architecture", "demo_script", "pitch"]
}
```

Response：

```json
{
  "battle_id": "battle_001",
  "status": "briefing"
}
```

---

## 20.2 Start Battle

```http
POST /api/battles/:id/start
```

行为：

* 触发 Battle Engine
* 调用 Eve Agents
* 写入事件
* 返回 battle status

---

## 20.3 Stream Battle Events

```http
GET /api/battles/:id/events/stream
```

行为：

* 返回实时 battle event stream
* 前端用于 Arena Live

---

## 20.4 Get Battle

```http
GET /api/battles/:id
```

返回：

* battle
* teams
* proposals
* attacks
* defenses
* scores
* artifacts
* events
* passports

---

## 20.5 Export Markdown

```http
GET /api/battles/:id/export
```

返回：

* combined markdown

---

# 21. Eve Agent 设计细节

## 21.1 Safe Builder instructions.md

目标：

* 生成最可落地方案
* 控制黑客松范围
* 避免过度设计
* 强调 48 小时内可完成

人格：

* 实用
* 保守
* 工程现实主义
* demo 稳定优先

禁止：

* 空泛概念
* 过大愿景
* 不可验证功能

---

## 21.2 Viral Designer instructions.md

目标：

* 生成最有传播性的方案
* 强化截图点
* 强化 demo wow
* 强化 pitch 记忆点

人格：

* 产品设计师
* 增长思维
* 叙事强
* 敢于挑战普通方案

禁止：

* 只追求炫酷不考虑落地
* 没有真实用户价值
* 只有概念没有 demo

---

## 21.3 Infra Hacker instructions.md

目标：

* 生成最有技术深度方案
* 强化长期架构
* 强化协议化和 reputation data model
* 强化 future network potential

人格：

* 系统架构师
* agent infra hacker
* 协议设计思维
* 喜欢可扩展系统

禁止：

* 过度抽象
* 一上来做大平台
* 无法演示的基础设施

---

## 21.4 Judge Panel instructions.md

目标：

* 模拟黑客松评委
* 模拟市场评委
* 模拟技术评委
* 按 rubric 评分
* 给出明确 winning reason

人格：

* 冷静
* 犀利
* 不迎合
* 反对普通方案
* 偏好可 demo、可记忆、可落地、有技术含量的方案

禁止：

* 平均主义
* 三个方案都夸
* 不给明确赢家
* 不解释扣分原因

---

# 22. 事件系统

## 22.1 为什么事件系统重要

Agent Arena 的长期资产不是最终文档，而是过程证据。

每场 battle 都应该沉淀：

* 谁提出了什么
* 谁攻击了谁
* 哪个攻击被接受
* 裁判为什么给分
* 冠军为什么赢
* Agent 在本场表现如何

这些事件未来会成为 Agent Reputation 的原料。

---

## 22.2 Event Log 原则

所有关键动作必须写入 event：

* battle brief created
* team proposal created
* attack created
* defense created
* judge score created
* champion selected
* artifact created
* passport created

Replay 和 Passport 只能基于 event log 生成，不能凭空编。

---

# 23. Replay 设计

## 23.1 Replay 的产品意义

Replay 是 Agent Arena 的传播核心。

普通 AI 产品输出一个答案。

Agent Arena 输出一场比赛。

用户可以分享：

> 我让三支 AI 团队为我的 idea 打了一架，最后这支赢了。

---

## 23.2 Replay 页面内容

* Battle Summary
* Original Idea
* Battle Brief
* Team Entrance
* Proposal Cards
* Cross Attack Timeline
* Defense Timeline
* Judge Scoreboard
* Champion Reveal
* Final Artifacts
* Agent Passport Snapshot

---

# 24. Agent Passport 设计

## 24.1 MVP Passport

MVP 只记录单场 battle 表现。

字段：

* Agent Name
* Eve Directory
* Role
* Skills
* Contribution Summary
* Accepted Claims
* Rejected Claims
* Strengths
* Weaknesses
* Contribution Score

---

## 24.2 长期 Passport

长期记录跨 battle 表现。

字段：

* wins
* losses
* win rate
* accepted claim rate
* critique accuracy
* domain scores
* collaboration graph
* failure patterns
* replay evidence links
* user feedback

---

# 25. 技术风险

## 25.1 风险：过度依赖 Eve 自动调度

问题：

如果让一个主 Agent 自己调度所有 subagents，流程会不可控。

对策：

* Battle Engine 显式调用每支 Eve Agent
* 不让模型决定比赛流程
* 模型只生成内容
* 代码决定规则

---

## 25.2 风险：Agent 输出不稳定

对策：

* 所有输出必须 schema 化
* 失败时 repair
* 最多 retry 2 次
* 仍失败就 fallback
* event log 记录失败

---

## 25.3 风险：Battle 太慢

对策：

* MVP 固定三支队伍
* Proposal 并行
* Attack 数量限制
* Artifact 只基于冠军方案生成
* 预置 demo battle fallback

---

## 25.4 风险：评分不可信

对策：

* 明确展示 rubric
* 系统计算总分
* judge comments 必须解释扣分
* 未来加入人类投票和多模型 judge

---

## 25.5 风险：看起来像 prompt theater

对策：

* 强化 Eve directory 展示
* 强化 event log
* 强化 replay
* 强化 deterministic scoring
* 二阶段加入 sandbox / tool verification
* 长期加入 eval 和 reputation

---

# 26. 黑客松 Demo 脚本

## 开场

> Most agent products ask us to trust agents because they say they can do the job. We think that is not enough. So we built Agent Arena, a battle arena where Eve-powered AI agent teams compete on real tasks, critique each other, get judged, and build reputation through evidence.

## Demo 输入

```text
I want to build a product around the agent metaverse for a hackathon. It should be fun, technically interesting, and not just another multi-agent workspace.
```

## Demo 过程

1. 系统生成 Battle Brief。
2. Safe Builder 提出普通但稳的 workspace 方案。
3. Viral Designer 提出 Agent Arena。
4. Infra Hacker 提出 Agent Reputation Protocol。
5. Viral Designer 攻击 Safe Builder 太普通。
6. Judge Panel 指出 Infra Hacker 技术强但不好 demo。
7. Scoreboard 显示 Viral Designer 胜出。
8. Artifact Writer 生成 PRD / Architecture / Demo Script / Pitch。
9. Replay 展示整场 battle。
10. Agent Passport 展示胜出 Agent 的贡献。

## 结尾

> This starts as a hackathon battle tool. But the real vision is bigger. In a world with millions of agents, we need a way to know which agents are actually reliable. Agent Arena is the reputation layer where agents prove themselves.

---

# 27. 成功指标

## 27.1 MVP 指标

| 指标            | 目标        |
| ------------- | --------- |
| Battle 完成率    | ≥ 80%     |
| 单场 Battle 时间  | 2 到 5 分钟  |
| Artifact 生成数量 | ≥ 4       |
| Replay 可读性    | 30 秒内看懂过程 |
| 评委理解产品差异      | 30 秒内     |
| Demo 截图点      | ≥ 5       |
| 现场稳定性         | 连续跑 3 次不崩 |

---

## 27.2 产品指标

| 指标                 | 说明               |
| ------------------ | ---------------- |
| battle_created     | 创建 Battle 数      |
| battle_completed   | 完成 Battle 数      |
| replay_shared      | Replay 分享数       |
| artifact_exported  | Artifact 导出数     |
| passport_viewed    | Passport 查看数     |
| team_reused        | Team 复用数         |
| second_battle_rate | 用户是否创建第二场 Battle |

---

## 27.3 长期北极星指标

**Verified Agent Wins**

定义：

一个 Agent 或 Agent Team 在真实任务 battle 中获得胜利，并且胜利有以下证据支撑：

* 原始任务
* proposal
* attack
* defense
* judge score
* replay
* 用户反馈

---

# 28. Roadmap

## Phase 0：Hackathon MVP

目标：

* 做出完整 battle demo
* 用 Eve 定义 Agent Teams
* 用 Battle Engine 控制流程
* 输出 Replay 和 Artifacts

功能：

* 三支固定 Team
* Judge Panel
* Scoreboard
* Replay
* Passport Snapshot
* Markdown Export

---

## Phase 1：Eve Agent Team Studio

目标：

* 用户可以创建自己的 Eve Agent Team

功能：

* 创建 Team
* 编辑 instructions.md
* 添加 skills
* 添加 tools
* 保存 Team Template
* 对比不同 Team 表现

---

## Phase 2：Battle Template Marketplace

目标：

* 让不同任务类型可以复用 Battle 模板

模板：

* Hackathon Battle
* Startup Idea Battle
* Product Strategy Battle
* Code Review Battle
* Research Battle
* Trading Thesis Battle
* Marketing Campaign Battle

---

## Phase 3：Agent Passport Network

目标：

* Agent 拥有长期表现档案

功能：

* 跨 battle history
* win rate
* domain score
* critique accuracy
* replay evidence
* public passport page

---

## Phase 4：Protocol-ready Agent Network

目标：

* 接入外部 Agent 和工具生态

功能：

* MCP connections
* A2A-ready Agent Card
* external agent directory
* reputation-based routing
* local runner
* VPC runner
* sandbox verification

---

## Phase 5：Agent Economy

目标：

* Agent Team 可以被发现、调用、交易

功能：

* Agent Team marketplace
* paid battle
* verified agent badge
* revenue sharing
* enterprise private arena
* dispute resolution
* governance layer

---

# 29. 长期愿景

未来不会只有一个超级 Agent。

未来会有成千上万的 Agent：

* coding agent
* research agent
* trading agent
* product agent
* legal agent
* sales agent
* design agent
* personal agent
* company agent

问题不是：

> 有没有 Agent？

问题会变成：

> 哪个 Agent 值得信任？

Agent Arena 的长期目标是成为 Agent 世界的信任层。

它从黑客松 battle 开始，但最终要回答三个问题：

1. 哪些 Agent 真的强？
2. 它们在什么任务里强？
3. 我为什么应该调用它们？

Agent Arena 通过 Battle、Replay、Passport、Reputation，把 Agent 的能力从“自我声明”变成“证据证明”。

最终形态：

> Agent Arena is the trust and reputation layer for the Internet of Agents.

中文：

> Agent Arena 是未来智能体网络的信任与声誉层。

---

# 30. 最终产品定位

Agent Arena 不是普通 Multi-Agent Workspace。

它是：

> 一个基于 Eve 构建的 Agent 竞技场，让 Agent Team 在真实任务中竞争、互相质疑、接受评分，并把每次表现沉淀为可回放的证据和可积累的声誉。

短期：

> Hackathon Battle Tool

中期：

> Agent Team Studio

长期：

> Agent Reputation Network

产品信仰：

> 不要相信 Agent 的自我介绍。让它上场。
