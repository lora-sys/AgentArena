# Current visual system

Agent Arena uses a dark sports-broadcast interface: navy-black surfaces, thin evidence borders, cyan/pink/amber team signals, Archivo Black headlines, Inter body copy, and IBM Plex Mono telemetry.

The authoritative visual and motion specifications are the engineering brief and browser prototype in `prototype/`. Current reviewed captures live in `docs/visual-reference/current/`; `legacy/` is historical reference only.

## Core layout contracts

- Landing `/`: statement, autoplay mini battle, template chooser, and exactly one editable Idea input.
- Live Arena `/battle/:id`: three evidence-bound fighter cards on desktop and an internal horizontal card rail on mobile. Each card exposes a safe persisted activity summary (`当前动作 / 观察 / 决策`), never raw chain-of-thought.
- Verified replay is a Live Arena mode, not another route; it starts at the briefing event and progressively projects the fixed event store.
- Fatal Attack, Evidence Lens, and Artifact Viewer are Live Arena takeovers/modals. Fatal keeps the `88 → -50 → 38` causal frame visible for 3200ms; Evidence and Artifact preserve the same evidence IDs across the handoff.
- Champion `/battle/:id/champion`: 1200ms reveal above a dense Team Passport with six dimensions, strengths, explicit weaknesses, improvements, and evidence journey.
- Champion 的“查看战斗回放”返回同一 Battle 的 `replay=1` 状态，从事件 1 渐进投影；已完成的 `live_runtime` 不得直接恢复为最终画面，也不得重新连接模型 SSE。
- 三张 Agent 卡片的“查看作品”严格按 teamId 投影各自 Proposal、Defense、Score 与 Evidence。非冠军显示“队伍方案快照”，冠军才显示最终 Artifact；底部作品演进在裁决后明确打开冠军作品。

## Tokens and behavior

Runtime tokens and responsive rules live in `apps/web/src/styles.css`. Visible status must not rely on color alone. Motion respects `prefers-reduced-motion`. Page-level horizontal overflow is forbidden at 390px; intentional fighter/template rails own their own horizontal scrolling.

Do not introduce Storybook or a second UI kit without a concrete reuse need. Prefer existing components and contracts in `apps/web/src/components`.

Live AI Degraded is a page-level takeover rather than a badge-only skin. It removes all fixed battle evidence, preserves an explicit demo-fallback badge, separates verified UI state from missing evidence, and returns to the golden replay after a pausable 10-second countdown.

## Visual QA

Check 1440×900 and 390×844, compare against the reference, exercise all primary controls, inspect console errors, and verify both `verified_replay` and one persisted `live_runtime` Battle before a demo release.
