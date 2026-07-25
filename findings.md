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
