# R18 Backend API

Date: 2026-07-10

## CRITICAL

1. **app/api/battles/[id]/events/route.ts:8-16** — No rate limiting, no battle ID validation, no error handling. Every other route wraps its handler in `withRateLimit` and validates the `id` param with `validateBattleId`, but this route is completely unguarded. An attacker can spam this endpoint with arbitrary path values to exhaust server resources or trigger unhandled exceptions. The handler has no try/catch — any error in `runBattleFromPayload` or `NextResponse.json` propagates as a 500.

2. **app/api/battles/[id]/events/stream/route.ts:19-29** — Returns a complete buffered body despite advertising `text/event-stream`. The handler joins ALL events into a single string via `.map().join()`, then returns it in one `Response` with no chunked transfer, no ReadableStream, and no heartbeat. This is not an SSE stream — it is a synchronous JSON dump that:
   - Blocks the event loop while serializing the full event array (hundreds of events for a real battle).
   - Causes memory spikes proportional to total event payload size.
   - Will be closed by reverse-proxy idle timeouts (no heartbeat keeps the connection alive).
   - Misleads clients that connect expecting a live event stream.
   - `connection: "keep-alive"` is a hop-by-hop header that applications must not set — the HTTP server controls it.

3. **app/api/battles/[id]/start/route.ts:33 + lib/api/guards.ts:300-309** — AbortController registration race condition. The POST export composes `withRateLimit(withGlobalConcurrency(withInputValidation(...)))`. The concurrency wrapper may hold the request in its p-queue for an indeterminate time before executing the inner handler that calls `registerAbortController(id)`. During that window, a client that calls `POST /api/battles/[id]/cancel` will find no controller in the map and receive `cancelled: false`. The battle then runs to completion despite the user requesting cancellation. The registration MUST happen before enqueueing, or the cancel endpoint must retry/poll.

4. **lib/api/guards.ts:300-309** — `registerAbortController` aborts any existing controller for the same battle ID without checking ownership. If a stale `clearAbortController(id)` from a previous battle's `finally` block runs after a new battle's `registerAbortController(id)`, it deletes the NEW controller. This allows cancel to silently no-op for the second battle. The `finally` cleanup at `start/route.ts:45` must not delete a controller it did not create.

5. **app/api/battles/route.ts:95-125** — DB write failure swallowed silently with a 201 response. After the idempotency check passes, if the `db.insert(battle).values(...)` throws for any non-unique-constraint reason (connection timeout, disk full, schema mismatch), the code logs a warning and falls through to return `201 { battleId, status: "created" }`. The client believes the battle was persisted, but no row exists in the database. On the next POST with the same idea, the idempotency check finds nothing and a new (different) battle ID is generated, breaking replay/passport lookup for the "created" battle.

## Summary

- Criticals: 5
- All 350 tests pass; none of the above are covered by existing test suites (no test exercises the events/stream buffering behavior, the concurrency-queue race, the abort-controller cleanup ordering, or the DB-fallback 201 path).