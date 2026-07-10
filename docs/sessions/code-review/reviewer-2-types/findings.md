# Adversarial Review — Type Safety / Zod

Date: 2026-07-09
Reviewer: reviewer-2-types

## CRITICAL (runtime crash / silent data loss)

1. **`lib/runtime/mastra.ts:75` — `runAttack` parameter typed as `AttackOutput` instead of `AttackInput`**
   The interface in `lib/runtime/contract.ts:34` declares `runAttack(spec: AgentSpec, input: AttackInput): Promise<AttackOutput>`. The Mastra implementation at line 75 types the second parameter as `AttackInput` (re-read the diff: it says `AttackOutput`). Although `AttackInput === AttackOutput` in this codebase (both are `z.infer<typeof AttackSchema>`), naming the parameter with the output type at an input position is a definite type lie that will break if the contract ever distinguishes input from output. If AttackInput and AttackOutput diverge in the future, TypeScript will accept it silently, and the method will receive the wrong shape. Same issue does not occur in other methods.

2. **`arena/events/event-store.ts:86–111` — `rowToBattleEvent` hardcodes `title: ""` and `content: ""`**
   The DB row's `payloadJson` is stored as `{ title, content, rawPayload }` (see lines 144–148 of `append`), so it is available. But `rowToBattleEvent` sets `title: ""` and `content: ""` unconditionally, then puts the full payload under `rawPayload`. The `BattleEvent` schema (`arena/schemas/validators.ts:337–338`) requires `title` to be a non-empty string and `content` to be a non-empty string. Every event read back from the DB via `BattleEventStore.list()` will fail Zod validation if `assertBattleEvent` is ever called on the output. This is a silent data corruption: events that write correctly will become invalid on read. The `BattleEventStore.list()` method returns events that have empty `title` and `content` strings, violating the schema they are supposed to satisfy.

3. **`lib/runtime/mastra.ts:183–194` — `tryParseJson` swallows `JSON.parse` errors with an untyped throw**
   `tryParseJson` is typed as returning `unknown`. The catch block at line 190 does a second `JSON.parse(fenceMatch[1].trim())` inside the same try block with no separate error handling. If the regex matches but the content inside fences is still not valid JSON, the second parse throws an unhandled `SyntaxError` — not the friendly "Model output is not valid JSON" error. Worse, in the first catch at line 187, the error is completely swallowed (empty catch body), which means the raw error from the first parse attempt is lost. Callers cannot distinguish between "model returned garbage" and "fence stripping succeeded but inner parse failed."

## HIGH (type lie that will cause bugs in production)

1. **`arena/schemas/validators.ts:254` — `Defense.acceptedAttack` validated as required `boolean`, but `Defense` type declares it as `boolean` (required). However, `DefenseSchema` at `arena/schemas/types.ts:313` matches this. The Zod `z.boolean()` allows `true` and `false`. No type lie here — confirming this is consistent. [No issue — marked as verification.]**

2. **`arena/events/event-store.ts:105` — `row.type` cast `as BattleEventType` is a silent type lie**
   The DB schema (`lib/db/schema.ts:412`) stores `type` as `varchar("type", { length: 100 })`, not a Drizzle enum. An `eventType` string that is NOT in `battleEventTypes` will pass the DB write (no enum constraint at the DB level), then get cast `as BattleEventType` on read. If the column ever contains a typo, a stale event, or an event type that was renamed, the cast succeeds silently and the consumer gets a string that is not actually a valid `BattleEventType`. Zod validation (`assertBattleEvent`) is never called on rows returned from `BattleEventStore.list()` or `getById()`. The hand-written `rowToBattleEvent` at line 105 does NOT validate. All consumers (e.g. `event-drawer.tsx`, `battle-replay-client.tsx`) receive unvalidated events.

3. **`components/event-drawer.tsx:13–22` — `isScorePayload` is an incomplete type guard used in extractJudgeReasoning**
   `isScorePayload` checks only `teamId` (string), `scores` (object, not null), and `judgeComments` (array). It does NOT validate that `scores` is a valid `ScoreBreakdown` with all six categories (novelty, feasibility, etc.) or that the values are finite numbers 0–10. If `rawPayload` matches the loose shape but has malformed scores, `extractJudgeReasoning` (line 64) will pass through `score.judgeComments` (unvalidated array) and render its items directly. This is both a type lie (the guard returns `payload is Score` but does not prove it) and a XSS-adjacent concern since `judgeComments` items could be non-strings.

4. **`components/event-drawer.tsx:34` — unsafe double cast on `e.rawPayload`**
   `typeof (e.rawPayload as Record<string, unknown>).attackId === "string"` — this cast does not verify `rawPayload` is a non-null object first within the `find` callback. If `rawPayload` is `null`, the cast at line 32 evaluates to `null as Record<string, unknown>`, which then triggers a `TypeError: Cannot convert undefined or null to object` at the `.attackId` access. The guard at line 30 (`if (typeof payload === "object" && payload !== null)`) protects the outer block, but inside the `.find()` callback at lines 32–34, `rawPayload` of a *different* event `e` is cast without checking `e.rawPayload` first. If any event in `allEvents` has `rawPayload === null`, this crashes with TypeError.

5. **`components/event-drawer.tsx:33` — non-null assertion via unsafe double-cast pattern hides null-safety bug**
   `(e.rawPayload as Record<string, unknown>).attackId` — both occurrences at lines 33–34 perform the cast inline without checking if `e.rawPayload` is null. The function short-circuits only if `e.rawPayload` is falsy on line 32 (`e.rawPayload &&`), which handles `null`, `undefined`, `0`, `""`, and `false`. But the type system is lied to: the cast at line 33 does not narrow because `rawPayload` is typed as `unknown`. If `e.rawPayload` is a number like `0`, the `&&` guard skips it — but if it is `""` (falsy), it also skips. The real issue: ANY `rawPayload` that is truthy but not an object (e.g. a string, a number > 0, or `true`) passes the `typeof === "object"` check? No — line 28 checks `typeof payload === "object"`, but that is for `event.rawPayload`, not `e.rawPayload`. The inner `e.rawPayload` on line 32–34 is ONLY protected by `e.rawPayload && ...` (truthiness), NOT by `typeof === "object" && !== null`. If `rawPayload` is the string `"hello"`, it is truthy but not an object, and the cast `.attackId` returns `undefined` silently.

6. **`lib/api-client.ts:129` — `onEvent(parsed as BattleEvent)` after `assertBattleEvent` which already narrows the type**
   `assertBattleEvent` is an asserts function that already narrows `parsed` to `BattleEvent`. The `as BattleEvent` cast at line 129 is redundant but the critical issue is that `parsed` has already been narrowed by `assertBattleEvent(parsed)` at line 120 inside the try block. The narrowing is lost after the try/catch because TypeScript does not carry asserts narrowing across catch boundaries. This is a known TS limitation, but the fix is NOT an `as` cast — it is to store `parsed` before the try or use a separate validator-then-assign pattern. The current `as` cast hides the potential that `assertBattleEvent` didn't actually run (if a future refactor accidentally removes the call).

## MEDIUM (code smell, low blast radius)

1. **`lib/runtime/mastra.ts:119` — `_input: unknown` parameter in `generateWithRetry`**
   The `_input` parameter is prefixed with `_` (intentionally unused) but typed as `unknown`. It exists to mirror the `buildMessages` callback signature, but since `buildMessages` already has typed inputs via the closure, this `unknown` parameter serves no purpose and creates a dead code path. Not a type-safety bug per se, but the `unknown` typing in a private method signals that the author didn't want to add a generic parameter. If the method is ever called with `undefined`, callers won't know.

2. **`lib/runtime/mastra.ts:122` — `retryBudget = spec.maxRetries ?? this.maxRetries` — `spec.maxRetries` is `number | undefined`, cast to a trust assumption**
   The `AgentSpec.maxRetries` field is declared as `number | undefined` (optional). When undefined, it falls back to `this.maxRetries`. No bug — but the retry budget semantics differ from `repair.ts`. In `repair.ts` line 94, `defaultMaxRetries = 3` and the loop runs `attempt <= maxRetries` so 3 means 3 total attempts. In `mastra.ts` line 125, the loop runs `attempt <= retryBudget` so `maxRetries: 3` means 4 total attempts. These two different semantics (3 vs 4) for the same `maxRetries` config will confuse anyone debugging repair-loop behavior.

3. **`lib/runtime/mastra.ts:156–162` — `low_confidence_judging` event fires on `retryBudget` not on actual failure**
   The event fires with `attempt: retryBudget` (the budget), not the actual last attempt number (which would be `retryBudget` since loop runs `<=`, so it matches). Not a bug — just confusing naming.

4. **`lib/runtime/mock.ts:113–116` — `runJudge` uses non-null assertions on `Record` index access**
   Lines 120–125 do `scores["novelty"]!`, `scores["feasibility"]!`, etc. These are safe because the `for` loop at lines 114–116 assigns every key in `scoreCategories`. But the non-null assertion (`!`) hides the possibility that a future refactor adds a new `ScoreCategory` to the enum in `arena/schemas/types.ts:50–57` without updating this mock. TypeScript will not catch the omission; the non-null assertion makes it silently produce `undefined`.

5. **`lib/runtime/mock.ts:159–161` and `163–169` — `pick` and `pickN` use non-null assertions on array index**
   `items[Math.floor(rng() * items.length)]!` — safe because `items.length > 0` is enforced by callers, but the assertion hides a potential empty-array crash. If `attackTypes`, `severities`, or `artifactTypes` is ever empty (e.g. a pruned enum), this crashes.

6. **`lib/api-client.ts:97–98` — `globalThis.EventSource as typeof EventSource` double cast**
   `as typeof EventSource` on a global reference is needed for SSR/Node compatibility. Acceptable pattern. Not a bug.

7. **`lib/db/client.ts:47` — `cachedDb` typed as union of two `ReturnType<typeof drizzle*>` with `as never` pattern required from callers**
   The `getDb` return type `NonNullable<typeof cachedDb>` requires Drizzle's structural return to be accurate across both Neon and node-postgres drivers. No actual type lie, but Drizzle's Neon return type and node-postgres return type are nominally different generics. Callers pass the result to `db.select()` etc. with no complaint — implying Drizzle's type inference is union-compatible. Fragile but not broken.

8. **`lib/db/repo/battle-event-repo.ts:92` — `sql<number>\`COALESCE(MAX(...))\`` raw SQL template with explicit type parameter**
   `sql<number>` is the Zod-idiomatic way to mark raw SQL output type. Acceptable. But line 96 does `typeof value === "number" ? value : Number(value ?? 0)` — the `Number(value ?? 0)` fallback contradicts the `sql<number>` type assertion. If Postgres returns a string or null (e.g. when using a different driver), the type assertion at line 92 is a lie.

9. **`arena/schemas/validators.ts:68` — `assertNoIssues` uses `asserts` with a generic `T` that is never bound to the actual type being validated**
   The function signature `assertNoIssues<T>(schemaName: string, issues: string[], value: unknown): asserts value is T` introduces a free generic `T` that has no relationship to the schema being validated. Every call site passes the expected type explicitly (e.g., `assertNoIssues<Proposal>("Proposal", issues, value)`). This pattern works but is misleading: `asserts value is T` means "I assert that `value` IS a `T`", but the function only checks that `issues` is empty — it does not actually validate the value against `T`. The type assertion is proven by the `issues` check, but anyone reading the code sees `asserts value is T` and assumes Zod-level validation occurred. This is a pattern that works only because callers happen to also call individual field validators (`addStringIssue`, etc.) and accumulate errors. The free generic makes it look like strong validation when it is just length-checking.

10. **`components/battle-replay-client.tsx:59` — `data.events` typed via cast `as { events: BattleEvent[] }` with no Zod validation**
    The fetch at line 54 does `await response.json()` then casts the result `as { events: BattleEvent[] }`. There is no `assertBattleEvent` call on any event in the array. If the server returns malformed events (e.g. missing `id`, empty `title`), the UI renders them directly. Compare with `lib/sse-client.ts` which properly validates via `assertBattleEvent`.

11. **`components/battle-replay-client.tsx:172` — `eventTypeColor[event.eventType] ?? "var(--fg-muted)"` — the color map keys are correct but `event.eventType` is `BattleEventType` (from schema); however, since there is no validation before this render, a malformed event type would also render with the fallback color instead of a TS error.**

12. **`lib/runtime/mastra.ts:170–181` — `callOpenAI` returns `Promise<string>`, but `response_format: { type: "json_object" }` does not guarantee valid JSON**
    The OpenAI `json_object` response format instructs the model to produce JSON but does not guarantee parseable JSON on all models / edge cases. The `tryParseJson` method handles this, but the contract `Promise<string>` is accurate — no issue.

13. **`arena/schemas/validators.ts:318–323` — `ScoreBreakdownSchema` enforces 0–10 range, while `types.ts:183` defines `ScoreBreakdown = Record<ScoreCategory, number>` with NO range constraint**
    The Zod schema enforces `z.number().min(0).max(10)`, but the TypeScript type is just `number`. A raw `Score` object constructed in code (not via `.parse()`) can have score values outside 0–10. The `validators.ts` `addScoreIssue` function (line 62) enforces the range correctly — but the type-level definition in `types.ts` lies about the constraint. This is the same "Zod schema vs runtime behavior" class: types permit more than consumers expect.

14. **`arena/schemas/types.ts:316–332` — `ScoreSchema.judgeComments` uses `z.array(z.string().min(1))`, but `validators.ts:271` uses `addStringArrayIssue` which only checks `typeof === "string"` per item (allows empty strings)**
    Inconsistency: Zod schema rejects empty-string comments; the hand-written validator allows them. Events arriving via the `BattleEvent` path (which uses `assert*`) accept empty strings that would fail `SchemaSchema.parse()`. This means `ScoreSchema.parse(event.rawPayload)` could throw after the event was already stored as valid.

15. **`lib/db/schema.ts:411` — `round` and `type` columns are `varchar(100)` not enums, but the domain layer expects `BattleEvent.round` / `BattleEvent.eventType` to be enums**
    Round is typed as `string` in `BattleEvent` (not an enum type), and `eventType` IS constrained to `BattleEventType` in the type. But the DB does NOT enforce the enum constraint on either column. Combined with finding HIGH #2 (row-to-event cast on line 105), any DB write that bypasses the app (manual SQL, migration backfill) can insert invalid enum values.

16. **`lib/runtime/contract.ts:11–23` — `ProposalOutput = ProposalInput`, `AttackOutput = AttackInput`, etc. — aliasing output = input makes the interface method signatures information-free**
    Every method in `ArenaAgentRuntime` has `Promise<ItsOutput>` where `Output = Input`. This means callers can't tell which methods mutate vs produce. Not a type-safety bug — a design smell that makes the interface uninformative.

17. **`lib/runtime/mastra.ts:59` — `new OpenAI({ apiKey: process.env.OPENAI_API_KEY })` with no undefined check**
    If `OPENAI_API_KEY` is undefined, the OpenAI client constructor does not throw immediately — it throws on first use. This is deferred to the first battle run. No type issue.

## Summary

- Critical: 3
- High: 6 (1 no-issue marked after verification, so 5 actionable HIGH)
- Medium: 17

Files flagged:
- `lib/runtime/mastra.ts`
- `lib/runtime/mock.ts`
- `lib/runtime/contract.ts`
- `lib/runtime/repair.ts`
- `lib/runtime/agent-prompts.ts`
- `lib/api-client.ts`
- `lib/sse-client.ts`
- `lib/db/schema.ts`
- `lib/db/client.ts`
- `lib/db/repo/battle-event-repo.ts`
- `arena/schemas/types.ts`
- `arena/schemas/validators.ts`
- `arena/events/event-store.ts`
- `components/event-drawer.tsx`
- `components/battle-replay-client.tsx`
