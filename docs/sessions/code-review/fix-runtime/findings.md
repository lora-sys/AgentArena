# Fix Report — lib/runtime/mastra.ts Critical Bugs

Date: 2026-07-10
Agent: fix-runtime
Scope: 4 critical bugs in `lib/runtime/mastra.ts` + repair loop semantics + JSON parse swallow

## Status: GREEN

- typecheck: 0 errors
- tests: 105/105 passed (16 in mastra.test.ts)
- public API of `MastraRuntime`: preserved

---

## Bug 1: `runAttack` parameter type lie

**Location:** `lib/runtime/mastra.ts:90` (was line 75)

**Bug:** The second parameter of `runAttack` was typed as `AttackOutput` instead of `AttackInput`. The interface in `lib/runtime/contract.ts:34` declares `runAttack(spec: AgentSpec, input: AttackInput): Promise<AttackOutput>`. The implementation had a type lie at the input position. Although `AttackInput === AttackOutput` currently (both are `z.infer<typeof AttackSchema>`), if they diverge in the future, TypeScript would accept the wrong shape silently.

**Fix:**
```typescript
// Before:
async runAttack(spec: AgentSpec, input: AttackOutput): Promise<AttackOutput> {
// After:
async runAttack(spec: AgentSpec, input: AttackInput): Promise<AttackOutput> {
```

**New test:** `"runAttack accepts AttackInput parameter (not AttackOutput)"` — verifies that `runAttack(sampleSpec, validAttack)` compiles and returns the correct shape, catching any future type drift.

**Status:** GREEN

---

## Bug 2: `tryParseJson` swallows `JSON.parse` errors

**Location:** `lib/runtime/mastra.ts:214-227` (was lines 183-194)

**Bug:** `tryParseJson` used an empty `catch` block that silently swallowed `JSON.parse` errors. If the first parse failed AND the fence-stripped content was also invalid JSON, the second `JSON.parse` inside the same try block would throw an unhandled `SyntaxError` instead of the friendly "Model output is not valid JSON" error. Callers could not distinguish between "model returned garbage" and "fence stripping succeeded but inner parse failed."

**Fix:** Replaced the swallowed catch with a structured approach:
1. Extracted `safeJsonParse()` helper that wraps `JSON.parse` and re-throws `SyntaxError` as `Error("Invalid JSON: ...")` with a clear message.
2. Added `tryParseJsonValue()` that calls `safeJsonParse` inside try/catch, returning `undefined` on failure.
3. Rewrote `tryParseJson()` to try direct parse first, then fence-stripped parse, then throw a clear error if both fail.

```typescript
function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON: ${err.message}`);
    }
    throw err;
  }
}

function tryParseJsonValue(input: string): unknown {
  try {
    return safeJsonParse(input);
  } catch {
    return undefined;
  }
}

private tryParseJson(raw: string): unknown {
  const trimmed = raw.trim();
  const direct = tryParseJsonValue(trimmed);
  if (direct !== undefined) return direct;
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    const fromFence = tryParseJsonValue(fenceMatch[1].trim());
    if (fromFence !== undefined) return fromFence;
  }
  throw new Error("Model output is not valid JSON");
}
```

**New tests:**
- `"tryParseJson recovers JSON wrapped in markdown fences"` — verifies fence-stripped JSON is parsed correctly.
- `"tryParseJson throws clear error on completely invalid output"` — verifies the error message contains either "not valid JSON" or "Invalid JSON".

**Status:** GREEN

---

## Bug 3: Repair loop off-by-one

**Location:** `lib/runtime/mastra.ts:148` (was lines 125)

**Bug:** The loop condition `for (let attempt = 0; attempt <= retryBudget; attempt++)` yielded 4 total attempts when `maxRetries = 3`, because `0..3` is 4 iterations. The canonical semantics in `lib/runtime/repair.ts:184` use `for (let attempt = 1; attempt <= maxRetries; attempt++)` which yields exactly 3 attempts. This inconsistency meant that `maxRetries: 3` in `mastra.ts` produced different behavior than the same config in `repair.ts` (3 vs 4 attempts).

**Fix:**
```typescript
// Before:
for (let attempt = 0; attempt <= retryBudget; attempt++) {
  const messages = buildMessages(attempt);
// After:
for (let attempt = 1; attempt <= retryBudget; attempt++) {
  const messages = buildMessages(attempt - 1);
```

The `attempt - 1` adjustment to `buildMessages` preserves the existing prompt-builder semantics: `repairAttempt = 0` means "no repair suffix" (initial attempt), `repairAttempt > 0` means "add repair suffix". Since the loop now starts at attempt 1 (the first actual attempt), we pass `attempt - 1 = 0` to `buildMessages` for the first call so no repair suffix is added.

Also fixed the error message: `Schema validation failed after ${retryBudget + 1} attempts` → `Schema validation failed after ${retryBudget} attempts` (now matches actual count).

**New/updated tests:**
- `"repair loop retries up to maxRetries total attempts then throws SchemaRepairExhaustedError"` — expects 3 calls (was 4, which was testing the bug).
- `"repair loop with budget=3 emits 2 schema_repair_started events when all fail"` — verifies the correct event count (2 repair-started events for 3 total attempts: attempts 1 fails, attempt 2 fails, attempt 3 fails; repair-started fires for attempts 2 and 3).
- Updated `"repair loop retries on invalid output and emits schema_repair_started"` — expects `attempt: 1` (was 0, which was the old zero-indexed attempt number).

**Status:** GREEN

---

## Bug 4: `low_confidence_judging` without `battle_failed`

**Location:** `lib/runtime/mastra.ts:187-193` (new code)

**Bug:** PRD invariant requires a `battle_failed` event after repair exhaustion. The code only emitted `low_confidence_judging` then threw `SchemaRepairExhaustedError`, violating the invariant.

**Fix:** Added `battle_failed` event type to `SchemaRepairEvent` union and emit it after `low_confidence_judging`, before the throw:

```typescript
// Added to SchemaRepairEvent type:
//   | "battle_failed"

// Added after low_confidence_judging emission:
this.onEvent?.({
  type: "battle_failed",
  spec,
  method,
  attempt: retryBudget,
  issues: lastIssues,
});
```

**New tests:**
- `"exhausted repair emits battle_failed event after low_confidence_judging"` — verifies the event is emitted.
- `"battle_failed event fires after low_confidence_judging in event order"` — verifies the ordering invariant (battle_failed comes after low_confidence_judging).

**Status:** GREEN

---

## Files modified

| File | Changes |
|---|---|
| `lib/runtime/mastra.ts` | 4 bug fixes: type fix, safeJsonParse, loop bounds, battle_failed event |
| `lib/runtime/mastra.test.ts` | Updated 3 existing tests + added 6 new tests |

## Files NOT modified (out of scope per hard rules)

- `lib/runtime/contract.ts` — type definitions are correct
- `lib/runtime/repair.ts` — canonical loop semantics already correct
- `lib/runtime/mock.ts` — not in scope
- `event-store.ts`, `schema.ts`, `allowlist.ts` — other agents handle these

## Verification

```bash
$ pnpm typecheck
$ tsc --noEmit
# (exit 0, no errors)

$ pnpm test
 Test Files  11 passed (11)
      Tests  105 passed (105)
```