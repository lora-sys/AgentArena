# Adversarial Review — Live Page Round 2

Date: 2026-07-10
Reviewer: reviewer-live-r2

## CRITICAL

1. **lib/sse-client.ts:107-112 — `namedHandler` registers the same function reference for every event type, causing EventSource to dispatch every typed event to every registered handler.** A message with `event: proposal_created` fires ALL 16 listeners because `source.addEventListener("proposal_created", fn)`, `source.addEventListener("attack_created", fn)`, etc. all share the same `fn` closure. Every event fires the handler 16 times. The fix should use a single listener function mapped by event type, or ensure each `addEventListener` uses a distinct handler closure that checks `e.type`. Result: every SSE event triggers 16 calls to `dispatch({ type: "event" })`, producing 16x event timeline entries per real event.

2. **lib/sse-client.ts:108 — `source.addEventListener` receives the `MessageEvent` with `e.data` of type `string` per the type annotation, but `source.onmessage` provides the same `MessageEvent<string>` interface, meaning both paths call `handleMessage(e.data)` with the same string. Combined with finding CRITICAL-1, each event fires `handleMessage` 17 times (16 named + 1 onmessage). If CRITICAL-1 is fixed, the duplicate dispatch via `onmessage` + one `addEventListener` for the matching event type still fires twice. The named listeners and `onmessage` are not mutually exclusive — typed events fire BOTH their named listener AND `onmessage`.**

## HIGH

1. **components/live-battle-client.tsx:126-128 — `openTimer` unconditionally dispatches `status: "open"` after 100ms regardless of whether the SSE connection actually opened.** If the connection fails (dispatches `"reconnecting"`), the timer still overwrites the status back to `"open"` 100ms after mount. The `setTimeout` callback has no guard. This means the UI shows "open" even when the EventSource is in a reconnecting/error state. The fix should either remove this timer entirely and rely on an `onOpen` callback from the SSE client, or add a condition checking the current status before dispatching.

2. **lib/sse-client.ts:127 — `backoff` is doubled on error and never reset on successful connection.** There is no `source.onopen` handler. Once a single transient error escalates `backoff` to `maxBackoffMs`, it remains at the max for the entire battle lifetime even if the connection is stable for hours. Any subsequent disconnect will wait the full max delay before reconnecting instead of starting from `initialBackoffMs`. Add `source.onopen = () => { backoff = initialBackoffMs; }` (and add an `onOpen` callback option for callers).

3. **components/live-battle-client.test.tsx — Missing coverage for the cancel success path.** The test file only verifies that cancel does NOT redirect on fetch failure (line 62-87). There is no test verifying that cancel DOES call `router.push("/battles")` when the fetch succeeds. The success path is the more critical flow (it's what users do 99% of the time) and currently has zero regression protection. The fix was specifically about the error path, but the error path is the one that was broken and already covered — the test does not validate that the normal redirect still works.

## MEDIUM

1. **components/live-battle-client.tsx:95-106 — `startedAtRef` is initialized at mount but immediately overwritten in the SSE effect.** Line 95 sets `startedAtRef.current = Date.now()` at mount, then line 106 sets it again inside the `useEffect`. The initial value on line 95 is dead — the effect runs on first mount before the 1-second interval first fires, so the timer reads the line-106 value. Minor waste; not a bug.

2. **components/live-battle-client.tsx:155-163 — Timer interval depends on `[]` (never re-created), but `startedAtRef.current` changes when `battleId` changes.** While this works correctly (the interval reads the current ref value on each tick), it means the timer continues ticking across battle transitions without reset of the interval closure. If `battleId` changes rapidly, the UI will show the elapsed time jumping because `startedAtRef` jumps forward but the interval keeps its 1s cadence. Functionally correct but fragile.

3. **components/live-battle-client.tsx:16-20 — `AgentStatePayload.score` is typed as `number` (required), but the mock in the test file (lines 21-23) assigns `score: undefined`.** This type mismatch is silently bypassed by `vi.mock()` which doesn't enforce types. In production, the status API may return `score: undefined` or omit the field, which would be a type-level lie. Consider making `score?: number` in the internal type for safety.

4. **lib/sse-client.ts:69-71 — Throws synchronously if `EventSource` is unavailable, but the caller (`live-battle-client.tsx`) calls `connectSse` inside a `useEffect` without a try/catch.** If this ever runs in an environment without `EventSource` (SSR, older browsers, test environments without the polyfill), the entire effect throws, React shows the error boundary, and the component is dead. The caller should either wrap in try/catch or `connectSse` should return `{ close: () => {} }` gracefully and call `onConnectionError` instead.

5. **components/agent-status-card.tsx:116 — Uses `streamedText || (state === "fallback" ? "..." : " ")` (falsy OR).** If `streamedText` is `"0"` (a valid string that is falsy), it falls through to the fallback message. The `streamedText` is unlikely to be `"0"` for agent output, but technically possible (e.g., a model returning empty streaming state with placeholder). Use `streamedText !== "" && streamedText !== undefined` instead.

## Summary
- Critical: 2, High: 3, Medium: 5