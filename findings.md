# Adversarial Review — #34 FatalTakeover

Date: 2026-07-25
Reviewer: Codex

## CRITICAL

None.

## HIGH

1. `apps/web/src/components/fatal-takeover.tsx:102` — `role="alertdialog"` declared a modal, but keyboard focus could tab into the battle controls behind it and the page remained scrollable. Fixed after review with focus containment, scroll locking, focus restoration, and Escape dismissal.

## MEDIUM

1. `apps/web/src/components/ArenaStage.tsx:26` — the verified fatal takeover is only guaranteed through the `?fatal=1` synthetic trigger until the shared severity contract exposes `fatal`. A normal replay cannot reliably enter this state from current typed fixture events. This is an integration dependency, not safe to solve by mutating the contract in this workstream.
2. `apps/web/src/components/fatal-takeover.tsx:52` — the animation duration parser falls back to 700ms when the CSS token is missing or malformed, which can hide a broken token import. The fallback preserves the demo but should be covered by a component test when a DOM test environment is added.

## Summary

- Critical: 0
- High: 1
- Medium: 2
