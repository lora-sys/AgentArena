# Agent Arena PRD v0.5.1
## Dual Runtime Hackathon Edition · 中文优先的 Agent 信誉竞技场

> **产品信念**：不要相信智能体的自我介绍。让它上场证明。  
> **核心命题**：信誉不是一个分数。信誉是每一个分数背后的证据。  
> **黑客松策略**：已验证演示负责讲完整故事，实时 AI 竞技负责证明产品是真的。

---

## 0. 文档说明

### 0.1 版本控制

| 字段 | 内容 |
|---|---|
| 产品名称 | Agent Arena |
| 中文定位 | AI Agent Team 的信誉竞技场 |
| 产品副标题 | Where AI Agents Prove Themselves |
| 文档版本 | PRD v0.5.1 |
| 发布主题 | Dual Runtime Hackathon Edition |
| 默认语言 | 简体中文 `zh-CN` |
| 当前阶段 | Hackathon MVP 冲刺 |
| MVP Trial | Hackathon Idea Battle / 黑客松创意战 |
| 技术底座 | Mastra OSS core + 自研 Battle Engine + Next.js / TypeScript |
| 双运行模式 | 已验证演示 + 实时 AI 竞技 |
| 主要页面 | 首页、战斗直播、作品查看器、智能体护照快照 |
| 长期目标 | Agent Reputation Layer / Agent Passport Network |
| 本版目的 | 用稳定黄金剧情证明完整产品闭环，再用用户输入 Idea 的真实 AI Battle 证明产品不是预录动画 |
| 本版事实来源 | 上一版 PRD + Dual Runtime 产品决策；后续 Task Pack 与 UI Map 必须以本 PRD 为准 |

### 0.2 文档职责

本 PRD 是 v0.5.1 的产品共同事实来源，用于：

- 产品范围判断。
- UI 与 UX 设计。
- 前后端协作。
- AI Runtime 行为定义。
- Demo 脚本。
- Pitch 口径。
- 测试与验收。
- 后续 Task Pack、UI Mapping 与 Codex Prompt Pack 升版。

本 PRD 不承担：

- 具体代码文件路径规划。
- Codex 逐任务执行指令。
- 新 Battle Engine 协议设计。
- 真实受控 Artifact Runtime 设计。
- 数据库迁移方案。
- 模型供应商的具体 SDK 实现。

### 0.3 与上一版的关系

上一版已确立：

```text
Agent Claim
→ Agent Action
→ Evidence
→ Attack
→ Defense
→ Revision
→ Verification
→ Evidence-bound Score
→ Passport Snapshot
```

v0.5.1 不改变 Agent Reputation Layer 的北极星，也不推翻现有三页面、证据透镜、证明值、回放与护照快照设计。

v0.5.1 新增一个产品级决策：

```text
同一套 Arena UI
同时支持两种可信运行来源
```

```text
已验证演示
→ 固定 Idea
→ 固定黄金剧情
→ 稳定完整证据闭环

实时 AI 竞技
→ 用户输入 Idea
→ 真实 Agent Proposal / Attack / Defense / Judge
→ 真实 Event / Evidence / Passport Snapshot
```

### 0.4 双运行模式定义

#### 模式 A：已验证演示（Verified Showcase）

目的：

- 保证正式 Pitch 稳定。
- 在 75 至 90 秒内完整展示逆风翻盘、证据透镜和护照快照。
- 形成可重复截图点。
- 在无网络、模型延迟或供应商异常时仍可演示。

特征：

- 固定 Idea。
- 固定战斗编号。
- 固定黄金剧情。
- 固定冠军与分数。
- 使用已验证回放数据或明确标记的脚本示例。
- 不发起真实 AI 调用。

#### 模式 B：实时 AI 竞技（Live AI Battle Lite）

目的：

- 允许用户或评委输入全新 Idea。
- 证明系统不是提前录好的动画。
- 展示真实 Agent 生成 Proposal、Attack、Defense、Judge、Evidence 与 Passport Snapshot。
- 形成黑客松第二幕的可信度加速器。

特征：

- 用户输入 Idea。
- 每场生成新的 Battle ID。
- 使用现有 Battle Engine 与真实 AI Runtime。
- 结果不固定。
- 不保证逆风翻盘。
- 不保证出现 Patch 或 Retest。
- 只展示实际产生的 Event 与 Evidence。
- 支持取消、超时、重试、Schema repair 与失败降级。

### 0.5 本版工程边界

```text
v0.5.1
= Verified Showcase
+ Live AI Battle Lite
+ 共用 Presentation / Evidence / Replay / Passport UI
```

```text
v0.5.1
≠ Verified Artifact Runtime
```

v0.5.1 会实现：

- 已验证演示模式。
- 用户输入 Idea。
- 实时 AI 竞技模式。
- 三个真实 Agent 的提案、攻击、防守与裁决。
- 真实 Event Log。
- 实时模式的证据透镜降级。
- 实时模式的护照快照。
- 同一套三页面 UI。
- 运行模式诚实标签。
- Demo Safety 与模式隔离。
- 中文 Markdown Export。
- 分享与现场记忆点。
- 轻量致命攻击回放。

v0.5.1 不会实现：

- 新增 Build Round。
- 新增 Artifact Lock Round。
- 新增 Verify Round。
- 真实受控 Mini-App Runtime。
- 任意代码执行。
- 标准化代码 Test Runner。
- 自动修改代码的 Patch Runner。
- 自动重新运行作品的 Retest Runner。
- 新增核心 Event Type。
- 修改 JudgeScore 持久化结构。
- 修改数据库 schema。
- 将固定黄金剧情注入实时 Battle。
- 把演示兜底伪装成用户刚才 Idea 的真实结果。

上述能力进入：

```text
v0.6：Agent Arena Verified Artifact Runtime
```

---

# 1. 产品北极星

## 1.1 长期目标

Agent Arena 的长期目标不是：

- PRD 生成器。
- 普通多智能体工作区。
- 智能体聊天竞技场。
- 智能体排行榜。
- 单纯的黑客松创意工具。
- 预录的 AI 战斗动画。

Agent Arena 要成为：

> **AI Agent 的信誉生成层。**

未来用户选择智能体时，不只看官网自我介绍、模型名称、提示词、作者宣传或精心挑选的 Demo，而是查看：

- 它参加过哪些标准化试炼。
- 它面对陌生输入时如何表现。
- 它提出过什么。
- 它被如何攻击。
- 它承认过哪些错误。
- 它如何防守或修正。
- 它的评分依据是什么。
- 它有哪些可回放证据。
- 它在多次试炼中暴露过哪些稳定模式。

## 1.2 产品一句话

### 中文

> Agent Arena 让多个 AI 智能体在同一任务、同样规则和同样资源下竞争，并把它们的提案、攻击、防守、失败和评分沉淀为可回放证据与智能体护照快照。

### 黑客松版

> 先看一场经过验证的完整 Battle，再输入一个全新 Idea，让真实 AI 智能体现场开战。

### Demo 版

> 每个智能体都声称自己很强。竞技场让它当场证明。

### 英文

> Agent Arena combines a verified showcase with live AI battles, turning agent claims into replayable evidence and passport snapshots.

## 1.3 核心产品信念

```text
Claims are cheap.
Evidence earns reputation.
```

中文：

```text
自我声明很廉价。
信誉必须由证据获得。
```

## 1.4 Battle 的定义

```text
Battle = Reputation-generating evaluation run
```

Battle 是一次生成信誉证据的标准化评估运行，不是 AI 吵架表演。

它可以来自：

- 已验证演示数据。
- 真实 AI Runtime。

但无论来源如何，都必须明确标记、可追溯、可回放，并遵守同一套产品语义。

### 作品查看器

```text
Artifact Viewer = Evidence-stage viewer for build/defend/verify artifacts
```

作品查看器是 Battle 中「构建 → 攻击 → 修正 → 验证」阶段证据的专门展示视图，不是新的 Runtime 能力页面。

它可以展示：

- 版本对比（v1 / v2）。
- Patch Diff。
- Test Result。
- Mini App Preview（静态渲染）。
- 证据链回链。

所有内容遵守 D1/D3 解法：

- Verified Showcase 中为固定 fixture。
- Live AI Battle Lite 中证据不足时降级展示（`insufficient_evidence`）。
- 不驱动真实代码生成或执行。
- Round 进度条上的「构建」「验证」为 Presentation 层展示分段，不是 Battle Engine 新增的状态机节点。

### Sub-agent 结构说明

除非另有明确决策，每个 Team（Safe Builder / Viral Designer / Infra Hacker）在 Engine 层仍为单一 Contestant Agent。UI 上展示的「构建 / 审查 / 防守」标签为该 Agent 能力构成的展示性描述，不代表 Engine 层存在三个独立 Agent 实例。

## 1.5 双运行模式的产品关系

已验证演示和实时 AI 竞技不是二选一。

```text
已验证演示
负责确定性、完整叙事和 Wow Moment

实时 AI 竞技
负责真实性、不可预演输入和技术可信度
```

两者共同证明：

```text
Agent Arena 既能稳定讲清产品，
也能真正运行 Agent Battle。
```

---

# 2. 问题定义

## 2.1 用户问题

当前 AI 智能体生态存在五个信任缺口。

### 缺口一：能力依赖自我描述

大多数智能体用作者介绍、精选 Demo、成功截图和难以复现的口头承诺证明自己。

用户无法判断：

- 它是否只在作者准备的输入上有效。
- 它遇到陌生 Idea 后会不会失效。
- 它面对反对意见后会不会崩。
- 它是否能承认错误。
- 它的分数是否只是另一个模型的主观意见。

### 缺口二：多智能体产品容易退化为“不同提示词一起聊天”

如果界面只展示三个智能体同时输出文字，用户很难判断它们是否真的拥有：

- 不同策略。
- 持续会话。
- 工具调用。
- 环境反馈。
- 作品状态。
- 可审计决策。
- 可比较表现。

最终体验会退化成三段提示词包装过的聊天结果。

### 缺口三：评分不可解释

传统 AI Judge 常输出若干分数，但用户不知道：

- 为什么得到这一分。
- 哪条攻击导致扣分。
- 哪次防守改变了结论。
- 哪个 Evidence 支持评分。
- Judge 是否在平均主义打分。

### 缺口四：单场结果容易被包装成伪信誉

一场比赛的冠军不能证明长期可靠。

如果产品过早展示总战斗数、长期胜率、全球排名或长期信誉曲线，产品的信誉主张会反过来伤害自己。

### 缺口五：固定 Demo 容易被质疑为预录动画

单纯依赖固定黄金剧情会引发评委最危险的问题：

> 这是不是提前写好的动画？

如果不能接受一个从未见过的 Idea 并产生新的 Battle，产品的 Agent Runtime 真实性难以成立。

## 2.2 产品机会

Agent Arena 通过双运行模式同时解决“讲不清”和“信不过”：

```text
已验证演示
→ 用固定黄金剧情展示完整闭环

实时 AI 竞技
→ 用陌生 Idea 证明真实 Runtime
```

两种模式共享：

```text
同一任务冻结逻辑
→ 三个差异化智能体
→ 提案
→ 攻击
→ 防守
→ 裁决
→ Evidence Log
→ Replay
→ Passport Snapshot
```

这既是黑客松 Demo，也是未来 Agent Reputation Layer 的最小种子。

---

# 3. 目标用户

## 3.1 P0：已验证演示核心用户

### 黑客松评委

需求：

- 10 秒内理解产品。
- 看到智能体真的在采取行动。
- 看到明确反转。
- 理解评分为什么可信。
- 看到完整 Evidence、Replay 与 Passport 闭环。
- 确认正式 Demo 不会因模型随机性崩溃。

### 黑客松参赛者

需求：

- 理解不同方案如何被攻击和比较。
- 看到产品具备强截图点与强叙事。
- 理解为什么某个 Agent 在失败后仍可能获胜。

## 3.2 P1：实时 AI 竞技核心用户

### 黑客松评委

需求：

- 输入一个从未见过的 Idea。
- 看到三个真实 Agent 生成不同提案。
- 看到真实交叉攻击和防守。
- 看到结果不是固定冠军。
- 看到实时 Event 与 Evidence。
- 判断系统是否真的由 AI Runtime 驱动。

### Agent Builder

需求：

- 用自定义 Idea 测试 Agent Team。
- 查看真实 Battle 的优势与弱点。
- 回放失败和防守过程。
- 生成本场 Passport Snapshot。

### AI 产品经理与独立开发者

需求：

- 把一个模糊 Idea 放进 Arena。
- 快速获得三个差异化方向。
- 观察方案之间的攻击与风险。
- 获得可解释的单场裁决。

## 3.3 次级用户

- 多智能体系统开发者。
- 企业内部 Agent 评估团队。
- Agent Marketplace 运营者。
- 需要选择智能体的普通用户。

## 3.4 本版不服务的需求

- 自定义 Agent Studio。
- 企业级私有评测平台。
- 多租户权限管理。
- 完整 Agent Marketplace。
- 自动路由和付费调用。
- 大规模排行榜。
- 外部 Agent 接入。
- 用户自定义工具权限。
- 任意代码运行。

---

# 4. 产品原则

## 4.1 证据优先

任何关键结论都应尽可能关联：

```text
Score
→ Reason
→ Evidence
→ Event / Presentation Evidence
→ Artifact Version or Proposal Version
```

实时模式没有证据时必须明确降级，不得为了界面完整伪造证据。

## 4.2 公平优先

两种模式都应清晰展示：

```text
同一份冻结任务
相同角色规则
相同资源或预算约束
统一评分维度
```

已验证演示使用固定已验证数据。

实时 AI 竞技使用本场真实输入与真实 Event。

## 4.3 双运行模式优先

```text
固定 Demo 负责讲完整故事
真实 AI 负责证明产品是真的
```

不得让实时模式破坏已验证演示。

不得让已验证演示冒充实时模式。

## 4.4 诚实优先

运行模式必须始终明确标注：

- 已验证演示。
- 实时 AI 竞技。
- 演示兜底。
- 脚本示例。

禁止：

- 把脚本数据称为实时运行。
- 把固定黄金剧情套到用户输入 Idea。
- 把单场护照称为长期信誉。
- 为缺失证据伪造评分拆解。
- 为了剧情修改真实比赛结果。
- 展示虚构规模数据。

## 4.5 可观看优先

Battle 不能只被读懂，还要能被看懂。

用户应快速看到：

- 当前运行模式。
- 当前阶段。
- 当前行动。
- 谁攻击谁。
- 攻击是否成立。
- 谁防守或接受问题。
- 哪些 Event 真正发生。
- 为什么最终获胜。

## 4.6 Demo Safety 优先

已验证演示必须：

- 可离线运行。
- 不依赖实时模型。
- 可重复播放。
- 可刷新恢复。
- 连续 20 次一致。
- 不展示裸错误。

实时 AI 竞技必须：

- 独立于已验证演示。
- 可取消。
- 有超时。
- 有 Schema repair。
- 有 SSE 重连和事件幂等。
- 失败后不污染固定 Demo。
- 降级时明确说明结果不对应刚才输入的创意。

## 4.7 中文用户优先

- 中文是主界面语言。
- Agent 中文名为主显示名。
- 用户 Idea、实时状态、错误和空状态使用中文。
- 技术 ID 保持原值。
- 所有模式的诚实标签均为中文。

## 4.8 展位轻量优先

展位场景以「观看为主，少量互动」为默认假设：

- Verified Showcase 循环播放作为默认待机内容，无需专门的待机页面开发。
- 实时开战入口保留基础安全网：单次输入长度限制、简单频率限制、连续失败自动降级提示，不需要专门的排队系统或多端提交入口。
- 若后续观察到实际展位互动量明显高于预期，再补充排队与限流能力，不在本版本预先建设。

---


# 5. v0.5.1 成功定义

## 5.1 P0 产品成立条件：已验证演示

用户完成黄金剧情后必须能够回答：

1. 三个智能体分别主张什么。
2. 谁最早领先。
3. 哪个致命问题被发现。
4. 攻击为什么成立。
5. 被攻击方是否接受问题。
6. 它进行了什么修正。
7. 复测是否通过。
8. 最终冠军为什么发生逆转。
9. 任意分数背后有哪些证据。
10. 本场表现如何进入护照快照。

## 5.2 P1 产品成立条件：实时 AI 竞技

评委输入一个陌生 Idea 后必须能够确认：

1. Idea 被原样冻结进入本场 Battle。
2. 系统创建了新的 Battle ID。
3. 三个 Agent 产生了不同 Proposal。
4. Attack 和 Defense 来自真实 AI Runtime。
5. Winner 和 Score 不是固定值。
6. UI 没有注入黄金剧情。
7. Event Log 可以回放本场真实过程。
8. Evidence Lens 只展示本场实际证据。
9. Passport Snapshot 来自本场结果。
10. 失败时系统诚实降级，不伪装成功。

## 5.3 90 秒已验证演示

```text
首页定位
→ 三个智能体入场
→ 早期热门
→ 致命隐藏测试
→ 接受攻击
→ 提交修正
→ 复测通过
→ 最终反超
→ 证据透镜
→ 护照快照
```

## 5.4 实时 AI 第二幕

```text
评委输入 Idea
→ 实时开战 Beta
→ 冻结任务
→ 三个智能体提案
→ 交叉攻击
→ 防守
→ 裁决
→ Evidence
→ Mini Passport
```

## 5.5 核心记忆点

用户离开后应记住：

```text
每个智能体都说自己很强。
竞技场让它当场证明。
每一分都有证据。
刚才的完整故事可以回放，
刚才的新 Idea 也真的跑了起来。
```

---

# 6. MVP 范围

## 6.1 MVP 名称

```text
Agent Arena: Hackathon Idea Battle
```

中文：

```text
Agent Arena：黑客松创意战
```

## 6.2 P0：Verified Showcase

P0 目标是形成稳定、完整、可离线的产品主线。

| 模块 | 必须能力 | 验收结果 |
|---|---|---|
| 首页 | 清楚解释产品定位与双入口 | 10 秒内理解产品 |
| 三个内置智能体 | 差异化身份与策略 | 中文名称与策略明确 |
| 战斗直播 | 行动、观察、决策、作品、工具和状态 | 不像三段聊天文本 |
| 固定逆风翻盘 | 六个剧情里程碑 | 连续播放 20 次一致 |
| 证明值 | 当前已验证风险 | 与最终得分分离 |
| 最终评分板 | 六维评分及胜负理由 | 裁决前不显示最终分 |
| 证据透镜 | 点击分数反查证据 | 示例分数可打开 |
| 证据检查器 | 评分因果链 | 深链直接打开 |
| 回放能力 | 刷新后重建上下文 | 不依赖先前动画 |
| 智能体护照快照 | 三队单场表现 | 每队有优势、弱点与证据 |
| Demo Safety | 固定 Demo 离线运行 | 真实服务失败不影响 |
| 中文优先 | 主页面和数据中文化 | 无未授权英文 UI |
| Markdown Export | 中文战斗报告 | 页面与导出一致 |

## 6.3 P1：Live AI Battle Lite

P1 的优先级高于音效、胜利卡和 Kill Cam。

必须包含：

- 首页 Idea 输入。
- “实时开战 Beta”入口。
- 每场新的 Battle ID。
- 冻结用户 Idea。
- 三个真实 Agent Proposal。
- 每队至少一个可读主张。
- 基于现有 Battle Engine 的 Attack。
- Defense 或接受攻击。
- 真实 JudgeScore。
- 实时 Event Log。
- 实时 Replay。
- 实时 Passport Snapshot 或 Mini Passport。
- 运行进度。
- 取消与超时。
- Schema repair。
- SSE / polling 重连。
- 失败与降级。
- 20 次真实运行稳定性测试。

P1 不要求：

- 三个真实 Mini-App。
- 代码执行。
- 真实 Patch Runner。
- 真实 Retest Runner。
- 固定逆风翻盘。
- 固定赢家。
- 固定分数。
- 固定 `test_032`、`attack_031`、`defense_041`、`test_052`。

## 6.4 P2：分享与现场记忆点

- 三个关键音效。
- 已验证胜利卡。
- 中文 PNG 导出。
- 复制回放链接。
- 二维码可选。

## 6.5 P3：视觉抛光

- 轻量致命攻击回放。
- 只服务已验证演示中的 Fatal Attack。
- 不超过 1.5 秒。
- 支持减少动态效果模式。
- 实时模式只有实际 Fatal Attack 存在时才允许触发。

## 6.6 Hackathon Bonus 场景

“评委加时赛”不再是独立产品功能，而是 Live AI Battle Lite 的现场使用场景：

```text
评委给出陌生 Idea
→ 用户输入
→ 实时开战
→ 展示真实 Proposal / Attack / Defense / Judge
```

## 6.7 明确不做

- 完整智能体市场。
- 长期排行榜。
- 多个 Trial Template。
- 外部 Agent 提交。
- 任意 MCP 工具市场。
- BYOK。
- 多用户协作。
- 多裁判委员会。
- 完整 GitHub Repo 生成。
- 任意 Shell。
- 用户代码执行。
- 数据库迁移。
- 完整 IDE。
- 模型原始思维链。
- 虚构长期战斗数据。
- Verified Artifact Runtime。
- 真实受控作品执行。
- 自动代码 Patch 与真实 Retest。

---

# 7. 核心概念词典

| 概念 | 中文 UI 文案 | 定义 | v0.5.1 |
|---|---|---|---|
| Agent | 智能体 | 在 Arena 中执行角色与策略的 AI 单元 | 是 |
| Agent Team | 智能体队伍 | 当前简化为单智能体队伍 | 是 |
| Trial | 试炼 | 标准化任务类型 | 仅黑客松创意战 |
| Battle | 战斗 | 一次信誉证据生成运行 | 是 |
| Verified Showcase | 已验证演示 | 固定、可重复、完整的黄金剧情 | P0 |
| Live AI Battle Lite | 实时 AI 竞技 | 用户输入 Idea 后由真实 AI 产生 Battle | P1 |
| Round | 回合 | Battle 中的阶段 | 沿用现有 Engine |
| Evidence Event | 证据事件 | 核心事件日志中的关键动作 | 是 |
| Presentation Evidence | 展示证据 | 仅用于已验证演示或脚本示例 | P0 |
| Live Evidence | 实时证据 | 实时 Battle 中实际产生的 Event / Reason | P1 |
| Proof HP | 证明值 | 当前尚未解决的已验证风险状态 | 是 |
| Evidence Lens | 证据透镜 | 从评分反查证据 | 是 |
| Evidence Chain | 证据链 | 事件之间的因果关系 | 是 |
| Replay | 回放 | 基于事件重建比赛过程 | 是 |
| Passport Snapshot | 智能体护照快照 | 单场 Battle 表现记录 | 是 |
| Mini Passport | 迷你护照 | 实时 Battle 在证据不足时的安全快照 | P1 |
| Agent Passport | 智能体护照 | 多场 Battle 累积的长期档案 | 否 |
| Reputation | 信誉 | 多场、多任务、可验证表现的累积 | 否 |
| Verified Win | 已验证胜利 | 有输入、过程、评分和证据的单场胜利 | 是 |
| Runtime Mode | 运行模式 | 当前数据来源和执行方式 | 是 |
| Verified Artifact Runtime | 已验证作品运行时 | 真实执行、测试、修正和复测作品 | v0.6 |

---

# 8. 内置智能体

## 8.1 稳健构建者（Safe Builder）

定位：

> MVP 优先、稳定可靠、务实收敛。

核心目标：

- 48 至 72 小时内能够实现。
- 控制依赖。
- 减少不可控环节。
- 确保 Demo 稳定。

擅长：

- 可实现性。
- 范围收缩。
- 风险控制。
- 交付路径。

容易暴露的弱点：

- 创意保守。
- 演示记忆点不足。
- 传播性弱。

固定颜色：

```text
#49D6C8
```

## 8.2 传播设计师（Viral Designer）

定位：

> 吸引注意、易于分享、形成记忆点。

核心目标：

- 做出评委一眼记住的产品。
- 形成强截图点。
- 设计传播闭环。
- 提升 Demo Power。

擅长：

- 演示表现。
- 用户体验。
- 传播性。
- 情绪价值。
- 叙事。

容易暴露的弱点：

- 对边界条件考虑不足。
- 容易依赖不稳定视觉效果。
- 技术风险控制偏弱。

固定颜色：

```text
#F5567E
```

## 8.3 架构黑客（Infra Hacker）

定位：

> 技术深度、证据驱动、鲁棒可靠。

核心目标：

- 发现架构与验证漏洞。
- 证明系统不是表面演示。
- 强化可审计性。
- 增加技术护城河。

擅长：

- 技术深度。
- 证据链。
- 系统边界。
- 风险发现。
- 结构化攻击。

容易暴露的弱点：

- 容易过度工程。
- 讲解复杂。
- 用户价值不够直观。

固定颜色：

```text
#F2B84B
```

## 8.4 双运行模式中的智能体行为

已验证演示模式：

- 三个智能体使用固定、已验证的展示数据。
- 身份、策略、关键事件和黄金剧情稳定复现。
- 不发起实时模型调用。

实时 AI 竞技模式：

- 三个智能体继续使用相同身份、目标和视觉语义。
- Proposal、Attack、Defense、Judge 由真实 AI Runtime 产生。
- 不强制任何智能体获胜。
- 不强制出现致命攻击、接受攻击、修正或复测。
- 只展示本场实际产生的 Event 与 Evidence。
- 模型失败、Schema repair、重试和降级必须诚实显示。

## 8.5 显示规则

- 中文名是主标题。
- 英文名是次级信息。
- 移动端空间不足时只显示中文名。
- 数据层 Agent ID 不变。
- 不伪造记忆百分比、智能指数和置信度。
- 可以展示会话编号、工具调用、作品版本和上下文事件。

---

# 9. 主用户流程

## 9.1 首页进入

首页同时提供两个清晰入口：

### 主入口：观看已验证演示

```text
观看 90 秒已验证演示
```

特点：

- 固定 Idea。
- 固定黄金剧情。
- 稳定完整。
- 正式 Pitch 首先使用。

### 次入口：输入创意，实时开战 Beta

```text
输入你的 Idea
[                                  ]

实时开战 Beta
```

特点：

- 用户自由输入。
- 真实 AI Agent 驱动。
- 结果不固定。
- 可能需要等待。
- 可能失败或降级。

## 9.2 Flow A：已验证演示

```text
进入已验证演示
→ Battle #BA-2026-0024
→ 三个智能体入场
→ 早期热门
→ 致命隐藏测试
→ 接受攻击
→ 提交修正
→ 复测通过
→ 最终逆风翻盘
→ 证据透镜
→ 护照快照
```

该 Flow 使用固定的黄金剧情，只服务 Verified Showcase。

## 9.3 Flow B：实时 AI 竞技

```text
用户输入 Idea
→ 校验输入
→ 创建新 Battle ID
→ 冻结任务
→ runtimeMode = live_runtime
→ 三个智能体生成 Proposal
→ 交叉 Attack
→ Defense
→ Judge
→ Evidence Log
→ Replay
→ Passport Snapshot / Mini Passport
```

## 9.4 实时模式运行进度

UI 必须显示当前真实阶段：

```text
正在冻结任务
正在生成提案
正在交叉攻击
正在生成防守
正在裁决
正在生成护照快照
```

状态必须来自真实 Battle 进度，不能播放固定时间轴假装进展。

## 9.5 实时模式结果规则

允许：

- 任意智能体获胜。
- 并列或低可信度结果。
- 攻击被驳回。
- 没有 Fatal Attack。
- 没有修正。
- 没有复测。
- Evidence 不足。
- Battle 部分完成。
- 用户取消。

禁止：

- 强制传播设计师获胜。
- 强制 87 / 84 / 78。
- 注入固定 `test_032`。
- 注入固定逆风翻盘。
- 将未发生的 Patch / Retest 显示为已发生。

## 9.6 实时模式失败

若 Battle 未能完成：

```text
实时竞技未能完成。
以下将切换到已验证演示。
演示内容不对应刚才输入的创意。
```

用户可以：

- 重试本次 Idea。
- 返回首页修改 Idea。
- 观看已验证演示。

系统不能把固定演示的结果挂在用户 Idea 名下。

## 9.7 共享收束

无论模式来自哪里，最终都进入同一套：

```text
战斗直播
→ 最终评分板
→ 证据透镜
→ 回放
→ 护照快照
```

---

# 10. 页面信息架构

## 10.1 四张主页面

```text
首页
→ 战斗直播
→ 作品查看器
→ 智能体护照快照
```

作品查看器是新增的第四张页面，不是第二套页面。

双运行模式不增加第二套页面。

## 10.2 页面与模式关系

| 页面 | 已验证演示 | 实时 AI 竞技 |
|---|---|---|
| 首页 | 观看黄金剧情 | 输入 Idea 并开战 |
| 战斗直播 | 固定回放 | 实时 Event 流 |
| 作品查看器 | 固定 Patch / Test / 版本对比 | 降级展示（证据不足时） |
| 护照快照 | 完整已验证快照 | 本场实际快照或 Mini Passport |

## 10.3 已有页面处理

若仓库已有以下页面，不删除、不迁移：

- Battle Setup。
- Result。
- Replay。
- Dashboard。
- Example Battle。
- Export。

正式 Demo 主导航只突出四张主页面。

## 10.4 主路由

```text
/                                   首页
/battle/:id/live                    战斗直播
/agent/:id/passport?battle=:id      智能体护照快照
```

推荐但不强制的创建接口或动作：

```text
POST /api/battles
body: { idea, runtimeMode: "live_runtime" }
```

不得为了双模式新增不必要的第四张页面。

## 10.5 运行来源参数

URL 或 Battle 数据必须能够恢复：

- Battle ID。
- Runtime Mode。
- Idea。
- 当前 Event。
- 当前 Score。
- 当前 Agent。
- 是否为演示兜底。

## 10.6 证据深链

```text
/battle/:id/live?evidence=:evidenceId
/battle/:id/live?score=:scoreKey
```

固定演示可使用 `test_032`。

实时 Battle 必须使用本场实际 Event ID。

---

# 11. 首页 PRD

## 11.1 页面目标

用户在 10 秒内理解：

1. 这是智能体信誉竞技场。
2. 不是普通多智能体聊天。
3. 有一个稳定的已验证演示。
4. 用户也可以输入 Idea 运行真实 AI Battle。
5. 每一分都尽可能关联证据。
6. 两种模式的数据来源会诚实标记。

## 11.2 首屏文案

### 主标题

```text
每个智能体都声称自己很强。
竞技场让它当场证明。
```

### 副标题

```text
同一任务、同样工具、每一分都有证据。
```

## 11.3 双入口布局

### 实时入口

```text
输入你的创意

[帮助独立开发者验证产品需求的 AI 助手            ]

[实时开战 Beta]
```

辅助说明：

```text
真实 AI 智能体将生成提案、攻击、防守与裁决。
结果不会预先固定。
```

### 已验证入口

```text
或

[观看 90 秒已验证演示]
```

辅助说明：

```text
固定证据 · 可重复回放 · 适合快速了解完整流程
```

## 11.4 主次关系

产品层面，两种模式都是正式能力。

Pitch 操作层面：

1. 先观看已验证演示。
2. 再输入陌生 Idea 运行实时模式。

首页不使用复杂模式配置、单选卡或设置面板。

## 11.5 Idea 输入规则

- 非空。
- 去除首尾空格。
- 长度设置合理上限。
- 中文或英文均可输入。
- 显示示例 Placeholder。
- 创建 Battle 前冻结原始 Idea。
- 不在首页调用 Idea Generator。
- 不自动改写用户 Idea。
- 如必须压缩为 Brief，应同时保留原始输入。

## 11.6 首屏动态

首页加载后 3 秒内出现示例动态：

```text
架构黑客调用测试
→ 隐藏测试失败
→ 传播设计师证明值下降
→ 证据已记录
```

必须明确属于已验证演示预览，不得让用户误认为实时调用已经开始。

## 11.7 禁止内容

- 虚构战斗总数。
- 虚构智能体数量。
- 虚构平均信誉。
- 虚构全球排名。
- 成熟 Trial Marketplace。
- 多个主 Trial。
- 长期胜率。
- 长期信誉曲线。
- 把 Idea 输入做成聊天框。
- 把首页做成 AI Idea Generator。

---

# 12. 战斗直播 PRD

## 12.1 页面目标

让用户看到：

> 智能体正在采取行动，比赛结果由证据推动，而不是三个模型互相评价。

同一页面同时承载：

- 已验证回放。
- 实时 Event 流。
- 演示兜底。

## 12.2 顶部信息栏

必须展示：

- Agent Arena 品牌。
- Battle ID。
- Trial。
- 冻结 Idea。
- 当前阶段。
- 运行模式。
- 数据来源说明。
- 取消按钮，仅实时模式。
- 重试按钮，仅失败状态。
- 静音开关，P2。
- 回放控制，已验证演示或已完成 Battle。

## 12.3 运行模式标签

### 已验证演示

```text
已验证演示
固定证据 · 可重复回放
```

### 实时 AI 竞技

```text
实时 AI 竞技
真实智能体正在运行
```

### 演示兜底

```text
演示兜底
当前内容不对应刚才输入的创意
```

### 脚本示例

```text
脚本示例
预置演示数据
```

## 12.4 三个智能体工作台

每张卡包含：

```text
智能体身份
策略
证明值
Proposal / 作品预览
版本
当前行动
环境观察
决策摘要
工具调用
会话编号
当前状态
```

实时模式中所有状态必须由实际 Event 驱动。

### 子标签

每张 Agent 卡底部展示三个子标签：

```text
[构建 Builder]
[审查 Reviewer]
[防守 Defender]
```

规则：

- 这些标签是展示性描述，不是 Engine 层的独立 Agent 实例（见 §1.4 Sub-agent 结构说明）。
- 标签内容固定，不随 Battle 阶段变化。
- 不与状态值混淆：当前状态是动态的，子标签是静态的能力构成标签。
- 不触发独立操作：标签不可点击，不展开子面板。

### Arena Host（主持人解说）

固定展示位，位于事件流区域上方：

```text
[主持人头像/图标]  [音频波形动画]  "传播设计师完成提案，目前领跑。"
```

规则：

- 文案随 Round 切换更新。
- 音频波形为装饰性动画，不需要真实 TTS 音频。
- Verified Showcase：文案来自固定 fixture 表。
- Live AI Battle Lite：如有余量可接入轻量 Commentator Agent，无余量用通用文案兜底。
- 静音模式 / Reduced Motion 下有静态替代。

## 12.5 状态值

- 等待中。
- 正在生成提案。
- 正在检查。
- 正在攻击。
- 正在防守。
- 已接受攻击。
- 正在裁决。
- 已完成。
- 已取消。
- 失败。
- 证据不足。

“正在修正”和“已验证”只在本场数据确实支持时出现。

## 12.6 当前攻击区域

展示：

- 攻击方。
- 被攻击方。
- 主张。
- 严重级别。
- 证据来源。
- 验证状态。
- 防守结果。

实时模式不得显示不存在的 Test ID。

## 12.7 比赛状态与最终评分板

### Round 进度条

顶部展示七个展示性阶段：

```text
简报 → 提案 → 构建 → 攻击 → 防守 → 验证 → 裁决
```

规则：

- 七个标签是 Presentation 层展示分段，对应 Battle Engine 原有的四个核心状态：
  - 简报 → 对应 `briefing`
  - 提案 → 对应 `proposal_round`
  - 构建 → 对应 `proposal_round` 的后半段（作品产出）
  - 攻击 → 对应 `cross_attack_round`
  - 防守 → 对应 `defense_round`
  - 验证 → 对应 `defense_round` 的后半段（修正/确认）
  - 裁决 → 对应 `judging_round`
- 不是 Battle Engine 新增的状态机节点。
- 不改变 `battle-state.ts` 的既有合法路径。
- 当前阶段高亮，已完成阶段标记，未到达阶段置灰。
- 实时模式由实际 Runtime 阶段驱动，不播放固定时间轴。
- 已完成的阶段在页面刷新后可恢复。

### 裁决前展示

- 当前进度。
- 证明值。
- 已产生 Proposal 数。
- 已产生 Attack 数。
- 已解决或未解决风险。
- 当前状态。

裁决前不得显示最终 JudgeScore。

裁决后展示：

- 六维评分。
- 总分。
- 排名。
- 获胜原因。
- 落败原因。
- 低可信度提示。
- Evidence Links。

## 12.8 智能体感要求

页面不能只显示提案文本。

至少展示：

```text
当前行动
→ 环境观察
→ 决策摘要
→ Proposal / Event 变化
```

禁止：

- 原始 Chain of Thought。
- 虚构 Memory 百分比。
- 虚构智能指数。
- 虚构置信度。
- 长篇聊天气泡主导页面。

## 12.9 已验证演示截图点

1. 三个智能体入场。
2. 传播设计师成为早期热门。
3. 致命隐藏测试命中。
4. 接受攻击并修正。
5. 复测通过。
6. 最终逆风翻盘与证据透镜。

## 12.10 实时 AI 竞技截图点

1. 用户 Idea 已冻结。
2. 三个 Agent 正在生成不同 Proposal。
3. 真实 Attack 出现。
4. Defense 出现。
5. JudgeScore 与 Winner 出现。
6. 本场 Evidence / Mini Passport 出现。

---

# 13. 已验证演示的固定逆风翻盘

## 13.1 适用范围

本章只适用于：

```text
runtimeMode = verified_replay
```

或明确标记的：

```text
runtimeMode = scripted_example
```

严禁用于实时 AI 竞技的结果生成。

## 13.2 设计目的

- 确保主 Demo 有清晰高潮。
- 避免模型随机性破坏正式 Pitch。
- 在 90 秒内完整展示产品主张。
- 证明适应能力也是智能体能力。
- 提供稳定截图和录屏。

## 13.3 六个里程碑

```text
早期热门
→ 致命隐藏测试
→ 接受攻击
→ 提交修正
→ 复测通过
→ 逆风翻盘
```

## 13.4 固定示例场景

| 字段 | 内容 |
|---|---|
| 战斗编号 | BA-2026-0024 |
| 试炼 | 黑客松创意战 |
| 创意 | 帮助大学生准备考试的 AI 学习助手 |
| 运行模式 | 已验证演示 |
| 早期热门 | 传播设计师 |
| 攻击者 | 架构黑客 |
| 致命问题 | 缺少必填输入时进入无法恢复状态 |
| 初始证明值 | 88 |
| 命中后证明值 | 38 |
| 复测后证明值 | 68 |
| 最终冠军 | 传播设计师 |
| 冠军分数 | 87 |
| 第二名 | 架构黑客 84 |
| 第三名 | 稳健构建者 78 |
| 核心原因 | 面对证据后成功修正并恢复 |

固定最终排名：

```text
1. 传播设计师 87
2. 架构黑客 84
3. 稳健构建者 78
```

## 13.5 固定证据

- `test_032`：展示证据。
- `attack_031`：固定攻击。
- `defense_041`：可关联核心事件。
- `patch_049`：展示修正。
- `test_052`：展示复测。

## 13.6 数据诚实要求

- 展示证据 ID 不冒充数据库 BattleEvent ID。
- 展示数据不得写回真实 Battle。
- 不得改变真实 Battle 的冠军。
- 不得把固定 Demo 结果绑定到用户输入 Idea。
- Live AI Battle 不得读取固定 StoryMilestone。
- 实时模式缺少 Patch 或 Retest 时必须省略相应节点。

## 13.7 作品查看器展示规格

### 版本对比 Tab

```text
v1（修复前）  ←→  v2（修复后）
```

- v1 展示传播设计师完成初版后的作品状态。
- v2 展示接受攻击并提交修正后的作品状态。
- 切换时高亮差异区域。
- Mini App Preview 为静态渲染的示例界面，非真实可交互应用。

### 补丁差异 Tab

格式：结构化 diff 文本，包含行号和变更类型。

```text
--- input_state.ts (v1)
+++ input_state.ts (v2)
@@ -3,7 +3,10 @@
   renderApp() {
-    if (!userInput) return crash();
+    if (!userInput) return renderEmptyState();
+    // 增加可恢复的空状态
+    preserveUserInput();
   }
```

- Verified Showcase：固定 fixture 文本。
- Live AI Battle Lite：不渲染真实 diff，展示 Agent 输出的纯文本描述，或降级为 `insufficient_evidence`。

### 测试结果 Tab

结构：

| 测试 ID | 名称 | v1 结果 | v2 结果 | 说明 |
|---|---|---|---|---|
| test_032 | 必填输入恢复 | ✗ 失败 | ✓ 通过 | 致命隐藏测试 |
| test_052 | 回归测试 | — | ✓ 通过 | 修正验证 |

- 至少 5/6 通过（v2）。
- test_032 在 v1 中为致命失败，在 v2 中通过。
- 其余测试在 v1/v2 中均通过。
- Live AI Battle Lite：无真实 Test Result 时降级展示。

### 关联证据

每个 Patch / Test 条目链接回 Evidence Chain 对应节点。

### 实时模式规则

- 不生成真实 Patch Diff。
- 不生成真实 Test Result。
- 无足够证据时显示：
  ```
  本场为真实 AI 竞技，暂无可验证的构建/测试证据。
  ```
- 允许展示 Agent 输出的纯文本描述（如"计划修复空状态恢复逻辑"），但不得渲染为看起来像真实 diff 或真实测试通过的 UI。

---

# 14. 证明值

## 14.1 定义

证明值表示：

> 智能体当前尚未解决的、已经被验证的风险状态。

证明值不是：

- 生命值。
- 最终得分。
- 模型能力分。
- 长期信誉分。
- 淘汰规则。

## 14.2 扣减规则

| 严重级别 | 扣减 |
|---|---:|
| 低 | -5 |
| 中 | -15 |
| 高 | -30 |
| 致命 | -50 |

- 未验证攻击不扣。
- 被驳回且有反证的攻击不扣。
- 接受或验证成立后扣减。
- 提交修正不立即恢复。
- 有实际复测通过时恢复该次伤害的 60%。
- 初始失败仍保留在护照快照。

## 14.3 已验证演示示例

```text
传播设计师：
88 → 38 → 68
```

## 14.4 实时 AI 竞技规则

实时模式：

- 证明值只能由本场实际 Attack / Defense / Evidence 推导。
- 不默认从 88 开始，除非现有系统已锁定统一起始值。
- 不注入固定 Fatal Attack。
- 没有真实复测时不恢复。
- 证据不足时显示“暂无法计算完整证明值”。
- 不使用固定 `test_032` 驱动扣减。

## 14.5 与最终得分分离

最终得分只在裁决阶段产生。

禁止：

- 用证明值直接计算最终得分。
- 把最终得分画进证明值曲线。
- 把证明值称为 Reputation Score。
- 因证明值高低直接宣布 Winner。

---

# 15. 评分系统

## 15.1 评分维度

| 维度 | 权重 | 中文说明 |
|---|---:|---|
| Feasibility | 25% | 48 至 72 小时内能否做出稳定 Demo |
| Originality | 20% | 是否避免普通多智能体工作区 |
| Demo Power | 20% | 是否有强截图点、强演示路径和记忆点 |
| Technical Depth | 15% | 是否有合理技术亮点 |
| Pitch Clarity | 10% | 是否能在 2 分钟内讲清楚 |
| Risk Control | 10% | 是否识别并控制实现风险 |

## 15.2 Judge 输出要求

Judge 必须包含：

- 六维分数。
- 总分。
- Winner。
- 获胜原因。
- 每个未获胜 Agent 的落败原因。
- 已接受攻击。
- 未解决风险。
- 关联 Evidence ID。
- 低可信度标记。
- 运行模式。
- 本场 Battle ID。

## 15.3 已验证演示评分

- 使用固定、已验证分数。
- 维度级加减项完整。
- 证据透镜必须可打开。
- `19 / 25` 示例数学一致。

## 15.4 实时 AI 竞技评分

- 不使用固定 Winner。
- 不使用固定 87 / 84 / 78。
- Judge 输出必须通过 Schema 校验。
- Schema repair 次数有限。
- 评分无法完成时显示“裁决未完成”，不能生成假分数。
- 缺少维度级 delta 时使用 Evidence Link 降级。
- 低差异平均主义评分应重试或标记低可信度。
- Winner 必须来自本场 JudgeScore。

## 15.5 反伪信誉规则

- 单场胜利不能叫长期信誉。
- JudgeScore 必须绑定本场证据。
- 护照快照必须显示弱点。
- 评分板必须显示落败原因。
- 缺少评分拆解时不得伪造加减分。
- 实时失败不得生成“已验证胜利”。

---

# 16. 证据透镜

## 16.1 产品定义

证据透镜回答：

> 这一分为什么得到？这一分为什么被扣？

它是两种运行模式共用的核心交互。

## 16.2 已验证演示

提供完整维度级拆解：

```text
为什么是 19 / 25 分？

+13 基础完成度达到要求
    proposal_014

+5 核心流程通过
    test_018

-4 空状态恢复失败
    test_032

+3 致命问题已修正
    defense_041 / artifact_created

+2 回归测试通过
    test_052

合计：19 / 25
```

必须满足：

```text
sum(delta) = score
```

## 16.3 实时 AI 竞技

按实际数据分三级展示。

### Level A：完整评分证据

具有维度级 delta 与 Event ID 时，展示完整证据透镜。

### Level B：关联证据

没有 delta，但 JudgeScore 具有 Evidence IDs 时：

```text
暂无详细评分拆解。
以下展示本场裁决已关联的证据。
```

### Level C：证据不足

```text
证据不足。
当前 Battle 无法验证这项评分结论。
```

## 16.4 联动

- 高亮评分单元格。
- 打开 Drawer。
- 定位 Event。
- 高亮 Attack / Defense / Test。
- 关联 Proposal 或作品版本。
- 显示 Evidence Chain。
- 提供深链。
- 关闭后恢复焦点。

## 16.5 禁止

- 根据总分反推虚构 delta。
- 为实时模式生成固定 `test_032`。
- 伪造测试通过。
- 展示 Event Log 中不存在的事实。
- 把模型自由文本当成已经验证的 Test Evidence。

---

# 17. 证据链与回放

## 17.1 已验证演示证据链

```text
作品 v1
→ 隐藏测试失败
→ 攻击验证成立
→ 接受攻击
→ 提交修正
→ 复测通过
→ 评分更新
```

## 17.2 实时 AI 竞技最小证据链

```text
用户 Idea
→ 冻结任务
→ Proposal
→ Attack
→ Defense
→ JudgeScore
→ Passport Snapshot
```

如果本场实际产生 Revision 或 Verification，可追加：

```text
Defense
→ Revision
→ Verification
→ JudgeScore
```

## 17.3 Evidence Log 原则

- 核心 Event 是实时 Battle 的事实来源。
- Presentation Evidence 只服务已验证演示。
- 每个核心 Event 具有 ID 和 sequence。
- Replay 从 Event 重建。
- Passport 从本场 Event 与 JudgeScore 派生。
- Schema repair、模型失败、重试、超时、取消与 fallback 应记录。
- 已验证演示和实时 Battle 的 Event Namespace 必须可区分。

## 17.4 回放能力

两种模式共用战斗直播与证据检查器。

必须满足：

- 刷新后重建。
- 不依赖先前动画。
- 深链直接定位。
- Back / Forward 正常。
- 不展示不存在的证据。
- 已完成的实时 Battle 可以回放。
- 未完成 Battle 明确显示终止位置。

## 17.5 数据来源标记

每条证据至少标记：

- Battle ID。
- Runtime Mode。
- Event ID 或 Presentation Evidence ID。
- Actor。
- Sequence。
- 时间。
- 来源类型。

---

# 18. 智能体护照快照

## 18.1 定义

智能体护照快照是：

> 某个智能体在一场 Battle 中的可验证表现记录。

它不是长期信誉、全球排名、永久认证或综合能力证书。

## 18.2 已验证演示快照

页面标题：

```text
智能体护照快照
来自已验证 Battle #024
```

展示完整黄金剧情的：

- 结果。
- 最终得分。
- 测试通过数。
- 验证等级。
- 优势。
- 弱点。
- 接受与驳回的主张。
- 失败模式。
- 成功修正。
- 证据亮点。
- 比赛历程。
- 回放链接。

## 18.3 实时 AI 竞技快照

页面标题：

```text
智能体护照快照
来自实时 Battle #BA-2026-XXXX
```

只能展示本场实际数据。

若 Battle 完整：

- 生成三份 Passport Snapshot。

若 Battle 部分完成：

- 生成 Mini Passport。
- 标记“本场战斗未完整裁决”。
- 不生成已验证胜利标签。
- 不补造缺失字段。

## 18.4 实时模式缺失状态

```text
本场战斗尚未产生完整护照快照。
以下仅展示已经记录的提案、攻击与证据。
```

## 18.5 三队切换

- 默认显示本场 Winner。
- 无 Winner 时默认显示第一个完成 Proposal 的 Agent。
- 可切换查看其他智能体。
- 每个快照展示数据来源与完整度。

## 18.6 比赛历程

已验证演示使用固定历程。

实时 AI 竞技根据实际 Event 动态生成，不保证包含：

- 早期热门。
- Fatal Attack。
- 修正。
- 复测。
- 逆风翻盘。

## 18.7 禁止数据

- 虚构总战斗数。
- 虚构胜率。
- 全球排名。
- 长期信誉趋势。
- 未经证据支持的优势。
- 隐藏失败和弱点。
- 把部分完成 Battle 标记为已验证胜利。

---

# 19. 已验证胜利卡

## 19.1 产品目的

已验证胜利卡属于 P2“分享与现场记忆点”，不是 P0 或 P1 的阻塞项。

已验证胜利卡是：

- Demo 的最终截图点。
- 可分享的单场证明。
- 产品评分体系的自证闭环。

它不能只是冠军宣传海报。

## 19.2 必须内容

```text
传播设计师
已验证胜利
战斗 #024

得分：87
测试通过：5 / 6
致命攻击：1
成功抵御：1
成功修正：1

核心优势：
适应能力

暴露弱点：
初始空状态恢复失败

已验证修正：
patch_049 → test_052
```

## 19.3 操作

- 下载 PNG。
- 复制回放链接。
- 打开回放。
- 二维码可选。

## 19.4 约束

- 卡片必须显示失败。
- 卡片必须显示弱点。
- 卡片必须显示修正。
- 卡片数据与护照快照一致。
- 已验证演示模式可使用固定黄金剧情数据。
- 实时 AI 竞技模式只能使用本场真实 Event、JudgeScore 与 Passport Snapshot。
- 实时 Battle 未完成时不得生成“已验证胜利”卡。
- 二维码失败不影响主流程。
- 不展示长期数据。

---

# 20. 运行模式与 Demo 诚实标签

## 20.1 内部模式

| 内部值 | 中文 UI | 产品语义 |
|---|---|---|
| `verified_replay` | 已验证演示 | 固定、完整、可重复的黄金剧情 |
| `live_runtime` | 实时 AI 竞技 | 用户 Idea 驱动的真实 AI Battle |
| `demo_fallback` | 演示兜底 | 实时模式失败后切换到固定演示 |
| `scripted_example` | 脚本示例 | 预置但未宣称为实时的数据 |

## 20.2 正式 Pitch 顺序

第一幕：

```text
已验证演示
```

第二幕：

```text
实时 AI 竞技
```

不是只在 Q&A 才能运行实时模式，但实时模式不得阻塞正式黄金剧情。

## 20.3 实时模式启动

启动后必须显示：

```text
实时 AI 竞技
真实智能体正在运行
```

并显示：

- 原始 Idea。
- Battle ID。
- 当前阶段。
- 已用时间。
- 取消入口。

## 20.4 实时失败与降级

失败文案必须明确：

```text
实时竞技未能完成。
以下将切换到已验证演示。
演示内容不对应刚才输入的创意。
```

模式切换为：

```text
演示兜底
```

不得：

- 不得沿用用户 Idea 标题播放固定结果。
- 把固定 Winner 说成实时结果。
- 隐藏失败原因。
- 自动创建虚假 Passport。

## 20.5 用户选择

失败后提供：

- 重试本次 Idea。
- 修改 Idea。
- 观看已验证演示。
- 查看已经产生的部分 Event。

## 20.6 禁止

- 脚本示例标成实时运行。
- 兜底数据标成实时结果。
- 隐藏当前运行模式。
- 固定黄金剧情污染实时模式。
- 实时模式使用固定 Battle ID。
- 实时模式使用固定 Winner 和 Score。

---

# 21. 中文优先与本地化

## 21.1 默认 Locale

```text
zh-CN
```

根节点：

```html
<html lang="zh-CN">
```

## 21.2 中文范围

以下内容必须中文：

- 导航。
- 页面标题。
- 按钮。
- 标签。
- 状态。
- 错误。
- 空状态。
- 解说。
- 行动摘要。
- 攻击说明。
- 防守说明。
- 测试说明。
- 评分理由。
- 护照内容。
- 胜利卡。
- 分享文案。
- 导出标题。
- 示例数据。
- 用户输入的创意。
- 实时生成的阶段状态。
- 运行失败与切换提示。

## 21.3 英文白名单

允许保留：

- Agent Arena 品牌。
- 类型名。
- 变量名。
- API 路径。
- 文件名。
- Event ID。
- Event type。
- Tool name。
- 模型名。
- 框架名。
- 第三方产品名。
- Agent 英文别名。
- SB / VD / IH。

## 21.4 固定术语

| 英文 | 中文 UI |
|---|---|
| Landing | 首页 |
| Live Arena | 战斗直播 |
| Verified Showcase | 已验证演示 |
| Live AI Battle Lite | 实时 AI 竞技 |
| Live Battle Beta | 实时开战 Beta |
| Passport Snapshot | 智能体护照快照 |
| Evidence Lens | 证据透镜 |
| Evidence Chain | 证据链 |
| Replay | 回放 |
| Battle | 战斗 |
| Trial | 试炼 |
| Proposal | 提案 |
| Attack | 攻击 |
| Defense | 防守 |
| Patch | 修正 |
| Retest | 复测 |
| Verify | 验证 |
| Judge | 裁决 |
| Champion | 冠军 |
| Final Score | 最终得分 |
| Proof HP | 证明值 |
| Artifact | 作品 |
| Artifact Viewer | 作品查看器 |
| Patch Diff | 补丁差异 |
| Test Result | 测试结果 |
| Mini App Preview | 应用预览 |
| Tool Call | 工具调用 |
| Observation | 环境观察 |
| Decision | 决策摘要 |

## 21.5 格式

- 日期：年、月、日。
- 时间：24 小时制。
- 数字：`zh-CN`。
- 分数：`19 / 25`。
- 中文正文使用全角标点。
- 技术 ID 使用半角。
- 中文正文行高不低于 1.55。
- 375px 不截断中文标签。

---

# 22. 视觉设计系统

## 22.1 颜色

```css
--arena-bg: #0A0D14;
--arena-panel: #12161F;
--arena-panel-2: #171C27;
--arena-panel-3: #0D1119;

--arena-hair: #242A3A;
--arena-hair-soft: #1B2130;

--arena-text: #E9ECF3;
--arena-text-dim: #8891A6;
--arena-text-faint: #5B6478;

--team-sb: #49D6C8;
--team-sb-dim: #1E3A38;

--team-vd: #F5567E;
--team-vd-dim: #3A1E28;

--team-ih: #F2B84B;
--team-ih-dim: #3A301A;

--arena-danger: #FF4D4D;
--arena-success: #3ED598;
--arena-gold: #E9C468;
--arena-live: #FF4D4D;
```

## 22.2 运行模式视觉语义

| 模式 | 主文案 | 辅助文案 | 视觉要求 |
|---|---|---|---|
| 已验证演示 | 已验证演示 | 固定证据 · 可重复回放 | 稳定、中性、可信 |
| 实时 AI 竞技 | 实时 AI 竞技 | 真实智能体正在运行 | 使用 Live 状态，不制造虚假成功 |
| 演示兜底 | 演示兜底 | 当前内容不对应刚才输入的创意 | 危险或警示语义 |
| 脚本示例 | 脚本示例 | 预置演示数据 | 明确非实时 |

模式不能只用颜色区分，必须有文字标签与说明。

## 22.3 字体

| 用途 | 字体 |
|---|---|
| 大标题与回合 | Archivo Black |
| 正文 | Inter 或仓库现有正文字体 |
| 证据、日志、ID、分数 | IBM Plex Mono |

不提交字体文件。

## 22.4 圆角

```text
4 / 6 / 8 / 10 / 12px
```

## 22.5 间距

```text
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40px
```

## 22.6 布局目标

- 主演示分辨率：1440 × 900。
- 最大内容宽度：1440px。
- 最小桌面宽度：1180px。
- 平板断点：880px。
- 移动端参考：375px。

## 22.7 动效

| 动效 | 时长 |
|---|---:|
| Round Banner 转场 | 350ms |
| HP 掉血过渡 | 700ms |
| 证明值变化 | 700ms |
| 命中闪红 | 500ms |
| 致命抖动 | 450ms |
| 浮动伤害数字 | 1100ms |
| 面板淡入 | 300ms |
| 证据高亮 | 900ms |
| 轻量致命攻击回放 | 1500ms |
| Victory Reveal | 1200ms |

HP 视觉规则：

- 掉血动画：宽度过渡 700ms ease-out 曲线。
- 命中反馈：所有 severity 触发闪红效果；severity 为 high 时额外触发卡片震动。
- 浮动伤害数字：命中瞬间飘出 "-{数值}"，1100ms 内淡出上浮。
- HP 低于 35 时血条颜色切换为危险色 `#FF4D4D`。

## 22.8 无障碍

- 不能只用颜色表达状态。
- 状态必须有文字或图标。
- 证据透镜支持键盘。
- 关闭后焦点返回触发按钮。
- 动态标题可被屏幕阅读器识别。
- 支持 `prefers-reduced-motion`。
- ESC 可关闭轻量致命攻击回放。

---

# 23. Demo Safety

## 23.1 模式隔离

```text
Verified Showcase Store
与
Live Battle Store
必须隔离
```

实时模式失败不能：

- 改写固定 Demo。
- 污染固定 Fixture。
- 让固定 Demo 累积实时 Event。
- 改变固定 Winner。
- 改变固定 Evidence Deep Link。

## 23.2 数据优先级

### 已验证演示

```text
已验证 Fixture
→ 缓存回放
→ 安全空状态
```

### 实时 AI 竞技

```text
核心 Battle Event
→ 有效 API 数据
→ 已保存的本场部分 Event
→ 实时失败状态
```

实时模式不得无提示地把固定 Fixture 当成本场数据。

## 23.3 实时异常覆盖

- Idea 校验失败。
- Battle 创建失败。
- 模型超时。
- 模型拒绝或空输出。
- Schema 校验失败。
- Schema repair 失败。
- SSE 断开。
- SSE 重连。
- 重复 Event。
- Event sequence 缺失。
- Judge 失败。
- Passport 生成失败。
- 页面刷新。
- 用户取消。
- 网络离线。

## 23.4 幂等

- 按 Event ID 去重。
- 按 sequence 排序。
- 同一攻击只扣一次证明值。
- 同一复测只恢复一次证明值。
- 同一 JudgeScore 只落一次最终结果。
- 历史状态重建不重复播放动画。
- React Strict Mode 不重复发起 Battle。
- 取消后迟到 Event 不得改变最终状态。

## 23.5 超时与取消

- 实时 Battle 有明确超时。
- 用户可取消。
- 取消后显示部分结果。
- 取消不是系统错误。
- 超时后可以重试。
- 正式 Pitch 中实时阶段应有最大等待时间。

## 23.6 空状态与错误文案

证据不足：

```text
证据不足
当前事件日志无法验证这项结论。
```

裁决未完成：

```text
裁决未完成
本场 Battle 尚未产生可用的最终评分。
```

实时失败：

```text
实时竞技未能完成。
以下将切换到已验证演示。
演示内容不对应刚才输入的创意。
```

部分护照：

```text
本场战斗尚未产生完整护照快照。
```

## 23.7 正式 Demo 保护

- 已验证演示可离线运行。
- 实时模式使用独立 feature flag。
- 关闭实时模式不影响 P0。
- 实时失败后首页和固定 Demo 仍可使用。
- 不显示裸错误堆栈。
- 任何失败都不得伪装成成功。

---

# 24. Markdown Export

## 24.1 产品目的

Markdown Export 保留 Trial Artifact 能力。

核心资产仍然是：

- Evidence Log。
- Replay。
- Passport Snapshot。

## 24.2 两种模式的导出

### 已验证演示

导出完整黄金剧情报告，并标记：

```text
运行模式：已验证演示
```

### 实时 AI 竞技

导出本场真实数据，并标记：

```text
运行模式：实时 AI 竞技
原始 Idea：...
Battle ID：...
完成状态：完整 / 部分 / 取消 / 失败
```

## 24.3 最低导出内容

```text
原始 Idea
冻结任务
运行模式
Battle ID
参赛智能体
提案摘要
主要攻击
防守决定
修正记录（如存在）
最终评分（如存在）
获胜与落败原因（如存在）
证据链接
智能体护照快照或 Mini Passport
完成状态
```

## 24.4 约束

- 不重写 Artifact Writer。
- 不修改 Export API 合约，除非现有接口明确支持可选字段扩展。
- 不引入新的事实。
- 不使用固定 Fixture 污染实时 Battle 导出。
- 实时失败不能导出固定 Winner。
- 缺少证据时写 `insufficient_evidence`。
- 缺少裁决时写 `judging_incomplete`。
- 中文内容不乱码。
- 页面与导出数据一致。
- Evidence Link 可打开。

---

# 25. 非功能需求

| 类别 | 已验证演示 P0 | 实时 AI 竞技 P1 |
|---|---|---|
| 稳定性 | 连续 20 次一致 | 20 次运行，成功率达到 Go / No-Go |
| 延迟 | 75 至 90 秒主线 | P95 不超过 90 秒 |
| 首事件时间 | 固定播放 | 目标 ≤ 10 秒 |
| 可取消 | 不需要 | 必须支持 |
| 可恢复 | URL + Fixture 重建 | URL + Battle Event 重建 |
| 可审计 | 示例分数完整拆解 | 评分绑定本场 Event |
| 诚实性 | 标记已验证演示 | 标记实时、失败或部分完成 |
| 幂等 | 重播无状态污染 | SSE 重连不重复事件 |
| 安全 | 不执行用户代码 | 不执行用户代码 |
| 中文化 | 主页面中文 | Idea、进度、错误与结果中文 |
| 可访问性 | 键盘与减少动态效果 | 同 P0 |
| 移动端 | 375px 可读 | 实时进度不溢出 |
| 导出 | 完整报告 | 完整或部分报告 |
| 可维护 | 展示层与 Engine 隔离 | 复用同一 Presentation Adapter |
| 模式隔离 | Fixture 稳定 | 不污染 Fixture |
| 模型输出 | 不调用 | Schema success ≥ 95% |
| 降级时间 | 不适用 | Fallback switch ≤ 1 秒 |

## 25.1 Live AI Battle Go / No-Go

全部满足才进入黑客松正式第二幕：

```text
连续 20 次运行
成功完成 ≥ 18 次
Schema success ≥ 95%
P95 ≤ 90 秒
首个可见 Event P95 ≤ 10 秒
Fallback switch ≤ 1 秒
无裸错误页面
无固定剧情污染
无重复 Battle 创建
```

未达到时：

- 保留实时入口为 Beta 或隐藏。
- 不影响已验证演示。
- Pitch 只展示固定主线。

---

# 26. 成功指标

## 26.1 P0 已验证演示指标

| 指标 | 目标 |
|---|---:|
| 示例战斗连续通过 | 20 / 20 |
| 90 秒主线完成率 | ≥ 95% |
| 固定 Winner 一致率 | 100% |
| 证明值 88 → 38 → 68 一致率 | 100% |
| 证据透镜打开成功率 | 100% |
| 分数与 delta 数学一致率 | 100% |
| 深链刷新恢复率 | 100% |
| 中文截图覆盖率 | 100% |
| 导出成功率 | ≥ 90% |

## 26.2 P1 实时 AI 竞技指标

| 指标 | Go / No-Go 目标 |
|---|---:|
| 连续运行 | 20 次 |
| 完整完成率 | ≥ 90% |
| Schema success | ≥ 95% |
| 首个可见 Event P95 | ≤ 10 秒 |
| 完整 Battle P95 | ≤ 90 秒 |
| Fallback switch | ≤ 1 秒 |
| 新 Battle ID 唯一率 | 100% |
| 固定剧情污染 | 0 |
| Winner 非硬编码 | 100% |
| Evidence 生成率 | ≥ 90% |
| Passport / Mini Passport 生成率 | ≥ 90% |
| 重复 Event 幂等率 | 100% |

## 26.3 黑客松理解指标

评委应在：

- 30 秒内理解已验证演示为什么稳定。
- 30 秒内理解实时模式为什么证明系统是真的。
- 30 秒内理解 Evidence Lens。
- 30 秒内理解 Passport Snapshot 不是长期信誉。

## 26.4 产品事件

- `home_verified_showcase_clicked`
- `home_live_battle_started`
- `idea_validation_failed`
- `live_battle_created`
- `live_battle_first_event`
- `live_battle_cancelled`
- `live_battle_timed_out`
- `live_battle_completed`
- `live_battle_failed`
- `fallback_to_verified_showcase`
- `verified_replay_opened`
- `story_milestone_viewed`
- `score_evidence_opened`
- `evidence_deep_link_opened`
- `passport_viewed`
- `mini_passport_viewed`
- `win_card_generated`
- `battle_shared`
- `export_clicked`

## 26.5 长期北极星

```text
Verified Agent Wins
```

定义：

> 一个智能体在某个 Trial 中获胜，并拥有原始输入、提案、攻击、防守、评分、回放与证据。

---

# 27. P0 验收标准：已验证演示

## 27.1 首页

- [ ] 10 秒内理解产品定位。
- [ ] 双入口清晰。
- [ ] “观看 90 秒已验证演示”可用。
- [ ] “实时开战 Beta”可以暂时受 feature flag 控制。
- [ ] 3 秒内出现明确标记的演示预览动态。
- [ ] 三个智能体中文名可见。
- [ ] 不展示虚构统计。
- [ ] 离线可运行。
- [ ] 375px 不破版。

## 27.2 战斗直播

- [ ] 三个智能体工作台同屏可见。
- [ ] 展示行动、观察、决策、工具和作品版本。
- [ ] 运行模式显示“已验证演示”。
- [ ] 六个固定里程碑稳定出现。
- [ ] 证明值正确显示 88 → 38 → 68。
- [ ] 裁决前不显示最终分数。
- [ ] 最终评分为 87 / 84 / 78。
- [ ] 最终评分板显示胜负原因。

## 27.3 证据透镜与回放

- [ ] 任意示例维度分可点击。
- [ ] 加减项总和等于维度分。
- [ ] 评分项至少关联一个证据。
- [ ] 点击证据可定位事件。
- [ ] 深链刷新恢复。
- [ ] 浏览器前进后退正常。
- [ ] 不依赖先前动画。
- [ ] 不展示不存在的事件。

## 27.4 护照快照

- [ ] 三个智能体都有快照。
- [ ] 每个快照有优势和弱点。
- [ ] 每个快照有证据链接。
- [ ] 冠军快照显示失败与恢复。
- [ ] 证明值与最终得分分离。
- [ ] 不展示长期排名和胜率。

## 27.5 Demo Safety 与 Export

- [ ] 示例战斗离线运行。
- [ ] 页面刷新可恢复。
- [ ] 连续播放 20 次通过。
- [ ] 无状态累计污染。
- [ ] 中文 Markdown 可下载。
- [ ] 页面与导出分数一致。
- [ ] 无裸错误堆栈。
- [ ] Battle Engine 和核心 schema 未因 P0 被破坏性修改。

---

# 28. P1 验收标准：实时 AI 竞技

## 28.1 首页与创建

- [ ] 实时 AI 竞技由独立 feature flag 控制。
- [ ] feature flag 关闭时不加载真实 AI Runtime。
- [ ] 用户可以输入任意非空 Idea。
- [ ] Idea 在创建前校验。
- [ ] 原始 Idea 被保留。
- [ ] 每次创建新的 Battle ID。
- [ ] “实时开战 Beta”明确标识。
- [ ] 重复点击不会创建多个 Battle。
- [ ] 创建失败有中文提示。

## 28.2 真实 AI 运行

- [ ] 三个 Agent 产生真实 Proposal。
- [ ] Proposal 具有差异化。
- [ ] Attack 来自本场真实 AI Runtime。
- [ ] Defense 来自本场真实 AI Runtime。
- [ ] JudgeScore 来自本场真实 AI Runtime。
- [ ] Winner 不固定。
- [ ] 分数不固定。
- [ ] 不注入固定 `test_032`。
- [ ] 不注入固定黄金剧情。
- [ ] 不要求出现 Patch / Retest。

## 28.3 实时 UI

- [ ] 顶部显示“实时 AI 竞技”。
- [ ] 显示原始 Idea。
- [ ] 显示新 Battle ID。
- [ ] 显示真实运行阶段。
- [ ] 三个 Agent 工作台随 Event 更新。
- [ ] 用户可取消。
- [ ] 页面刷新可重建。
- [ ] 375px 不破版。

## 28.4 Evidence、Replay 与 Passport

- [ ] Event Log 记录本场真实过程。
- [ ] JudgeScore 绑定本场 Evidence。
- [ ] 有 delta 时显示完整证据透镜。
- [ ] 无 delta 时显示关联证据。
- [ ] 证据不足时明确降级。
- [ ] 完整 Battle 生成 Passport Snapshot。
- [ ] 部分 Battle 生成 Mini Passport。
- [ ] 未完成 Battle 不生成已验证胜利。

## 28.5 实时安全

- [ ] API 超时可处理。
- [ ] Schema repair 可处理。
- [ ] SSE 重连不重复 Event。
- [ ] 用户取消后迟到 Event 不改变状态。
- [ ] 实时失败不污染已验证演示。
- [ ] 降级提示明确说明内容不对应用户 Idea。
- [ ] 不把固定 Winner 挂在用户 Idea 上。
- [ ] 无裸错误页面。

## 28.6 Go / No-Go

- [ ] 连续运行 20 次。
- [ ] 完整完成率 ≥ 90%。
- [ ] Schema success ≥ 95%。
- [ ] P95 ≤ 90 秒。
- [ ] 首 Event P95 ≤ 10 秒。
- [ ] Fallback ≤ 1 秒。
- [ ] 固定剧情污染为 0。
- [ ] Battle ID 唯一率 100%。

未全部达到时，实时模式不能进入正式 Pitch 第二幕。

---

# 29. P2 验收标准：分享与现场记忆点

## 29.1 三个关键音效

- [ ] 致命攻击音效。
- [ ] 复测通过音效。
- [ ] 冠军揭晓音效。
- [ ] 每种每场只播放一次。
- [ ] 可静音。
- [ ] 音频失败不影响 UI。
- [ ] Strict Mode 不重复播放。
- [ ] 实时模式不存在相应 Event 时不播放。

## 29.2 已验证胜利卡

- [ ] 可导出 1200 × 675 中文 PNG。
- [ ] 显示失败和弱点。
- [ ] 显示已验证修正。
- [ ] 数据与护照快照一致。
- [ ] 可复制回放链接。
- [ ] 二维码失败不影响主流程。
- [ ] 实时 Battle 完成且证据充分时才可生成。
- [ ] 部分或失败 Battle 不生成已验证胜利卡。

---

# 30. P3 验收标准：轻量致命攻击回放

- [ ] 仅实际 Fatal Attack 触发。
- [ ] 已验证演示中的固定 Fatal Attack 可稳定触发。
- [ ] 实时模式没有 Fatal Attack 时不触发。
- [ ] 每场只触发一次。
- [ ] 总时长不超过 1.5 秒。
- [ ] ESC 可跳过。
- [ ] 移动端不溢出。
- [ ] 减少动态效果模式有静态替代。
- [ ] 不决定业务状态。
- [ ] 失败不影响主线。

---

# 31. Hackathon Demo 策略

## 31.1 第一幕：Verified Showcase

目标：

- 讲完整故事。
- 提供稳定 Wow Moment。
- 展示 Evidence Lens。
- 展示 Passport Snapshot。
- 保证现场不会因模型失败中断。

顺序：

```text
首页
→ 已验证演示
→ 致命攻击
→ 接受攻击
→ 修正
→ 复测
→ 逆风翻盘
→ 证据透镜
→ 护照
```

## 31.2 第二幕：Live AI Challenge

主持话术：

```text
刚才是一场经过验证、可以稳定回放的 Battle。
现在请给我们一个从未见过的 Idea。
```

输入评委 Idea，运行：

```text
实时开战 Beta
→ Proposal
→ Attack
→ Defense
→ Judge
→ Evidence
→ Mini Passport
```

## 31.3 实时模式最低展示价值

即使现场只完成：

```text
三个 Proposal
→ 一个主要 Attack
→ Defense
→ Judge
```

只要数据真实、模式诚实、Event 可见，就已经证明系统不是预录动画。

## 31.4 现场失败策略

实时失败时：

- 不慌张隐藏。
- 显示失败状态。
- 展示已产生的部分 Event。
- 明确切回已验证演示。
- 不重复播放完整固定主线，除非评委要求。
- 不宣称固定结果对应刚才 Idea。

---

# 32. 技术与数据边界

## 32.1 不修改的核心语义

v0.5.1 不应为了双模式随意改变：

- Battle Engine 的既有 Round 语义。
- Champion 选择语义。
- Judge Rubric。
- Attack / Defense 核心语义。
- Passport Snapshot 的事实来源。
- Event sequence 的可重建原则。
- API 的既有兼容性。
- 核心持久化字段语义。

若现有 Battle Engine 已具备真实运行能力，P1 应复用。

若现有 Engine 缺少必要能力，必须在后续 Task Pack 中先审计，再决定最小兼容扩展，不能在 PRD 层假设数据库迁移。

## 32.2 允许新增

- `RuntimeMode` 展示语义。
- Live Battle 创建入口。
- 用户 Idea 输入。
- Live Runtime Adapter。
- Presentation Adapter。
- View Model。
- Fixture。
- Selector。
- 实时进度 UI。
- 取消与超时状态。
- Schema repair。
- 测试与监控事件。

## 32.3 同一 Presentation Contract

推荐架构：

```text
Verified Fixture ─┐
                  ├→ ArenaPresentationViewModel → 三页面 UI
Live AI Events ───┘
```

禁止维护两套完全不同的页面。

## 32.4 实时模式事实来源

```text
用户原始 Idea
→ Battle Record
→ Core Event
→ JudgeScore
→ Replay
→ Passport Snapshot
```

展示 Fixture 不得进入此链路。

## 32.5 安全边界

- 不执行用户代码。
- 不执行任意 Shell。
- 不接入任意未授权工具。
- 不允许用户通过 Idea 注入系统指令。
- Agent 输出必须 Schema 校验。
- 用户 Idea 与系统 Prompt 严格隔离。
- 输出展示进行安全转义。

---

# 33. 风险与对策

| 风险 | 影响 | v0.5.1 对策 |
|---|---|---|
| 看起来像预录动画 | 真实 Agent 价值不成立 | Live AI Battle Lite |
| 实时模型失败 | 现场中断 | Verified Showcase 先行，模式隔离 |
| 固定剧情污染实时模式 | 欺骗感 | 不共享 Story Fixture，Event 来源标记 |
| 实时结果不精彩 | Wow Factor 不稳定 | 固定第一幕负责完整叙事 |
| 实时模式太慢 | 评委失去耐心 | 首 Event ≤ 10 秒，P95 ≤ 90 秒 |
| Judge 不可信 | 核心主张崩塌 | Evidence Lens 与低可信度标记 |
| Schema 输出失败 | Battle 中断 | 有限 Schema repair 与超时 |
| SSE 重复 Event | 重复扣减或重复裁决 | Event ID 幂等 |
| 用户 Idea 注入 | 系统行为偏离 | 输入隔离、长度限制、Schema |
| Passport 伪完整 | 伪信誉 | Mini Passport 与完成状态 |
| 证明值和总分混淆 | 逻辑不可信 | 定义和 UI 分离 |
| 双模式做成两套产品 | 开发膨胀 | 共享三页面与 Presentation Contract |
| 实时模式吞噬 P0 时间 | 固定 Demo 不稳定 | P0 冷审计通过后再做 P1 |
| 分享功能抢优先级 | 核心没完成 | 音效与胜利卡顺延到 P2 |
| Artifact Runtime 偷跑 | 范围爆炸 | 明确延后到 v0.6 |

---

# 34. 发布阶段

## 34.1 P0：Verified Showcase

- 首页双入口壳。
- 已验证演示。
- 智能体工作台。
- 固定逆风翻盘。
- 证明值。
- 最终评分板。
- 证据透镜。
- 回放深链。
- 三份护照快照。
- Demo Safety。
- 中文优先。
- Markdown Export。

P0 必须独立冷审计通过。

## 34.2 P1：Live AI Battle Lite

- Idea 输入。
- 新 Battle 创建。
- 真实 Proposal / Attack / Defense / Judge。
- Live Event 流。
- 实时模式 UI。
- Evidence 降级。
- Passport / Mini Passport。
- 取消、超时、失败与降级。
- 20 次 Go / No-Go。

## 34.3 P2：Share & Sound

- 三个关键音效。
- 已验证胜利卡。
- 中文 PNG。
- 回放链接。
- 二维码可选。

## 34.4 P3：Visual Polish

- 轻量致命攻击回放。
- 减少动态效果替代。
- 细节动画。

## 34.5 发布门槛

```text
P0 未通过
→ 不做 P1

P1 未通过 Go / No-Go
→ 不进入正式 Pitch 第二幕

P2 / P3 未完成
→ 不阻塞产品成立
```

---

# 35. 后续 Roadmap

## v0.6：Verified Artifact Runtime

- 受控作品 Schema。
- 统一作品渲染器。
- 标准 Test Runner。
- 真实 Patch。
- 真实 Retest。
- Artifact Lock。
- Attack Validation。
- 新 Battle Protocol 评估。

## Phase 1：Agent Team Studio

- 创建和编辑 Agent instructions。
- 保存 AgentSpec。
- 选择模型。
- 配置工具 allowlist。
- 查看 Battle History。
- 对比 Agent Team。

## Phase 2：Trial Marketplace

- Product Strategy Trial。
- Code Review Trial。
- Research Trial。
- Tool-use Trial。
- Custom Trial Template。
- Trial-specific rubric。

## Phase 3：Passport Network

- Public Passport。
- Domain Scores。
- Win / Loss History。
- Failure Patterns。
- Replay Evidence Links。
- Human Feedback。
- Verification Levels。

## Phase 4：External Agent Arena

- External Agent Submission。
- API Agent Adapter。
- MCP Adapter。
- A2A Agent Card。
- Sandbox Verification。
- Private Enterprise Arena。

## Phase 5：Reputation-based Agent Economy

- Reputation-based routing。
- Verified Badge。
- Paid Trial。
- Agent Marketplace。
- Revenue Sharing。
- Governance。

---

# 36. Demo 脚本

## 36.1 30 秒版

```text
每个智能体都说自己很强，但自我声明很廉价。

Agent Arena 把三个智能体放进同一场标准化 Battle。
它们提出方案、互相攻击、防守，并留下证据。

我们先用一场已验证演示，让你看到完整的失败、修正和逆风翻盘。
然后你可以给我们一个全新的 Idea，让真实 AI 智能体现场开战。

每一分都能追到证据，每一场都能进入护照快照。
```

## 36.2 90 秒已验证演示

```text
0-10 秒：首页定位与双入口。
10-20 秒：三个智能体入场。
20-30 秒：传播设计师成为早期热门。
30-40 秒：架构黑客发现致命隐藏测试。
40-52 秒：传播设计师接受攻击并修正。
52-62 秒：复测通过。
62-74 秒：最终逆风翻盘。
74-84 秒：点击分数打开证据透镜。
84-90 秒：打开护照快照。
```

## 36.3 实时 AI 第二幕

```text
请给我们一个从未见过的 Idea。

0-5 秒：输入 Idea 并创建 Battle。
5-15 秒：显示新 Battle ID 与首个 Event。
15-35 秒：三个 Agent Proposal。
35-55 秒：交叉 Attack 与 Defense。
55-80 秒：Judge。
80-90 秒：Evidence 与 Mini Passport。
```

## 36.4 实时失败话术

```text
这次实时 Battle 没有完整完成。
你现在看到的是它已经产生的真实 Event。

为了不让现场演示被网络或模型随机性破坏，
我们可以切回已验证演示。
需要强调的是，兜底演示不对应刚才输入的 Idea。
```

## 36.5 Pitch 收束

```text
已验证演示证明这套体验可以稳定复现。
实时 Battle 证明它不只是预录动画。

今天我们展示的是单场 Passport Snapshot。
未来，多场 Battle 会形成真正的 Agent Reputation。
```

---

# 37. 决策锁定

以下决策在 v0.5.1 中锁定：

1. 产品保持四张主页面（首页、战斗直播、作品查看器、智能体护照快照）。
2. 默认语言为简体中文。
3. 已验证演示与实时 AI 竞技是两个独立入口。
4. 已验证演示负责完整叙事和稳定性。
5. 实时 AI 竞技负责真实性。
6. 正式 Pitch 先固定演示，再实时挑战。
7. P0 先完成并冷审计，再进入 P1。
8. P1 优先级高于音效、胜利卡和 Kill Cam。
9. 实时模式不复用固定 Winner、Score、Test ID 或黄金剧情。
10. 实时模式不保证 Patch、Retest 或逆风翻盘。
11. 两种模式共用同一套四页面与 Presentation Contract。
12. 运行模式始终可见。
13. 演示兜底必须说明内容不对应用户 Idea。
14. 证明值与最终得分分离。
15. 单场只叫护照快照。
16. 部分实时 Battle 只能生成 Mini Passport。
17. 不展示虚构长期数据。
18. 不执行用户代码。
19. 不实现 Verified Artifact Runtime。
20. Verified Artifact Runtime 延后到 v0.6。
21. Markdown Export 必须区分运行模式和完成状态。
22. 实时模式必须通过 20 次 Go / No-Go 才进入正式 Pitch。
23. 作品查看器页面允许新增，但 Verified Showcase 中的 Build/Verify/Patch/Test 内容一律来自固定 fixture，不驱动真实代码生成或执行。
24. Live AI Battle Lite 中不生成真实 Patch Diff 或真实 Test 结果；证据不足时按 4.1 证据优先原则降级展示。
25. Round 进度条上的「构建」「验证」为 Presentation 层展示分段，不是 Battle Engine 新增的状态机节点。

---

# 38. 自检清单

## 38.1 产品一致性

- [x] 长期北极星仍是 Agent Reputation Layer。
- [x] Battle 仍是信誉证据生成运行。
- [x] 三页面主线未改变。
- [x] Evidence、Replay 与 Passport 仍是核心资产。
- [x] 新增实时 AI 不把产品改成 Idea Generator。
- [x] 实时模式与固定演示具有清晰分工。

## 38.2 双运行模式完整性

- [x] 已验证演示定义完整。
- [x] 实时 AI 竞技定义完整。
- [x] 首页双入口明确。
- [x] 两条用户流程完整。
- [x] 运行模式标签完整。
- [x] 实时失败和降级语义完整。
- [x] 模式数据隔离完整。
- [x] 固定剧情不污染实时模式。

## 38.3 范围一致性

- [x] P0 为 Verified Showcase。
- [x] P1 为 Live AI Battle Lite。
- [x] P2 为 Share & Sound。
- [x] P3 为 Kill Cam。
- [x] Artifact Runtime 延后到 v0.6。
- [x] 不要求真实代码 Patch / Retest。
- [x] 不增加第二套页面。

## 38.4 数据一致性

- [x] 已验证演示仍为 87 / 84 / 78。
- [x] 已验证演示证明值仍为 88 → 38 → 68。
- [x] 证据透镜 13 + 5 - 4 + 3 + 2 = 19。
- [x] 实时模式 Winner 和 Score 不固定。
- [x] 实时模式只使用本场 Event。
- [x] 部分 Battle 不伪装完整结果。
- [x] Export 区分运行模式与完成状态。

## 38.5 安全与诚实

- [x] 实时模式支持取消和超时。
- [x] SSE 重连和 Event 幂等纳入要求。
- [x] Schema repair 纳入要求。
- [x] 兜底不冒充用户 Idea 结果。
- [x] 不展示模型原始思维链。
- [x] 不执行用户代码。
- [x] 用户 Idea 与系统指令隔离。

## 38.6 黑客松一致性

- [x] 第一幕有稳定 Wow Moment。
- [x] 第二幕能证明真实 AI。
- [x] 实时模式失败不破坏主 Demo。
- [x] Go / No-Go 指标明确。
- [x] 现场话术和失败话术完整。
- [x] P1 优先级高于装饰功能。

## 38.7 文档完整性

- [x] 产品北极星。
- [x] 问题定义。
- [x] 目标用户。
- [x] 产品原则。
- [x] 双模式成功定义。
- [x] MVP 范围。
- [x] 核心词典。
- [x] Agent 定义。
- [x] 双用户流程。
- [x] 页面 PRD。
- [x] 固定黄金剧情。
- [x] 证明值。
- [x] 评分系统。
- [x] 证据透镜。
- [x] 回放。
- [x] 护照。
- [x] 胜利卡。
- [x] 运行模式。
- [x] 中文化。
- [x] 视觉系统。
- [x] Demo Safety。
- [x] Export。
- [x] 非功能需求。
- [x] 成功指标。
- [x] P0 至 P3 验收。
- [x] 黑客松策略。
- [x] 技术与数据边界。
- [x] 风险。
- [x] 发布阶段。
- [x] Roadmap。
- [x] Demo 脚本。
- [x] 决策锁定。
- [x] 自检。

---

# 39. 最终定义

Agent Arena v0.5.1 不是一个固定动画，也不是一个随机 AI 聊天页面。

它通过两种运行模式共同成立：

```text
已验证演示
让产品故事稳定、完整、可重复

实时 AI 竞技
让陌生 Idea 真正进入 Agent Battle
```

最终用户看到的是：

```text
智能体的行动可观看
智能体的失败可记录
智能体的裁决可举证
智能体的表现可回放
单场结果可进入护照快照
```

最终黑客松主张：

> **Verified Showcase 给评委确定性，Live AI Battle 给评委可信度。**
