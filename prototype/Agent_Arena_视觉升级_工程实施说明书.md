![alt text](image.png)# Agent Arena — Battle Arena 视觉升级 · 工程实施说明书

**面向执行者**：本文档为可直接交给编码 Agent（如 Codex）执行的任务包，不需要额外澄清即可开工。所有设计决策已锁定，执行者只需在现有代码库结构内落地。

**背景**：产品是 Agent Arena（Reputation Arena for AI Agent Teams），技术底座 Mastra OSS core + 自研 Battle Engine + Next.js/TypeScript。当前 Battle 呈现层过于"文本仲裁记录"化（Proposal Cards / Attack Matrix / Scoreboard 均为静态表格化组件），本次任务目标是**只改呈现层**，把 Battle 体验从"读证据"升级为"看比赛"，用于 hackathon 提交前的冲刺打磨。

**参考实现**：本任务包附带一个独立 HTML 原型 `agent_arena_prototype.html`，已实现全部目标交互和动效的可运行版本（vanilla JS，无框架依赖）。执行者应把该文件的**交互行为、动效时序、视觉语言**作为行为规格（behavior spec），移植改写为项目现有技术栈（Next.js + TypeScript，样式方案以仓库现状为准，若已用 Tailwind 则用 Tailwind class 复刻下方 token，若是 CSS Modules/styled-components 同理迁移变量）。不要求逐行复制代码，要求交互结果与原型一致。

---

## 0. 执行护栏（禁止事项）

在开始前必须确认并遵守：

1. **不修改 Battle Engine 的 round 顺序、状态机、评分算法**。任何视觉效果都必须是对已有 `BattleEvent` / `Attack` / `Defense` / `JudgeScore` 数据的**消费**，不是对底层规则的改写。
2. **不引入破坏性 schema 变更**。唯一允许的数据契约新增见第 3 节，且必须是新增字段/新增 event type，不能修改已有字段的类型或含义。
3. **不新增外部依赖**除非必要（打字机效果、HP 动画、ticker 滚动均可用原生 CSS transition/animation + React state 实现，无需引入动画库）。如仓库已有 framer-motion 等动画库可直接复用，但不是必需项。
4. **保留 Demo Safety 机制**（Example Battle / API 失败兜底），任何新组件都必须能在纯静态 mock 数据下正常渲染，不依赖实时模型输出才能展示效果。
5. 改动前先探测现有目录结构（`/app` 或 `/pages`、`/components`、`/lib` 等），把下方任务映射到实际路径，不要假设不存在的文件路径。

---

## 1. 设计令牌（Design Tokens，直接照抄，不要重新设计）

```css
:root{
  --arena-bg:#0A0D14;
  --arena-panel:#12161F;
  --arena-panel-2:#171C27;
  --arena-hair:#242A3A;
  --arena-hair-soft:#1B2130;
  --arena-text:#E9ECF3;
  --arena-text-dim:#8891A6;
  --arena-text-faint:#5B6478;

  --team-sb:#49D6C8;      /* Safe Builder - teal */
  --team-sb-dim:#1E3A38;
  --team-vd:#F5567E;      /* Viral Designer - magenta */
  --team-vd-dim:#3A1E28;
  --team-ih:#F2B84B;      /* Infra Hacker - amber */
  --team-ih-dim:#3A301A;

  --danger:#FF4D4D;
  --gold:#E9C468;
}
```

字体：display 用 `'Archivo Black'`（战况/标题类大字）；正文 `'Inter'`；证据日志/数据类一律 `'IBM Plex Mono'`（强调"这是协议数据，不是聊天记录"）。三者都可通过 Google Fonts 引入，若仓库已有字体规范则用现有正文字体替代 Inter，但**证据日志必须保留等宽字体**，这是刻意的语义区分，不要用正文字体代替。

三个内置 Agent 的识别色是固定的，不要在实现中改动：Safe Builder = teal，Viral Designer = magenta，Infra Hacker = amber。所有 Agent 相关的 UI 元素（徽章、血条、边框）取对应色值。

---

## 2. 数据契约新增（唯一允许的 schema 改动）

### 2.1 新增 event type

在现有 `BattleEvent.type` 枚举中新增：

```text
commentary_created
```

### 2.2 新增 payload 类型

```ts
type CommentaryLine = {
  round: string;
  text: string; // 1-2 句解说，中文
};
```

### 2.3 新增 AgentSpec role（扩展，不改变已有值）

```ts
type AgentSpec = {
  // ...现有字段不变
  role: 'contestant' | 'judge' | 'artifact_writer' | 'commentator'; // 新增 'commentator'
};
```

### 2.4 前端派生状态（不落库，纯客户端计算，无需后端改动）

```ts
const DAMAGE_MAP: Record<Attack['severity'], number> = {
  low: 5,
  medium: 15,
  high: 30,
  fatal: 50,
};

// 每个 agent 的 HP 完全由前端从 events reduce 得出，不是后端字段
type ArenaHpState = Record<string /* agentId */, number>; // 初始 100，随 defense_created 事件递减
```

HP 计算规则：订阅 `defense_created` 事件，取该 Defense 的 `acceptedAttacks`，在原始 `attack_created` 事件里找到对应 Attack 的 `severity`，用 `DAMAGE_MAP` 累加扣血。`rejectedAttacks` 不扣血。这条逻辑必须写成一个纯函数（reducer），输入是整个 events 数组，输出是某一时刻的 HP 状态，方便 Replay 页面复用同一函数做"任意时间点快照"。

---

## 3. 任务清单（按优先级执行，每个任务独立可验收）

### Task 1 — HpBar 组件（P0）

**目标**：三个 Agent 卡片顶部各一条血条，随 `defense_created` 事件动画掉血。

**实现要点**：
- Props: `{ hp: number; teamColor: string; justHit?: { severity: Attack['severity'] } }`
- 血条宽度用 `transition: width 0.7s cubic-bezier(.2,.9,.3,1)`
- 掉血瞬间：卡片容器加一个 `flash` class（红色内阴影闪烁 0.5s），若 severity 为 `high` 或 `fatal` 额外加 `shake` class（横向抖动 0.45s）
- 掉血数字浮层：显示 `-{dmg}` 红色文字，从血条右上角向上飘出并淡出（1.1s），可用一个绝对定位 + CSS keyframe 实现，参考原型 `.dmg-float` / `floatUp`
- HP ≤ 35 时血条颜色切换为 `--danger`

**验收标准**：Defense Round 每发生一次 `acceptedAttacks` 非空的 defense，对应 Agent 的血条必须在 1 秒内可见地平滑减少，并出现闪红+浮动伤害数字；被 reject 的攻击不触发任何视觉变化。

---

### Task 2 — 打字机流式文本组件（P0）

**目标**：Proposal / Attack / Defense 的文本内容不是一次性渲染，而是逐字符浮现。

**实现要点**：
- 优先方案：若 Mastra runtime 已支持流式输出（Vercel AI SDK 的 `streamText`），直接把 token 流接到组件，真流式渲染
- 降级方案（如流式对接成本高或时间不够，直接用降级方案即可，视觉效果几乎无差异）：拿到完整文本后，前端用 `setInterval`/`requestAnimationFrame` 按字符切片显示，速度 14-25ms/字符
- 渲染中显示一个闪烁的竖线光标（CSS `animation: blink 1s step-start infinite`），文本渲染完毕后移除光标

**验收标准**：Proposal Round 三个 Agent 的方案文本必须逐字可见地生成，不能是内容突然出现的静态渲染。

---

### Task 3 — Round Banner 转场（P0）

**目标**：每次进入新 Round（Proposal → Attack → Defense → Judging → Passport）时有一个明确的过场提示。

**实现要点**：一个居中横幅，显示 `ROUND {n}` + Round 名称（大写、Archivo Black 或等效粗体展示字体），进入时 fade + 轻微上移动画（0.35s），停留后可保留在页面顶部或淡出，不强制要求消失。

**验收标准**：用户能在不看其他 UI 的情况下，仅凭 Round Banner 判断当前处于哪个阶段。

---

### Task 4 — Commentary Ticker（P1）

**目标**：页面下方一条常驻的"直播字幕条"，每个 Round 关键节点滚动展示一句解说。

**实现要点**：
- 视觉：左侧一个红底 `LIVE` 徽章（带呼吸动画的小圆点），右侧滚动文字（CSS `animation: scrollLeft` 或简单的文字替换+淡入）
- 内容来源两种方式任选其一：
  - **快速方案（P0 级成本，先上这个）**：固定文案表，key 是 round 名称，value 是预写好的解说词（中文，语气类似体育解说），不需要调用模型
  - **完整方案（P1，如果时间充裕）**：新增一个 `commentator` 角色的 AgentSpec（见第 2.3 节），在每个 `*_created` 事件写入后异步调用一次，输入是本轮的结构化 payload（不传全部历史，控制成本），输出写入 `commentary_created` 事件，前端订阅展示
- Gotcha Moment 出现时（某 Agent 承认 severity 为 `high`/`fatal` 的攻击），ticker 文案必须切换为醒目的"突发"样式（可以是文字前缀变化 + 颜色变红），这是全场最大记忆点，UI 上要让它和普通解说有明显区分

**验收标准**：每个 Round 切换时 ticker 内容更新；Gotcha Moment 触发时 ticker 有视觉上的特殊强调（不能和普通解说一个样式）。

---

### Task 5 — Evidence Log 实时面板（P1）

**目标**：在 Battle 进行时，右侧/侧边有一个等宽字体的事件流面板，实时显示每个写入的 `BattleEvent`（`type` + 关键 payload 摘要），随时间自动滚动到底部。

**实现要点**：复用现有 Evidence Log 的数据源，只是新增一个"实时跟随战斗进度"的紧凑展示视图（区别于 Replay 页面完整的 Evidence Log 展示），条目出现时有轻微 fade-in，不需要复杂动画。

**验收标准**：Battle 进行过程中，血条每掉一次血，Evidence Log 面板必须同步新增至少一条对应事件，两者时间上强关联，让评委能直观理解"戏剧效果是数据驱动的，不是纯表演"。

---

### Task 6 — Gotcha Moment 数据固化（P0，纯数据/内容任务，不需要写新组件）

**目标**：Example Battle（用于 demo 兜底）的数据必须包含一次明确的"高光反转"。

**实现要点**：
- 在现有 Example Battle 的预置数据里，确保：一个初期看起来"最吸引人"的 Agent（比如强调传播/演示力的那个），在 Attack Round 被对手一次 `severity: fatal` 或 `high` 的攻击命中要害，并在 Defense Round 的 `acceptedAttacks` 中承认
- 这条数据必须是**固定的**，不依赖模型实时生成的随机性——demo 现场最大高潮点不能赌运气
- 其余 Round（尤其 Proposal）可以继续保留实时模型调用，只有这一个关键转折点用固定数据兜底

**验收标准**：任意次打开 Example Battle，Defense Round 里必须稳定出现这次"承认致命缺陷"的时刻，且效果（血条腰斩 + ticker 特殊强调）稳定复现。

---

### Task 7 — 首页 Hero 改为自动播放的迷你战斗动画（P1）

**目标**：首页第一屏 3 秒内出现动态画面，替代纯文字定位介绍。

**实现要点**：用 Example Battle 的固定数据，跑一遍简化版的 HP 血条动画 + 打字机效果（可以只播放 Attack + Defense 两个 Round 的精华片段，循环播放，不需要完整走完全流程），作为首页 Hero 区域的背景/主视觉。产品定位文案退居到画面下方，作为补充说明而非首屏主角。

**验收标准**：不点击任何按钮，首页加载后 3 秒内可见画面在自动播放中。

---

### Task 8 — Replay 伤害曲线（P2，时间富余再做）

**目标**：Replay 页面在现有 Round Timeline 基础上，增加一条 HP 随事件序列（`sequence`）变化的折线图。

**实现要点**：复用第 2.4 节的 reducer 函数，对整个 events 数组做逐步 reduce，得到每个 sequence 点位三个 Agent 的 HP 快照数组，用简单折线图组件渲染（如无图表库，可用 SVG polyline 手写，三条线对应三个 team color）。允许拖动/点击时间轴跳转查看任意时刻状态。

**验收标准**：非必须在本次冲刺内完成，若实现，需保证与 Live Battle 视图使用同一套 HP 计算逻辑，不能有第二套计算规则。

---

### Task 9 — Passport 卡片视觉升级（P2）

**目标**：`PassportSnapshot` 展示组件从纯列表文字改为卡片化视觉（类似段位卡），strengths/weaknesses 用短标签 chip 展示而非长句列表，可加一个基于 `totalScore` 的简单分级徽章（如 S/A/B）。

**实现要点**：不改变 `PassportSnapshot` 数据结构，仅改前端展示组件。

**验收标准**：非必须在本次冲刺内完成。

---

## 4. 实施顺序建议

严格按 P0 → P1 → P2 顺序执行，且 P0 内部按 Task 1 → 2 → 3 → 6 顺序（血条和打字机是视觉冲击力核心，转场和数据固化是配套），P0 全部完成并可稳定演示后再进入 P1。**不要并行开多个 Task 导致某个都做不完**——P0 四项做完就已经是质的飞跃，宁可 P1/P2 不做也要保证 P0 稳。

---

## 5. 回归测试 / Definition of Done

在提交前，执行者需确认：

- [ ] 连续运行 Example Battle 3 次，血条动画、打字机效果、Gotcha Moment 均稳定复现，无渲染卡死或数据错位
- [ ] 页面在移动端宽度（~375px）下不破版（三栏 Agent 卡片需在窄屏下改为可滚动或纵向堆叠）
- [ ] 关闭动画（`prefers-reduced-motion`）时，核心信息（HP 数值、文本内容）仍完整可读，只是没有动效
- [ ] 所有新增视觉效果均可在纯离线 mock 数据下运行，不依赖实时模型调用才能展示（Demo Safety 要求）
- [ ] Battle Engine 的 round 顺序、状态机、评分算法代码未被改动（可用 git diff 核对，改动应只出现在展示层组件和第 2 节允许范围内的数据契约新增）

---

## 6. 附：参考实现文件

`agent_arena_prototype.html` —— 独立可运行的 vanilla JS 原型，包含本文档全部 P0/P1 交互效果的完整实现，作为行为规格参考。可直接在浏览器打开查看效果，或作为动效时序、CSS keyframe、状态机逻辑的移植参考代码。
