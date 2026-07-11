# R20 Frontend Pages

Date: 2026-07-10

## CRITICAL

1. app/agent/[id]/passport/page.tsx:275-290 — RACE CONDITION: "Passport not found" flashes on first load for ALL agents. The skeleton guard `if (!id)` only catches the pre-effect render. Once the useEffect fires and calls `setId(paramId)`, the component re-renders with `id` set but `result` still null (the async fetch hasn't resolved). At this point the `if (!result)` branch fires and renders "Passport not found" until the fetch completes. This affects every valid agent — the "not found" message briefly appears before the real passport loads. Fix: change the guard to `if (!result && !id) return skeleton; if (!result) return skeleton;` (load skeleton while result is null, only render "not found" after fetch resolves with null).

2. app/agent/[id]/passport/page.tsx:120 — UNSANITIZED PATH INJECTION: `agentId` from the URL param is interpolated directly into the fetch URL `/api/agents/${agentId}/passport` without `encodeURIComponent()`. A URL like `/agent/..%2F..%2Fadmin/passport` could produce `/api/agents/../../admin/passport`. The `loadAgentPassport` function and `loadFromDemoBundle` both receive the raw `agentId` and pass it to `bundle.scores[agentId as keyof typeof bundle.scores]` and `bundle.teams.find((t) => t.id === agentId)`. Use `encodeURIComponent(agentId)` in the fetch URL and validate the ID format.

3. app/agent/[id]/passport/page.tsx:390-404 vs app/agent/viral-designer/passport/page.tsx:111-127 — INCONSISTENT QUERY PARAMS ON EVIDENCE LINKS: Dynamic passport page links use `?attack=${claim.attackId}` but the static viral-designer passport page uses `?event=${claim.attackId}`. The replay page client (`components/battle-replay-client.tsx`) ignores both query parameters entirely — it fetches all events without filtering. Clicking evidence links from either passport page does not open the event drawer. One of the two URL formats is wrong, and both are dead links.

4. app/battle/[id]/result/page.tsx:235-237 — DUPLICATE STATE ON TRANSITION: When the battle ID changes mid-load, `useEffect` calls `setResult(null)`, `setError(null)`, `setLoading(true)` in sequence. If a previous fetch's `.then` already fired (setting `result` and `loading=false`), the new effect reset will clear result, then the old error state from a prior failed fetch persists alongside the skeleton. More critically: the conditions `{loading && skeleton}` and `{error && errorUI}` are independent, so if both are truthy (possible during rapid ID switches), both render simultaneously. Fix: use a single `phase` state machine ('loading' | 'error' | 'ready').

5. components/battle-replay-client.tsx:163-170 — VIRTUAL SCROLL HEIGHT HARDCODED: The scroll container's `style.height` is hardcoded to `${DEFAULT_VIEWPORT_HEIGHT}px` (600px) instead of using the `viewportHeight` state updated by ResizeObserver. The `visibleCount` calculation on line 91 uses `viewportHeight`, creating a mismatch between the actual visible area and the virtual scroll window. This can cause events to be clipped or blank space at the bottom depending on the real container height.

6. components/live-battle-client.tsx:106-151 — SSE EFFECT MISSING battleId RESET: When `battleId` changes, the SSE effect re-runs and resets `startedAtRef.current` and dispatches `{type: "reset"}`, clearing the event timeline. But the timer effect (line 183-197) has dependency `[]` and does NOT reset `elapsedSec` state. After a battle switch, `elapsedSec` still holds the old battle's elapsed time until the next interval tick, then resets to 0. This means the timer briefly shows the old battle's elapsed count after switching to a new battle. Fix: add `setElapsedSec(0)` to the SSE effect or reset it in a separate effect keyed on `battleId`.

## Summary
- Criticals: 6
