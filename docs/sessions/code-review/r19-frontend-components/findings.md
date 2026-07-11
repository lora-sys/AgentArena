# R19 Frontend Components

Date: 2026-07-10

## CRITICAL

1. `components/header-actions.tsx:30` — SSR hydration mismatch: `shareUrl` is computed at render time (`typeof window === "undefined" ? "http://localhost:3000" : window.location.href`). Server renders the fallback string into HTML, client hydration computes the real URL — React throws hydration error. The mismatch value is rendered as text at line 167 inside the share dialog.

2. `components/replay-controls.tsx:20` — Same SSR hydration mismatch: `shareUrl` uses the identical `typeof window` ternary pattern. Server output `"http://localhost:3000/battle/demo/replay"` differs from client `window.location.href`. Rendered as text at line 62 inside the share dialog.

## Summary
- Criticals: 2