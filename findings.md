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
