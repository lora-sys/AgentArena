# R17 Backend Runtime

Date: 2026-07-10

## CRITICAL

No critical bugs found.

## Analysis Summary

Files reviewed (6):

- `lib/runtime/contract.ts` — interface definitions, types
- `lib/runtime/mock.ts` — deterministic mock runtime (seeded RNG)
- `lib/runtime/mastra.ts` — OpenAI-backed runtime with repair loop + mock fallback
- `lib/runtime/repair.ts` — generic schema repair loop
- `lib/runtime/agent-prompts.ts` — message builders for each agent method
- `lib/runtime/mock-content-hash.ts` — content hash for mock output stability
- `lib/sse-client.ts` — typed SSE consumer with reconnect logic
- `lib/api-client.ts` — battle result fetch with Zod validation + evidence binding

Test results: 348 passed, 1 unrelated failure (passport page test, outside scope).

## Observations (not critical)

1. **`isInfrastructureError` (lib/runtime/mastra.ts:89)** — Catches all HTTP 400-599 as "infrastructure" errors and re-throws. 400 (Bad Request) is a client error, not an infrastructure error. Treating 400 as infrastructure prevents graceful fallback for prompt format issues. However, re-throwing 400 is arguably safer than silently masking it with mock output, so this is a design choice rather than a bug.

2. **`_input` parameter (lib/runtime/mastra.ts:230)** — `generateWithRepair` accepts `_input: unknown` but never uses it. The `buildMessages` closure already captures `input` from the outer scope. Dead parameter, not a runtime issue.

3. **`findScoreEvidenceEventId` (lib/api-client.ts:201-203)** — Returns the first `score_created` event for a team. If a team is re-scored after a defense round, evidence binding could point to an outdated event rather than the final score. Not caught by current tests.

4. **`runWithFallback` mock substitution (lib/runtime/mastra.ts:222)** — When model exhausts retries or returns non-JSON output, falls back to `MockRuntime` silently. The caller receives a valid-looking response with no signal that it is mock data rather than real model output. Explicitly tested as "Stage 3 resilience" (mastra.test.ts:212-227, 375-383).

## Summary

- Criticals: 0