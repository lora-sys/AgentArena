# R16 Backend Runtime

Date: 2026-07-10

## CRITICAL

1. **lib/api-client.ts:204-208** — `findScoreEvidenceEventId` throws `BattleApiError` with `status: 404` when a score has no matching `score_created` event. This is a data-integrity violation (CLAUDE.md §7: "Every Score binds to ≥1 evidenceEventId"), NOT an HTTP 404. The result page at `app/battle/[id]/result/page.tsx:37-38` shows "This battle could not be found. It may have been deleted or the ID is incorrect." for any error with `status === 404`, so a corrupted battle record is reported as a missing battle. Callers cannot distinguish "battle does not exist" from "battle data is corrupt." This misclassifies the error class to both users and monitoring.

2. **lib/runtime/mastra.ts:289-303** — `callOpenAI` does not pass `maxRetries: 0` to `this.client.chat.completions.create()`. The OpenAI Node SDK defaults to `maxRetries: 2`, silently retrying 429/5xx/network errors with exponential backoff. With the runtime's `retryBudget = 3`, the actual number of underlying API calls can be up to 3 × 3 = 9, but the repair loop only emits 3 `schema_repair_started` events. The event store and observability tooling see 3 attempts while the model provider sees up to 9. Billing, rate-limit accounting, and the audit trail of the repair process are all out of sync with reality.

## Summary

- Criticals: 2