# Agent Arena Dual Runtime Hackathon v1.3
## Codex 工程任务包 · 中文优先 · 最终版

**文档状态**：可执行  
**目标执行者**：Codex / 编码 Agent  
**产品事实源**：`Agent_Arena_PRD_v0.5.1_Dual_Runtime_Hackathon_Edition_中文优先.md`  
**适用阶段**：Hackathon MVP 冲刺  
**目标技术栈**：沿用现有仓库，不擅自改变既有技术栈  
**主要页面**：首页、战斗直播、智能体护照快照  
**双运行模式**：已验证演示 + 实时 AI 竞技  
**最终目标**：先用稳定黄金剧情完整展示信誉证据闭环，再用用户输入 Idea 的真实 Agent Battle 证明产品不是预录动画

---

# 0. v1.3 修订说明与执行规则

## 0.1 v1.3 相对 v1.2 的核心变化

本版根据 PRD v0.5.1 完成以下升级：

1. 将“实时 Agent Quick Trial”从 Experimental 提升为 P1 正式能力。
2. 明确双运行模式：
   - P0：Verified Showcase / 已验证演示。
   - P1：Live AI Battle Lite / 实时 AI 竞技。
3. 将原 P1 音效与胜利卡顺延为 P2。
4. 将原 P2 轻量致命攻击回放顺延为 P3。
5. 首页由“模糊的 Idea 入口”升级为两个清晰入口：
   - 观看 90 秒已验证演示。
   - 输入 Idea，实时开战 Beta。
6. 固定黄金剧情只允许用于 `verified_replay` 或 `scripted_example`。
7. 实时模式禁止复用固定 Winner、Score、Test ID、StoryMilestone 与 Passport。
8. 新增实时 Battle 创建、冻结任务、运行流、取消、超时、Schema repair、失败降级和 Mini Passport。
9. 新增实时模式 Go / No-Go：
   - 连续运行 20 次。
   - 完整完成率 ≥ 90%。
   - Schema success ≥ 95%。
   - 首 Event P95 ≤ 10 秒。
   - 完整 Battle P95 ≤ 90 秒。
   - Fallback switch ≤ 1 秒。
10. 明确 `Verified Artifact Runtime` 仍不属于本任务包。
11. 更新固定演示 Battle ID 为 `BA-2026-0024`。
12. 保留 v1.2 的三页面、中文化、证据透镜、回放深链、护照快照、Demo Safety 和 Export 回归要求。

## 0.2 本任务包的工程定位

```text
本任务包
= P0 Verified Showcase
+ P1 Live AI Battle Lite
+ P2 Share & Sound
+ P3 Visual Polish
```

```text
本任务包
≠ Verified Artifact Runtime
```

本任务包会实现：

- 三页面中文主线。
- 首页双入口。
- 已验证演示黄金剧情。
- 用户输入 Idea。
- 实时 AI Battle。
- 三个真实 Agent Proposal。
- 真实 Attack / Defense / Judge。
- 实时 Event Log。
- Evidence Lens。
- Replay。
- Passport Snapshot / Mini Passport。
- Demo Safety。
- 中文 Markdown Export。
- 音效与已验证胜利卡。
- 轻量致命攻击回放。

本任务包不会实现：

- 新增 Build Round。
- 新增 Artifact Lock Round。
- 新增 Verify Round。
- 真实受控 Mini-App Runtime。
- 任意代码执行。
- 自动代码 Patch Runner。
- 自动作品 Retest Runner。
- 新的核心 Event Type，除非仓库已有可扩展通用事件机制且不改变持久化语义。
- 数据库 migration。
- 破坏性 Schema 变更。
- 把固定 Fixture 伪装为实时结果。

## 0.3 执行者工作方式

开始编码前必须先探测仓库。

必须确认：

1. 前端目录结构（Vite + React 19，组件在 `apps/web/src/`）。
2. 样式方案（`apps/web/src/styles.css`，CSS 变量驱动）。
3. 状态管理方式（组件本地 state + `data/` 适配器）。
4. Battle Engine 路径（`arena/engine/`）。
5. 核心 Schema 路径（`packages/contracts/src/`）。
6. 当前创建 Battle 的入口。
7. 当前是否已经支持用户输入任务。
8. 当前是否已经支持真实模型 Runtime。
9. 当前 SSE / polling / event reducer。
10. 当前 Judge、Replay、Passport 和 Export。
11. 当前测试框架与命令。
12. 当前环境变量和 AI Provider 接入方式。

先生成：

```text
docs/agent-arena-v051-implementation-map.md
docs/agent-arena-v051-runtime-capability-audit.md
```

然后按阶段执行。

## 0.4 文档优先级

```text
PRD v0.5.1
> Task Pack v1.3
> UI Mapping 后续新版
> 当前仓库实现细节
```

若仓库与文档冲突：

- 记录冲突。
- 优先采用最小改动。
- 不创建平行架构。
- 不移动大量文件。
- 不为追求“理想架构”扩大范围。
- 不因文档示例路径与仓库不同而复制另一套系统。

## 0.5 任务优先级

发布阶段名称：

```text
P0：Verified Showcase
P1：Live AI Battle Lite
P2：Share & Sound
P3：Visual Polish
```

严格按以下顺序执行：

```text
P0-A  仓库探测、能力审计与安全护栏
P0-B  双来源 Presentation Contract
P0-C  首页双入口壳
P0-D  智能体工作台
P0-E  已验证演示黄金剧情
P0-F  比赛状态与最终评分板分离
P0-G  证据透镜
P0-H  证据检查器与回放深链
P0-I  已验证护照快照
P0-J  P0 Demo Safety 与幂等
P0-K  已验证演示 Markdown Export 回归

P0-COLD-AUDIT  P0 独立冷审计

P1-A  实时 Runtime 能力门禁与 Feature Flag
P1-B  Idea 输入、校验、冻结任务与 Battle 创建
P1-C  Live Runtime Adapter 与 Event Stream
P1-D  三个真实 Agent Proposal
P1-E  真实 Attack 与 Defense
P1-F  真实 Judge、Evidence 与低可信度处理
P1-G  实时 Replay、Passport Snapshot 与 Mini Passport
P1-H  取消、超时、重试、Schema Repair 与失败降级
P1-I  输入安全、Prompt 隔离与输出校验
P1-J  实时稳定性、性能与 Go / No-Go

P1-COLD-AUDIT  P1 独立冷审计

P2-A  三个关键音效
P2-B  已验证胜利卡

P3-A  轻量致命攻击回放
```

规则：

- P0 未通过，不进入 P1。
- P1 未通过 Go / No-Go，不进入正式 Pitch 第二幕。
- P2 / P3 不阻塞产品核心成立。
- 不得为了赶 P2 / P3 跳过 P1 测试。

## 0.6 每个阶段的固定循环

```text
Goal
→ Repo Map
→ Plan
→ Implement
→ Type Check
→ Lint
→ Unit Test
→ Component Test
→ Browser E2E
→ Screenshot Review
→ Git Diff Review
→ Status Report
```

任何阶段存在阻塞项时输出：

```text
NOT READY FOR NEXT STAGE
```

---

# 1. 产品范围与页面锁定

## 1.1 只突出三张主页面

### 首页

职责：

- 10 秒内讲清 Agent Arena。
- 展示三个 Agent。
- 展示公平协议。
- 提供已验证演示入口。
- 提供实时 Idea 输入入口。
- 不承担完整 Battle 数据展示。
- 不做 Idea Generator。

### 战斗直播

职责：

- 承担正式 Demo 80% 时间。
- 同时承载已验证回放与实时 Event 流。
- 展示三个 Agent 的行动、观察、决策、工具与 Proposal / 作品。
- 展示 Attack、Defense、Judge。
- 只在真实数据支持时展示 Patch / Retest。
- 展示 Evidence Lens。
- 展示运行模式。

### 智能体护照快照

职责：

- 展示单场 Battle 表现。
- 已验证演示生成完整 Snapshot。
- 实时完整 Battle 生成真实 Snapshot。
- 实时部分 Battle 生成 Mini Passport。
- 展示优势、弱点、失败与 Evidence。
- 不伪装长期 Reputation Network。

## 1.2 不增加第二套页面

双运行模式必须共用：

```text
首页
→ 战斗直播
→ 智能体护照快照
```

禁止：

- 为实时模式另做一套 Live 页面。
- 为实时模式另做一套 Passport。
- 新建大型 Runtime Dashboard。
- 新建 Chat Workspace。
- 新建 Agent Studio。
- 新建 Leaderboard。

## 1.3 不删除现有页面

若仓库已有以下页面，不删除、不迁移：

- Battle Setup。
- Result。
- Replay。
- Dashboard。
- Example Battle。
- Export。

正式导航只突出三张主页面。

## 1.4 明确不做

- 完整 Agent Marketplace。
- 长期排行榜。
- 多 Trial Template。
- 外部 Agent 提交。
- 任意 MCP 工具市场。
- BYOK。
- 多用户协作。
- 多 Judge 委员会。
- 完整 GitHub Repo 生成。
- 任意 Shell。
- 用户代码执行。
- 完整 IDE。
- 原始 Chain of Thought。
- 虚构长期战斗数据。
- 真实受控 Artifact Runtime。
- 自动代码 Patch。
- 自动作品 Retest。

---

# 2. 工程禁区与 P1 能力门禁

## 2.1 绝对禁止的破坏性变更

不新增数据库迁移。

不得：

- 改变现有 Round 的业务语义。
- 改变 Battle 状态机的既有合法路径。
- 改变 Champion 选择语义。
- 改变 Judge rubric 权重。
- 改变 Attack / Defense 的核心语义。
- 删除、重命名或改变核心字段类型。
- 添加数据库 migration。
- 破坏已有 API 兼容性。
- 将前端展示状态写回核心数据库。
- 让 StoryMilestone 变成核心持久化事件。
- 让 Fixture 写入真实 Battle。
- 让固定黄金剧情改变实时 Winner。
- 为 UI 动画增加 Engine Round。
- 让 Battle Engine import UI 或 presentation 代码。

## 2.2 P0 的硬护栏

P0 必须满足：

```text
Battle Engine files: unchanged
Core schema files: unchanged
Database migrations: none
API contracts: unchanged
```

P0 只允许：

- Presentation Adapter。
- Fixture。
- View Model。
- UI Component。
- Selector。
- Presentation Reducer。
- 测试。
- 文档。

## 2.3 P1 的能力门禁

P1 开始前必须完成 Runtime Capability Audit。

审计问题：

1. 现有 Engine 是否接受用户提供的 Idea / Brief。
2. 是否能够创建唯一 Battle ID。
3. 是否已有真实 Agent Runtime。
4. 是否已有 Proposal、Attack、Defense、Judge 流程。
5. 是否已有 SSE / polling。
6. 是否已有 Schema 校验和 retry。
7. 是否已有取消或中止能力。
8. 是否已有部分 Event 保存。
9. 是否已有 Replay 构建。
10. 是否已有 PassportSnapshot 构建。

审计结论只能是：

```text
READY_WITH_EXISTING_CAPABILITIES
```

或：

```text
READY_WITH_PRESENTATION_OR_RUNTIME_ADAPTER
```

或：

```text
BLOCKED_BY_MISSING_CORE_CAPABILITY
```

## 2.4 缺少核心能力时的处理

如果现有 Engine 无法实现 P1：

- 不得自行重写 Engine。
- 不得新增数据库 migration。
- 不得假设新的核心 Event Type。
- 不得用 Fixture 冒充实时运行。
- 必须输出：

```text
docs/agent-arena-v051-live-runtime-gap-report.md
```

Gap Report 包含：

- 缺少的能力。
- 当前代码证据。
- 最小可行扩展建议。
- 是否影响核心语义。
- 是否需要单独 PRD / Task Pack。
- Hackathon 可接受的降级方案。

然后停止 P1，输出：

```text
P1 BLOCKED BY MISSING CORE CAPABILITY
```

## 2.5 允许的 P1 非破坏性扩展

在现有明确扩展点内允许：

- 新建 Live Runtime Adapter。
- 新建 Battle Create Service wrapper。
- 新建前端或服务端输入校验。
- 新建 Feature Flag。
- 新建非持久化运行状态。
- 新建兼容现有 Schema 的可选 DTO。
- 新建 SSE 客户端封装。
- 新建 Schema repair wrapper。
- 新建 Cancel Controller。
- 新建观测日志。
- 新建测试 Fixture。

所有新增必须：

- 不改变旧 API 的现有字段。
- 不破坏旧 Battle。
- 不改变旧 Replay。
- 不污染 Example Battle。
- 在关闭 Feature Flag 后不加载 Runtime。

## 2.6 依赖限制

默认不新增第三方依赖。

允许：

- 复用仓库已有 AI SDK。
- 复用现有 Schema 校验库。
- 复用现有动画、图标、测试、截图与 QR 依赖。
- 使用 Web Audio API。
- 使用 Canvas API。
- 使用 Clipboard API。
- 使用 AbortController。
- 使用现有 Playwright / Vitest / Jest。

禁止：

- 为单个动效新增大型动画库。
- 为 Win Card 新增重量级截图依赖。
- 从不可信 CDN 加载运行时代码。
- 提交字体文件。
- 为 P1 额外接入第二套大型 Agent Framework。

---

# 3. 设计令牌

以下设计值锁定，不重新设计。

## 3.1 颜色

```css
:root {
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
}
```

## 3.2 模式视觉语义

| 模式 | 主文案 | 辅助文案 |
|---|---|---|
| `verified_replay` | 已验证演示 | 固定证据 · 可重复回放 |
| `live_runtime` | 实时 AI 竞技 | 真实智能体正在运行 |
| `demo_fallback` | 演示兜底 | 当前内容不对应刚才输入的创意 |
| `scripted_example` | 脚本示例 | 预置演示数据 |

要求：

- 不能只依靠颜色。
- 必须显示中文模式名。
- `demo_fallback` 必须具有明显警示语义。
- `live_runtime` 不能在 Runtime 尚未启动时提前显示。
- 首页预览动画不能标为实时运行。

## 3.3 字体

```text
Display: Archivo Black
Body: Inter 或仓库现有正文字体
Protocol / Evidence / Log / Numeric Data: IBM Plex Mono
```

不提交字体文件。

## 3.4 圆角

```text
4 / 6 / 8 / 10 / 12px
```

- Button：8px。
- Panel：12px。
- Inner Card：8px。
- Badge：4px 或 6px。
- 不使用超大胶囊主卡片。

## 3.5 间距

```text
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40
```

## 3.6 布局

```text
Max content width: 1440px
Primary demo target: 1440 x 900
Minimum desktop: 1180px
Tablet breakpoint: 880px
Mobile reference: 375px
```

880px 以下：

- Agent 卡横向滚动或纵向堆叠。
- Evidence Lens 使用全宽 Drawer / Bottom Sheet。
- 实时阶段与取消按钮不溢出。
- Idea 输入按钮不截断。

## 3.7 动效

```text
Round enter: 350ms
Proof width: 700ms
Hit flash: 500ms
Fatal shake: 450ms
Damage float: 1100ms
Panel fade: 300ms
Evidence highlight: 900ms
Kill Cam total: 1500ms
```

所有动效尊重：

```css
@media (prefers-reduced-motion: reduce)
```

---

# 4. 中文优先与术语

## 4.1 Locale

```ts
const DEFAULT_LOCALE = 'zh-CN';
const FALLBACK_LOCALE = 'zh-CN';
```

```html
<html lang="zh-CN">
```

## 4.2 用户可见内容必须中文

包括：

- 导航。
- 页面标题。
- 按钮。
- 状态。
- 错误。
- 空状态。
- 用户 Idea。
- 实时运行阶段。
- Attack / Defense 可读说明。
- Judge 原因。
- Evidence Lens。
- Passport。
- Export。
- 分享文案。
- Toast。

## 4.3 允许英文白名单

- Agent Arena 品牌。
- 代码类型。
- 变量。
- API 路径。
- 文件名。
- Event ID。
- Event type。
- Tool name。
- Agent 英文别名。
- 模型名。
- 框架名。
- SB / VD / IH。

## 4.4 三个 Agent 固定显示名

```text
稳健构建者（Safe Builder）
传播设计师（Viral Designer）
架构黑客（Infra Hacker）
```

## 4.5 固定术语

| 技术概念 | 中文 UI |
|---|---|
| Landing | 首页 |
| Live Arena | 战斗直播 |
| Passport Snapshot | 智能体护照快照 |
| Mini Passport | 迷你护照 |
| Verified Showcase | 已验证演示 |
| Live AI Battle Lite | 实时 AI 竞技 |
| Live Battle Beta | 实时开战 Beta |
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
| Judge | 裁决 |
| Champion | 冠军 |
| Final Score | 最终得分 |
| Proof HP | 证明值 |
| Artifact | 作品 |
| Tool Call | 工具调用 |
| Observation | 环境观察 |
| Decision | 决策摘要 |
| Runtime Mode | 运行模式 |
| Verified Replay | 已验证演示 |
| Demo Fallback | 演示兜底 |
| Scripted Example | 脚本示例 |
| Live Runtime | 实时 AI 竞技 |

`Artifact` 在 UI 中统一显示“作品”。

## 4.6 中文验收

必须检查：

- 主页面截图中文。
- 实时运行阶段中文。
- 实时错误中文。
- 模式标签中文。
- Agent 中文名为主。
- 375px 中文不截断。
- PNG 中文。
- Markdown 中文不乱码。
- 日期时间采用 `zh-CN`。
- 不出现未授权英文按钮或状态。

---

# 5. 双运行模式架构

## 5.1 目标架构

```text
Verified Fixture ─────────────┐
                              ├→ ArenaPresentationViewModel → 三页面 UI
Live Battle Core Events ──────┘
```

必须共用：

- AgentWorkbenchCard。
- BattleStatePanel。
- FinalScoreboard。
- EvidenceLens。
- Replay Deep Link。
- Passport Snapshot。
- Export View Model。

禁止维护两套 UI。

## 5.2 数据事实来源

### 已验证演示

```text
Verified Fixture
→ Presentation Adapter
→ UI
```

### 实时 AI 竞技

```text
Original Idea
→ Frozen Brief
→ Battle Record
→ Core Event
→ JudgeScore
→ Replay
→ Passport Snapshot
→ Presentation Adapter
→ UI
```

Fixture 不能进入实时事实链。

## 5.3 数据优先级

```text
核心 BattleEvent / JudgeScore / PassportSnapshot
→ 现有 API 数据
→ 当前 Battle 已保存的部分 Event
→ 明确标记的 Verified Fixture
→ 安全空状态
```

规则：

- 实时 Battle 只读本场核心数据。
- Fixture 只服务已验证演示或脚本示例。
- 冲突时核心数据优先。
- 冲突应记录开发错误。
- 不得把 Fixture 写回数据库。

## 5.4 运行状态

```ts
type RuntimeMode =
  | 'verified_replay'
  | 'live_runtime'
  | 'demo_fallback'
  | 'scripted_example';

type BattleCompletionState =
  | 'not_started'
  | 'creating'
  | 'running'
  | 'completed'
  | 'partially_completed'
  | 'cancelled'
  | 'timed_out'
  | 'failed';
```

## 5.5 实时阶段

```ts
type LiveBattleStage =
  | 'validating_idea'
  | 'creating_battle'
  | 'freezing_brief'
  | 'generating_proposals'
  | 'generating_attacks'
  | 'generating_defenses'
  | 'judging'
  | 'building_passport'
  | 'completed'
  | 'cancelled'
  | 'failed';
```

UI 文案：

```text
正在校验创意
正在创建战斗
正在冻结任务
正在生成提案
正在交叉攻击
正在生成防守
正在裁决
正在生成护照快照
已完成
已取消
运行失败
```

这些状态必须由实际 Runtime 驱动。

## 5.6 Feature Flag

推荐：

```text
AGENT_ARENA_LIVE_BATTLE_ENABLED
```

要求：

- 默认值根据部署环境显式配置。
- 关闭时不加载真实 Runtime 客户端。
- 关闭时首页隐藏或禁用实时入口。
- 不影响已验证演示。
- 测试环境可独立开关。
- 不在客户端暴露敏感 Provider Secret。

---

# 6. Presentation 数据契约

以下是推荐语义，路径与名称可按仓库调整。

## 6.1 ArenaPresentationViewModel

```ts
type ArenaPresentationViewModel = {
  battleId: string;
  runtimeMode: RuntimeMode;
  completionState: BattleCompletionState;

  originalIdea: string;
  frozenBrief?: string;
  title: string;

  currentStage: string;
  currentSequence: number;
  elapsedMs?: number;

  canCancel: boolean;
  canRetry: boolean;
  canReplay: boolean;

  agents: AgentWorkbenchViewModel[];
  storyMilestones: StoryMilestone[];

  activeAttack?: CurrentAttackViewModel;
  battleState: BattleStateViewModel;
  finalScoreboard?: FinalScoreboardViewModel;

  evidenceLens: EvidenceLensViewModel;
  passportSnapshots: PassportSnapshotViewModel[];

  commentary: CommentaryViewModel[];
  runtimeNotice?: RuntimeNoticeViewModel;
};
```

## 6.2 AgentWorkbenchViewModel

```ts
type AgentWorkbenchViewModel = {
  agentId: string;
  name: string;
  shortCode: 'SB' | 'VD' | 'IH';
  strategy: string;
  teamColor: string;

  proofHp?: number;
  proofStatus:
    | 'available'
    | 'partial'
    | 'insufficient_evidence';

  status:
    | 'idle'
    | 'generating_proposal'
    | 'inspecting'
    | 'attacking'
    | 'defending'
    | 'attack_accepted'
    | 'patching'
    | 'verified'
    | 'judging'
    | 'completed'
    | 'cancelled'
    | 'failed';

  proposalTitle?: string;
  proposalVersion?: number;
  artifactTitle?: string;
  artifactVersion?: number;
  artifactPreview?: ArtifactPreviewViewModel;

  currentAction?: string;
  observation?: string;
  decision?: string;

  usedToolCalls?: number;
  toolCallBudget?: number;
  sessionLabel?: string;
};
```

禁止显示：

- 记忆占用百分比。
- 智能水平百分比。
- 无来源置信度。

## 6.3 StoryMilestone

```ts
type StoryMilestoneType =
  | 'early_favorite'
  | 'fatal_hidden_test'
  | 'attack_accepted'
  | 'patch_submitted'
  | 'retest_passed'
  | 'final_comeback';
```

硬规则：

- StoryMilestone 只用于 `verified_replay` / `scripted_example`。
- `live_runtime` 不从 Fixture 读取 StoryMilestone。
- 实时 UI 可从真实 Event 派生普通阶段标记，但不得使用固定黄金剧情类型冒充事件。
- 实时模式没有 Fatal Attack 时不显示 Fatal。

## 6.4 RuntimeNoticeViewModel

```ts
type RuntimeNoticeViewModel = {
  level: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  sourceMode: RuntimeMode;
  targetMode?: RuntimeMode;
  doesResultMatchOriginalIdea: boolean;
};
```

Fallback 必须：

```ts
doesResultMatchOriginalIdea === false
```

## 6.5 Evidence Lens

```ts
type EvidenceCompleteness =
  | 'full_breakdown'
  | 'linked_evidence'
  | 'insufficient_evidence';

type EvidenceDeltaItem = {
  id: string;
  delta: number;
  reason: string;
  evidenceEventIds: string[];
  artifactVersion?: number;
  source:
    | 'deterministic_test'
    | 'judge_reasoning'
    | 'battle_conduct'
    | 'presentation_fixture';
};

type ScoreEvidenceEntry = {
  scoreKey: string;
  teamId: string;
  dimension: ScoreDimension;
  score: number;
  maxScore: number;
  completeness: EvidenceCompleteness;
  items: EvidenceDeltaItem[];
  linkedEvidenceEventIds: string[];
  summary: string;
};
```

规则：

- Fixture 的 delta 只属于已验证演示。
- 实时 Battle 没有 delta 时不得补造。
- 实时 Battle 有 Evidence ID 时使用 `linked_evidence`。
- 没有可验证 Evidence 时使用 `insufficient_evidence`。

## 6.6 Evidence Chain

```ts
type EvidenceChainViewModel = {
  battleId: string;
  runtimeMode: RuntimeMode;
  rootEventId: string;
  relatedEventIds: string[];

  proposalEventIds: string[];
  testEventIds: string[];
  attackEventIds: string[];
  defenseEventIds: string[];
  patchEventIds: string[];
  retestEventIds: string[];
  judgeEventIds: string[];

  artifactVersions: number[];
  scoreKeys: string[];
};
```

## 6.7 Passport Snapshot

```ts
type PassportCompleteness =
  | 'verified_complete'
  | 'live_complete'
  | 'live_partial';

type PassportSnapshotViewModel = {
  battleId: string;
  runtimeMode: RuntimeMode;
  completeness: PassportCompleteness;

  agentId: string;
  agentName: string;
  result?: 'winner' | 'runner_up' | 'third' | 'unresolved';
  finalScore?: number;

  strengths: string[];
  weaknesses: string[];
  acceptedClaims: string[];
  rejectedClaims: string[];
  failurePatterns: string[];
  successfulRevisions: string[];

  sourceEventIds: string[];
  replayUrl?: string;
};
```

规则：

- 实时未完成使用 `live_partial`。
- `live_partial` 不生成 Verified Win Card。
- 缺失字段不补造。
- 完整度必须在页面可见。

## 6.8 Live Battle Create Input

推荐 DTO：

```ts
type CreateLiveBattleInput = {
  originalIdea: string;
  runtimeMode: 'live_runtime';
  clientRequestId: string;
};
```

要求：

- `clientRequestId` 用于防重复创建。
- `originalIdea` 保留原文。
- 后端若生成 Frozen Brief，必须同时保留 Original Idea。
- 不允许客户端提交 Winner、Score、StoryMilestone 或 Evidence ID。

## 6.9 取消与迟到 Event

取消后：

```text
completionState = cancelled
```

迟到 Event：

- 可记录到调试日志。
- 不得改变页面最终状态。
- 不得重新宣布 Winner。
- 不得自动跳转 Passport。
- 不得覆盖用户取消文案。

---

# 7. 已验证演示黄金剧情

## 7.1 固定身份

```text
稳健构建者（Safe Builder）
策略：MVP 优先 · 稳定可靠 · 务实收敛
颜色：#49D6C8

传播设计师（Viral Designer）
策略：吸引注意 · 易于分享 · 形成记忆点
颜色：#F5567E

架构黑客（Infra Hacker）
策略：技术深度 · 证据驱动 · 鲁棒可靠
颜色：#F2B84B
```

## 7.2 固定场景

```text
战斗编号：BA-2026-0024
试炼：黑客松创意战
创意：帮助大学生准备考试的 AI 学习助手
运行模式：已验证演示
```

## 7.3 固定故事

### 里程碑 1：早期热门

```text
传播设计师率先完成最具记忆点的作品，暂时领跑。
```

### 里程碑 2：致命隐藏测试

```text
test_032
hidden_case: missing_input_recovery
result: failed
```

```text
attack_031
attacker: Infra Hacker
target: Viral Designer
severity: fatal
claim: 缺少必填输入时，应用会进入无法恢复的状态。
```

```text
传播设计师证明值：88 → 38
```

### 里程碑 3：接受攻击

```text
defense_041
decision: accepted
```

### 里程碑 4：已提交修正

```text
patch_049
artifact: v1 → v2
```

```text
+ 生成前校验必填输入
+ 增加可恢复的空状态
+ 失败后保留用户输入
```

### 里程碑 5：复测通过

```text
test_052
result: passed
```

```text
传播设计师证明值：38 → 68
```

### 里程碑 6：逆风翻盘

```text
1. 传播设计师：87
2. 架构黑客：84
3. 稳健构建者：78
```

冠军理由：

```text
它获胜，不是因为从未犯错。
而是因为面对证据后完成了修正，并在压力下恢复。
```

## 7.4 固定证据的隔离规则

- `test_032`、`patch_049`、`test_052` 是 Presentation Evidence ID。
- 不冒充数据库 Event ID。
- 不写入实时 Battle。
- 不进入实时 Export。
- 不进入实时 Passport。
- 不触发现实 Winner。
- 不用于实时证明值。
- `BA-2026-0024` 不用于实时 Battle。

## 7.5 证明值规则

```text
低：-5
中：-15
高：-30
致命：-50
```

- 未验证攻击不扣。
- 被驳回且有反证不扣。
- 提交修正不恢复。
- 实际复测通过恢复该次伤害的 60%。
- 证明值与最终分数独立。

---

# 8. 路由、入口与深链

## 8.1 主路由

按现有仓库适配：

```text
/                              首页
/battle/:id/live               战斗直播
/agent/:id/passport?battle=:id 智能体护照快照
```

## 8.2 首页入口

### 已验证演示

```text
观看 90 秒已验证演示
```

### 实时 AI

```text
输入你的创意
[...]
实时开战 Beta
```

不新增复杂 Battle Setup 页面作为主流程。

## 8.3 证据深链

```text
/battle/:id/live?evidence=:evidenceId
/battle/:id/live?score=:scoreKey
```

- 已验证演示可使用 `test_032`。
- 实时模式只使用本场 Event ID。
- 刷新可恢复。
- Back / Forward 正常。
- 不依赖 React 内存临时状态。

## 8.4 页面刷新

必须根据 URL + Battle 数据恢复：

- Battle ID。
- Runtime Mode。
- Original Idea。
- Completion State。
- 当前 Event。
- 当前 Score。
- 当前 Agent。
- Evidence Lens 选中项。

## 8.5 Fallback 路由行为

实时失败切回已验证演示时：

- URL 必须切换到固定 Battle ID，或明确显示当前为独立兜底 Battle。
- 不得继续保留用户 Idea 作为当前 Battle 标题。
- Runtime Notice 必须显示：
  - 实时 Battle 失败。
  - 当前演示不对应刚才 Idea。
- 已产生的实时部分 Event 应保留可查看入口。

---

# 9. P0 任务清单：Verified Showcase

## Task P0-A：仓库探测、能力审计与安全护栏

### 目标

确认目录、依赖、数据流、Runtime 能力和禁区。

### 产出

```text
docs/agent-arena-v051-implementation-map.md
docs/agent-arena-v051-runtime-capability-audit.md
```

### 必须定位

- Battle Engine。
- Core Schema。
- Example Battle。
- Live 页面。
- Passport 页面。
- Replay。
- SSE / polling / reducer。
- Judge。
- Export。
- Runtime Provider。
- 创建 Battle 的现有入口。
- 测试命令。

### 验收

- 实现映射完整。
- P1 Capability Audit 有明确结论。
- P0 不修改 Engine。
- 无 migration。
- 无 destructive schema change。
- 无重复架构。

---

## Task P0-B：双来源 Presentation Adapter

### 目标

建立一套 UI Contract，同时支持 Fixture 与 Core Event。

推荐：

```ts
buildArenaPresentationViewModel(input)
```

### 要求

- 输入只读。
- 不 mutate 原始 Event。
- 不依赖 React。
- 不依赖浏览器 API。
- 不 import Engine 内部实现。
- Fixture 可生成完整 P0 三页数据。
- Live 数据缺字段安全降级。
- Runtime Mode、Completion State 与 Source Provenance 明确。
- StoryMilestone 只在已验证模式生成。

### 验收

- 相同输入得到稳定输出。
- Fixture 与 Live Input 均可适配。
- 实时输入不会读取固定 Story Fixture。
- 缺失字段不崩溃。
- Selector 可单测。

---

## Task P0-C：首页双入口壳

### 目标

10 秒内讲清产品，同时为 P1 留出正式入口。

### 必须包含

```text
每个智能体都声称自己很强。
竞技场让它当场证明。

同一任务、同样工具、每一分都有证据。
```

### 双入口

```text
输入你的创意
[帮助独立开发者验证产品需求的 AI 助手]

[实时开战 Beta]

或

[观看 90 秒已验证演示]
```

### P0 阶段行为

- 已验证演示按钮必须可用。
- 实时按钮由 Feature Flag 控制。
- Feature Flag 关闭时：
  - 可隐藏按钮，或
  - 显示“实时模式准备中”。
- 不能发起假实时 Battle。
- 首页预览动画明确属于演示预览。

### 禁止

- Idea Generator。
- Chat 输入体验。
- Prompt Playground。
- 虚构统计。
- Marketplace。
- 多 Trial。

### 验收

- 3 秒内有演示预览动态。
- 两入口视觉层级清晰。
- 375px 正常。
- P0 离线可用。
- 实时入口关闭时不加载 Runtime。

---

## Task P0-D：智能体工作台

### 目标

让三张卡表现为持久 Agent，而不是聊天文本。

### 每张卡显示

- 中文名称。
- 英文别名。
- 策略。
- 证明值。
- Proposal / 作品预览。
- 版本。
- 当前行动。
- 环境观察。
- 决策摘要。
- 工具调用。
- 会话编号。
- 状态。

### 行为

- 三个 Agent 桌面端同屏。
- 活跃 Agent 增强。
- 状态来自 View Model。
- UI 不直接解析复杂 Event Payload。
- 实时状态值已经预留，但 P0 不发起 Runtime。

### 验收

- Fixture 完整渲染。
- Sequence 驱动动作。
- 驳回攻击不扣证明值。
- 复测恢复正确。
- 移动端可读。
- 无虚构智能指标。

---

## Task P0-E：已验证演示 Story Director

### 目标

稳定播放六个黄金里程碑。

```text
早期热门
→ 致命隐藏测试
→ 接受攻击
→ 修正
→ 复测通过
→ 逆风翻盘
```

### 要求

- 使用 Story Fixture。
- 播放逻辑与组件分离。
- 支持播放、暂停、重置。
- 支持跳转 Sequence。
- 重置完全恢复。
- 不修改 Engine。
- 不调用真实模型。
- Runtime Mode 为已验证演示。

### 验收

- 自动播放 20 次顺序一致。
- Winner 一致。
- 证明值一致。
- 不重复扣减。
- 页面刷新可重建。
- 不依赖音效和 Kill Cam。

---

## Task P0-F：Battle State 与 Final Scoreboard 分离

### Pre-Judge

显示：

- 证明值。
- 测试通过。
- 已验证风险。
- 当前状态。

### Judge 后

显示：

- 可实现性。
- 原创性。
- 演示表现。
- 技术深度。
- 讲解清晰度。
- 风险控制。
- 总分。
- 排名。
- 胜负原因。

### 验收

- 裁决前不显示最终分。
- 最终固定为 87 / 84 / 78。
- 每个维度可点击。
- 未获胜 Agent 有落败原因。
- 最终分不由证明值计算。

---

## Task P0-G：Evidence Lens

### 目标

点击分数反查证据。

### 固定示例

```text
为什么是 19 / 25 分？

+13 基础完成度达到要求
+5  核心流程通过
-4  空状态恢复失败
+3  致命问题已修正
+2  回归测试通过

合计：19 / 25
```

### 要求

- Score 单元格高亮。
- Drawer 打开。
- Event 定位。
- Attack / Defense / Test 高亮。
- Evidence Chain。
- Replay Deep Link。
- 焦点恢复。
- `sum(items.delta) === score`。

### 验收

- Fixture 所有分数至少一个 Evidence。
- 基础分显式展示。
- 无 Evidence 显示 `insufficient_evidence`。
- 不伪造 delta。
- 键盘与屏幕阅读器可用。

---

## Task P0-H：Evidence Inspector 与 Replay Deep Link

### 目标

回放能力不必新增第四张主页面。

### 必须展示

```text
作品 v1
隐藏测试失败
攻击验证成立
接受攻击
已提交修正
复测通过
评分更新
```

### 验收

- 从评分、攻击、测试、Passport 进入。
- Query 同步。
- 刷新保持。
- Back / Forward 正常。
- 不展示不存在内容。
- 不依赖先前动画。

---

## Task P0-I：已验证 Passport Snapshot

### 页面标题

```text
智能体护照快照
来自已验证 Battle #024
```

### 必须展示

- 比赛结果。
- 最终得分。
- 测试通过。
- 验证等级。
- 优势。
- 弱点。
- 接受与驳回主张。
- 失败模式。
- 成功修正。
- 证据亮点。
- 比赛历程。
- 回放链接。

### 固定历程

```text
提案：成为早期热门
构建：作品 v1 完成
攻击：证明值 88 → 38
防守：接受攻击并提交修正
验证：复测通过，证明值 38 → 68
裁决：最终得分 87 / 100
```

### 禁止

- 总 Battle 数。
- 胜率。
- 全球排名。
- Level。
- 长期趋势。

### 验收

- 三个 Agent 均有 Snapshot。
- 每个有 Strength 与 Weakness。
- 每个至少一个 Evidence Link。
- Winner 显示失败与恢复。
- 375px 正常。

---

## Task P0-J：P0 Demo Safety 与幂等

### 目标

已验证演示永远可用。

### 要求

- Fixture 离线可运行。
- Event ID 去重。
- Sequence 排序。
- 同一 Attack 只扣一次。
- 同一 Retest 只恢复一次。
- 重建不重播历史动画。
- Strict Mode 不重复播放。
- 缺字段不白屏。
- 不显示裸错误。

### 验收

- 中途刷新可恢复。
- SSE 模拟重连不重复扣减。
- 20 次播放无状态污染。
- 正式 P0 不依赖 Runtime Provider。
- Feature Flag 关闭不影响 P0。

---

## Task P0-K：已验证演示 Markdown Export

### 要求

- 不重写 Artifact Writer。
- 不修改现有 Export API 合约。
- 标记：
  - 运行模式：已验证演示。
  - Battle ID：BA-2026-0024。
- 中文内容不乱码。
- 页面与导出分数一致。
- Evidence Link 可打开。
- 不出现不存在事实。
- 缺证据写 `insufficient_evidence`。

### 最低内容

```text
原始 Idea
冻结任务
运行模式
Battle ID
参赛智能体
提案摘要
主要攻击
防守决定
修正记录
最终评分
胜负原因
证据链接
护照快照
完成状态
```

### 验收

- 现有 Export 成功。
- 中文下载成功。
- 添加 Export 回归测试。
- Fixture 不污染真实 Battle Export。

---

## Task P0-L：作品查看器 Artifact Viewer（Fixture-Only）

### 目标

新增第四张页面，展示 Battle 中「构建 → 攻击 → 修正 → 验证」阶段的证据细节。

### 实现

- 新增路由：`/battle/:battleId/artifact/:agentId`。
- 四个 Tab：版本对比、应用预览、补丁差异、测试结果。
- 从战斗直播页点击 Agent 卡上的作品入口进入。
- Verified Showcase：内容来自固定 fixture。
  - 版本对比：v1 → v2 切换，高亮差异。
  - 应用预览：静态渲染的示例界面，非真实可交互应用。
  - 补丁差异：结构化 diff 文本，固定内容。
  - 测试结果：表格，test_032（v1 失败→v2 通过）等。
- Live AI Battle Lite：证据不足时降级展示。
  - 展示 Agent 输出的纯文本描述（如"计划修复空状态恢复逻辑"）。
  - 不得渲染为看起来像真实 diff 或真实测试通过的 UI。
  - 无足够证据时显示：`本场为真实 AI 竞技，暂无可验证的构建/测试证据。`

### 明确不做

- 不新增代码执行环境。
- 不新增 Test Runner。
- 不解析或运行真实代码。
- 不触发任何 Shell 调用或文件系统写入。

### 验收

- [ ] Verified Showcase 中该页面可稳定展示固定内容。
- [ ] 四个 Tab 可切换。
- [ ] 版本对比高亮差异。
- [ ] 补丁差异展示行号和变更类型。
- [ ] 测试结果表格包含 v1/v2 对比。
- [ ] 链接回 Evidence Chain。
- [ ] Live AI Battle Lite 降级文案正确。
- [ ] 页面不触发任何代码执行。
- [ ] 375px 可读。

---

## Task P0-M：Arena Host 主持人解说

### 目标

在战斗直播页增加主持人解说区域，提供 Battle 进展的叙事性补充。

### 实现

- 固定展示位，位于事件流区域上方、Proof HP 下方。
- 包含：主持人头像/图标、音频波形动画、解说文案。
- 文案随 Round 切换更新。
- Verified Showcase：文案来自固定 fixture 表。
- Live AI Battle Lite：如有余量可接入轻量 Commentator Agent，无余量用通用文案兜底。
- 音频波形为装饰性动画，不需要真实 TTS 音频。

### 验收

- [ ] Round 切换时主持人解说内容随之更新。
- [ ] 音频波形动画在静音 / Reduced Motion 下有静态替代。
- [ ] 不阻塞主线 UI。
- [ ] 375px 不溢出。

---

## Task P0-N：7 段 Round 进度条（Presentation 展示分段）

### 目标

在战斗直播顶部展示 7 个阶段的进度条，提供更精细的 Battle 进展感知。

### 实现

- 展示七个标签：
  ```
  简报 → 提案 → 构建 → 攻击 → 防守 → 验证 → 裁决
  ```
- 映射到 Battle Engine 原有四个核心状态：
  - 简报 → `briefing`
  - 提案 → `proposal_round` 前半段
  - 构建 → `proposal_round` 后半段（作品产出）
  - 攻击 → `cross_attack_round`
  - 防守 → `defense_round` 前半段
  - 验证 → `defense_round` 后半段（修正/确认）
  - 裁决 → `judging_round`
- 当前阶段高亮，已完成阶段标记，未到达阶段置灰。
- 实时模式由实际 Runtime 阶段驱动，不播放固定时间轴。
- 页面刷新后可恢复。

### 明确不做

- 不修改 `battle-state.ts` 状态机。
- 不新增 Engine 状态转移节点。
- 不改变现有 API 字段。

### 验收

- [ ] 七个标签正确显示。
- [ ] 阶段切换流畅（350ms 转场）。
- [ ] 已验证演示 7 阶段稳定。
- [ ] 实时模式阶段由 Runtime 驱动。
- [ ] 刷新后可恢复。
- [ ] 375px 不溢出。

---

# 10. P0 独立冷审计

P0 完成后新开 Codex 会话，只审计，不先改代码。

必须运行：

- Type Check。
- Lint。
- Unit。
- Component。
- E2E。
- 20 次回归。
- Screenshot Review。
- Git Diff。

结论只能是：

```text
READY FOR P1
```

或：

```text
NOT READY FOR P1
```

必须确认：

```text
Battle Engine modified: NO
Core Schema modified: NO
Database Migration added: NO
API Contract changed: NO
```

---

# 11. P1 任务清单：Live AI Battle Lite

## Task P1-A：Runtime 能力门禁与 Feature Flag

### 目标

确认 P1 可以基于现有能力实现。

### 实现

- 完成 Runtime Capability Audit。
- 配置 Feature Flag。
- 关闭 Flag 不加载 Runtime。
- 关闭 Flag 不影响 P0。
- 确认 Provider Secret 只在服务端。
- 确认现有 Engine 接口。

### 验收

- Audit 结论为 Ready。
- Gap Report 无阻塞。
- Feature Flag 测试通过。
- 不修改固定 Fixture。
- 不修改 P0 autoplay。

---

## Task P1-B：Idea 输入、校验、冻结任务与 Battle 创建

### Idea 输入

要求：

- 非空。
- Trim。
- 合理长度上限。
- 中文与英文均可。
- 保留 Original Idea。
- 不自动改写用户内容。
- 不把输入当系统指令。

### Battle 创建

要求：

- 每次创建唯一 Battle ID。
- 使用 `clientRequestId` 防重复。
- 重复点击不创建多个 Battle。
- 创建中禁用按钮。
- 创建失败中文提示。
- 成功后进入 Live Arena。
- URL 使用新 Battle ID。
- Runtime Mode 为 `live_runtime`。

### Frozen Brief

若系统生成 Frozen Brief：

- Original Idea 仍保留。
- Frozen Brief 可查看。
- 不悄悄改变产品目标。
- 三个 Agent 使用同一 Frozen Brief。

### 验收

- Idea 原样进入 Battle。
- 新 ID 唯一率 100%。
- 双击防重。
- 创建失败可恢复。
- 固定 Battle ID 未被使用。
- 用户不能提交 Winner / Score / Evidence ID。

---

## Task P1-C：Live Runtime Adapter 与 Event Stream

### 目标

把真实 Runtime Event 转换为共用 Presentation Contract。

### 要求

- 复用现有 SSE / polling。
- Event 按 ID 去重。
- Event 按 Sequence 排序。
- 页面刷新从服务端数据重建。
- 断线可重连。
- 迟到 Event 安全处理。
- 不读取 Story Fixture。
- 不读取固定 Evidence。
- Runtime 状态驱动 Stage UI。

### 实时状态

```text
正在冻结任务
正在生成提案
正在交叉攻击
正在生成防守
正在裁决
正在生成护照快照
```

### 验收

- 首 Event 可见。
- 重连不重复。
- Refresh 不丢状态。
- UI 与 P0 使用同一组件。
- P0 Fixture 不受影响。

---

## Task P1-D：三个真实 Agent Proposal

### 目标

三个身份产生差异化 Proposal。

### Agent 角色

#### 稳健构建者

- MVP 可行性。
- 风险控制。
- 交付路径。

#### 传播设计师

- Wow Factor。
- Demo Power。
- 用户体验。
- 传播。

#### 架构黑客

- 技术深度。
- 系统边界。
- 证据与风险。

### 输出要求

Proposal 至少包含：

- 标题。
- 核心主张。
- 目标用户。
- 关键体验。
- 可实现性说明。
- 风险。
- Demo Moment。

### Schema

必须 Schema 校验。

禁止：

- 三个 Proposal 高度同质。
- 输出原始思维链。
- 输出不可控超长文本。
- 输出固定黄金剧情内容。

### 验收

- 三个 Proposal 均来自真实 Runtime。
- 角色差异明显。
- 空输出可重试。
- Schema success 计入指标。
- 每个 Proposal 有 Event ID。

---

## Task P1-E：真实 Attack 与 Defense

### Attack

每个 Agent 针对其他方案产生结构化主攻击。

至少包含：

- Attacker。
- Target。
- Claim。
- Severity。
- Reason。
- Evidence Reference，若有。
- Verification Status。

### Defense

至少包含：

- Target Agent。
- Defended Attack ID。
- Decision：
  - accepted。
  - rejected。
  - partially_accepted。
- Reason。
- Revision Suggestion，若有。
- Counter Evidence，若有。

### 规则

- Attack 来自本场 Runtime。
- Defense 来自本场 Runtime。
- 不使用 `attack_031` 或 `defense_041`。
- 不强制 Fatal。
- 不强制 accepted。
- 不强制修正。
- 没有 Test 时不能声称“测试失败”。

### 证明值

- 只由本场已验证 Attack 推导。
- 无足够 Evidence 时显示 partial / insufficient。
- 没有真实 Retest 不恢复。
- 不默认使用固定 88 起点，除非现有系统统一定义。

### 验收

- Attack / Defense 可回放。
- 驳回 Attack 不扣减。
- 不存在固定 Fixture 污染。
- 每条结果有来源 Event。
- Evidence 不足时明确标记。

---

## Task P1-F：真实 Judge、Evidence 与低可信度处理

### Judge 输出

- 六维分数。
- 总分。
- Winner。
- 获胜原因。
- 每个落败原因。
- 已接受 Attack。
- 未解决风险。
- Evidence IDs。
- 低可信度标记。

### 规则

- 不使用固定 87 / 84 / 78。
- Winner 不硬编码。
- Schema 校验。
- 有限 Schema repair。
- Judge 失败显示“裁决未完成”。
- 不生成假分数。
- 平均主义低差异可重试或标低可信度。
- Evidence ID 必须属于本场。

### Evidence Lens

分级：

1. `full_breakdown`
2. `linked_evidence`
3. `insufficient_evidence`

禁止：

- 根据总分反推 delta。
- 使用固定 `test_032`。
- 伪造 deterministic test。
- 将自由文本当已验证测试。

### 验收

- Winner 来自本场 Judge。
- Evidence Link 可打开。
- 缺 delta 正确降级。
- Judge 失败不生成 Passport Winner。
- Score 与页面一致。

---

## Task P1-G：实时 Replay、Passport Snapshot 与 Mini Passport

### 完整 Battle

生成三份：

```text
completeness = live_complete
```

展示：

- 结果。
- Score。
- Strength。
- Weakness。
- Attack / Defense。
- Failure Pattern。
- Evidence。
- Replay。

### 部分 Battle

生成：

```text
completeness = live_partial
```

UI：

```text
本场战斗尚未产生完整护照快照。
以下仅展示已经记录的提案、攻击与证据。
```

### 规则

- 未完成不生成 Verified Win。
- 不补造 Score。
- 不补造 Winner。
- 不补造 Patch / Retest。
- 默认显示 Winner；无 Winner 时显示第一个完成 Proposal 的 Agent。
- 页面显示数据来源和完整度。

### 验收

- 完整 Battle 有三份 Snapshot。
- 部分 Battle 有 Mini Passport。
- Replay 可重建。
- Evidence Link 指向本场。
- 不出现长期数据。

---

## Task P1-H：取消、超时、重试、Schema Repair 与失败降级

### 取消

- Live Arena 提供取消。
- 使用 AbortController 或现有中止机制。
- 取消后状态为 cancelled。
- 迟到 Event 不改变最终状态。
- 已产生 Event 可查看。

### 超时

- 有明确最大等待时间。
- 超时状态为 timed_out。
- 支持重试。
- 不显示裸错误。

### Schema Repair

- 有限次数。
- 每次 repair 记录。
- 超过次数进入失败。
- 不无限循环。

### Fallback

实时失败后显示：

```text
实时竞技未能完成。
以下将切换到已验证演示。
演示内容不对应刚才输入的创意。
```

提供：

- 重试本次 Idea。
- 修改 Idea。
- 查看部分 Event。
- 观看已验证演示。

硬规则：

- 不把固定 Winner 挂在用户 Idea 上。
- 切换后 URL / Battle ID 必须明确。
- Runtime Mode 变为 `demo_fallback`。
- Fallback ≤ 1 秒。

### 验收

- Cancel 可用。
- Timeout 可用。
- Retry 不重复 Battle。
- Schema repair 有上限。
- Fallback 文案诚实。
- P0 仍可使用。

---

## Task P1-I：输入安全、Prompt 隔离与输出校验

### 输入安全

- Idea 长度限制。
- 控制字符处理。
- HTML 转义。
- 不执行用户代码。
- 不把 Idea 拼进系统指令角色。
- 用户输入与系统 Prompt 分隔。
- 不允许用户控制 Agent ID、Score、Winner、Event Type。

### 输出安全

- Schema Validation。
- HTML / Markdown 安全渲染。
- 不直接 `dangerouslySetInnerHTML`。
- 链接协议白名单。
- 不渲染未受控脚本。
- 不展示原始 Chain of Thought。

### Secret

- Provider Key 只在服务端。
- 不写入客户端 Bundle。
- 不记录完整 Secret。
- 错误日志脱敏。

### 验收

- Prompt Injection 测试。
- XSS 测试。
- 超长输入测试。
- 非法 URL 测试。
- Secret Scan。
- 用户不能伪造运行模式。

---

## Task P1-J：实时稳定性、性能、观测与 Go / No-Go

### 必须记录

- Battle ID。
- Client Request ID。
- Runtime Mode。
- 创建耗时。
- 首 Event 耗时。
- 总耗时。
- Schema Repair 次数。
- Retry 次数。
- Completion State。
- Fallback 原因。
- Event 数。
- Evidence 数。

不得记录：

- Provider Secret。
- 原始 Chain of Thought。
- 不必要的敏感内容。

### 20 次运行

测试 Idea 至少覆盖：

- AI 学习助手。
- Web3 创意。
- 健身助手。
- 独立开发者产品验证。
- 校园活动工具。
- 模糊短 Idea。
- 较长 Idea。
- 英文 Idea。
- 边界合法输入。
- 模型超时模拟。

### Go / No-Go

```text
连续运行：20 次
完整完成：≥ 18 次
Schema success：≥ 95%
首 Event P95：≤ 10 秒
完整 Battle P95：≤ 90 秒
Fallback switch：≤ 1 秒
Battle ID 唯一率：100%
重复 Event 幂等率：100%
固定剧情污染：0
裸错误页面：0
```

### 输出

```text
docs/audits/agent-arena-v051-live-go-no-go.md
```

结论：

```text
LIVE AI READY FOR PITCH
```

或：

```text
LIVE AI NOT READY FOR PITCH
```

---

# 12. P1 独立冷审计

新开会话，禁止先改代码。

必须验证：

- 用户 Idea 原样保存。
- 新 Battle ID。
- Proposal 真实生成。
- Attack 真实生成。
- Defense 真实生成。
- Judge 真实生成。
- Winner 不固定。
- Score 不固定。
- 无固定 Test ID 污染。
- 无 Story Fixture 污染。
- Evidence 降级正确。
- Replay 正确。
- Passport / Mini Passport 正确。
- Cancel。
- Timeout。
- Retry。
- Schema Repair。
- SSE Reconnect。
- Feature Flag。
- Prompt Injection。
- XSS。
- Secret。
- 20 次指标。

结论只能是：

```text
READY FOR P2
```

或：

```text
NOT READY FOR P2
```

并单独给出：

```text
LIVE AI READY FOR PITCH
```

或：

```text
LIVE AI NOT READY FOR PITCH
```

---

# 13. P2 任务清单：Share & Sound

## Task P2-A：三个关键音效

只实现：

- 致命攻击。
- 复测通过。
- 冠军揭晓。

规则：

- 用户交互后初始化。
- 每种每场一次。
- 支持静音。
- 默认低音量。
- Strict Mode 不重复。
- 音效失败不影响 UI。
- 实时模式没有对应 Event 时不播放。
- 部分 Battle 不播放冠军揭晓。

验收：

- P0 节点同步。
- P1 实际 Event 同步。
- Reset 后可重播。
- 静音立即生效。
- Audio Blocked 不报错。

## Task P2-B：已验证胜利卡

### 内容

```text
智能体名称
已验证胜利
Battle ID
得分
测试 / Evidence
致命攻击
成功抵御
成功修正
核心优势
暴露弱点
已验证修正
Replay Link
运行模式
```

### 已验证演示

可使用固定数据。

### 实时模式

只有以下条件全部满足才生成：

- Completion State = completed。
- Passport Completeness = live_complete。
- Winner 存在。
- JudgeScore 存在。
- Evidence 足够。
- 非 Fallback。
- 非 Mini Passport。

### PNG

- 1200 × 675。
- 中文。
- 优先 Canvas。
- 不新增重量依赖。
- 文件名包含 Battle ID。

### 验收

- 卡片包含失败和弱点。
- 数据与 Passport 一致。
- Copy Link 可用。
- Clipboard 失败可手动复制。
- QR 可选。
- 部分 Battle 不生成。

---

# 14. P3 任务清单：Visual Polish

## Task P3-A：轻量致命攻击回放

### 已验证演示

固定在 `fatal_hidden_test` 触发。

### 实时模式

只有本场真实 Attack：

```text
severity = fatal
```

且有实际 Event 时触发。

### 视觉

```text
背景压暗 60%
聚焦被攻击 Proposal / 作品
致命攻击
攻击结论
Evidence ID
严重级别
```

### 时序

```text
0ms    遮罩
250ms  聚焦
450ms  结论
900ms  Evidence
1500ms 退出
```

### 规则

- 每场一次。
- Reset 可重播。
- Reduced Motion 静态替代。
- ESC 跳过。
- 不决定业务状态。
- 不触发 Proof 计算。
- 失败不影响主线。
- 实时没有 Fatal 不触发。

---

# 15. 现有代码库结构（按实际路径映射）

实施前必须先探测以下实际路径，不要新建平行目录。

```text
apps/web/src/
  App.tsx             — 路由壳（Shell + Routes）
  main.tsx            — 入口
  styles.css          — 全局样式（CSS 变量驱动）
  components/
    AgentPassport.tsx       — 护照快照组件
    ArenaStage.tsx          — 竞技场舞台组件
    BattleArchive.tsx       — 战斗列表
    BattleReplayPlayer.tsx  — 回放播放器
    BattleWorkspace.tsx     — 战斗工作台（主要 Battle UI）
    HomeExperience.tsx      — 首页体验
  data/
    battle.ts              — Battle 数据适配器
    battle.test.ts         — Battle 数据测试
    demo.ts                — Demo 数据适配器
    home.ts                — 首页数据适配器
    home.test.ts           — 首页数据测试

arena/engine/
  artifacts.ts        — 作品生成与 Markdown Export
  battle-state.ts     — Battle 状态机（idle → briefing → ... → completed）
  battle-state.test.ts — 状态机测试
  demo-battle.ts      — Demo Battle 完整运行流程
  fixtures.ts         — Demo Fixture 数据（团队、提案、攻击、防守、评分等）
  passport.ts         — 护照生成逻辑
  passport.test.ts    — 护照测试
  replay.ts           — 回放构建
  replay.test.ts      — 回放测试
  scoring.ts          — 评分逻辑
  scoring.test.ts     — 评分测试

arena/schemas/         — Zod Schema 定义
arena/events/          — Event Store（InMemoryBattleEventStore）

lib/runtime/
  contract.ts              — Agent Runtime 接口定义
  contract.test.ts         — 接口测试
  mastra.ts                — Mastra 适配器实现
  mastra.test.ts           — Mastra 适配器测试
  mock.ts                  — Mock Runtime
  mock.test.ts             — Mock 测试
  repair.ts                — Schema Repair
  repair.test.ts           — Repair 测试
  agent-prompts.ts         — Agent Prompt 定义

packages/contracts/src/
  index.ts                 — 共享 Event 类型（BattleEvent, AttackPayload, DefensePayload 等）
  index.test.ts            — 类型测试

lib/db/                    — Drizzle/Postgres 数据层
```

关键现有类型：

```ts
// packages/contracts/src/index.ts
type BattleEventType = "brief_created" | "team_created" | "proposal_created"
  | "attack_created" | "defense_created" | "score_created"
  | "champion_selected" | "passport_created" | "artifact_created"
  | "replay_created" | "commentary_created" | "error";

type Severity = "low" | "medium" | "high";  // 注意：当前无 "fatal"

const DAMAGE_MAP = { low: 5, medium: 15, high: 30 };  // 注意：当前无 fatal 条目
```

## 15.1 实施原则

- UI 不直接解析复杂 Event Payload，通过 `data/` 适配器转换。
- Engine 文件（`arena/engine/`）P0 阶段不修改。
- Schema 文件（`arena/schemas/`、`packages/contracts/`）P0 阶段不修改。
- 新增组件放在 `apps/web/src/components/` 下，不要新建 `components/arena/` 平行目录。
- 新增数据适配器放在 `apps/web/src/data/` 下。
- 新增 Engine 扩展放在 `arena/engine/` 下，不要新建 `lib/arena-presentation/` 或 `lib/arena-runtime/` 平行目录。
- Fixture 不 import Runtime。
- Reducer 纯函数。
- Secret 不进入客户端。

---

- UI 不直接解析复杂 Event Payload。
- Presentation Adapter 是纯转换层。
- Runtime Adapter 不 import UI。
- Fixture 不 import Runtime。
- Reducer 纯函数。
- 音效与动效不决定业务状态。
- Secret 不进入客户端。

---

# 16. 测试要求

## 16.1 P0 单元测试

必须覆盖：

```text
Event dedupe
Event sequence sorting
Proof damage
Retest partial recovery
Rejected attack no damage
Repeated event idempotency
Presentation adapter fixture
StoryMilestone only verified mode
Evidence Lens score lookup
Evidence math
Evidence Chain
Deep link parsing
Passport Snapshot mapping
Export consistency
```

## 16.2 P1 单元测试

必须覆盖：

```text
Idea validation
Idea trim
Idea length
Client request id dedupe
Unique battle id mapping
Runtime stage mapping
Live event dedupe
Late event after cancel
Timeout state
Retry state
Schema repair limit
Live evidence completeness
No fixture contamination
Mini Passport mapping
Feature flag off
Fallback provenance
```

## 16.3 组件测试

必须覆盖：

- 双入口显示。
- Feature Flag 关闭。
- Score 点击打开 Lens。
- Lens 关闭恢复焦点。
- Evidence 高亮。
- Pre-Judge 隐藏 Final Score。
- Judge 后显示 Score。
- Runtime Stage 更新。
- Cancel。
- Retry。
- Timeout。
- Fallback Notice。
- Mini Passport。
- Mute。
- Reduced Motion。
- `insufficient_evidence`。

## 16.4 P0 E2E

```text
首页
→ 观看已验证演示
→ 三个 Agent
→ Fatal Attack
→ 接受攻击
→ 修正
→ 复测
→ 逆风翻盘
→ Evidence Lens
→ Passport
→ Export
```

附加：

- Reload during Attack。
- Duplicate Event。
- 375px。
- Reduced Motion。
- Clipboard Failure。
- Offline P0。

## 16.5 P1 E2E

```text
首页
→ 输入陌生 Idea
→ 实时开战 Beta
→ 新 Battle ID
→ 冻结任务
→ 三个 Proposal
→ Attack
→ Defense
→ Judge
→ Evidence
→ Passport / Mini Passport
```

异常：

- 双击创建。
- API Create Failure。
- Provider Timeout。
- Schema Failure。
- SSE Disconnect。
- SSE Duplicate。
- Cancel。
- Late Event。
- Reload。
- Judge Failure。
- Passport Failure。
- Fallback。
- Feature Flag Off。
- Prompt Injection。
- XSS。
- 375px。

## 16.6 截图清单

P0：

```text
landing-desktop.png
landing-mobile.png
verified-entrance.png
verified-fatal.png
verified-patch.png
verified-retest.png
verified-final.png
evidence-lens.png
passport-verified.png
```

P1：

```text
live-idea-input.png
live-battle-created.png
live-proposals.png
live-attack-defense.png
live-judge.png
live-evidence.png
live-passport.png
live-mini-passport.png
live-timeout.png
live-fallback.png
live-mobile.png
```

## 16.7 稳定性

### P0

- 20 / 20。
- Event 顺序一致。
- Winner 一致。
- Proof 一致。
- Evidence Link 一致。
- 无状态污染。
- 无重复音效。
- 无重复 Kill Cam。

### P1

- 20 次。
- 完整完成 ≥ 18。
- Schema success ≥ 95%。
- 首 Event P95 ≤ 10 秒。
- 完整 P95 ≤ 90 秒。
- Fallback ≤ 1 秒。
- ID 唯一。
- 无 Fixture 污染。
- 无重复 Event。
- 无裸错误。

---

# 17. Definition of Done

## 17.1 P0 完成

- [ ] 三页可访问。
- [ ] 首页双入口壳完成。
- [ ] 已验证演示可离线运行。
- [ ] Runtime Mode 正确。
- [ ] 三个 Workbench 同屏。
- [ ] 六里程碑稳定。
- [ ] 88 → 38 → 68。
- [ ] 87 / 84 / 78。
- [ ] Evidence Lens 完整。
- [ ] Deep Link 可恢复。
- [ ] 三份 Passport。
- [ ] Export 正常。
- [ ] 中文完整。
- [ ] 375px。
- [ ] Reduced Motion。
- [ ] 20 次通过。
- [ ] Engine 未修改。
- [ ] Schema 未修改。
- [ ] 无 migration。
- [ ] P0 冷审计 READY FOR P1。

## 17.2 P1 完成

- [ ] Capability Audit Ready。
- [ ] Feature Flag。
- [ ] Idea 输入。
- [ ] Original Idea 保留。
- [ ] New Battle ID。
- [ ] 防重复创建。
- [ ] 三个真实 Proposal。
- [ ] 真实 Attack。
- [ ] 真实 Defense。
- [ ] 真实 Judge。
- [ ] Winner 不固定。
- [ ] Score 不固定。
- [ ] 无 Fixture 污染。
- [ ] Live Event Stream。
- [ ] Evidence 降级。
- [ ] Replay。
- [ ] Passport / Mini Passport。
- [ ] Cancel。
- [ ] Timeout。
- [ ] Retry。
- [ ] Schema Repair。
- [ ] Fallback 诚实。
- [ ] Prompt 隔离。
- [ ] XSS 防护。
- [ ] Secret 安全。
- [ ] 20 次 Go / No-Go。
- [ ] P1 冷审计通过。

## 17.3 P2 完成

- [ ] 三音效。
- [ ] Mute。
- [ ] Win Card。
- [ ] 中文 PNG。
- [ ] Copy Replay。
- [ ] 部分 Battle 不生成 Win Card。

## 17.4 P3 完成

- [ ] Fatal Attack 才触发。
- [ ] 每场一次。
- [ ] ≤ 1500ms。
- [ ] Reduced Motion。
- [ ] ESC。
- [ ] 不决定业务状态。

---

# 18. Git Diff 护栏

提交前运行：

```bash
git status
git diff --stat
git diff
```

## 18.1 P0 必须确认

```text
Battle Engine modified: NO
Core Schema modified: NO
Database Migration added: NO
API Contract changed: NO
Existing routes deleted: NO
```

## 18.2 P1 必须确认

```text
Battle Engine core semantics changed: NO
Destructive schema change: NO
Database Migration added: NO
Existing API compatibility broken: NO
Fixture imported by Live Runtime: NO
Provider Secret exposed: NO
```

若 P1 需要修改核心 Engine 语义：

1. 停止。
2. 回退。
3. 输出 Gap Report。
4. 不继续声称 P1 完成。

---

# 19. Codex 最终报告格式

完成后生成：

```text
docs/agent-arena-v051-implementation-report.md
```

## 19.1 实施摘要

```text
Completed P0:
P0 Cold Audit:
Completed P1:
P1 Cold Audit:
Live AI Go / No-Go:
Completed P2:
Completed P3:
Skipped:
Blocked:
```

## 19.2 Task 到文件映射

```text
Task → Changed Files
```

## 19.3 测试结果

```text
Command
Result
Duration
```

## 19.4 P0 稳定性

```text
Runs: 20
Passed:
Winner Consistent:
Proof Consistent:
Duplicate Events:
State Pollution:
```

## 19.5 P1 稳定性

```text
Runs: 20
Completed:
Completion Rate:
Schema Success:
First Event P95:
Total P95:
Fallback P95:
Unique Battle IDs:
Fixture Contamination:
Duplicate Events:
```

## 19.6 护栏

```text
Battle Engine core semantics changed: NO
Database migration added: NO
Destructive schema change: NO
Existing API compatibility broken: NO
Provider secret exposed: NO
New dependency added: NO / list
```

## 19.7 Demo 运行方式

```text
Install
Start
Open URL
Run Verified Showcase
Open Evidence Lens
Open Passport
Enable Live Feature Flag
Run Live AI Battle
Cancel Live Battle
Trigger Fallback
Export Markdown
```

## 19.8 已知限制

只记录真实限制。

禁止写：

- 模糊未来愿景。
- 未实现却声称完成。
- 未达到 Go / No-Go 却写 Live Ready。

---

# 20. 缺项审计

本任务包已显式覆盖：

- [x] 三页面范围。
- [x] 首页双入口。
- [x] 已验证演示。
- [x] 实时 AI 竞技。
- [x] P0 与 P1 隔离。
- [x] Runtime Feature Flag。
- [x] Runtime Capability Audit。
- [x] Engine / Schema 禁区。
- [x] Presentation Contract。
- [x] Runtime Mode。
- [x] Completion State。
- [x] 用户 Idea。
- [x] Frozen Brief。
- [x] Client Request ID。
- [x] 防重复创建。
- [x] 三个真实 Proposal。
- [x] Attack。
- [x] Defense。
- [x] Judge。
- [x] Evidence 分级。
- [x] Replay。
- [x] Passport Snapshot。
- [x] Mini Passport。
- [x] Cancel。
- [x] Timeout。
- [x] Retry。
- [x] Schema Repair。
- [x] SSE 重连。
- [x] Late Event。
- [x] Fallback 诚实标签。
- [x] 固定剧情隔离。
- [x] 固定 Winner 隔离。
- [x] Proof 与 Final Score 分离。
- [x] 中文化。
- [x] Export。
- [x] Prompt Injection。
- [x] XSS。
- [x] Secret。
- [x] 20 次 Go / No-Go。
- [x] 音效。
- [x] Win Card。
- [x] Kill Cam。
- [x] Git Diff。
- [x] 最终报告。

---

# 21. Codex 执行指令

开始执行时：

1. 完整阅读 PRD v0.5.1 与本 Task Pack。
2. 只执行 P0-A。
3. 生成 Implementation Map 与 Runtime Capability Audit。
4. 不等待普通实现细节确认。
5. 完成 P0 后停止并进行独立冷审计。
6. 只有 P0 输出 `READY FOR P1` 才开始 P1。
7. 如果 P1 Capability Audit 为 Blocked，生成 Gap Report 并停止。
8. P1 达不到 Go / No-Go 时，不进入正式 Pitch 第二幕。
9. P2 / P3 不能反向改变 P0 / P1 业务状态。
10. 最终报告必须诚实记录未完成项。

最终原则：

```text
已验证演示负责确定性。
实时 AI 竞技负责可信度。
两种模式必须共享产品，不共享假事实。
```
