# R15 Backend Runtime

Date: 2026-07-10

## CRITICAL

1. **lib/runtime/mastra.ts:263-278** — `battle_failed` event emitted twice for every schema repair exhaustion. `generateWithRetry` emits `battle_failed` on line 271, then throws `SchemaRepairExhaustedError`. The catch in `runWithFallback` (line 211) emits a second `battle_failed` for the same failure. This corrupts the event store with duplicate failure events and the second event loses all diagnostic context (attempt: 0, issues: undefined).

2. **lib/api-client.ts:197-211** — `findScoreEvidenceEventId` throws a `BattleApiError` with `status: 500` when a score lacks a `score_created` evidence event, but `transformBundle` calls it without try/catch. This causes the entire battle result page to fail to render if any team's score is missing its evidence event, and the HTTP 200 success is misrepresented as a 500 server error.

## Summary
- Criticals: 2