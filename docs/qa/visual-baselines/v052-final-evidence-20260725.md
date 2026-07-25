# Agent Arena v0.5.2 最终浏览器证据（2026-07-26）

## 验证环境

- Web：`http://localhost:5188`
- API：`http://localhost:8787`
- 浏览器：Chromium（agent-browser + Codex 内置浏览器）
- 桌面视口：1440×900；移动视口：390×844
- 黄金剧情：`BA-2026-0024`
- 真实 StepFun Battle：`live_ms0e3h70_26vuzj`、`live_ms0j6bcc_w615l0`、`live_ms0lmp9n_kv02d1`

## 两种模式结论

### verified_replay

- 首页已验证演示从 `1/21` 简报事件开始回放，可暂停、继续和重新播放，不再直达结果。
- Fatal 接管固定展示 `attack_031` 与 `88 → -50 → 38`，攻击切换不再被后续 SSE 重复延长。
- Evidence Lens 展示六维得分、证据链与事件详情；Artifact Viewer 验证版本对比、补丁差异、测试结果、关联证据和 Mini App。
- Champion 固定为传播设计师 87/100，Passport 同时展示优势、弱点、改进建议和战斗旅程。

### live_runtime

- 三场真实 StepFun Battle 均完整到达 Artifact、Champion 与 Passport；没有用 mock 冒充成功。
- 最终场 `live_ms0lmp9n_kv02d1` 约 101 秒完成，持久化 142 条事件，冠军为传播设计师，作品为“绿途小队 产品简报”。
- 第三场约 8 秒即展示模型实际分片进度（例如“已接收 82 / 257 字符”）；页面只展示安全的累计字符数和阶段活动，不展示或持久化原始思维链。
- 等待期间三张 Agent 卡片与事件流约每 2.5 秒更新“当前动作 / 观察 / 决策 / 证据 / 状态”；约 20 秒已推进到防守阶段。
- 刷新同一 URL 后，原始 Idea、142 条事件、三队状态、冠军作品与完成态全部从事件存储恢复。
- Artifact Mini App 已实际生成 8 条与本场冠军作品绑定的验收步骤；Evidence Lens 展示 8 个本场 `live_evt_*` 来源事件。
- 所有 Score 绑定至少一个 evidence event；Artifact、补丁、测试和证据页只读取当前 Battle 数据。

## 视觉基线

| 画面 | 文件 |
|---|---|
| 首页桌面 / 单一 Idea / 移动端 | `v052-home-desktop-20260725.png` / `v052-home-single-idea-desktop-20260725.png` / `v052-home-mobile-20260725.png` |
| 已验证 Live Arena / 移动端 | `v052-verified-live-desktop-20260725.png` / `v052-verified-live-mobile-20260725.png` |
| Fatal 接管 | `v052-verified-fatal-desktop-20260725.png` |
| Evidence Lens | `v052-evidence-lens-desktop-20260725.png` |
| Artifact Viewer + Mini App | `v052-artifact-viewer-desktop-20260725.png` |
| Champion Reveal / Passport | `v052-champion-reveal-desktop-20260725.png` / `v052-passport-desktop-20260725.png` |
| Live AI Degraded | `v052-live-ai-degraded-desktop-20260725.png` |
| 真实分片与活动流 | `v052-live-runtime-3-stream-progress-20260726.png` |
| 真实完成态 | `v052-live-runtime-3-complete-20260726.png` |
| 真实 Artifact Mini App | `v052-live-runtime-3-artifact-miniapp-20260726.png` |
| 真实 Evidence Lens | `v052-live-runtime-3-evidence-lens-20260726.png` |
| 真实 Champion Reveal / Passport | `v052-live-runtime-3-champion-reveal-viewport-20260726.png` / `v052-live-runtime-2-champion-passport-20260725.png` |

## 自动化质量门

- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test`：354/354 通过（265 root + 12 contracts + 18 API + 59 web）。
- `pnpm e2e`：12 通过，2 条按视口配置跳过；覆盖 verified_replay、live_runtime 成功闭环、降级态和移动端横向溢出检查。
- `pnpm build`：通过，Vite 74 modules transformed。

## StepFun 运行时依据

第一场真实运行曾在 judge 阶段因 `finish_reason=length` 返回不完整 JSON。修复后，judge / artifact 采用更高输出预算，截断进入有限 schema repair 循环，并使用真实 Abort deadline；实际流式分片只上报安全元数据，不暴露模型内容。即使模型在首个 2.5 秒心跳前完成，完成事件也会持久化最终 `streamChars`。此后两场真实 Battle 均完整到达作品与冠军。

- [StepFun 异常说明](https://platform.stepfun.com/docs/zh/guides/developer/exception)
- [StepFun JSON Mode](https://platform.stepfun.com/docs/zh/guides/developer/json-mode)

## 2026-07-26 产品体验复审增量

- 冠军页“查看战斗回放”现在进入 `mode=live_runtime&replay=1`，从本地事件存储的 `1/142` 开始渐进播放；支持暂停、继续与重新播放，不再直接落到完成态。
- 回放只使用当前游标前的 `visibleEvents` 投影作品、证据、评分与冠军。浏览器在 `12/142` 暂停时，证据镜仅显示当时已经出现的关联证据，未提前暴露冠军作品或完整评分。
- 三张 Agent 卡片按各自 `teamId` 投影提案、防守、补丁、测试和 Mini App；稳健构建者、传播设计师、架构黑客的作品内容与标题均不同，只有传播设计师显示冠军作品“绿途小队”。
- 规则按钮已可展开竞技规则；分享按钮会复制当前 URL；作品与证据入口包含队伍名作为可访问名称。
- 对抗复审确认此前五项高/中风险均关闭：未来事件泄漏、跨队防守串线、空回放冠军泄漏、护照旅程混队、重复可访问名/惰性按钮。

### 增量截图

| 验收点 | 文件 |
|---|---|
| 实时冠军回放从头开始 | `v052-live-runtime-replay-from-start-20260726.png` |
| 回放早期证据隔离 | `v052-final-live-replay-evidence-isolation-20260726.jpg` |
| 真实稳健构建者独立作品 | `v052-final-live-safe-artifact-audit-20260726.jpg` |
| 已验证稳健构建者 / 冠军作品差异 | `v052-verified-safe-artifact-distinct-20260726.png` / `v052-verified-champion-artifact-distinct-20260726.png` |

### 最终自动化门禁

- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test`：357/357 通过（265 root + 12 contracts + 18 API + 62 web）。
- `pnpm e2e`：12 通过，2 条按 viewport 配置跳过；覆盖黄金回放、真实 SSE、刷新恢复、三队作品差异、早期证据隔离、冠军回放和 390px 页面级溢出。
- `pnpm build`：通过，Vite 74 modules transformed。
- `git diff --check`：通过（仅存在仓库行尾转换提醒，无 whitespace error）。
