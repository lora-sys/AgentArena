# Adversarial Review — AI Integration (Stages 1+3)

Date: 2026-07-10
Reviewer: reviewer-AI-integration

## CRITICAL

1. **lib/runtime/mastra.ts:213** — `schema_repair_completed` event fires on every successful first attempt, not only on actual repair. The condition `if (attempt > 0)` is always true because `attempt` starts at 1 and increments on each try. This makes the event semantically meaningless: the event log always shows `schema_repair_completed` after the first `schema_validation_failed`, even when the FIRST attempt at OpenAI returned valid JSON. Consumers of this event cannot distinguish "real repair succeeded" from "no repair was needed". Should be `if (attempt > 1)`.

2. **lib/api/guards.ts:293–308 + app/api/battles/[id]/cancel/route.ts:18** — The entire cancel/abort mechanism is non-functional in production. `registerAbortController` and `clearAbortController` are defined and exported, but **no production code path ever calls `registerAbortController`** — no battle-start code, no MastraRuntime instantiation, no SSE handler registers an AbortController. The MastraRuntime supports a `signal` option (line 55) but nobody passes one. `cancelCurrentBattle()` always finds an empty `abortControllers` Map and returns `false`. The "Cancel" button on the live page is wired to call this endpoint, but pressing it always returns `{ cancelled: false, status: "not_running" }`. This is dead infrastructure.

3. **lib/api/guards.ts:230–243** — `withGlobalConcurrency` is exported, tested, and fully functional in isolation, but **no production route uses it**. Every route handler in `app/api/battles/` applies `withRateLimit` but not `withGlobalConcurrency`. The global p-queue (capacity 6) is never invoked. This means concurrent battle creation/start requests are not bounded at the application layer — only by the 10-req/min per-IP rate limit. The stated purpose of the guard (protecting OpenAI + Postgres from simultaneous overload) is not achieved.

## HIGH

1. **lib/runtime/mastra.ts:33–34** — `DEFAULT_MODEL` and `DEFAULT_BASE_URL` are read at **module-load time** and frozen in module scope. The LongCat integration requires setting `OPENAI_BASE_URL` to a custom endpoint. If the env var is set after the Next.js process starts (e.g., via a per-request env injection or a misconfigured dotenv order), the OpenAI client will silently fall back to the real `api.openai.com/v1` endpoint. The `apiKey: process.env.OPENAI_API_KEY` in the constructor (line 88) is read at construction time, so a runtime-passed `options.client` works, but the constructor's else branch captures env once. In serverless cold-start scenarios where env vars are resolved after import, this misses.

2. **lib/runtime/mastra.ts:185–191** — `runWithFallback` fires `onEvent({ type: "battle_failed", attempt: 0, issues: undefined })` after the repair loop already fired its own `battle_failed` event with `attempt: retryBudget` and the actual issues. The fallback handler's `attempt: 0` and `issues: undefined` clobbers the diagnostic context. Consumers who subscribe to `battle_failed` will see a phantom "attempt 0" event with no issues after every repair-loop exhaustion. This fires the same event type twice in the same operation — the first carries valid context, the second discards it.

3. **app/api/battles/route.ts:99–101** — TOCTOU unique-violation recovery relies on `/unique|duplicate/i.test(dbErr.message)`. Drizzle's PG error wrapping (`DrizzleQueryError`) exposes `cause.message` not `message`, and Postgres driver errors often have messages like `"Failed query"`, `"insert into ... returned no result"`, etc. The actual `cause` (the `PgDatabaseError` with code `23505`) is nested inside. The regex against the top-level message is unreliable — in production with `DrizzleQueryError`, the check may fail and silently fall through to the "in-memory fallback" log, returning a 201 with a battle_id that was never persisted.

4. **app/api/battles/[id]/status/route.ts:76** — `canCancel: !isTerminal && battleRow.status !== "idle"`. When `battleRow.status === "cancelled"`, this evaluates to `!false && true` → `true`. The cancel button is shown for an already-cancelled battle. A second cancel-click from the UI will hit `cancelCurrentBattle()` and get `false` (because the abort controller was already aborted and the map has no entry), so the response is `{ cancelled: false, status: "not_running" }` — confusing. The UI shows the cancel affordance on a battle that cannot be cancelled. Should also exclude `"cancelled"`.

5. **lib/api/guards.ts:238** — `concurrency === 6` literal comparison on the option value creates fragile coupling between the queue-selection logic and the default. If anyone changes the default from 6 (line 213 `PQueue({ concurrency: 6 })` and line 234 `?? 6`), the conditional selecting the global queue vs a new one silently breaks: a caller passing `{ maxConcurrent: 6 }` to request the default will bypass the global queue and create a private one, fragmenting concurrency limits across calls. The check should be against a single shared constant.

## MEDIUM

1. **lib/runtime/mastra.ts:170** — `private readonly fallback = new MockRuntime()` is an **instance field** initialized inline, which means every `MastraRuntime` instance creates its own `MockRuntime`. If multiple `MastraRuntime` instances are long-lived, each holds its own mock state. Not a current bug (one instance per battle), but if the pattern scales, this duplicates state. Also: instance fields in JS classes are initialized **after** `super()` but the `runWithFallback` closure captures `this.fallback` lazily, so re-initializing it after construction is impossible — `readonly` prohibits this. If `MockRuntime` becomes stateful (e.g., for randomness seeding), there's no escape hatch.

2. **app/api/battles/[id]/cancel/route.ts:18–24** — `cancelCurrentBattle` returns `false` when no AbortController is registered, but the route returns HTTP 200 (not 404). Calling POST on `/cancel` for a non-existent or finished battle silently returns `{ cancelled: false, status: "not_running" }` with no error indication. This masks the real problem: the cancel infrastructure is not hooked up. Should at minimum log a warning or return a distinct status.

3. **lib/runtime/mastra.ts:259–272** — `callOpenAI` does not distinguish between timeout, network error, and validation error. If `this.signal` fires (user pressed cancel), the OpenAI SDK will throw an `AbortError` — this propagates up to `runWithFallback`, which catches it and falls back to `MockRuntime`. This means **a successful cancel from the UI silently produces mock output instead of a "cancelled" result**. Cancel should be distinguishable from other failures: either short-circuit the fallback or return a `cancelled` sentinel so the route can respond with 499.

4. **lib/db/repo/battle-event-repo.ts:88–97** — `maxSequence` is implemented and tested, but **no production caller invokes it**. The DB schema has `uniqueIndex("battle_event_battle_seq_idx")` on `(battle_id, sequence)`. If/when the engine does start persisting events, it will need to compute sequence numbers — and the race between `maxSequence()` and `insert()` is a classic TOCTOU pattern: two concurrent inserts with the same max+1 both succeed in the SELECT then collide on UNIQUE INDEX. The repo should either provide an atomic `insertNext()` that wraps both in a transaction or document this as a known gap.

5. **lib/api/guards.ts:87–101** — `cleanupExpiredBuckets` uses a module-level `lastCleanup` timestamp (not in the `buckets` Map) and the function is called inline from `withRateLimit`. Under high concurrent traffic, multiple concurrent `withRateLimit` callers may each see `now - lastCleanup >= CLEANUP_INTERVAL_MS` as true, all run the cleanup loop, and all update `lastCleanup = now`. Not a bug (idempotent) but the check-then-act on a module-global shared between concurrent requests is a non-atomic pattern. Acceptable for single-process dev; in Vercel's serverless model each cold start gets its own process so the race is moot.

## Summary
- Critical: 3
- High: 5
- Medium: 5
