# R27 Frontend Components

Date: 2026-07-10

## CRITICAL

1. **components/replay-controls.tsx:37-41** — Unhandled promise rejection in `copy()` function. The `async` function calls `navigator.clipboard.writeText(shareUrl)` without try/catch, and the returned Promise from the `onClick` handler is discarded. When clipboard is unavailable (insecure context, denied permission, browser restriction), the rejection propagates as an unhandled rejection. Sibling component `header-actions.tsx` (line 47-53) correctly wraps this call in try/catch — the pattern is inconsistent.

## Summary
- Criticals: 1