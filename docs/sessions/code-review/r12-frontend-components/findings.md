# R12 Frontend Components

Date: 2026-07-10

## CRITICAL

1. **components/live-battle-client.tsx:126-128** — `openTimer` dispatches `status: "open"` unconditionally after 100ms, racing against `onConnectionError` which sets `"reconnecting"`. If the SSE connection fails immediately (e.g. 502), the error fires `reconnecting`, then the 100ms timer overrides it to `open` even though the connection never succeeded. The UI status indicator lies about the real connection state.

2. **components/artifact-viewer.tsx:7-24** — `active.content` is dereferenced without guarding against `active` being `undefined`. When `demoBattle.artifacts` is empty (P0 fixture has none, or after artifact cleanup), `useState(demoBattle.artifacts[0]?.id)` yields `undefined`, `find()` returns `undefined`, and line 24 `active.content` throws `TypeError: Cannot read properties of undefined`. React will crash the page.

3. **components/arena-cards.tsx:194** — React `key={ "${attack.from}-${attack.to}-${attack.claim}" }` collides when two attacks share the same attacker, target, and claim text (common in cross-attack rounds where teams duplicate critiques). Duplicate keys cause React reconciliation to skip/substitute DOM nodes and lose component state.

4. **components/event-drawer.tsx:98-106** — Focus-restoration `useEffect` captures `document.activeElement` on every `[open]` change. When `open` transitions `true → false`, the cleanup of the previous effect focuses the opener, but the new effect immediately overwrites `previousFocusRef.current` with `document.activeElement` (now the drawer being blurred). Any subsequent close-from-different-trigger loses the real opener reference and focuses the wrong element.

## Summary
- Criticals: 4
