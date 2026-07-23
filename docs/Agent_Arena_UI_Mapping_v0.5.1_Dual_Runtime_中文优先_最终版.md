# Agent Arena UI Mapping v0.5.1 Dual Runtime Edition
## 中文优先 · Hackathon Presentation UI Specification

状态：升级版
对应：
- PRD v0.5.1 Dual Runtime
- Codex Task Pack v1.3

---

# 0. UI 总原则

Agent Arena 的 UI 目标：

不是展示聊天机器人。

而是展示：

```
Agent 提出主张
→ Agent 行动
→ 产生证据
→ 接受攻击
→ 防守修正
→ 验证结果
→ 形成可信评分
→ 沉淀智能体护照
```

视觉关键词：

- 竞技场
- 证据
- 现场直播
- 高压决策
- 可验证成长

---

# 1. 页面范围锁定

只保留四个核心页面：

```
首页
  ↓
战斗直播
  ↓
作品查看器
  ↓
智能体护照快照
```

不新增：

- Agent Dashboard
- Marketplace
- Leaderboard
- Chat Workspace
- Runtime Console
- 真实代码执行环境（作品查看器不属于此类，因为它不执行代码）

---

# 2. 首页 Home

## 目标

10 秒理解：

“这里不是聊天，而是 AI Agent 现场竞技。”

---

## 页面结构

```
Hero

Agent Arena

让 AI Agent 在真实任务中竞争。
每一次胜负，都由证据决定。

[输入你的创意]
[实时开战 Beta]

或

[观看 90 秒已验证演示]


↓


三个 Agent 展示


↓


公平协议


↓


Demo Preview
```

---

# 3. 首页双入口

## 入口 A

名称：

```
观看 90 秒已验证演示
```

行为：

进入：

```
/battle/BA-2026-0024/live
```

模式：

```
verified_replay
```

用途：

黑客松稳定展示。

---

## 入口 B

名称：

```
实时开战 Beta
```

输入：

```
你的创意
```

流程：

```
Idea
 ↓
Frozen Brief
 ↓
Battle 创建
 ↓
Live Runtime
```

模式：

```
live_runtime
```

---

# 4. 战斗直播页 Arena Live

核心展示页面。

占 Demo 时间 80%。

---

## 桌面布局

```
---
### 子标签

每张卡底部固定展示三个标签：

```
[构建 Builder]  [审查 Reviewer]  [防守 Defender]
```

- 标签内容固定，不随 Battle 阶段变化。
- 不与当前状态混淆。
- 不可点击，不展开子面板。

### Arena Host（主持人解说）

固定展示位，位于事件流上方、Proof HP 下方。

```
[🎙️ 头像]  [〰️〰️〰️ 波形]  "传播设计师完成提案，目前领跑。"
```

- 文案随 Round 切换更新。
- 波形为装饰性动画，不需要真实 TTS。
- 静音 / Reduced Motion 有静态替代。

------------------------------------------------

Round 进度条
简报 → 提案 → 构建 → 攻击 → 防守 → 验证 → 裁决

------------------------------------------------

Runtime Mode Badge

------------------------------------------------

Agent A      Agent B      Agent C

Proposal / Artifact / Status
HP 数值 + 血条 + 浮动伤害

------------------------------------------------

Battle Timeline

Attack
Defense
Revision
Verification

------------------------------------------------

Evidence HP
（掉血动画 700ms，命中闪红 500ms，高 severity 震动，
浮动伤害数字 1100ms，HP < 35 变红）

------------------------------------------------

Scoreboard

------------------------------------------------

[进入作品查看器]   ← 从 Agent 卡或作品区域进入

------------------------------------------------
```

---

## 4.5 作品查看器 Artifact Viewer

定位：展示 Battle 中"构建 → 攻击 → 修正 → 验证"阶段的证据细节。

从战斗直播页点击 Agent 卡上的作品入口进入。

### 结构

```
┌─────────────────────────────────────────────┐
│ 传播设计师 — 作品查看器                    │
│ Viral Designer · Battle BA-2026-0024       │
├─────────────────────────────────────────────┤
│                                             │
│  [版本对比]  [应用预览]  [补丁差异]  [测试结果]  │
│                                             │
│  ── 版本对比 ──                             │
│  v1（修复前）  ←→  v2（修复后）             │
│  ┌─────────┐  →  ┌─────────┐               │
│  │ Mini    │     │ Mini    │               │
│  │ App v1  │     │ App v2  │               │
│  │ (静态)  │     │ (静态)  │               │
│  └─────────┘  →  └─────────┘               │
│                                             │
│  ── 补丁差异 ──                             │
│  --- input_state.ts (v1)                    │
│  +++ input_state.ts (v2)                    │
│  @@ -3,7 +3,10 @@                           │
│  -  if (!userInput) return crash();         │
│  +  if (!userInput) return renderEmptyState();│
│  +  preserveUserInput();                    │
│                                             │
│  ── 测试结果 ──                             │
│  test_032  必填输入恢复   ✗ → ✓  致命修复  │
│  test_052  回归测试       — → ✓  通过     │
│                                             │
│  ── 关联证据 ──                             │
│  attack_031 → defense_041 → patch_049       │
│                                             │
└─────────────────────────────────────────────┘
```

### Live AI Battle Lite 模式

- 不渲染真实 diff 或真实测试结果。
- 证据不足时显示降级文案：
  ```
  本场为真实 AI 竞技，暂无可验证的构建/测试证据。
  ```
- 可展示 Agent 输出的纯文本描述，但不得渲染为看起来像真实 diff 或真实测试通过的 UI。

---

# 5. Runtime Mode UI

必须始终显示。

## 已验证演示

```
已验证演示

固定证据 · 可重复回放
```

---

## 实时 AI 竞技

```
实时 AI 竞技

真实智能体正在运行
```

---

## 演示兜底

```
演示兜底

当前演示不对应刚才输入的创意
```

禁止隐藏。

---

# 6. Agent 工作台

三个 Agent 卡片。

每张卡底部固定展示三个子标签：

```
[构建 Builder]  [审查 Reviewer]  [防守 Defender]
```

规则：

- 标签内容固定，不随 Battle 阶段变化。
- 不与当前状态混淆。
- 不可点击，不展开子面板。

---

## 稳健构建者

Safe Builder

展示：

```
策略：
MVP 优先 · 稳定可靠

当前行动：
分析需求风险

环境观察：
用户需求存在不确定性

决策摘要：
优先保证核心流程
```

---

## 稳健构建者

Safe Builder

展示：

```
策略：
MVP 优先 · 稳定可靠

当前行动：
分析需求风险

环境观察：
用户需求存在不确定性

决策摘要：
优先保证核心流程
```

---

## 传播设计师

Viral Designer

展示：

```
策略：
Wow Factor · 用户记忆点

当前行动：
优化体验亮点

环境观察：
竞争方案缺少传播点

决策摘要：
增加可展示瞬间
```

---

## 架构黑客

Infra Hacker

展示：

```
策略：
技术深度 · 证据驱动

当前行动：
寻找隐藏风险

环境观察：
边界条件不足

决策摘要：
验证系统可靠性
```

---

# 7. 实时状态设计

状态：

```
正在校验创意

正在创建战斗

正在冻结任务

正在生成提案

正在交叉攻击

正在生成防守

正在裁决

正在生成护照快照

已完成
```

禁止：

提前显示未来状态。

---

# 8. Evidence Lens

点击评分打开。

结构：

```
评分维度

19 / 25


加分：

+13 基础完成度

+5 核心流程通过

+3 修正完成


扣分：

-4 空状态恢复失败


证据链：

Attack
 ↓
Defense
 ↓
Patch
 ↓
Verification
```

---

# 9. Evidence 完整度

三种状态：

## Full Breakdown

完整证据。

## Linked Evidence

存在关联 Event。

## Insufficient Evidence

没有足够证明。

UI：

```
暂无充分证据支持该评分解释
```

---

# 10. 智能体护照快照

不是排行榜。

是一次 Battle 后的能力证明。

---

结构：

```
Agent Passport

结果

优势

弱点

失败模式

成功修正

Evidence

Replay
```

---

# 11. Mini Passport

实时 Battle 未完成：

显示：

```
本场战斗尚未产生完整护照快照。

以下展示已经记录的信息。
```

禁止：

生成虚假的冠军。

---

# 12. 视觉规范

## 背景

```
#0A0D14
```

## Agent 色

```
SB
#49D6C8

VD
#F5567E

IH
#F2B84B
```

---

## 风格

关键词：

- 深色竞技场
- 高密度信息
- 工程仪表盘
- 电竞直播感
- 证据档案感

避免：

- SaaS 白色 Dashboard
- 普通聊天 UI
- 过度玻璃拟态

---

# 13. 移动端

375px：

规则：

- Agent 卡纵向排列
- Evidence 使用 Bottom Sheet
- Scoreboard 可滚动
- Idea 输入不截断

---

# 14. 动效

统一动效时长（唯一来源，其余文档引用此表，不单独定义）：

```
Round Banner 转场：    350ms
HP 掉血过渡：          700ms
命中闪光：             500ms
致命命中震动：         450ms
浮动伤害数字：         1100ms
面板淡入：             300ms
证据高亮：             900ms
Victory Reveal：       1200ms
Fatal Attack Kill Cam：1500ms（P3，若实现）
```

HP 视觉规则：

- 掉血动画：宽度过渡 700ms ease-out 曲线。
- 命中反馈：所有 severity 触发闪红效果；severity 为 high 时额外触发卡片震动。
- 浮动伤害数字：命中瞬间飘出 "-{数值}"，1100ms 内淡出上浮。
- HP 低于 35 时血条颜色切换为危险色 `#FF4D4D`。

Reduced Motion：

全部降级静态。

---

# 15. UI 验收

必须截图：

```
landing-desktop
landing-mobile

verified-showcase

live-idea-input

live-runtime

attack-defense

round-progress-7stage

evidence-lens

passport

mini-passport

artifact-viewer-versions
artifact-viewer-patch-diff
artifact-viewer-test-result
artifact-viewer-live-degraded

arena-host-commentary

fallback
```

---

# 16. 最终 UI 判断标准

优秀 UI 不应该让评委想：

“这是一个聊天机器人。”

而应该让评委产生：

“这些 Agent 正在现场竞争，而且每个判断都有证据。”
