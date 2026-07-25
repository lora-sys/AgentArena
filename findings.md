# Adversarial Review — #34 Live Arena + Fatal Takeover

Date: 2026-07-25
Reviewer: Codex

## CRITICAL

None.

## HIGH

1. `apps/web/src/components/hp-bar.tsx` — recovery from 38 to 68 inherited the linked attack's `fatal` severity and reopened the takeover with `-0` damage. Fixed by requiring an actual HP decrease in `isFatalHpHit`; regression test covers 88→38 and 38→68.
2. `apps/web/src/components/ArenaStage.tsx` — the per-event fatal guard was never reset, so pressing Replay could not show the fatal takeover a second time. Fixed by resetting the guard when playback returns to batch zero.

## MEDIUM

1. `apps/web/src/data/verified-showcase.ts` bundles the verified fixture into the web build because the current API route still serves the legacy fixture. This keeps the verified route correct without modifying the P2-owned API, but should be removed when the API switches its fixture import.
2. `apps/web/src/components/BattleWorkspace.tsx` still uses the legacy Evidence Drawer as the callback consumer. It proves automatic evidence expansion, but issue #39 must replace the presentation with the final three-state Evidence Lens.
3. Animation video capture remains unavailable because the execution policy rejects `agent-browser record`; screenshots and live runtime inspection are present, but the required MP4/WebM must still be captured in an unrestricted local terminal.

## Summary

- Critical: 0
- High: 2, both fixed
- Medium: 3, tracked integration/evidence dependencies

---

# Adversarial Review — #35 Artifact Modal Shell

Date: 2026-07-25
Reviewer: Codex

## CRITICAL

None.

## HIGH

1. `apps/web/src/components/ArenaStage.tsx` — the inline `onClose` function changed on every replay render, forcing the modal effect to clean up and reinstall while open; cleanup could restore focus outside the dialog during playback. Fixed with a stable `useCallback`, with a parent-rerender focus regression test.

## MEDIUM

1. `apps/web/src/components/artifact-modal.tsx` — the shell intentionally renders empty panels even when an `ArtifactBundle` is present. This matches #35 scope, but #36–#38 must replace each placeholder without weakening the dialog and focus behavior.
2. Animation video capture remains unavailable because the execution policy rejects `agent-browser record`; desktop and 375px screenshots plus semantic browser snapshots are present.

## Summary

- Critical: 0
- High: 1, fixed
- Medium: 2, tracked follow-up/evidence dependencies

---

# Adversarial Review — #36 Artifact Versions + Mini App

Date: 2026-07-25
Reviewer: Codex

## CRITICAL

None.

## HIGH

1. `apps/web/src/components/artifact-modal.tsx:24` — `activeTab` survived close/reopen. Repro: open any artifact, select “补丁差异”, close, then open the verified viral artifact; the modal reopened on the empty patch panel and hid the #36 version comparison. Fixed by resetting on close, with a regression test.

## MEDIUM

1. `apps/web/src/data/verified-showcase.ts:42` — the unified-diff restoration intentionally reconstructs only the recorded hunk, not an unrecorded full source file. The UI must continue presenting it as verified fixture content and must not imply missing lines were recovered.
2. `apps/web/src/components/mini-app-demo.tsx:35` — the generated count can be 5–20 while only three static sample questions are rendered. This meets the placeholder-demo scope, but the presentation should remain clearly understood as a sample rather than a complete generated set.
3. Required agent-browser video remains blocked by host execution policy; screenshots and semantic interaction evidence exist, but no WebM was created.

## Summary

- Critical: 0
- High: 1, fixed
- Medium: 3, tracked scope/evidence constraints

---

# Adversarial Review — #37 Artifact Patch / Tests / Evidence

Date: 2026-07-25
Reviewer: Codex

## CRITICAL

None.

## HIGH

1. `apps/web/src/components/ArenaStage.tsx:90` — selecting linked evidence permanently pinned that historical event into the five-row live Event Stream because `focusedEvidenceId` was never cleared. After one evidence jump, the stream silently stopped being a true “latest five” view. Fixed by expiring the focused/pinned state after a short verified highlight window.

## MEDIUM

1. `apps/web/src/components/artifact-tab-tests.tsx:5` — the six-column explanatory copy is intentionally keyed to the three golden fixture test IDs because the public `TestResultPayload` carries only id/name/passed. A future fixture ID requires new localized detail copy or will correctly show “fixture 未记录”.
2. `apps/web/src/components/artifact-tab-patch.tsx:11` — lines beginning with unified-diff control prefixes are treated as metadata. This is correct for the verified patch but is not a general-purpose multi-file diff parser.
3. Agent-browser semantic and screenshot evidence is complete; issue #37 does not require video, so no recording gap applies here.

## Summary

- Critical: 0
- High: 1, fixed
- Medium: 3, bounded by fixture/contract scope

---

# Adversarial Review — #38 Artifact Live Degraded

Date: 2026-07-25
Reviewer: Codex

## CRITICAL

None.

## HIGH

1. `apps/web/src/components/BattleWorkspace.tsx:20` — returning from a non-golden live battle navigates to BA-2026-0024, but the loader retained the old battle object and had no stale-promise guard. A slow old request could overwrite the new verified route or flash mismatched evidence under the verified badge. Fixed by clearing route-bound state immediately and ignoring responses after effect cleanup.

## MEDIUM

1. `apps/web/src/components/artifact-live-degraded-card.tsx:15` — the reusable card accepts an optional return callback, so an isolated caller could render a no-op CTA. The production Modal path supplies it from `BattleWorkspace`; future isolated reuse should make the callback mandatory or provide navigation context.
2. `apps/web/src/components/artifact-modal.tsx:79` — degraded detection relies on `artifact` being absent. This is correct only because `ArenaStage` explicitly refuses to inject the golden fixture outside `verified_replay`; bypassing that boundary would leak fixture content into live mode.
3. Issue #38 has no video requirement; desktop, 390px, semantic state-switch evidence and design-tone comparison are present.

## Summary

- Critical: 0
- High: 1, fixed
- Medium: 3, integration constraints documented
# Adversarial Review — #39 Evidence Lens

Date: 2026-07-25
Reviewer: Codex

## CRITICAL
None.

## HIGH
1. `apps/web/src/components/ArenaStage.tsx` — 致命接管与证据镜曾同时保持打开，两个 overlay 的 body scroll lock 清理会互相覆盖；自动展开前先关闭 FatalTakeover，已修复。
2. `apps/web/src/components/ArenaStage.tsx` — 自动展开使用未清理的 timeout，组件卸载或回放批次切换后仍会写状态；effect 现在返回 clearTimeout，已修复。
3. `apps/web/src/components/ArenaStage.tsx` — 内联 `onClose` 会让 Modal 焦点 effect 每次父组件渲染都重跑并抢焦点；改为稳定 callback，已修复。
4. `apps/web/src/components/ArenaStage.tsx` — 自动展开在接管关闭按钮可操作期间抢占指针，破坏三次回放；延后到接管展示末段，并在主动关闭/查看时取消 timer，已由 E2E 复现后修复。
5. `apps/web/src/components/ArenaStage.tsx` — timer 原先依附回放 batch effect，播放器推进下一批次会在 4.5 秒前清理它，导致“自动展开”永远不发生；生命周期改绑 `fatalEvent`，已由 agent-browser 复现后修复。
6. `apps/web/src/components/ArenaStage.tsx` — Modal 标题总分曾复用实时 Proof HP（自动展开时为 68），与六维明细合计 87 矛盾；黄金证据镜总分固定读取已验证裁决 87，已修复。

## MEDIUM
1. `apps/web/src/components/ArenaStage.tsx` — 黄金六维明细目前是 v0.5.2 的前端展示适配，底层 fixture 仍是旧六维字段；合并前不伪称为实时数据，后续应由 fixture contract 原生提供。
2. `apps/web/src/components/evidence-lens-modal.test.tsx` — 三态与 Escape 已覆盖，但焦点循环/恢复暂由 Artifact Modal 的同构实现间接兜底；可在后续回归补专门用例。

## Summary
- Critical: 0
- High: 6 (fixed)
- Medium: 2
