# Agent Arena Presentation & Demo Hardening v1.2
## Codex 工程任务包（中文优先）

**文档状态**：设计决策与中文界面规范已锁定，可直接执行  
**目标执行者**：Codex / 编码 Agent  
**适用阶段**：Hackathon Demo 冲刺  
**目标技术栈**：沿用现有仓库，不改变既有技术栈  
**主要页面**：首页、战斗直播、智能体护照快照（代码路由与类型名可保留英文）  
**核心目标**：在不改动 Battle Engine 与核心持久化 schema 的前提下，把 Agent Arena 从“文本化 AI 辩论”升级为“可观看、可举证、可回放的 Agent 竞技演示”


**本任务包的工程定位**：

```text
本任务包 = 展示层升级 + Demo 稳定化 + 证据可视化
本任务包 ≠ 新 Battle Protocol + 真实 Artifact Runtime
```

本任务包会实现：

- 三页面中文主线。
- 智能体工作台。
- 固定逆风翻盘。
- 证明值。
- 证据透镜。
- 回放深链。
- 智能体护照快照。
- Demo Safety。
- 音效、已验证胜利卡与轻量致命攻击回放。

本任务包不会实现：

- 新增 Build / Artifact Lock / Verify Round。
- 真实受控 Mini-App Runtime。
- 真实 Patch Runner。
- 真实 Retest Runner。
- 新增核心 Event Type。
- 修改 JudgeScore 持久化结构。
- 将示例数据夹具伪装为实时模型执行。

上述未实现能力属于后续独立任务包：

```text
Agent Arena Verified Artifact Runtime Task Pack
```

---


# 0.1 v1.2 修订记录

本版根据溯源审计完成以下修订：

1. 明确本任务包是“展示层升级与 Demo 稳定化”，不是完整 Agent Runtime 升级。
2. 将 P0 任务统一为 P0-A 至 P0-K。
3. 修复自动替换造成的中英文混合变量名与乱码。
4. 修复章节与子章节编号错位。
5. 修正证据透镜示例，使加减项总和严格等于 19 / 25。
6. 将护照中的混合数值曲线改为“比赛历程”，分离证明值与最终得分。
7. 明确修复、测试、复测通过由现有事件与展示层数据夹具派生，不新增核心 Event Type。
8. 补充 Markdown Export 回归任务。
9. 清理剩余面向用户的英文状态和按钮。
10. 增加核心数据、API 数据、展示层数据夹具与空状态的真实性优先级。


## 0. 执行规则

### 0.1 执行者工作方式

开始编码前，先探测现有仓库结构和实现状态，然后把本任务包映射到实际目录。

必须先完成：

1. 检查项目使用 `/app` 还是 `/pages`。
2. 检查样式方案是 Tailwind、CSS Modules、styled-components 还是其他。
3. 定位现有 Battle Engine、BattleEvent、Attack、Defense、JudgeScore、PassportSnapshot。
4. 定位现有 Example Battle、Replay、SSE、事件 reducer 和 Demo Safety。
5. 定位现有测试框架和运行命令。
6. 输出一个简短的实施映射，再直接开始实现，不等待人工确认。

当文档中的建议路径与仓库实际路径冲突时：

- 沿用仓库现有组织方式。
- 不新建平行架构。
- 不为了匹配文档而移动大量文件。
- 在最终完成报告中记录实际映射。

### 0.2 任务包优先级

严格按以下顺序实施：

```text
P0-A  仓库探测与安全护栏
P0-B  Presentation Adapter + 示例数据夹具
P0-C  首页收口
P0-D  智能体工作台
P0-E  固定逆风翻盘
P0-F  战斗状态 / 最终评分板分离
P0-G  证据透镜
P0-H  证据检查器 / 回放深链
P0-I  智能体护照快照
P0-J  Demo Safety / 幂等 / 回归测试
P0-K  Markdown Export 回归验证

P1-A  三个关键音效
P1-B  已验证胜利卡

P2-A  轻量致命攻击回放

EXP   评委加时赛
```

任何 P0 未通过验收前，不进入 P1。  
任何 P1 未通过验收前，不进入 P2。  
Experimental 不得阻塞或污染正式 Demo 主线。

---

# 1. 产品范围锁定

## 1.1 本次只优化三张主页面

### Landing

职责：

- 10 秒内讲清 Agent Arena。
- 提供 Idea 输入或 Verified Example Battle 入口。
- 展示三个 Agent 的差异化策略。
- 展示公平协议：Same Brief、Same Tools、Evidence-bound Scoring。
- 不承担详细 Battle 数据展示。

### Live Arena

职责：

- 承担 80% 的 Demo 时间。
- 展示 Agent 身份、当前行动、Artifact Preview、Tool Trace。
- 展示 Attack、Defense、Patch、Retest、Judge。
- 展示 Evidence Lens。
- 展示固定逆风翻盘剧情。

### Passport Snapshot

职责：

- 展示单场 Battle 结果。
- 展示优势、弱点、失败、修复与恢复。
- 展示 Evidence Links。
- 展示 Verified Win Card。
- 不伪装成长期 Reputation Network。

## 1.2 不删除现有页面

如果仓库已有以下页面，不删除、不重构、不迁移：

- Battle Setup
- Result
- Replay
- Dashboard
- Example Battle
- Export

正式 Demo 的主要导航只突出 Landing、Live Arena、Passport Snapshot。  
现有 Replay 页面可以继续存在，Evidence Lens 可以跳转到已有 Replay 页面。

## 1.3 P0 明确不做

- 不做完整 Agent Marketplace。
- 不做长期排行榜。
- 不做多 Trial Template。
- 不做外部 Agent 提交。
- 不做任意 MCP 工具市场。
- 不做 BYOK。
- 不做多用户协作。
- 不做多 Judge 委员会。
- 不让 Agent 写完整 GitHub Repo。
- 不执行任意 Shell。
- 不执行用户代码。
- 不新增数据库迁移。
- 不引入完整 IDE。
- 不展示模型原始 Chain of Thought。
- 不用虚构的长期 Battle 数量、胜率、全球排名或趋势图。

---

# 2. 绝对禁止修改的区域

本节优先级高于其他所有章节。

## 2.1 Battle Engine 禁止事项

除非仓库当前代码已经存在明确扩展点，否则不得修改：

- Round 顺序。
- Battle 状态机。
- Champion 选择算法。
- Judge rubric 权重。
- 谁攻击谁的规则。
- Attack 数量上限。
- Retry 次数。
- Event sequence 生成规则。
- Passport 计算逻辑。
- Existing Demo Safety 行为。

不得为了 UI 动效把新的 Round 写进 Battle Engine。

本次 UI 中出现的：

```text
Early Favorite
Fatal Hidden Test
Attack Accepted
Patch
Retest Passed
Final Comeback
```

全部由 Presentation Adapter 和 Example Fixture 驱动，不要求 Battle Engine 增加新状态。

## 2.2 持久化 Schema 禁止事项

不得：

- 修改已有字段类型。
- 修改已有字段语义。
- 删除已有字段。
- 重命名已有字段。
- 添加数据库 migration。
- 改写现有 API 返回格式。
- 改写 `BattleEvent`、`Attack`、`Defense`、`JudgeScore` 的持久化结构。
- 把前端展示状态写回核心数据库。

## 2.3 允许的数据扩展

只允许新增前端或 presentation 层 view model：

```text
ArenaPresentationViewModel
AgentWorkbenchViewModel
EvidenceLensViewModel
EvidenceChainViewModel
StoryMilestone
VerifiedWinCardViewModel
RuntimeModeBadge
```

这些类型：

- 不落库。
- 不修改核心 schema。
- 只能由现有 battle 数据、Example Fixture 或现有 API 数据派生。
- 必须位于 presentation / ui / view-model 层。
- 不得被 Battle Engine import。

## 2.4 依赖限制

默认不新增第三方依赖。

允许：

- 使用仓库已经存在的动画、图标、测试、截图或 QR 依赖。
- 使用原生 CSS Animation。
- 使用 Web Audio API。
- 使用 Canvas API。
- 使用原生 Clipboard API。
- 使用现有 Playwright / Vitest / Jest。

禁止：

- 为单个动效新增大型动画库。
- 为 Win Card 新增重量级截图依赖。
- 从不可信 CDN 加载运行时代码。
- 引入外部字体文件到仓库。

## 2.5 数据真实性层级

所有展示数据按以下优先级解释：

```text
核心 BattleEvent / JudgeScore / PassportSnapshot
→ 现有 API 返回数据
→ 明确标记的展示层数据夹具
→ 安全空状态
```

规则：

- 核心数据是事实来源。
- 展示层数据夹具只服务于“已验证回放”或“脚本示例”。
- 展示层数据夹具不得写回数据库。
- 展示层数据夹具不得改变真实 Battle 的冠军、评分或护照。
- UI 必须通过运行模式标签告知用户当前数据来源。
- 当展示层数据与核心数据冲突时，核心数据优先，并记录开发错误。

---

# 3. 设计令牌

以下值全部锁定，不重新设计。

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

颜色语义：

| 语义 | 颜色 |
|---|---|
| Safe Builder | `--team-sb` |
| Viral Designer | `--team-vd` |
| Infra Hacker | `--team-ih` |
| Fatal / Failed / Critical | `--arena-danger` |
| Passed / Verified / Patched | `--arena-success` |
| Champion | `--arena-gold` |
| Live | `--arena-live` |

不能仅使用颜色表达状态。  
Fatal、Passed、Champion 必须同时有文字或图标。

## 3.2 字体

```text
Display: Archivo Black
Body: Inter
Protocol / Evidence / Log / Numeric Data: IBM Plex Mono
```

规则：

- Round 标题、Champion、Attack Round 使用 Display。
- 正文、按钮、说明使用 Body。
- Event ID、Test ID、时间、分数、工具调用使用 IBM Plex Mono。
- 如果仓库已有正文字体，可用现有字体替代 Inter。
- Evidence Log 和 Event ID 必须保留等宽字体。
- 不提交字体文件。

## 3.3 圆角

```css
--radius-xs: 4px;
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 10px;
--radius-xl: 12px;
```

- Button: 8px
- Panel: 12px
- Inner Card: 8px
- Badge / Tag: 4px 或 6px
- 不使用超大胶囊圆角作为主卡片形态。

## 3.4 间距

使用 4px 基础网格：

```text
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40
```

页面主区间距：

- Desktop outer padding: 20px
- Panel gap: 14px
- Panel inner padding: 16px
- Compact card padding: 12px
- Section gap: 16px 或 20px

## 3.5 桌面布局

```text
Max content width: 1440px
Primary demo target: 1440 x 900
Minimum supported desktop: 1180px
Tablet breakpoint: 880px
Mobile reference: 375px
```

Live Arena Desktop：

```text
Header
Round Banner / Progress
Three Agent Workbench Cards
Live Commentary
Battle State / Scoreboard + Evidence Area
```

在 880px 以下：

- 三张 Agent 卡改为横向滚动或纵向堆叠。
- 不允许内容被裁切。
- Evidence Lens 改为全宽 drawer 或 bottom sheet。
- 核心信息仍可读。

## 3.6 动效

```text
Round enter: 350ms ease
HP width: 700ms cubic-bezier(.2,.9,.3,1)
Hit flash: 500ms ease
Fatal shake: 450ms ease
Damage float: 1100ms ease
Panel fade: 300ms ease
Evidence highlight: 900ms ease
Kill Cam total: 1500ms
```

所有动效必须尊重：

```css
@media (prefers-reduced-motion: reduce)
```

Reduced Motion 下：

- 不抖动。
- 不滚动字幕。
- 不播放 Kill Cam 缩放。
- 直接切换最终状态。
- 信息不能丢失。

---


# 4. 中文优先与本地化规范

本节覆盖文档中其他章节的所有界面文案示例。即使代码标识符为英文，最终用户界面也必须默认显示简体中文。

## 4.1 默认语言

```ts
const DEFAULT_LOCALE = 'zh-CN';
const FALLBACK_LOCALE = 'zh-CN';
```

根节点必须设置：

```html
<html lang="zh-CN">
```

P0 只交付中文界面，不要求实现语言切换器。  
未来如增加英文版，必须通过独立 locale 资源实现，不能在组件内散落中英文三元表达式。

## 4.2 中文优先原则

所有面向用户的内容默认使用简体中文：

- 导航。
- 页面标题。
- 按钮。
- 标签。
- 状态。
- 错误提示。
- 空状态。
- 直播解说。
- Agent 行动摘要。
- Attack / Defense / Test 的可读说明。
- Evidence Lens。
- Passport Snapshot。
- Verified Win Card。
- 分享文案。
- Toast。
- E2E 截图中的示例数据。

允许保留英文的白名单：

- 品牌名 `Agent Arena`。
- 代码类型名。
- 变量名。
- API 路径。
- 文件名。
- Event ID，例如 `test_032`。
- Event type，例如 `attack_created`。
- Tool name，例如 `artifact.test`。
- Agent 英文别名，必须放在中文主名称之后。
- 模型名、框架名和第三方产品名。
- `SB`、`VD`、`IH` 等内部短码。

禁止在同一界面出现：

```text
中文标题 + 英文按钮
英文状态 + 中文说明
英文错误 + 中文正文
```

品牌以外的英文不得作为主视觉文案。

## 4.3 三个 Agent 的中文显示名

固定显示：

```text
稳健构建者（Safe Builder）
传播设计师（Viral Designer）
架构黑客（Infra Hacker）
```

规则：

- 中文名称是主标题。
- 英文别名是次级信息。
- 移动端空间不足时只显示中文名称。
- 数据层仍使用原有 agentId，不改 ID。
- 不修改 AgentSpec 的持久化 name 字段也可以，由 presentation 层映射中文显示名。

## 4.4 固定术语表

| 英文技术概念 | 中文 UI 文案 |
|---|---|
| Landing | 首页 |
| Live Arena | 战斗直播 |
| Passport Snapshot | 智能体护照快照 |
| Evidence Lens | 证据透镜 |
| Evidence Chain | 证据链 |
| Replay | 回放 |
| Battle | 战斗 |
| Trial | 试炼 |
| Proposal | 提案 |
| Build | 构建 |
| Attack | 攻击 |
| Defense | 防守 |
| Patch | 修复 |
| Retest | 复测 |
| Verify | 验证 |
| Judge | 裁决 |
| Champion | 冠军 |
| Final Score | 最终得分 |
| Proof HP | 证明值 |
| Artifact | 作品 |
| Tool Call | 工具调用 |
| Current Action | 当前行动 |
| Observation | 环境观察 |
| Decision | 决策摘要 |
| Runtime Mode | 运行模式 |
| Verified Replay | 已验证回放 |
| Demo Fallback | 演示兜底 |
| Scripted Example | 脚本示例 |
| Live Runtime | 实时运行 |

`Artifact` 在 UI 中统一显示为“作品”，不要混用“产物”“制品”“Artifact”。

## 4.5 中文格式

日期与时间：

```ts
new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
```

示例：

```text
2026年7月22日 14:30
```

数字：

```ts
new Intl.NumberFormat('zh-CN');
```

百分比：

```ts
new Intl.NumberFormat('zh-CN', {
  style: 'percent',
  maximumFractionDigits: 0,
});
```

规则：

- 使用 24 小时制。
- 日期顺序为年、月、日。
- 中文正文使用全角标点。
- Event ID、工具名、文件名使用半角字符。
- 分数格式使用 `19 / 25`，不使用英文 `19 pts`。
- 状态文本使用“通过 / 失败 / 修复中 / 已验证”，不使用 `PASS / FAIL / PATCHING` 作为主文案。

## 4.6 中文排版

- 中文正文默认行高不低于 1.55。
- 按钮不得因中文长度被截断。
- 关键按钮最小宽度按最长中文文案设计。
- 长攻击结论最多显示 3 行，超出后展开。
- 等宽字体只用于 ID、时间、工具名、分数和协议数据。
- 中文解释文字不要强制使用等宽字体。
- 不使用全大写英文制造层级，改用字号、字重和颜色。
- 中文主标题避免硬塞英文断词。
- 375px 下中文标签不得横向溢出。

## 4.7 中文数据 Fixture

Example Battle 中所有面向用户的数据必须使用中文，包括：

- 创意内容。
- 三队策略。
- 当前行动。
- 环境观察。
- 决策摘要。
- Attack claim。
- Defense reason。
- Patch diff 的可读说明。
- Judge winning reason。
- Judge losing reason。
- Strengths。
- Weaknesses。
- Failure Patterns。
- Commentary。
- Evidence Lens reason。
- Win Card。

Event ID、tool name、schema enum 保持原值。

## 4.8 中文验收护栏

P0 验收必须新增：

- 所有主页面截图默认中文。
- E2E 使用 `zh-CN`。
- 不出现未授权英文按钮。
- 不出现英文错误提示。
- 不出现英文空状态。
- Runtime 标签为中文。
- Agent 中文名为主显示名。
- 手机端中文不截断。
- Win Card 导出图片为中文。
- 分享链接标题与描述为中文。
- `document.documentElement.lang === 'zh-CN'`。
- 日期、时间、数字格式符合 `zh-CN`。

允许测试用例通过白名单排除技术 ID、工具名、模型名和品牌名。

---

# 5. Runtime 模式标签


UI 必须诚实标注当前运行模式。

```ts
type RuntimeMode =
  | 'live_runtime'
  | 'verified_replay'
  | 'demo_fallback'
  | 'scripted_example';
```

显示文案固定：

| 值 | UI 文案 |
|---|---|
| `live_runtime` | 实时运行 |
| `verified_replay` | 已验证回放 |
| `demo_fallback` | 演示兜底 |
| `scripted_example` | 脚本示例 |

规则：

- 不得把“脚本示例”标成“实时运行”。
- 正式 Pitch 默认使用 `verified_replay` 或 `scripted_example`。
- Experimental Overtime 才使用 `live_runtime`。
- 当实时调用失败并切换缓存时，必须显示“演示兜底”。
- 运行模式标签位于战斗直播页顶部，始终可见。

---

# 6. Presentation 数据契约

以下类型为推荐形状。可按仓库现有命名调整，但语义不能改变。

## 6.1 ArenaPresentationViewModel

```ts
type ArenaPresentationViewModel = {
  battleId: string;
  runtimeMode: RuntimeMode;
  title: string;
  idea: string;
  currentRound: string;
  currentSequence: number;

  agents: AgentWorkbenchViewModel[];
  storyMilestones: StoryMilestone[];

  activeAttack?: CurrentAttackViewModel;
  battleState: BattleStateViewModel;
  finalScoreboard?: FinalScoreboardViewModel;

  evidenceLens: EvidenceLensViewModel;
  passportSnapshots: PassportSnapshotViewModel[];

  commentary: CommentaryViewModel[];
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

  proofHp: number;
  status:
    | 'idle'
    | 'building'
    | 'inspecting'
    | 'under_attack'
    | 'patching'
    | 'verified'
    | 'judging'
    | 'completed';

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

禁止显示无法定义的：

```text
记忆占用 82%
智能水平 95%
置信度 91%
```

可以显示：

```text
会话编号
工具调用
作品版本
上下文事件
```

## 6.3 StoryMilestone

```ts
type StoryMilestoneType =
  | 'early_favorite'
  | 'fatal_hidden_test'
  | 'attack_accepted'
  | 'patch_submitted'
  | 'retest_passed'
  | 'final_comeback';

type StoryMilestone = {
  id: string;
  type: StoryMilestoneType;
  sequence: number;
  actorAgentId: string;
  relatedEventIds: string[];
  title: string;
  commentary: string;
  artifactVersion?: number;
};
```

## 6.4 Evidence Lens

```ts
type ScoreDimension =
  | 'feasibility'
  | 'originality'
  | 'demoPower'
  | 'technicalDepth'
  | 'pitchClarity'
  | 'riskControl';

type EvidenceDeltaItem = {
  id: string;
  delta: number;
  reason: string;
  evidenceEventIds: string[];
  artifactVersion?: number;
  source:
    | 'deterministic_test'
    | 'judge_reasoning'
    | 'battle_conduct';
};

type ScoreEvidenceEntry = {
  scoreKey: string;
  teamId: string;
  dimension: ScoreDimension;
  score: number;
  maxScore: number;
  items: EvidenceDeltaItem[];
  summary: string;
};

type EvidenceLensViewModel = {
  entries: Record<string, ScoreEvidenceEntry>;
  chains: Record<string, EvidenceChainViewModel>;
};
```

P0 不改 JudgeScore schema。  
Example Battle 的维度级加减分写入 presentation fixture。  
其他 battle 如果没有维度级 breakdown：

- 仍允许打开 Evidence Lens。
- 展示 JudgeScore 已有的 `evidenceEventIds`。
- 显示“暂无详细评分拆解”。
- 不得伪造 delta。

## 6.5 Evidence Chain

```ts
type EvidenceChainViewModel = {
  rootEventId: string;
  relatedEventIds: string[];

  testEventIds: string[];
  attackEventIds: string[];
  defenseEventIds: string[];
  patchEventIds: string[];
  retestEventIds: string[];

  artifactVersions: number[];
  scoreKeys: string[];
};
```

Evidence Lens 展示的最小因果链：

```text
作品 v1
→ 隐藏测试失败
→ 攻击验证成立
→ 接受攻击
→ 提交修复
→ 复测通过
→ 评分更新
```

## 6.6 Verified Win Card

```ts
type VerifiedWinCardViewModel = {
  battleId: string;
  agentId: string;
  agentName: string;
  result: 'winner';

  finalScore: number;
  testsPassed: number;
  testsTotal: number;

  criticalAttacks: number;
  attacksSurvived: number;
  successfulPatches: number;

  primaryStrength: string;
  exposedWeakness: string;
  verifiedFix: string;

  sourceEventIds: string[];
  replayUrl: string;
};
```

Win Card 必须显示：

- 一项失败。
- 一项暴露弱点。
- 一次修复。
- 修复对应 Event ID。
- Replay Link。

不能只展示冠军优点。

## 6.7 展示里程碑的事件来源

本任务包禁止新增核心 Event Type。  
因此 UI 中的“隐藏测试失败、提交修复、复测通过”必须通过现有事件派生，不得写入新的持久化 schema。

固定映射：

| UI 里程碑 | 核心数据来源 |
|---|---|
| 隐藏测试失败 | 展示层数据夹具，或现有 `attack_created.payload.evidence` |
| 攻击验证成立 | `attack_created` + 对应证据存在 |
| 接受攻击 | `defense_created.acceptedAttacks` |
| 提交修复 | `defense_created.revisions` 或后续 `artifact_created` |
| 作品 v1 → v2 | 现有 Artifact 版本或展示层数据夹具 |
| 复测通过 | 展示层数据夹具，或现有 Artifact / Defense 结果派生 |
| 评分更新 | `score_created` |

约束：

- `patch_049`、`test_032`、`test_052` 在 P0 中是 presentation evidence ID。
- presentation evidence ID 不冒充数据库 `BattleEvent.id`。
- UI 必须区分“核心事件”和“展示证据”。
- 如果真实 Battle 缺少对应数据，显示“暂无可验证复测记录”，不得补造事件。
- 证据检查器只能展示由核心事件或显式展示层数据夹具支持的内容。

---

# 7. Example Battle 黄金剧情

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
战斗编号：BA-2024-0024
试炼：黑客松创意战
创意：帮助大学生准备考试的 AI 学习助手
运行模式：已验证回放
```

## 7.3 固定故事

### 里程碑 1：早期热门

行动者：传播设计师

文案：

```text
早期热门
传播设计师率先完成最具记忆点的作品，暂时领跑。
```

状态：

- 传播设计师的作品 v1 可见。
- 演示表现标签显示“强”。
- 不显示最终 Judge 分数。

### 里程碑 2：致命隐藏测试

行动者：架构黑客

固定展示证据：

```text
test_032
hidden_case: missing_input_recovery
result: failed
```

固定攻击：

```text
attack_031
attacker: Infra Hacker
target: Viral Designer
severity: fatal
claim: 缺少必填输入时，应用会进入无法恢复的状态。
```

效果：

```text
传播设计师证明值：88 → 38
```

### 里程碑 3：接受攻击

固定核心事件：

```text
defense_041
decision: accepted
```

文案：

```text
接受攻击
证据有效，传播设计师选择接受攻击并修复。
```

### 里程碑 4：已提交修复

固定展示证据：

```text
patch_049
artifact: v1 → v2
```

固定 Diff：

```text
+ 生成前校验必填输入
+ 增加可恢复的空状态
+ 失败后保留用户输入
```

### 里程碑 5：复测通过

固定展示证据：

```text
test_052
result: passed
```

文案：

```text
复测通过
修复后的作品通过了同一项隐藏测试。
```

### 里程碑 6：逆风翻盘

固定排名：

```text
1. 传播设计师：87
2. 架构黑客：84
3. 稳健构建者：78
```

固定冠军理由：

```text
它获胜，不是因为从未犯错。
而是因为面对证据后完成了修复，并在压力下恢复。
```

## 7.4 证明值规则

P0 展示层使用：

```text
低：-5
中：-15
高：-30
致命：-50
```

规则：

- 攻击未验证，不扣证明值。
- 攻击被驳回且存在反证，不扣证明值。
- 提交修复时不恢复证明值。
- 复测通过后，恢复该次伤害值的 60%。
- 曾经失败的记录仍进入 Passport。

Fatal 示例：

```text
88 → 38
Retest Passed → 68
```

证明值与最终裁决得分完全独立。

---

# 8. 路由与深链

## 8.1 主路由

按现有仓库路由适配：

```text
/                              Landing
/battle/:id/live               Live Arena
/agent/:id/passport?battle=:id Passport Snapshot
```

## 8.2 证据深链

至少支持：

```text
/battle/:id/live?evidence=test_032
/battle/:id/live?score=vd.feasibility
```

行为：

- 页面加载后自动打开 Evidence Lens。
- 自动定位对应 Event。
- 高亮相关 Attack / Defense / Test。
- 如果现有回放页面存在，显示“打开完整回放”。
- 不要求新增第四个页面。

## 8.3 刷新恢复

使用 URL + battle 数据恢复：

- Evidence Lens 当前选中项。
- 当前 Battle。
- 当前 Event 节点。
- 当前 Agent。

不得依赖仅存在于 React 内存的临时状态。

---

# 9. P0 任务清单

## Task P0-A: 仓库探测与安全护栏

### 目标

确认实际目录、依赖、数据流和不可改动区域。

### 实现要求

1. 找到 Battle Engine 文件。
2. 找到核心 schema 文件。
3. 找到现有 Example Battle 数据。
4. 找到 Live 页面和 Passport 页面。
5. 找到 SSE / polling / reducer。
6. 找到测试命令。
7. 建立 `presentation` 或等价目录。
8. 不移动现有 Engine 文件。

### 验收标准

- 产出实现映射记录。
- `git diff` 中无 Battle Engine 修改。
- 无数据库 migration。
- 无已有 schema destructive change。
- 无新增第三方依赖，或新增依赖已经在任务完成报告中说明且属于现有依赖复用。

---

## Task P0-B: Presentation Adapter

### 目标

用一个纯函数或纯 adapter，把现有 Battle 数据转换成 `ArenaPresentationViewModel`。

### 实现要求

- 输入只读。
- 不 mutate 原始 events。
- 可在无实时模型时运行。
- Example Battle 使用固定 fixture。
- Live 数据缺少展示字段时，安全降级。
- 所有 selector 可单元测试。

推荐：

```ts
buildArenaPresentationViewModel(input): ArenaPresentationViewModel
```

### 验收标准

- 同一输入得到稳定输出。
- Adapter 不依赖浏览器 API。
- Adapter 不 import React。
- Adapter 不 import Battle Engine 内部实现。
- Fixture 可生成完整三页需要的数据。
- 缺失 optional 字段时不崩溃。

---

## Task P0-C: Landing 页面收口

### 目标

让评委 10 秒理解产品，不展示虚构规模数据。

### 页面必须包含

```text
每个智能体都声称自己很强。
竞技场让它当场证明。

同一任务、同样工具、每一分都有证据。
```

三个 Agent：

- 稳健构建者
- 传播设计师
- 架构黑客

流程：

```text
构建
攻击
防守
证明
```

入口：

- `发起一场战斗`
- `观看已验证回放`
- `输入你的创意`

Protocol Guarantees：

```text
3 个参赛智能体
1 份冻结任务
相同工具与预算
每一分都有证据
```

### 禁止

- 不展示 1,248 Battles 等虚构统计。
- 不展示全球排名。
- 不展示成熟 Marketplace。
- 不展示超过一个主要 Trial。

### 验收标准

- 首页 3 秒内出现可见动态状态变化。
- 主 CTA 清晰。
- 页面不依赖实时模型。
- 375px 不破版。
- 动效关闭时信息完整。

---

## Task P0-D: Live Arena Agent Workbench

### 目标

让三张卡明显表现为持久 Agent，而不是三段聊天文本。

### 每张卡必须显示

- Agent 名称。
- 策略。
- 证明值。
- 作品预览。
- 作品版本。
- 当前行动。
- 环境观察。
- 决策摘要。
- 工具调用。
- 会话编号。
- 当前状态。

### 行为

- 三个 Agent 同时可见。
- 当前活跃 Agent 边框增强。
- “遭受攻击”使用危险状态。
- “修复中”使用状态标签。
- “已验证”使用成功状态。
- Agent 内容使用真实 presentation 数据，不把 UI 文案硬编码进组件。

### 验收标准

- 三张卡可由 fixture 完整渲染。
- 当前动作随 sequence 更新。
- 致命攻击触发证明值动画。
- 驳回攻击不扣证明值。
- 复测通过后按规则部分恢复证明值。
- 移动端可滚动或堆叠。
- 不显示无法定义的“记忆占用百分比”。

---

## Task P0-E: Fixed Comeback Story Director

### 目标

稳定播放完整情绪弧线。

### 固定顺序

```text
早期热门
→ 致命隐藏测试
→ 接受攻击
→ 修复
→ 复测通过
→ 逆风翻盘
```

### 实现要求

- 使用 StoryMilestone fixture。
- 播放逻辑与组件分离。
- 支持播放、暂停、重置。
- 支持跳到指定 sequence。
- 重置后所有状态完全恢复。
- 不修改 Battle Engine。
- 不要求实时模型输出。

推荐：

```ts
useBattlePresentationPlayback(...)
```

或等价 controller。

### 时序建议

```text
0 秒  智能体入场
5 秒  提案
12 秒 早期热门
20 秒 致命隐藏测试
29 秒 接受攻击
36 秒 提交修复
45 秒 复测通过
52 秒 最终裁决揭晓
```

### 验收标准

- 连续自动播放 20 次，事件顺序一致。
- 不出现重复扣血。
- 重置后状态等于初始值。
- 跳转到任意里程碑后状态正确。
- 页面刷新后可以从 sequence 重建。
- 主剧情不依赖音效或轻量致命攻击回放。

---

## Task P0-F: Battle State 与 Final Scoreboard 分离

### 目标

避免比赛未结束就出现 Judge 最终分数。

### Pre-Judge 显示

```text
证明值
测试通过
已验证风险
当前状态
```

### Judging 后显示

```text
可实现性
原创性
演示表现
技术深度
讲解清晰度
风险控制
总分
冠军 / 亚军 / 末位
获胜原因
落败原因
```

### 验收标准

- 裁决前不显示最终分数。
- 裁决阶段后，最终评分板转场出现。
- 每个维度分数可点击。
- 每个未获胜智能体至少显示一条落败原因。
- 最终评分板不得使用证明值直接计算总分。

---

## Task P0-G: Evidence Lens

### 目标

点击任意维度分数，反查评分证据。

### 触发方式

- 桌面端以点击为主，悬停只能作为辅助预览。
- 移动端使用点击。
- 键盘使用 Enter / Space。

### 打开后必须发生

1. 被点击 评分单元格 高亮。
2. 证据透镜抽屉 打开。
3. 显示评分加减项。
4. 对应 Event 自动滚动并高亮。
5. 对应 Attack / Defense / Test 高亮。
6. 显示 Evidence Chain。
7. 提供 回放深链。
8. 可关闭并恢复原视图。

### Drawer 固定内容

```text
为什么是 19 / 25 分？

+13 基础完成度达到要求
    proposal_014

+5  核心流程通过
    test_018

-4  空状态恢复失败
    test_032

+3  致命问题已修复
    defense_041 / artifact_created

+2  回归测试通过
    test_052

合计：19 / 25
```

### 状态

```text
selectedScoreKey
selectedEvidenceEventId
highlightedEventIds
selectedArtifactVersion
```

### 缺少细分数据时

显示：

```text
暂无详细评分拆解。
以下展示 JudgeScore 已关联的证据。
```

不得伪造加减分。

### 验收标准

- Example Battle 任意维度分数可打开 Lens。
- 所有 Example Battle 分数至少绑定一个 Evidence Item。
- 加减项总和与数据夹具中的维度分一致。
- 单元测试必须断言 `sum(items.delta) === score`。
- 如存在基础分，必须作为显式 `EvidenceDeltaItem` 展示，不允许隐藏基础分。
- 点击 Evidence ID 可定位事件。
- URL 可复制并重新打开同一节点。
- 无证据时明确显示 `insufficient_evidence`。
- Lens 关闭后焦点返回触发按钮。
- 屏幕阅读器 可读动态标题。

---

## Task P0-H: Evidence Inspector 与 回放深链

### 目标

保留 Replay 能力，但不强制新建第四张主页面。

### Inspector 必须展示

```text
作品 v1
隐藏测试失败
攻击验证成立
接受攻击
已提交修复
复测通过
评分更新
```

### 行为

- 可从评分板、攻击卡、测试结果、护照快照进入。
- URL query 同步。
- 如果已有回放页面，提供“打开完整回放”。
- 如果没有独立回放页面，战斗直播页内的证据检查器本身满足 P0。

### 验收标准

- 刷新后仍停留在同一 Evidence。
- Back / Forward 正常。
- 不展示 Event Log 中不存在的内容。
- 所有数据可从 presentation model 重建。
- 不依赖先前播放动画。

---

## Task P0-I: Passport Snapshot

### 目标

展示单场可信表现，不伪造长期信誉网络。

### 页面标题

```text
智能体护照快照
来自战斗 #024 的已验证表现
```

### 顶部指标

```text
比赛结果
最终得分
测试通过
验证等级
```

### 必须展示

- 优势。
- 弱点。
- 已接受主张。
- 已驳回主张。
- 失败模式。
- 成功修复。
- 证据亮点。
- 证明历程。
- 回放链接。

### 比赛历程

本区域不使用一条混合数值折线，避免把证明值与最终得分混为一谈。

固定阶段：

```text
提案：成为早期热门
构建：作品 v1 完成
攻击：证明值 88 → 38
防守：接受攻击并提交修复
验证：复测通过，证明值 38 → 68
裁决：最终得分 87 / 100
```

展示规则：

- “证明值”只用于攻击、修复和验证阶段。
- “最终得分”只在裁决阶段展示。
- 不把最终得分 87 画进证明值曲线。
- 如需画数值曲线，只画证明值：`88 → 88 → 38 → 38 → 68 → 68`。


### Agent 切换

系统内部生成三份 Snapshot：

- 稳健构建者
- 传播设计师
- 架构黑客

默认显示冠军。  
允许切换查看另外两队。

### 禁止

- 不展示虚构的总战斗数。
- 不展示虚构的胜率。
- 不展示全球排名。
- 不展示长期信誉趋势。
- 单场 Snapshot 不写“长期信誉已验证”。

### 验收标准

- 三个 Agent 均有 Snapshot。
- 每个快照至少包含一项优势和一项弱点。
- 每个 Snapshot 至少一个 Evidence Link。
- 冠军快照显示一次致命失败和一次已验证恢复。
- 点击 Evidence Link 打开对应 Live Arena 深链。
- 375px 不破版。

---

## Task P0-J: Demo Safety 与异常展示

### 目标

任何实时调用失败都不能破坏正式 Demo。

### 数据优先级

```text
1. 有效实时数据
2. 已验证回放数据
3. 脚本示例数据
4. 安全空状态
```

### 必须覆盖

- API 超时。
- Schema validation 失败。
- SSE 断线。
- 重复 Event。
- 页面刷新。
- Event 缺字段。
- 音频不可用。
- Clipboard 不可用。
- Replay URL 不可用。

### UI 文案

实时失败：

```text
实时智能体响应延迟
正在使用已验证的兜底事件。
```

无 Evidence：

```text
证据不足
当前事件日志无法验证这项结论。
```

### 幂等要求

- Event reducer 以 `event.id` 去重。
- `sequence` 用于排序。
- 同一 Attack Event 只能扣一次 HP。
- 同一 Retest Event 只能恢复一次 HP。
- 动画仅对首次消费事件播放。
- 重建状态时不重复播放历史动画。

### 验收标准

- 中途刷新可恢复。
- 模拟 SSE 重连不会重复扣血。
- 缺失 optional 数据时无白屏。
- 不显示裸露的错误堆栈。
- Example Battle 离线可运行。
- 正式 Demo 入口不依赖 MastraRuntime。

---

## Task P0-K: Markdown Export 回归验证

### 目标

确保展示层升级不破坏原有 Markdown 导出，并让中文用户获得一致的导出内容。

### 实现要求

- 不重写现有 Artifact Writer。
- 不修改现有 Export API 合约。
- 不新增新的文档生成链路。
- 保留现有 `battle-report.md` 或等价导出。
- 导出内容继续基于核心 Battle 数据与 Evidence Log。
- 展示层数据夹具不能污染真实 Battle 的导出结果。
- 如果示例战斗支持导出，必须明确标记为“已验证回放”或“脚本示例”。
- 导出中的用户可见标题与说明使用简体中文。
- Event ID、工具名、文件名保持原值。

### 最低导出内容

```text
战斗任务
参赛智能体
提案摘要
主要攻击
防守决定
修正记录
最终评分
获胜与落败原因
证据链接
智能体护照快照
运行模式
```

### 验收标准

- 现有 Export API 仍返回成功。
- Markdown 文件可正常下载。
- 中文内容不乱码。
- 导出中的分数与页面一致。
- 导出中的证据链接可打开。
- 不出现 Event Log 中不存在的事实。
- 缺少证据时写明 `insufficient_evidence`。
- 添加至少一个 Export 回归测试。

---

# 10. P1 任务清单

## Task P1-A: 三个关键音效

### 目标

只强化三个关键节拍。

### 音效

```text
致命攻击
复测通过
冠军揭晓
```

### 实现方式

优先使用 Web Audio API 合成，不新增音频依赖。

建议：

```text
致命攻击：
square 140Hz 70ms
随后 sine 70Hz 180ms

复测通过：
sine 660Hz 80ms
随后 sine 880Hz 120ms

冠军揭晓：
sine 440Hz 120ms
随后 554Hz 120ms
随后 659Hz 180ms
```

### 规则

- 用户点击“开始”或“观看”后再初始化音频。
- 顶部始终提供“静音”开关。
- 默认低音量。
- 每种提示音每场最多播放一次。
- 减少动态效果模式不自动关闭声音，但保留“静音”开关。
- 音效失败不能影响 UI。

### 验收标准

- 三个节点与剧情同步。
- 重置后可重新播放。
- 不因 React Strict Mode 重复播放。
- 点击“静音”后立即停止声音。
- 无权限时无报错。

---

## Task P1-B: Verified Win Card

### 目标

生成一张可截图、可分享、带失败与修复的战绩卡。

### 卡片内容

```text
传播设计师
已验证胜利
战斗 #024

得分：87
测试通过：5 / 6
致命攻击：1
成功抵御：1
成功修复：1

核心优势：
适应能力

暴露弱点：
初始空状态恢复失败

已验证修复：
patch_049 → test_052
```

### 操作

- `下载 PNG`
- `复制回放链接`
- `打开回放`
- 二维码可选

### PNG

- 优先使用 Canvas API。
- 不新增大型 DOM screenshot 依赖。
- 尺寸固定为 1200 x 675。
- 文件名：

```text
agent-arena-battle-024-viral-designer.png
```

### QR

只有以下条件满足才显示：

- 仓库已有 QR 依赖，或项目已有 QR 组件。
- Replay URL 是可公开访问的绝对 URL。
- 生成失败时自动隐藏。

### 验收标准

- PNG 中包含失败与修复。
- 复制链接成功后显示明确提示。
- 剪贴板不可用时，显示可手动复制的 URL。
- QR 失败不影响卡片。
- 卡片内容与 Passport Snapshot 一致。
- 不使用虚构长期数据。

---

# 11. P2 任务清单

## Task P2-A: Lightweight Kill Cam

### 目标

只强化一次 Fatal Attack。

### 触发

```text
StoryMilestone.type === 'fatal_hidden_test'
```

### 视觉

```text
背景压暗 60%
放大传播设计师的作品预览
致命攻击
攻击结论
证据：test_032
严重级别：致命
```

### 时序

```text
0ms    遮罩进入
250ms  聚焦作品
450ms  攻击文字进入
900ms  证据编号进入
1500ms 遮罩退出
```

### 规则

- 每场只播放一次。
- Reset 后允许再次播放。
- Reduced Motion 下不缩放，仅显示静态 Callout 600ms。
- Kill Cam 失败不影响 HP 和 Event 状态。
- 不创建独立页面。
- 不做复杂视频或真正慢动作系统。

### 验收标准

- 不遮挡超过 1.5 秒。
- 只在 Fatal Attack 触发。
- 不重复触发。
- 移动端不溢出。
- 按 ESC 可跳过。
- 焦点不被困住。

---

# 12. Experimental 任务

## Task EXP-A: Overtime Live Challenge

### 目标

为 Q&A 提供真实 Agent Quick Trial，不进入正式 Pitch 主线。

### 隔离要求

- 独立路由或 feature flag。
- 默认关闭。
- 不修改正式 Example Battle。
- 不复用主线 autoplay controller。
- 失败后立即回退到 Verified Replay。
- 不影响 P0 测试。

### 推荐入口

```text
评委加时赛
现场挑战我们
```

### Quick Trial 范围

```text
你的创意
→ 3 个智能体提案
→ 每队 1 次主要攻击
→ 1 次裁决
→ 迷你护照
```

不要求：

- 三个完整 Mini-App。
- 完整 Patch。
- 完整 Kill Cam。
- 完整 Win Card。

### Go / No-Go 门槛

全部满足才允许现场展示：

```text
20 次连续运行成功
Schema success >= 95%
P95 <= 90 秒
Fallback switch <= 1 秒
无裸错误页面
```

### 验收标准

- Feature flag 关闭时不会加载 runtime。
- 实时失败后主页面仍可继续使用。
- Runtime Mode 正确显示。
- 不得把兜底模式标成实时运行。
- 不进入正式 Demo 自动流程。

---

# 13. 组件建议

按仓库现有结构映射，不强制路径。

```text
components/arena/
  ArenaShell
  RuntimeModeBadge
  RoundBanner
  AgentWorkbenchCard
  ProofHpBar
  ArtifactPreview
  AgentRuntimeStrip
  LiveCommentary
  BattleStatePanel
  FinalScoreboard
  ScoreEvidenceButton
  EvidenceLensDrawer
  EvidenceChain
  CurrentAttackCard
  ArtifactDiff
  PassportSnapshotCard
  ProofJourney
  VerifiedWinCard
  KillCamOverlay
  AudioToggle

lib/arena-presentation/
  buildArenaPresentationViewModel
  buildAgentWorkbenchViewModel
  buildEvidenceLensViewModel
  buildEvidenceChainViewModel
  reduceProofHp
  dedupeAndSortEvents
  exampleBattleFixture
  scoreEvidenceFixture
  storyMilestoneFixture
```

规则：

- UI 组件不能直接解析原始复杂 event payload。
- 所有转换集中在 presentation adapter。
- Reducer 必须为纯函数。
- Fixture 与组件分离。
- 音效与动效不能决定业务状态。

---

# 14. 测试要求

## 14.1 单元测试

必须覆盖：

```text
Event dedupe
Event sequence sorting
Proof HP damage
Retest partial recovery
Rejected attack no damage
Repeated event idempotency
Presentation adapter fallback
Evidence Lens score lookup
Evidence Chain construction
Deep link parsing
Passport Snapshot mapping
Win Card data consistency
```

## 14.2 组件测试

必须覆盖：

```text
Score click opens Lens
Lens close restores focus
Evidence item highlights event
Pre-Judge hides final score
Judge round shows final score
Mute works
Reduced Motion renders final state
Missing evidence displays insufficient_evidence
```

## 14.3 端到端测试

优先使用仓库已有 Playwright。

关键路径：

```text
首页
→ 观看已验证回放
→ 致命隐藏测试
→ 接受攻击
→ 修复
→ 复测通过
→ 逆风翻盘
→ 点击“可实现性”分数
→ 打开证据透镜
→ 打开智能体护照快照
→ 打开证据深链
```

其他：

```text
Reload during Attack
SSE duplicate simulation
Mobile 375px
Reduced Motion
Clipboard failure
Audio blocked
```

## 14.4 稳定性测试

Example Battle：

- 自动播放 20 次。
- 事件顺序一致。
- Winner 一致。
- HP 一致。
- Evidence Link 一致。
- 不出现累计状态污染。
- 不出现重复音效。
- 不出现重复 Kill Cam。

---

# 15. Definition of Done

P0 完成必须满足：

- [ ] Landing、Live Arena、Passport Snapshot 三页可访问。
- [ ] 正式 Demo 不依赖实时模型。
- [ ] 运行模式标签正确。
- [ ] 三个智能体工作台在桌面端同屏可见。
- [ ] 智能体显示当前行动、环境观察、决策摘要、工具调用与作品版本。
- [ ] 固定逆风翻盘的六个里程碑稳定复现。
- [ ] 致命攻击正确扣减证明值。
- [ ] 复测通过后正确部分恢复证明值。
- [ ] 裁决前不显示最终分数。
- [ ] 裁决后每个维度分数可点击。
- [ ] 证据透镜展示评分加减项。
- [ ] 证据透镜高亮攻击、防守与测试证据。
- [ ] 证据深链刷新后可恢复。
- [ ] 三个智能体都生成护照快照。
- [ ] 冠军护照快照显示失败与修复。
- [ ] 示例战斗可离线运行。
- [ ] SSE 重连不会重复扣血。
- [ ] 减少动态效果模式可用。
- [ ] 375px 移动端不破版。
- [ ] 所有主页面、状态、按钮、错误与示例数据默认使用简体中文。
- [ ] `document.documentElement.lang` 为 `zh-CN`。
- [ ] 日期、时间与数字使用 `zh-CN` 格式。
- [ ] 中文界面中不存在未授权英文按钮、状态或错误提示。
- [ ] 无数据库 migration。
- [ ] 无 Battle Engine 修改。
- [ ] 无 destructive schema change。
- [ ] 无裸错误页面。
- [ ] Unit / Component / E2E 测试通过。
- [ ] 连续播放 20 次通过。
- [ ] 现有 Markdown Export 回归测试通过。
- [ ] 导出的中文战斗报告与页面分数、证据和护照快照一致。

P1 完成必须满足：

- [ ] 三个音效仅在对应节点播放。
- [ ] 静音开关可用。
- [ ] Verified Win Card 可导出中文 PNG。
- [ ] “复制回放链接”可用。
- [ ] 已验证胜利卡包含失败与修复。
- [ ] 二维码生成失败不影响主流程。

P2 完成必须满足：

- [ ] 轻量致命攻击回放只播放一次。
- [ ] 总时长不超过 1500ms。
- [ ] 减少动态效果模式具有静态替代。
- [ ] 按 ESC 可跳过。
- [ ] 轻量致命攻击回放不决定业务状态。

---

# 16. Git Diff 护栏

提交前必须运行并检查：

```bash
git status
git diff --stat
git diff
```

重点确认：

```text
Battle Engine files: unchanged
Core schema files: unchanged except presentation-only additions in separate files
Database migrations: none
API contracts: unchanged
Existing routes: not deleted
Existing Demo Safety: preserved
```

如果发现为了 UI 改动了 Engine 或数据库：

1. 回退该改动。
2. 改为 presentation adapter。
3. 在最终报告中说明。

---

# 17. Codex 最终完成报告格式

实现结束后必须输出：

## 17.1 实施摘要

```text
Completed P0:
Completed P1:
Completed P2:
Skipped:
```

## 17.2 实际文件映射

```text
Task → Changed Files
```

## 17.3 测试结果

```text
Command
Result
Duration
```

## 17.4 护栏确认

```text
Battle Engine modified: NO
Database migration added: NO
Destructive schema change: NO
New dependency added: NO / list
```

## 17.5 Demo 运行方式

```text
Install
Start
Open URL
Run Example Battle
Open Evidence Lens
Open Passport Snapshot
```

## 17.6 已知限制

只记录真实限制，不写未来大愿景。

---

# 18. 缺项审计结果

本任务包已经显式覆盖以下容易遗漏的部分：

- [x] 三页面范围。
- [x] Battle Engine 禁止改动。
- [x] 持久化 schema 禁止改动。
- [x] Presentation-only 数据契约。
- [x] Runtime 模式诚实标签。
- [x] 固定逆风翻盘。
- [x] Proof HP 与 Final Score 分离。
- [x] Evidence Lens 维度级加减项。
- [x] Evidence Chain 因果关系。
- [x] 回放深链。
- [x] 三个 Agent 的 Passport Snapshot。
- [x] Verified Win Card 必须包含失败与修复。
- [x] 音效重复播放防护。
- [x] Kill Cam 单次触发。
- [x] Reduced Motion。
- [x] Mobile 375px。
- [x] 中文优先 locale 与术语表。
- [x] 中文 Fixture、状态、错误、按钮与分享文案。
- [x] `zh-CN` 日期、时间与数字格式。
- [x] E2E 中文截图与英文白名单审计。
- [x] SSE 重连与 Event 幂等。
- [x] API / Schema / Event 缺失降级。
- [x] Offline Example Battle。
- [x] Runtime fallback。
- [x] Clipboard / Audio / QR 失败处理。
- [x] Unit / Component / E2E 测试。
- [x] 20 次稳定回归。
- [x] Git Diff 护栏。
- [x] Codex 完成报告格式。
- [x] 展示层任务包与 Verified Artifact Runtime 的边界。
- [x] P0-A 至 P0-K 的完整任务编号。
- [x] 证据透镜分数加减项数学一致性。
- [x] 证明值与最终得分不混用。
- [x] 修复 / 复测展示证据从现有事件派生。
- [x] Markdown Export 回归验证。
- [x] 中英文混合变量名与乱码修复。

---

# 19. 最终执行原则

所有 UI 效果必须遵循：

```text
Data / Fixture
→ Presentation Adapter
→ View Model
→ UI State
→ Animation
```

禁止：

```text
Animation
→ Fake Business State
```

正式 Demo 的价值链必须完整呈现：

```text
Agent Claim
→ Agent Action
→ Evidence
→ Attack
→ Defense
→ Patch
→ Verification
→ Evidence-bound Score
→ Passport Snapshot
```

最终判断标准不是页面是否更炫，而是中文用户能否无语言负担地看懂，并让评委在现场看到并相信：

```text
信誉不是一个分数。
信誉是每一个分数背后的证据。
```
