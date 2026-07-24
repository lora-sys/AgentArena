# Agent Arena v0.5.2 · 开发准则（Team Playbook）

> 面向 **2 人协作** 的黑客松交付节奏。全部工作线（A/B/C/D/E）都必须遵守本文档。
> 权威文档优先级：`Agent_Arena_v0.5.2_最终交付包` > `PRD v0.5.1` > `Task Pack v1.3` > `UI Mapping v0.5.1` > 两张 UI 设计稿 > 仓库现状。

---

## 0. 页面架构（只有 3 个页面）

```
/                                Landing / Home
/battle/:id                      Live Arena（含 3 状态 + 2 个 Modal）
  ├─ ?mode=verified_replay        设计稿 02: 正常运行
  ├─ ?mode=live_runtime           设计稿 03: 致命攻击接管态
  ├─ ?mode=demo_fallback          设计稿 08: 证据不足 / 演示兜底
  ├─ Modal: Evidence Lens         设计稿 04（点评分维度触发）
  └─ Modal: Artifact Viewer       设计稿 05（点 Agent 卡作品入口触发）
/battle/:id/champion              Champion（Reveal 上半屏 + Passport 下半屏）
  ├─ 上半屏: Champion Reveal      设计稿 07（1200ms Victory Reveal + 奖杯）
  └─ 下半屏: Team Passport        设计稿 06（六维 + 优势 + 弱点 + 战斗旅程）
```

`/agent/:id/passport` 仅作分享短链，deep-link 到 Champion 页并展开对应 Passport。

---

## 1. 工作线划分与文件边界

| 工作线 | 负责范围 | 拥有的文件 |
|---|---|---|
| A 播放引擎 + Live Arena 页 | HpBar / TypewriterText / RoundBanner / ArenaHost / RuntimeModeBadge / Live Arena 页面 + 致命攻击接管 | `apps/web/src/components/hp-bar.tsx`、`typewriter-text.tsx`、`round-banner.tsx`、`arena-host.tsx`、`runtime-mode-badge.tsx`、`arena-stage.tsx` 重构 |
| B Artifact Modal | 4 tab 弹窗 + Mini App | `apps/web/src/components/artifact-modal/**` |
| C Evidence Modal + Champion 页 | Evidence Lens Modal + Champion / Passport 页 | `apps/web/src/components/evidence-lens.tsx`、`apps/web/src/pages/champion.tsx` |
| D Live AI (StepFun) | StepFun Provider + 编排 + SSE + POST /battles + 降级页 | `lib/runtime/providers/stepfun.ts`、`lib/runtime/live-battle.ts`、`apps/api/src/app.ts` 新 endpoints |
| E Fixture / 内容 / QA | fixture / 六维口径 / damage / tokens / zh.ts / 视觉基线 / 20 场连测 | `examples/fixtures/verified-showcase.json`、`packages/contracts/src/index.ts`、`apps/web/src/styles/tokens.css`、`apps/web/src/i18n/zh.ts` |

### 共触区（改动前必须双人 sign-off）
- `packages/contracts/src/index.ts`
- `arena/schemas/types.ts`（只允许追加，不允许改语义）
- `lib/runtime/contract.ts`
- `apps/web/src/App.tsx` 路由表
- `apps/web/src/data/battle.ts` 的 `BattleEventsResult`
- `apps/web/src/i18n/zh.ts`

---

## 2. 2 人分工总纲

- **开发者 P1（视觉 / 前端主力）**：承担 A + B + C 全部前端 issue。全部时间在 `apps/web/src/**`。评委看到的每一个像素都是 P1 的责任。
- **开发者 P2（数据 / 后端 / QA）**：承担 D + E + 契约 + fixture + StepFun 后端 + SSE + 限流 + CI + 视觉基线 + 20 场连测 + 止损测试。

具体 issue 分配见 `docs/BROWSER-VERIFICATION.md` 的 Issue Manifest。

### 关键 Handoff 时刻
1. **Day 0 下午**：P2 交付 `#07 Contracts v2` → P1 解锁 `fatal` severity，开始 `#08 HpBar`。
2. **Day 1 底**：P2 交付 `#02 fixture BA-2026-0024` → P1 的 `#13 Live Arena` 可以对着真实 fixture 调，不再 mock。
3. **Day 3 早**：P2 交付 `#23 POST /battles` → P1 接入 Idea 输入框 + `#17 Live 降级卡`。
4. **Day 3 晚**：P2 交付 `#26 止损结果` → 双人对 D 线是否降级 P2 拍板。

---

## 3. 分支 & PR 规范

### 3.1 分支命名
```
ws-{A|B|C|D|E}/{issue-number}-{短描述}
例：ws-A/08-hp-bar-component
    ws-D/22-stepfun-orchestrator-sse
    ws-E/02-fixture-ba-2026-0024
```

### 3.2 PR 标题
```
[WS-A] #08 HpBar 组件（掉血 700ms · 命中闪红 500ms · fatal 震动 450ms）
```

### 3.3 PR body 模板
```markdown
Closes #NN

## Scope
（引用 v0.5.2 交付包"文件边界"章节，列出改到的文件）

## Verification
- [ ] typecheck / lint / test / build / e2e 全绿
- [ ] agent-browser 截图已附（清单见下）
- [ ] 视觉比对图已附（左设计稿 · 右实现，标注差异）
- [ ] 动画类：录屏已附（若适用）

## Screenshot Manifest
| 状态 | 文件路径 |
|---|---|
| hp-bar-normal | screenshots/pr-NN-hp-bar-normal.png |
| hp-bar-fatal | screenshots/pr-NN-hp-bar-fatal.png |

## Visual Diff
（贴并排图，左 = ui/详细瞬间状态设计稿.png 的裁剪 · 右 = 实现截图）

## Blocked by
- #MM （必须先合并）

## Blocks
- #KK （合并后 K 才能开工）
```

### 3.4 红线（Reviewer 直接 request-changes 的情况）
1. 修改 `arena/engine/*` 的**状态机语义**（追加新状态不算，改流转规则算）。
2. 新增 DB migration。
3. Provider Secret（如 `STEPFUN_API_KEY`）出现在前端 bundle 或日志。
4. Fixture 与真实事件流混杂（`verified_replay` 走 fixture，`live_runtime` 走真实事件，不允许合并事件源）。
5. 解析或执行用户代码。
6. **用户可见的裸英文字符串**（英文只允许作副标题，如"战斗直播 Live Arena"）。
7. UI 改动 PR 没有并排视觉比对图。
8. 动画类 UI PR 没有录屏。

---

## 4. 中文优先（硬规矩）

- 全部用户可见字符串走 `apps/web/src/i18n/zh.ts`。
- 中文主标题 + 可选英文副标题（"战斗直播 Live Arena"）。
- 严禁把中文硬编码在组件里。
- 严禁把英文作为主要文案（技术副标题除外）。

---

## 5. CI 门槛

`.github/workflows/ci.yml` 已跑：`typecheck` · `lint` · `test`（含 Postgres 服务） · `build` · `e2e`（Playwright）。

**本次新增（由作者本地手动执行 + Reviewer 检查）**：
- `browser-verification`：每 PR 附 agent-browser 截图。
- `visual-diff-required`：UI PR 附并排视觉比对图，>5% pixel diff 且未解释 → request-changes。

具体协议见 `docs/BROWSER-VERIFICATION.md`。

---

## 6. Feature Flag

- `AGENT_ARENA_LIVE_BATTLE_ENABLED=true|false`（默认 `false`）——控制 Landing 页"实时开战 Beta"入口是否显示。
- `AGENT_ARENA_STEPFUN_MODEL_ID`（默认 `step-2-16k`）——StepFun 模型 ID。

---

## 7. 数值口径统一

| 项目 | 数值 | 来源 |
|---|---|---|
| Damage low | 5 | Task Pack v1.3 |
| Damage medium | 15 | 同上 |
| Damage high | 30 | 同上 |
| Damage fatal | **50** | v0.5.2 新增 |
| HP recovery on retest | **60%** of damage | 同上 |
| HP 危险色阈值 | < 35 | UI Mapping v0.5.1 |
| Round Banner 转场 | 350ms | 同上 |
| HP 掉血过渡 | 700ms ease-out | 同上 |
| 命中闪光 | 500ms | 同上 |
| 致命命中震动 | 450ms | 同上 |
| 浮动伤害数字 | 1100ms | 同上 |
| Victory Reveal | 1200ms | 同上 |

固定黄金剧情（Verified Showcase `BA-2026-0024`）：
- 冠军：**传播设计师** Viral Designer
- 三队终值：稳健构建者 72（后追至 78）、传播设计师 88→38→68→87、架构黑客 81→84
- 六维评分（最终冠军）：可实现性 23/25 · 原创性 20/25 · 演示表现 19/25 · 技术深度 13/15 · 讲述清晰度 8/10 · 风险控制 4/5 → **总 87/100**
- 关键事件：`attack_031`（致命攻击 · 必调输入状态恢复失败 · 88 → -50 → 38）· `defense_041` · `patch_048/049` · `test_052`（重回通过）

以上任何数值出现分歧，以本表为准。

---

## 8. 止损条款（复述 v0.5.2 交付包第 0 节）

工作线 D `#26 止损测试 20 场` 完成后：
- 若真实闭环完成率 **< 70%**，或反复出现同类失败 → PM 拍板将 D 降级为 P2，剩余时间转投 A 与 C 的动效打磨（Arena Host、Kill Cam、Champion Reveal 灯光）。
- 完成率 ≥ 70% 但未达 90%：继续投入但不打磨 Kill Cam。
- 完成率 ≥ 90%：D 通过 P1 门，可加做 Kill Cam（P3）。

---

## 9. 每日节奏（5 天冲刺）

| Day | P1 | P2 | 联合 gate |
|---|---|---|---|
| Day 0 上午 | Pair 写 #01 Dev Standards | Pair 写 #01；启动 #02 fixture、#07 contracts v2 | 清空旧 issue · 创建 26 个新 issue |
| Day 0 下午 | #05 tokens · #08 HpBar 开工 | #02 · #07 合并 · #03 · #04 | Handoff 1（contracts v2） |
| Day 1 | #09 TypewriterText · #10 RoundBanner · #11 ArenaHost | #21 StepFun Provider · #22 编排+SSE 开工 | 同步 zh.ts (#06) · Handoff 2（fixture） |
| Day 2 | #12 RuntimeModeBadge · **#13 Live Arena 页 & 致命攻击** | #22 合并 · #23 POST /battles · #25 起草 | **gate**: Live Arena 骨架跑通 |
| Day 3 | #14 Artifact Modal · #15 · #18 Evidence Lens · #19 Champion | #23 合并 · #26 止损测试 | Handoff 3 · 4 · **gate**: 止损拍板 |
| Day 4 | #16 · #17 · #19 收尾 · #20 Mini Passport | 支援 P1 · #24 Visual Baseline · #25 20 连测 | 全线合并 |
| Day 5 | 视觉打磨 · Pitch 彩排 · Bug fix | Pitch 彩排 · Bug fix | Pitch |

---

## 10. 求助与升级

- 有阻塞 > 2 小时 → 在 issue 里 @对方，或开新 issue 描述阻塞点。
- 设计稿/文档冲突 → 按第 0 节优先级判断；仍不清楚就在 issue 里贴设计稿截图 + 问题描述，等对方 sign-off。
- 遇到红线争议 → PM 拍板，不要自行决定合并到主干。
