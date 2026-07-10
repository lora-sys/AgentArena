# Adversarial Review — Live Page UI (Stage 2)

Date: 2026-07-10
Reviewer: reviewer-ui-live

---

## CRITICAL

### 1. `components/live-battle-client.tsx:149` — `elapsedSec` never updates without re-render

```tsx
const elapsedSec = Math.floor((Date.now() - startedAtRef.current) / 1000);
```

`elapsedSec` is computed directly in the render body from `startedAtRef.current`. There is no `setInterval`, no `useState` tick, and no `forceUpdate`. The value is frozen at whatever second the component last rendered (i.e. when `status` changes via SWR poll). The timer in `RoundProgressBar` will appear stuck — it only increments every 2 seconds when the poll lands, or never at all if the user is not on the default tab (browsers throttle SWR polling when tabs are hidden, and `visibilitychange` revalidation may not fire reliably). A user watching the live page will see "0:00 elapsed" for the entire battle on most tabs.

**Fix**: Use a `useEffect` with `setInterval(() => forceUpdate, 1000)` or store `elapsedSec` in state.

---

### 2. `lib/sse-client.ts:136-141` — `onmessage` swallows the SSE `event:` field; typed server events are never delivered

```tsx
source.onmessage = (e: MessageEvent<string>) => {
  const envelope = parseSseMessage(`data: ${e.data}`);
  if (envelope) {
    handleMessage(envelope.data);
  }
};
```

The server is almost certainly sending typed SSE events using the `event:` field (this is the standard SSE pattern, and the schema types `eventType` map cleanly onto SSE event names). This client only listens to `onmessage`, which fires for messages with no `event:` field. Any server sending `event: proposal_created\ndata: {...}` will never reach the handler. It then re-wraps the raw `e.data` as a single `data:` line and calls `parseSseMessage`, which extracts `eventType: "message"` and feeds the raw JSON into `assertBattleEvent` — which will fail because `eventType` is a required `BattleEventType` enum and `"message"` is not a valid value. Every event will land in `onValidationError` and be silently discarded via `dispatch({ type: "invalid" })`.

**Fix**: Register `source.addEventListener(eventType, handler)` for each known `BattleEventType`, or at minimum use `source.onmessage` plus parse the SSE envelope properly from `e.data` without fabricating an envelope. Alternatively, set up a single generic `onmessage` that checks `e.type` if EventSource dispatches via event listeners.

---

### 3. `components/live-battle-client.tsx:154` — race condition: SWR response can overwrite live SSE state

The component maintains two parallel sources of truth for agent status:
- **SWR poll** (`agentStates` from `/status`, every 2s) — drives `AgentStatusCard` props.
- **SSE event stream** (`state.events`) — drives the timeline only.

If the server emits an SSE event for `score_created` that updates a team's score, the UI does not reflect it until the next 2s poll cycle lands. Worse, if the poll arrives mid-stream with a stale snapshot (the server may not have committed the score to the snapshot table yet), the UI will flicker: score appears, disappears, reappears. The reducer for SSE events has no `agentStates` field — SSE events are write-only to the timeline. There is no deduplication or merge logic.

Additionally, the `useEffect` for SSE at line 105 dispatches `{ type: "reset" }` on `battleId` change, which wipes `state.events` to `[]`. If the user navigates from `/battle/A/live` to `/battle/B/live` (or the same page via remount), the event timeline resets but the `startedAtRef.current = Date.now()` is also reset — the elapsed timer jumps backwards. There is no key-based remount strategy or memo on `LiveBattleClient` to prevent this if Next.js reuses the component across param changes within the same route segment.

**Fix**: Merge SSE events into the same `agentStates` map that SWR populates, or use SSE as the primary source and SWR only as a fallback reconnect bootstrap.

---

### 4. `app/battle/[id]/live/page.tsx:12` — hardcoded `currentRound="cross_attack"` on AppShell

```tsx
<AppShell active="battle" showRail currentRound="cross_attack">
```

The server component renders `AppShell` with a hardcoded `currentRound` of `"cross_attack"` regardless of the actual battle state. This is a hydration mismatch risk if `AppShell` reads its own `currentRound` from URL or props and uses it to highlight a nav item — the server renders "cross_attack" but the client (if it were to derive the round from the battle) would show something else. More critically, this prop will silently lie to users on a `proposal_round` battle: the breadcrumb / nav will say "Cross Attack" the entire time.

**Fix**: Pass the actual current round from the battle data, or remove the prop if not needed.

---

## HIGH

### 5. `components/live-battle-client.tsx:95-96` — `startedAtRef` resets on every effect run, even on revalidation

```tsx
const startedAtRef = useRef<number>(Date.now());
// ...
useEffect(() => {
  startedAtRef.current = Date.now();
  dispatch({ type: "reset" });
  // ...
}, [battleId]);
```

On mount, `startedAtRef.current` is initialized to `Date.now()`. The effect immediately overwrites it to `Date.now()` again. The `initialLiveState` is dispatched before SSE connects. This means: every time `battleId` changes (even by accident, e.g. URL normalization), the timeline is wiped and the timer resets. If a user shares a URL and another user opens it after a few seconds, they'll see "0:00 elapsed" and zero events even though the battle started 4 minutes ago.

There is no server-provided `startedAt` or `battles.startedAt` field used to anchor the timer.

**Fix**: Fetch the battle's `createdAt` (or `startedAt`) from the status endpoint and seed `startedAtRef.current` from that.

---

### 6. `components/agent-status-card.tsx:119` — `aria-live="polite"` on the placeholder text for pending/in_flight

```tsx
<p className="agent-status-stream muted" aria-live="polite">
  {state === "pending" ? "Waiting for turn…" : "Dispatching to model…"}
</p>
```

This paragraph has `aria-live="polite"`. Every time SWR polls (every 2s) and re-renders the component with the same `state` value, React will not re-render the text content (same string) so screen readers won't announce it. However, the `role="status"` on line 101 + `aria-live="polite"` on the pill at line 102 creates **two concurrent live regions** for the same state. When the state changes, both regions will announce — once for the pill and once for the body — producing a double announcement. Screen reader users will hear "Streaming, Streaming" or "Pending, Waiting for turn…" in rapid succession.

**Fix**: Use a single live region. Either remove `aria-live` from the body text or remove `role="status"` from the pill (one of the two is redundant).

---

### 7. `components/live-battle-client.tsx:137-147` — `handleCancel` swallows errors and always redirects to `/battles`

```tsx
const handleCancel = useCallback(async () => {
  try {
    await fetch(`/api/battles/${encodeURIComponent(battleId)}/cancel`, { method: "POST" });
  } catch {
    // Even if cancel fails, redirect so the user is not stuck on a stale page
  }
  router.push("/battles" as Parameters<typeof router.push>[0]);
}, [battleId, router]);
```

Two problems:

1. **No confirmation dialog.** The cancel button is one click — no `confirm()`, no modal. A misclick cancels the entire battle irreversibly. The PRD (§11.2) does not specify confirmation flow, but irreversible actions without confirmation are a UX defect.

2. **Always redirects to `/battles`.** Even if the cancel POST succeeds and the battle has a result page (e.g. `cancelled` status), the user is bounced to the listing. They lose the cancellation evidence. The comment "so the user is not stuck on a stale page" suggests this is a workaround for the fact that there's no cancelled-status page route.

3. **The `as Parameters<typeof router.push>[0]` cast is a code smell.** It bypasses type checking on the route argument. If `"/battles"` is not in the typed routes list, this will silently allow invalid routes. The actual route in the app is `/battles` (plural, the listing page) — but there's no guarantee the type system accepts this.

**Fix**: Add a confirmation step. After cancellation, redirect to the battle's result page if the API returns a `redirect` field, or show a "Cancellation requested" inline message.

---

### 8. `components/live-battle-client.tsx:101` — `revalidateOnFocus: true` causes re-render storm on every tab switch

```tsx
const { data: status, error: statusError } = useSWR<BattleStatus>(
  `/api/battles/${encodeURIComponent(battleId)}/status`,
  fetchStatus,
  { refreshInterval: 2000, revalidateOnFocus: true },
);
```

Combined with `refreshInterval: 2000`, focusing the tab fires an immediate fetch on top of the next scheduled poll. If the user toggles between tabs or windows, this can cause 4-6 fetches in rapid succession (focus + interval catch-up). Each fetch updates `status` → triggers re-render of all 3 `AgentStatusCard` children → dispatches `useReducer` if SSE also fires in the same tick.

For a live battle page that is explicitly designed to be watched, this is an unnecessary render storm.

**Fix**: Use `revalidateOnFocus: false` (the 2s poll is the cadence), or use `refreshWhenHidden: false` to pause polling when tab is hidden.

---

### 9. `components/agent-status-card.tsx:116` — `streamedText || (state === "fallback" ? "Engine fell back to mock output." : " ")` renders literal space for complete state with no streamed text

```tsx
{streamedText || (state === "fallback" ? "Engine fell back to mock output." : " ")}
```

When `state === "complete"` and `streamedText === ""` (server-side score with no streamed body), the component renders a single space character `" "`. This:
- Causes a 1-character line of empty visual space (minor layout shift).
- Will be announced by screen readers as... nothing (space). But the `aria-live` region (line 114) will announce the empty string, which some screen readers handle by saying "blank".
- Is a sign of a missing data path: a `complete` state should not have empty streamed text. Either the server is not sending the text, or the client should display a different fallback.

**Fix**: For `complete` state with no streamed text, show a static "Completed (no output recorded)" or similar. Don't render whitespace.

---

### 10. `components/live-battle-client.tsx:136` — `clearTimeout(openTimer)` fires even if the timer already executed

The cleanup function at line 130 calls `clearTimeout(openTimer)` unconditionally. `clearTimeout` on an already-fired timer is a no-op, so this is harmless but indicative of a deeper problem: the "open" status dispatch at line 127 fires after 100ms regardless of whether the SSE connection actually opened. There is no `onopen` handler in the SSE client (the SSE client itself doesn't expose one). The status display will show "open" 100ms after mount even if the SSE connection failed.

**Fix**: Expose an `onOpen` callback from the SSE client and wire it to `dispatch({ type: "status", status: "open" })`.

---

## MEDIUM

### 11. `components/live-battle-client.tsx:12` — `BattleEvent` import path

```tsx
import type { BattleEvent } from "@/arena/schemas/types";
```

The path `@/arena/schemas/types` — checking `arena/schemas/types.ts` confirms this exports the type, and the `@/` alias maps to the repo root (which contains `arena/`). This works, but `lib/sse-client.ts` imports the same type from `@/arena/schemas` (the barrel). Two different import paths for the same type creates a maintenance hazard: if someone changes the barrel to re-export from a different file, the two paths will diverge and TypeScript will report them as distinct (nominal) types in stricter configs.

**Fix**: Standardize on `@/arena/schemas` (the barrel).

---

### 12. `components/round-progress-bar.tsx:57` — cancel button not disabled during pending cancel request

```tsx
{canCancel ? (
  <button type="button" className="round-progress-bar-cancel" onClick={onCancel} aria-label="Cancel battle">
    <XCircle size={16} aria-hidden="true" />
    Cancel
  </button>
) : null}
```

The cancel button has no `disabled` state. After a user clicks it once, the fetch takes some time (network round-trip), during which the button remains clickable. A second click fires a second POST to `/cancel`. If the first request succeeded and the second is in-flight when the battle is already in `cancelled` state, the second request may 409 or silently no-op, confusing the user.

**Fix**: Add a local `isCanceling` state; disable the button and swap the label to "Cancelling…" while in-flight.

---

### 13. `components/live-battle-client.tsx:199` — event timeline has no virtualization for long battles

```tsx
{state.events.map((event) => ( ... ))}
```

A 6-round battle can produce 100+ events (proposal, cross-attacks, defenses, judging per round). All rendered as DOM nodes with no virtualization. For a battle that runs 4 minutes and emits ~2 events/sec, the DOM will have 480+ nodes by the end. Each SWR poll (every 2s) re-renders the parent, which re-renders all event rows even if their props didn't change (no `React.memo`).

**Fix**: Wrap each event row in `React.memo` keyed on `event.id`, or paginate the timeline to the last 50 events.

---

### 14. `components/live-battle-client.tsx:104-135` — `useEffect` has `battleId` in deps but no guard against rapid `battleId` changes

If `battleId` changes twice rapidly (e.g. user pastes a new URL while one page is still loading), the cleanup of the first effect runs `handle.close()`, then the second effect calls `handle.close()` again on `handleRef.current` which is already null (because the first cleanup set it to null). This is safe, but the `openTimer` for the first effect is never cleared — it's set to fire after 100ms and `clearTimeout` is called in the cleanup, but if the cleanup runs AFTER the timer already fired, the `dispatch({ type: "status", status: "open" })` from the first timer may land AFTER the second effect's `dispatch({ type: "status", status: "connecting" })`, causing a flicker from "connecting" → "open" → "open".

**Fix**: Use a ref to track the current "generation" and only dispatch if the generation still matches.

---

### 15. `components/agent-status-card.tsx:95` — `aria-label` on `<article>` conflicts with `<strong>` heading

```tsx
<article className="agent-status-card" ... aria-label={`${teamName} agent status: ${label}`}>
  <header className="agent-status-head">
    <strong className="agent-status-name">{teamName}</strong>
```

The `aria-label` on the `<article>` provides an accessible name for the landmark. Inside, `<strong>` is used for the team name. Screen readers will announce "Safe Builder agent status: Streaming, Safe Builder" (the aria-label first, then the strong text). The strong text duplicates the team name. Either remove the `aria-label` and let the `<strong>` serve as the heading (mark it with `<h3>` and `role="heading"`), or remove the `<strong>` team name (redundant with the label).

**Fix**: Change the inner team name to an `<h3>` with no `aria-label`, or remove the inner team name.

---

### 16. `components/live-battle-client.tsx:158-162` — error banner never clears after a transient failure

```tsx
{statusError ? (
  <div role="alert" className="error-banner">
    <span>Polling error: {statusError.message}</span>
  </div>
) : null}
```

`statusError` from SWR is sticky until the next successful fetch. If the first poll fails (e.g. the battle hasn't been created yet and returns 404), the error banner will remain for the entire page lifetime even if subsequent polls succeed. SWR does not automatically clear `error` on a successful response — it clears `error` only when `keepPreviousData` is configured with specific behavior, which it is not here.

**Fix**: Use `useSWR` with `shouldRetryOnError: false` and clear the error manually on successful poll, or use SWR's `error.retryCount` logic.

---

### 17. `components/round-progress-bar.tsx:70-74` — progress bar `aria-hidden="true"` but the visual percentage is not announced

```tsx
<div className="round-progress-bar-track" aria-hidden="true">
  <span className="round-progress-bar-fill" style={{ width: `${progressPct}%` }} />
</div>
```

The visual progress bar is correctly hidden from screen readers (it's decorative). However, there is no accessible alternative. The `aria-label="Round progress"` on the `<section>` and the "Round 3 of 6" text give partial info, but a screen reader user doesn't know what fraction of the battle is complete.

**Fix**: Add an `aria-valuenow`, `aria-valuemin`, `aria-valuemax` on the fill `<span>` and remove `aria-hidden`, or add a visually-hidden text node: `<span className="sr-only">{Math.round(progressPct)}% complete</span>`.

---

### 18. `components/live-battle-client.tsx:36` — `TOTAL_ROUNDS = 6` is hardcoded

```tsx
const TOTAL_ROUNDS = 6;
```

The total rounds is a constant, but the PRD and battle config determine this dynamically. If a battle is configured with 4 or 8 rounds, the progress bar will be wrong. The `/status` endpoint should return `totalRounds`.

**Fix**: Add `totalRounds` to `BattleStatus` and use `status?.totalRounds ?? 6` (keep the constant as a default for SSR before first poll).

---

## Summary

- Critical: 4
- High: 6
- Medium: 8