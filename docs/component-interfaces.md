# A 线组件接口（供 B / C / D 消费）

> 更新：2026-07-25 · owner P1（工作线 A）· 权威口径：`ui/Agent_Arena_v0.5.2_最终交付包.md` §142
>
> 本文档描述 A 线已交付、可被 B（Artifact Modal）/ C（Evidence + Champion）/ D（Live AI）消费的组件接口。
> **接口约定**：props 稳定，改动前先在 issue 里 @P1 同步，不要接口定完就大改。
> 全部用户可见文案走 `apps/web/src/i18n/zh.ts`（中文优先硬规矩），组件内不硬编码字符串。

---

## 通用约定

- **动效降级**：所有动画组件遵守 `prefers-reduced-motion: reduce`，自动切静态呈现（见 `tokens.css` §5 + 各组件样式）。
- **Token 消费**：颜色 / 字体 / 字号 / 动画时长一律从 `apps/web/src/styles/tokens.css` 取，禁止硬编码。
- **动画时长**（token 名 · 精确匹配 DEV-STANDARDS §7）：
  `--motion-hp-drain 700ms` · `--motion-hit-flash 500ms` · `--motion-fatal-shake 450ms` ·
  `--motion-damage-float 1100ms` · `--motion-round-banner 350ms` · `--motion-victory-reveal 1200ms`。

---

## 1. TypewriterText（#30）

`apps/web/src/components/typewriter-text.tsx` — 逐字打字机，前端模拟（非流式）。

```tsx
import { TypewriterText } from "../components/typewriter-text";

<TypewriterText text={fullText} active={isActive} msPerChar={22} keepCursor />
```

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `text` | `string` | 必填 | 要呈现的**完整**文本（已拿到全文） |
| `msPerChar` | `number` | `22` | 每字符间隔，落在交付包 §138 规定的 14–25ms 区间 |
| `startDelayMs` | `number` | `0` | 开始前延迟，便于与 RoundBanner 转场错峰 |
| `showCursor` | `boolean` | `true` | 是否显示闪烁光标 |
| `keepCursor` | `boolean` | `false` | 打完后是否保留光标 |
| `active` | `boolean` | `true` | false 时静态显示全文（非激活卡片） |
| `onDone` | `() => void` | — | 打字完成回调（reduced-motion / 非 active 也会触发一次） |
| `as` | `ElementType` | `"span"` | 渲染标签，如 `"p"` |

**降级**：`prefers-reduced-motion` 或 `active=false` 或 `msPerChar<=0` → 直接整段呈现 + 触发 `onDone`。
**无障碍**：`aria-label` 默认为全文，屏幕阅读器读全文，视觉按进度呈现。

**B/C/D 用法**：Artifact Modal 里的代码/文本揭示、Evidence Lens 的证据说明、Live 降级卡文案，均可复用。

---

## 2. RoundBanner（#31）

`apps/web/src/components/round-banner.tsx` — 回合横幅 + 七段展示进度条。

```tsx
import { RoundBanner } from "../components/round-banner";

<RoundBanner round="cross_attack_round" roundIndex={2} roundCount={5} degraded={false} />
```

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `round` | `string` | 必填 | Engine 回合 key：`proposal_round` / `cross_attack_round` / `defense_round` / `scoring_round` / `champion_round` |
| `roundIndex` | `number` | 必填 | 0 基回合序号（用于「第 x / y 回合」与转场 key） |
| `roundCount` | `number` | 必填 | 总回合数 |
| `degraded` | `boolean` | `false` | 实时模式下该阶段无真实证据时，标题降级为「证据不足」 |

**说明**：七段（简报/提案/构建/攻击/防守/验证/裁决）为 **Presentation 层展示**，Engine 状态机仅四段。
段状态 done/active/pending 由 `round` → 已抵达段索引映射得出。转场 350ms（`--motion-round-banner`）。

**D 线注意**：`live_runtime` 若某阶段无证据，传 `degraded` 让标题显示「证据不足」，避免进度条看似走完实则为空（交付包 §259）。

---

## 3. RuntimeModeBadge（#33）

`apps/web/src/components/runtime-mode-badge.tsx` — 运行时模式三态徽标。

```tsx
import { RuntimeModeBadge, modeFromSource, normalizeMode, type RuntimeMode } from "../components/runtime-mode-badge";

<RuntimeModeBadge mode="live_runtime" />
// 由数据源推导：
<RuntimeModeBadge mode={modeFromSource(battle.source)} />
// 由 URL ?mode= 归一化（非法回落 verified_replay）：
<RuntimeModeBadge mode={normalizeMode(searchParams.get("mode"))} />
```

| 导出 | 签名 | 说明 |
|---|---|---|
| `RuntimeMode` | `"verified_replay" \| "live_runtime" \| "demo_fallback"` | 三态类型 |
| `modeFromSource` | `(source?: string) => RuntimeMode` | `event-store`→live · `fallback`→demo · 其余→verified |
| `normalizeMode` | `(v?: string \| null) => RuntimeMode` | 归一化任意字符串，非法回落 `verified_replay` |
| `RuntimeModeBadge` | `({ mode, className? })` | 徽标组件 |

三态视觉：verified_replay=冠军金 · live_runtime=品红（脉冲点）· demo_fallback=琥珀。中文主标题 + 英文副标题。

**D 线用法**：Landing 的实时入口、Live 页顶栏、Fallback 页均用同一徽标区分模式，视觉不混淆。

---

## 4. ArenaHost（#32）

`apps/web/src/components/arena-host.tsx` — 主持人解说（头像 + 装饰波形 + 逐字解说）。

```tsx
import { ArenaHost, commentaryFor } from "../components/arena-host";

<ArenaHost events={currentBatchEvents} active={isPlaying} />
```

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `events` | `readonly BattleEvent[]` | 必填 | 当前批次事件（用于选取解说文案） |
| `active` | `boolean` | `true` | 是否活跃回合（驱动波形/光环动画） |

| 导出函数 | 签名 | 说明 |
|---|---|---|
| `commentaryFor` | `(events) => string` | 依据最新事件返回中文解说文案（走 `zh.ts.host`） |

**说明**：波形为**装饰性动画**（非真实 TTS，交付包 §140/§146）。解说文本用 TypewriterText 逐字呈现（18ms/字符）。
`prefers-reduced-motion` 下波形/光环静止。

---

## 5. HpBar（#29）

`apps/web/src/components/hp-bar.tsx` — Proof HP 血条 + 掉血 / 命中 / 致命动画。

```tsx
import { HpBar, type HpSeverity } from "../components/hp-bar";

<HpBar teamId={team.id} hp={hp} prevHp={prevHp} severity={hit ? severity : undefined} onFatal={openEvidenceLens} />
```

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `teamId` | `string` | 必填 | 队伍 id（主题色由父级 `.fighter.<color>` 提供） |
| `hp` | `number` | 必填 | 当前 HP（0..100，内部 clamp） |
| `prevHp` | `number` | — | 上一帧 HP，用于计算掉血量并触发闪红/浮伤/震动；首帧可省略 |
| `severity` | `HpSeverity` | — | 本次命中严重度 `low\|medium\|high\|fatal`；驱动浮伤数字与致命态 |
| `onFatal` | `() => void` | — | `severity==="fatal"` 或 `hp≤0` 时触发一次（供 #34 Live Arena 接管 Evidence Lens） |

**动画**（时长全部走 token · 精确匹配 DEV-STANDARDS §7）：掉血 700ms · 闪红 500ms · fatal 震动 450ms · 浮伤 1100ms。
**降级**：`prefers-reduced-motion` 下时长塌缩为 1ms（继承 tokens.css）。HP < 35（`--hp-danger-threshold`）切危险红。

**前向兼容说明**：契约 #28 尚未落地 `fatal`。组件当前用本地 `HpSeverity = Severity | "fatal"` 与本地 `DAMAGE_BY_SEVERITY`（含 fatal=50）；#28 合并后改用契约 `DAMAGE_MAP`，**公开接口不变**。C 线可按上表签名直接接入。

---

## 6. 待交付（阻塞中，接口预告）

| 组件 | Issue | 阻塞原因 | 预计接口 |
|---|---|---|---|
| **Live Arena 致命攻击接管** | #34 | 等 #23 fixture（现仅 `hackathon-001.json`，无 `BA-2026-0024` / `verified-showcase.json`） | 消费 HpBar `onFatal` 触发 Evidence Lens（内容由 C 线负责） |

> HpBar 已交付（见 §5），接口与此前预告一致。B/C 接入如需调整请 @P1。

---

## i18n 依赖

以上组件文案全部来自 `apps/web/src/i18n/zh.ts`（Issue #27 · workstream E / P2 owns）。
当前该文件为 **P1 起草的初版草案**，收录 A 线所需 key（`arena` / `roundBanner` / `runtimeMode` / `host`），
**合并前需 P2 sign-off** 并与 D/E 线补全。B/C/D 若需新增文案 key，请在 `zh.ts` 追加并同步 P2。
