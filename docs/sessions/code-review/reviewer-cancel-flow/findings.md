# Adversarial Review — Cancel Flow End-to-End

Date: 2026-07-10
Reviewer: reviewer-cancel-flow

## CRITICAL

1. **app/api/battles/[id]/start/route.ts:33–46** — AbortController is registered and then immediately cleared in the same synchronous tick. `runBattleFromPayload()` calls `runDemoBattle()` which is fully synchronous (uses pre-built demo fixtures, no `await` on any external service). The `finally` block at line 45 runs immediately after `runBattleFromPayload` returns, so the controller is always gone before any cancel request can arrive. The entire cancel pipeline (register → cancel → abort → signal reaches OpenAI) is dead code in the current implementation.

2. **lib/api/guards.ts:293–332 + app/api/battles/[id]/start/route.ts:33** — The AbortController is registered in the start route, but the AbortSignal from that controller is never threaded into any runtime. `runBattleFromPayload` calls `runDemoBattle` (synchronous, fixture-based), not `MastraRuntime`. Even if a cancel request beat the `finally` block (it cannot — sync code), there would be no `AbortSignal` consumer to abort. The signal is created, stored, and discarded without ever being connected to anything.

3. **components/live-battle-client.tsx:137–152** — `handleCancel` calls `cancelCurrentBattle` server-side, then unconditionally navigates to `/battles` regardless of whether the cancel actually worked. If the server returns `{ cancelled: false, status: "not_running" }` (which will always happen given #1), the client still redirects. The user loses their place with no feedback that cancel was a no-op. The response body (`cancelled` boolean) is parsed but never read.

## HIGH

1. **components/round-progress-bar.tsx:57–67** — No loading state on the cancel button. The button is immediately re-clickable after a click. A double-click fires two POST requests to the cancel endpoint. With the current implementation (#1), this is harmless but if the pipeline were wired, two concurrent cancel requests racing a still-pending battle could trigger `controller.abort()` twice (second call is a no-op per AbortController spec, but the UX shows no feedback). More importantly, if the first click is still in-flight (network slow), the button stays enabled and the user could believe the cancel failed.

2. **lib/api/guards.ts:316–323** — `cancelCurrentBattle` calls `controller.abort()` but never removes the controller from the registry after aborting. If the start route's `finally` block does NOT run (e.g., a future async start route that hasn't completed yet), the aborted controller stays in the `abortControllers` Map indefinitely. Any subsequent call to `cancelCurrentBattle(id)` will return `true` (the controller is still there) but calling `abort()` on an already-aborted controller is a no-op. A subsequent `registerAbortController(id)` call will correctly abort the stale controller at line 304, so the leak is bounded by one entry per battle ID, but there is no explicit cleanup path.

3. **components/live-battle-client.tsx:98–102** — The SWR poll interval is 2 seconds, but the cancel button visibility (`canCancel`) depends on `status.canCancel`. If the status endpoint returns `canCancel: false` (battle already complete or never started) but the user somehow has the live page open, the button should be hidden — it is. However, there is no visual indication when a cancel IS in progress (no spinner, no disabled state), so the user clicks, sees nothing change for up to 2 seconds, and may click again.

## MEDIUM

1. **lib/api/guards.ts:300–309** — `registerAbortController` aborts any existing controller for the same battle ID. If a start route handler is interrupted (e.g., process restart in serverless), the controller from the previous instance is aborted when the new instance registers. This is correct behavior, but `__resetAbortControllers()` (used in test setup) aborts all controllers without clearing individual registrations first. If tests run concurrently in the same process, one test's `__resetAbortControllers()` could abort another test's in-flight controller.

2. **app/api/battles/[id]/cancel/route.ts:18** — `cancelCurrentBattle(id)` is called without awaiting any async work. Since the current implementation is sync, this is fine, but the route has no try/catch around it. If a future implementation makes `cancelCurrentBattle` async (e.g., to flush event store writes), an unhandled rejection would crash the route handler, resulting in a 500 to the client instead of a graceful `{ cancelled: false }` response.

3. **components/live-battle-client.test.tsx:62–87** — The "does not redirect to /battles when cancel fetch fails" test validates that `router.push` is NOT called when fetch rejects. However, it only tests the network-error path (`Promise.reject`). It does NOT test the HTTP-error path (e.g., server returns `{ cancelled: false, status: "not_running" }` with a 200 status). Given finding #3 under CRITICAL, this is the more important path — the client SHOULD not redirect when `cancelled: false`, but currently does because the response body is never inspected. The test passes but doesn't catch the bug.

4. **lib/api/guards.ts:293** — The `abortControllers` Map is module-level and never scoped per-process. In Vercel serverless, cold starts create a new module instance per invocation, so the map resets. But within a warm container, controllers persist across requests indefinitely if neither the `finally` block nor `__resetAbortControllers()` runs. For a production deployment with multiple warm containers, there is no way to query or list orphaned controllers.

5. **components/live-battle-client.test.tsx:39** — `vi.useFakeTimers()` is enabled in `beforeEach` but only the cancel test advances timers (`vi.advanceTimersByTimeAsync(100)`). The first test ("updates elapsedSec via setInterval") uses `vi.advanceTimersByTime(3000)` which is synchronous. If `handleCancel` ever introduces a `setTimeout` (e.g., a debounce or timeout fallback), the fake timers will intercept it without the test author necessarily realizing — the cancel test's `advanceTimersByTimeAsync(100)` suggests this is a known concern but the first test doesn't follow the same pattern.

## Summary

- Critical: 3, High: 3, Medium: 5

The cancel flow is architecturally wired but functionally inert. The AbortController registry, the `MastraRuntime` signal threading, and the cancel route all exist, but they are connected by a synchronous `runDemoBattle()` call that renders the entire mechanism dead code. The client-side redirect after cancel is unconditional, so the user always leaves the page regardless of whether anything was actually cancelled. The test suite validates the happy path (mocked guards returning `true`/`false`) but does not test the integration between the client response inspection and the redirect decision.
