# Adversarial Review — Backend Runtime (R10)

Date: 2026-07-10
Reviewer: r10-backend-runtime

## CRITICAL

1. lib/api-client.ts:204 — `findScoreEvidenceEventId` silently returns `unknown-${teamId}` when no matching `score_created` event exists, violating the CLAUDE.md §7 invariant ("Every Score binds to >=1 evidenceEventId"). A malformed or incomplete API response (e.g., server drops a score event, or returns a typo in `eventType`) produces a placeholder evidence ID that passes through to the result page without error. The function should throw a `BattleApiError` to surface the data integrity violation to the caller.

2. lib/api-client.ts:108 — `BattleApiResponseSchema.bundle.events[].eventType` is `z.string()` with no enum validation against `battleEventTypes`. A server-side typo (e.g., `"score_created"` → `"score_createdd"`) passes validation silently, then `findScoreEvidenceEventId` filters by exact string match and misses every score event. This directly causes Bug 1. The field should be `z.enum(battleEventTypes)`.

3. lib/runtime/mastra.ts:186 — `runWithFallback` unconditionally emits a `battle_failed` event with `attempt: 0` on every caught error, including when the repair loop has already emitted its own `battle_failed` with the correct attempt count (line 247). This double-emits `battle_failed` for every repair exhaustion. The fallback handler should distinguish infrastructure failures (e.g., `callOpenAI` throws) from repair-exhaustion failures to avoid duplicate events.

4. lib/runtime/repair.ts:188 — `schema_repair_started` is emitted on every attempt including the first, where no repair is needed. The event name implies a prior failure existed, but on attempt 1 there is no prior failure. This produces a misleading audit trail where `schema_repair_started` appears for every model call, making it impossible to distinguish "first attempt" from "repair attempt" from the event stream alone. The first attempt should emit a different event (e.g., `model_call_started`) or no event at all.

## Summary

- Criticals: 4