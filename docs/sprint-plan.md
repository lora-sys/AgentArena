# Sprint Plan — Sprint 2: Hackathon Demo Fixes

> Created: 2026-07-21 (merged from 4-dimension review: bug-hunter + architecture-reviewer + frontend-creative + build-agent-app)
> Mode: 2+2 parallel (Wave 1: Backend + UI/UX; Wave 2: Frontend + QA; Wave 3: Frontend Creative + Agent UX)
> Goal: Wave 1+2 — System works as hackathon demo. Wave 3 — Demo impresses judges.

---

## Priority Matrix

### MUST FIX Before Demo (CRITICAL + HIGH)

| ID | Category | Issue | Files | Est. |
|----|----------|-------|-------|------|
| **CSS-1** | Frontend CRIT | 100+ CSS classes undefined in globals.css | `app/globals.css`, all page components | 1 day |
| **CSS-2** | Frontend HIGH | Event badge colors all purple | `components/live-battle-client.tsx:292` | 0.25 day |
| **CSS-3** | Frontend HIGH | Navigation hardcoded to viral-designer | `components/app-shell.tsx:14-19` | 0.25 day |
| **CSS-4** | Frontend HIGH | Live battle page blank during SSE connect | `components/live-battle-client.tsx:55-59` | 0.25 day |
| **CSS-5** | Frontend HIGH | Event timeline grid overflows on mobile (375px) | `components/live-battle-client.tsx:282` | 0.5 day |
| **CSS-6** | Frontend MED | Page padding 52px too wide for mobile | `app/globals.css:312` | 0.1 day |

| **BE-1** | Backend CRIT | Battle engine sync in request handlers | `lib/battle-api.ts`, `start/route.ts`, `stream/route.ts` | 1.5 days |
| **BE-2** | Backend HIGH | Events route re-runs battle on every poll | `events/route.ts`, new `lib/battle-cache.ts` | 0.5 day |
| **BE-3** | Backend HIGH | Setup form settings silently dropped | `battle-setup-form.tsx`, `battles/route.ts`, `lib/battle-api.ts` | 0.25 day |
| **BE-4** | Backend HIGH | SSE events lack `id` field (no resume on reconnect) | `events/stream/route.ts` | 0.1 day |
| **BE-5** | Backend HIGH | Rate limiter `lastRefill` reset causes permanent lockout | `lib/api/guards.ts:189` | 0.1 day |

| **FE-1** | Frontend CRIT | SSE reconnect causes duplicate events | `lib/sse-client.ts:108-146` | 0.25 day |
| **FE-2** | Frontend HIGH | SSE client no error boundary (crashes on EventSource failure) | `components/live-battle-client.tsx` | 0.25 day |
| **FE-3** | Frontend HIGH | Event array unbounded growth (memory leak) | `components/live-battle-client.tsx:64` | 0.1 day |
| **FE-4** | Frontend HIGH | Cancel button provides no user feedback | `components/live-battle-client.tsx:155-178` | 0.25 day |
| **FE-5** | Frontend MED | SSE `maxRetries` off-by-one (`>` vs `>=`) | `lib/sse-client.ts:137` | 0.05 day |

| **PROD-1** | Product CRIT | Every battle hardcoded (core promise broken) | `lib/demo-data.ts`, `lib/battle-api.ts` | P1 (post-demo) |
| **PROD-2** | Product CRIT | Scores not bound to evidenceEventIds (PRD §12.3 violation) | schemas, scoring engine | P1 (post-demo) |
| **PROD-3** | Product HIGH | Home page passport shows fabricated mock data | `app/page.tsx:56-72` | 0.25 day |
| **PROD-4** | Product HIGH | Passport stats fabricated (globalRank, winRate) | `lib/demo-data.ts:261-265` | 0.25 day |
| **PROD-5** | Product HIGH | Attack matrix doesn't show attack outcomes | `components/attack-matrix.tsx` | 0.25 day |

### NICE TO HAVE (MEDIUM + LOW) — Sprint 2 stretch

| ID | Category | Issue | Files | Est. |
|----|----------|-------|-------|------|
| **UX-1** | UX MED | Battle narrative missing "why" layer | replay, event-drawer | 0.5 day |
| **UX-2** | UX MED | Evidence chain links fragile, no visual breadcrumb | `event-drawer.tsx` | 0.25 day |
| **UX-3** | UX MED | Setup form constraints silently dropped | `battle-setup-form.tsx`, start route | 0.25 day |
| **UX-4** | UX MED | Replay loading state has no skeleton | `battle-replay-client.tsx:162-179` | 0.25 day |
| **UX-5** | UX MED | Event drawer close button labeled "Esc" | `event-drawer.tsx:164` | 0.1 day |
| **A11Y-1** | A11Y HIGH | Search input missing programmatic label | `battles-table.tsx:108` | 0.1 day |
| **A11Y-2** | A11Y HIGH | Table action links missing aria-labels | `battles-table.tsx:163-164` | 0.1 day |
| **PERF-1** | Perf MED | event-drawer O(n²) linear scan | `event-drawer.tsx:24-62` | 0.1 day |
| **PERF-2** | Perf MED | ResizeObserver not disconnected on status change | `battle-replay-client.tsx:112-138` | 0.1 day |
| **PERF-3** | Perf LOW | sparkline negative values for zero scores | `demo-data.ts:135-138` | 0.1 day |
| **ARCH-1** | Arch HIGH | Demo data tightly coupled through entire app | `lib/demo-data.ts`, all pages | P1 |
| **ARCH-2** | Arch HIGH | Two competing data architectures | `api-client.ts` vs `demo-data.ts` | P1 |
| **LOW-1** | LOW | CSS rules duplicated (attack-matrix-card) | `globals.css:2655-2851` | 0.1 day |
| **LOW-2** | LOW | Font weight magic numbers not in tokens | `globals.css` | 0.25 day |

---

## Wave 1 (Sprint 2.1) — Backend + UI/UX in parallel

### Backend Tasks

| # | Issue | Files | Est. |
|---|-------|-------|------|
| B-1 | Make battle engine async (fix sync execution) | `lib/battle-api.ts`, `lib/demo-data.ts`, `start/route.ts`, `stream/route.ts` | 1.5d |
| B-2 | Implement event store cache (stop re-running battle) | `events/route.ts`, `lib/battle-cache.ts` | 0.5d |
| B-3 | Fix rate limiter `lastRefill` reset bug | `lib/api/guards.ts:189` | 0.1d |
| B-4 | Wire setup form settings through API | `battle-setup-form.tsx`, `battles/route.ts`, `lib/battle-api.ts` | 0.25d |
| B-5 | Add SSE event `id` field for resume | `events/stream/route.ts` | 0.1d |
| B-6 | Make demo data lazy-loaded | `lib/demo-data.ts` | 0.25d |

### UI/UX Tasks

| # | Issue | Files | Est. |
|---|-------|-------|------|
| U-1 | Fix all missing CSS classes (100+ definitions) | `app/globals.css`, all page components | 1d |
| U-2 | Fix event badge colors by type | `components/live-battle-client.tsx` | 0.25d |
| U-3 | Fix navigation to be context-aware | `components/app-shell.tsx` | 0.25d |
| U-4 | Add loading/connecting skeleton for live battle | `components/live-battle-client.tsx` | 0.25d |
| U-5 | Fix mobile event timeline (stacked card layout) | `components/live-battle-client.tsx` | 0.5d |
| U-6 | Fix page padding for mobile breakpoints | `app/globals.css` | 0.1d |
| U-7 | Fix cancel button user feedback | `components/live-battle-client.tsx` | 0.25d |
| U-8 | Fix fabricated passport stats | `app/page.tsx`, `lib/demo-data.ts` | 0.25d |
| U-9 | Fix attack matrix to show attack outcomes | `components/attack-matrix.tsx` | 0.25d |

---

## Wave 2 (Sprint 2.2) — Frontend + QA in parallel

### Frontend Tasks

| # | Issue | Files | Est. |
|---|-------|-------|------|
| F-1 | Fix SSE duplicate events on reconnect | `lib/sse-client.ts` | 0.25d |
| F-2 | Add error boundary for SSE connection | `components/live-battle-client.tsx` | 0.25d |
| F-3 | Cap event array to prevent memory leak | `components/live-battle-client.tsx` | 0.1d |
| F-4 | Fix SSE `maxRetries` off-by-one | `lib/sse-client.ts:137` | 0.05d |
| F-5 | Accessibility: search input label, table aria-labels | `battles-table.tsx` | 0.1d |
| F-6 | Replay loading skeleton | `battle-replay-client.tsx` | 0.25d |
| F-7 | Event drawer close button text | `event-drawer.tsx` | 0.1d |

### QA Tasks

| # | Issue | Files | Est. |
|---|-------|-------|------|
| Q-1 | Fix flaky rate-limit test | `tests/e2e/` | 0.5d |
| Q-2 | Fix WebKit compatibility or exclude | `playwright.config.ts` | 0.25d |
| Q-3 | Add wait conditions for SSE-dependent tests | `tests/e2e/` | 0.5d |
| Q-4 | Full E2E run after fixes — target ≥90% | All test files | 0.5d |

---

## Wave 3 (Sprint 2.3) — Frontend Creative + Agent UX

> Wave 3 不阻塞 demo，但决定 demo 能否「Wow」评委。在 Wave 1+2 稳定后执行。

### Narrative Rhythm Upgrade (frontend-creative)

产品叙事：**好奇 → 承诺 → 紧张 → 高潮 → 反思 → 身份**

| # | 升级项 | 页面 | 效果 | 估计 |
|---|--------|------|------|------|
| N-1 | **Live 页面「舞台」头部** — 队伍卡 + 大比分 + 计时器作为首屏唯一焦点 | Live | 评委走进时第一眼看到「有东西在发生」 | 3h |
| N-2 | **FlowStrip 加入 Defense 节点** — 与 BattleRail 6 步对齐 | All pages | 叙事链路完整，用户看到防御阶段 | 0.5h |
| N-3 | **Result 冠军典礼** — 全宽金色背景 + Trophy 弹跳动画 + Podium 布局 | Result | 颁奖仪式感，评委走不过去 | 2h |
| N-4 | **Home Hero Cinematic** — H1 → 48px + 径向渐变背景 + 队伍卡片入场动画 | Home | 第一印象有冲击力 | 1h |
| N-5 | **Setup 仪式感** — 「Enter the Arena」header + 队伍「登场」序列动画 | Setup | 用户感到「即将释放三个 AI」 | 1h |
| N-6 | **事件时间线改垂直时间轴** — 替代 5 列网格，左侧彩色时间线 + 节点 | Live | 更像「战况播报」而非表格 | 2h |
| N-7 | **关键事件「快讯」高亮** — High severity attack/defense 弹出高亮卡片 | Live | 紧张感，像体育直播 | 1.5h |
| N-8 | **Scoreboard 条形图从零动画** — 480ms ease-out 从 0 到实际宽度 | Result | 数据感觉「活」的 | 1h |
| N-9 | **Round 转场动画** — 200ms fade-out → 320ms fade-in + translateY | Live | 阶段感而非滚动 | 2h |
| N-10 | **事件入场闪烁动画** — 新事件行左侧边框闪烁 800ms | Live | 新事件有视觉引导 | 0.5h |
| N-11 | **Attack Matrix 视觉升级** — 目标颜色边框 + 渐变背景 + 展开动画 | Live | 攻击影响力可视化 | 2h |
| N-12 | **Passport 徽章光晕 + 脉冲** — drop-shadow glow + 4s 循环 | Passport | 官方认证感 | 1h |
| N-13 | **Passport 证据链改攻防对视图** — Attack → Defense → Score 配对展示 | Passport | 审计员一眼看到因果链 | 2h |
| N-14 | **Replay 时间线 scrubber** — 水平时间轴 + 彩色事件标记点 | Replay | 像视频播放器而非阅读 | 4h |
| N-15 | **排版层级审计** — H1/H2/H3 对齐 design token | All | 一致性 | 2h |
| N-16 | **暗黑玻璃态（Obsidian Arena）** — Live + Result 暗黑模式 + glassmorphism | Live, Result | Awwwards 级视觉 | 3h |
| N-17 | **移动端 768px 断点** — Hero 堆叠 + 全页面适配 | All | 375px/390px 可用 | 2h |

### Agent Identity & UX Upgrade (build-agent-app)

| # | 升级项 | 效果 | 估计 |
|---|--------|------|------|
| A-1 | **队伍标志性视觉元素** — Safe=盾牌, Viral=闪电, Infra=终端 | 三队不靠颜色也能区分 | 1h |
| A-2 | **队伍「登场」序列** — Live 页面首次加载时三队依次淡入上浮 (200ms 间隔) | 戏剧化入场 | 1h |
| A-3 | **Proposal 卡片差异化** — Safe=实线边框, Viral=渐变边框, Infra=代码风格 | 个性表达 | 1h |
| A-4 | **Judge Commentary 对话气泡** — judging 阶段展示法官评语 | 评审团在场感 | 1.5h |
| A-5 | **Champion 「为什么赢」3-pillar 布局** — Demo Wow / Technical Depth / Long-term Potential 三卡片 | 冠军理由可视化 | 1h |
| A-6 | **Home page Passport 预览去 mock** — 替换为真实数据或删除 | 不广告不存在功能 | 0.5h |
| A-7 | **Setup 表单简化** — 移除未实现的 battle type / preference，或标注「Coming in P1」 | 不创建虚假期望 | 0.5h |

### Agent Experience Upgrade (build-agent-app — P1)

| # | 升级项 | 效果 | 估计 |
|---|--------|------|------|
| AE-1 | **Mock SSE Server** — 为 demo 场景提供基于定时器的 mock SSE，按预录时间戳逐步推送事件 | battle 「实时进行」而非一次性展示 | 3h |
| AE-2 | **Live/Replay 显式区分** — UI 中明确标记「Replay Mode」vs「Live Mode」 | 概念澄清 | 0.5h |
| AE-3 | **证据链攻防对视图** — 配对展示攻击→防御→裁定，带严重程度标签 | 审计员快速理解 | 3h |
| AE-4 | **Home 「One-page Pitch」视图** — 三队对战 + 证据链 + Passport 浓缩在一屏 | 评委 5 分钟速览 | 2h |
| AE-5 | **Battle 标题使用用户 idea** — 替代硬编码 "Agent Metaverse Hackathon" | 个性化 | 0.5h |

**Wave 3 总计：~42h（约 5 个工作日）**

---

## Timeline (合并版)

```
Day 1 上午：B-1 (engine async) + U-1 (CSS classes) ← 最关键
Day 1 下午：B-2 (cache) + U-2 (badge colors) + F-1 (SSE dedup)
Day 2 上午：B-3/B-4/B-5 + U-3/U-4 + F-2/F-6
Day 2 下午：B-6 + U-5/U-6/U-7/U-8/U-9 + F-3/F-4/F-5/F-7
Day 3 上午：Q-1/Q-2/Q-3 + 全量 E2E → 目标 ≥90%
Day 3 下午：Wave 1+2 review + Bug bash → Demo ready (Wave 1+2 完成)

--- Wave 3 (Demo 后，决定评委是否 "Wow") ---

Day 4:   N-1 (Live 舞台头部) + N-2 (FlowStrip Defense) + A-1 (队伍视觉元素)
Day 4-5: N-3 (Result 典礼) + N-4 (Home Hero) + N-6 (时间线改垂直) + A-2 (登场序列)
Day 5-6: N-7 (快讯高亮) + N-8 (Scoreboard 动画) + N-9 (Round 转场) + N-11 (Matrix 升级)
Day 6-7: N-13 (Passport 攻防对) + N-14 (Replay scrubber) + N-16 (暗黑玻璃态)
Day 7:   N-17 (移动端断点) + AE-1 (Mock SSE) + polish
Day 8:   Wave 3 review + 视觉 regression + 最终 demo ready
```

---

## Demo Checklist (Wave 1+2)

- [ ] All CSS classes defined (pages render correctly)
- [ ] Event badges have distinct colors per type
- [ ] Navigation adapts to current context
- [ ] Live battle shows loading state during SSE connect
- [ ] Mobile timeline usable at 375px
- [ ] Battle engine is async (not sync)
- [ ] Events route uses cache (not re-running battle)
- [ ] Setup form settings actually affect battle
- [ ] SSE events have `id` for resume
- [ ] Rate limiter doesn't cause permanent lockout
- [ ] SSE reconnection doesn't duplicate events
- [ ] Cancel button provides user feedback
- [ ] Passport shows real data (not fabricated)
- [ ] E2E pass rate ≥ 90% on chromium-desktop

## Demo Checklist (Wave 3 — "Wow" Factor)

- [ ] Live page first screen has team cards + scores + battle clock (no scroll needed)
- [ ] Result page has animated trophy + podium layout
- [ ] Home hero H1 is 48px with atmospheric gradient
- [ ] FlowStrip shows all 6 steps including Defense
- [ ] Attack matrix cells show attack outcomes (accepted/rejected)
- [ ] Passport seal has glow effect
- [ ] Three teams visually distinct beyond just color
- [ ] Mobile tested at 375px and 390px with no overflow
