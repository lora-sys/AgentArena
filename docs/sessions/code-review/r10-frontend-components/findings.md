# Adversarial Review — Frontend Components (R10)

Date: 2026-07-10
Reviewer: r10-frontend-components

## CRITICAL

1. **components/header-actions.tsx:189** — `login` passed as `action={login}` on a `<form>` triggers a full browser page reload. The `action` prop in React forms runs the function and then submits the form to its URL by default. There is no `e.preventDefault()` (the function signature accepts `FormData`, not `React.FormEvent`), so after login state is set, the browser navigates away, destroying all React state and breaking the SPA. Fix: add a `name` attribute-free `onSubmit` handler with `e.preventDefault()` instead of `action`.

2. **components/attack-matrix.tsx:20-22 vs production data** — `ATTACKER_TEAMS` uses `safe_builder`, `viral_designer`, `infra_hacker` (underscores), but the actual `BattleEvent` `actorId`/`targetId` values use `safe-builder`, `viral-designer`, `infra-hacker` (dashes, per `TEAMS` in `live-battle-client.tsx:31-33`). The `cellAttacksFor` filter on line 27 will never match any real events, so the matrix permanently shows "Awaiting attacks..." or all empty cells. Fix: normalize the team ID format to match the event payload.

3. **components/battle-replay-client.tsx:78-86** — The `ResizeObserver` effect depends on `[status]`. When status transitions from "loading" → "ready", the observer is destroyed and recreated, but during this window `scrollContainerRef.current` may be null or the new DOM node may not have a measured height yet, leaving `viewportHeight` stuck at `DEFAULT_VIEWPORT_HEIGHT`. Fix: use `[]` dependency (observe once on mount) or observe the same element without dependency on status.

4. **components/battle-replay-client.tsx:126-128** — The `openTimer` (`setTimeout(..., 100)`) is not tracked in a ref and has no `cancelled` guard. If `battleId` changes within 100ms (rapid route navigation), the cleanup closes the SSE handle, but the timer still fires and dispatches `{ type: "status", status: "open" }` to the reducer for the now-closed connection, corrupting the connection state shown to the user. Fix: clear the timeout in the cleanup function.

5. **components/battles-table.tsx:98** — The `timeMatch` filter for "Last 7 days" uses `timeRange === "Last 7 days" && row.timeRange !== "All time"`, which matches rows with `timeRange === "Today"`, `"Week"`, or any non-"All time" value. This does not filter to "last 7 days" at all — it matches everything except "All time" entries. The filter UI is misleading. Fix: actually compare the `completed` date against a 7-day threshold, or use the `timeRange` field semantically.

## Summary
- Criticals: 5
