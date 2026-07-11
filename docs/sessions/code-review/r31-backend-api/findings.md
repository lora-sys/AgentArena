# R31 Backend API

Date: 2026-07-10

## CRITICAL

1. `app/api/battles/[id]/events/stream/route.ts:21-32` — SSE route is not actually streaming. It calls `runBattleFromPayload` synchronously, concatenates all events into one string, and returns them in a single response body. No `ReadableStream`, no per-event flush, no heartbeat, no open-ended connection. Any `EventSource` client sees the connection close immediately after receiving the buffered batch with no ability to reconnect mid-battle. The `text/event-stream` content-type is misleading.

2. `lib/api/guards.ts:115-133` — Rate limiter silently buckets every client with missing or malformed IP headers under a single key `"unknown"`. An attacker can exhaust this shared bucket by sending requests with no `x-forwarded-for`/`x-real-ip` headers (or garbage values), causing all legitimate clients that lack these headers (local dev, certain proxies, curl) to be locked out with 429s. The rate-limit key should be unique per request origin even when IP is unavailable (e.g., random nonce, User-Agent hash, or at minimum separate buckets per request).

3. `lib/api/guards.ts:341-348` + `app/api/battles/[id]/start/route.ts:33-46` — AbortController registry leaks under error paths. `cancelCurrentBattle` aborts but never removes the entry from `abortControllers`; removal only happens via `clearAbortController` in the `finally` block of `startBattleHandler`. If the handler throws an unhandled exception (e.g., a `JSON.stringify` failure or unexpected runtime error in `runBattleFromPayload`), the `finally` may not execute, causing unbounded growth of the registry. Additionally, `cancelCurrentBattle` called before `start` registers the controller returns `false`, so a cancel that races ahead of start has no effect — the battle then runs to completion uncancellable.

## Summary
- Criticals: 3