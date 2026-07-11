# R21 Backend Runtime

Date: 2026-07-10

## CRITICAL

1. **lib/runtime/mastra.ts:194–223** — `runWithFallback` silently falls back to `MockRuntime` when `generateWithRepair` throws a non-infrastructure, non-abort error (e.g. invalid JSON from the model). Path: model returns unparseable output → `tryParseJson` throws "Model output is not valid JSON" → `generateWithRepair` re-throws → `runWithFallback` catches it, emits a `battle_failed` event with `attempt: 0, issues: undefined`, then calls `fallback.runProposal()` which returns a deterministic mock result. The caller receives a successful-looking `ProposalOutput` that is 100% fabricated by the mock — no indication that the AI pipeline failed. This violates CLAUDE.md §7 ("every event payload must pass Zod validation", "artifacts may not invent facts") because the returned mock proposal becomes a real battle artifact with zero evidence the model actually produced it. The error path should throw, not silently fall back.

2. **lib/sse-client.ts:118–130** — `onerror` triggers an unconditional reconnect with exponential backoff that has no upper bound on total retry duration. EventSource fires `onerror` for all transient failures including permanent server-side rejections (HTTP 500, 404 on the endpoint). The `setTimeout` reconnect keeps firing forever even when the server is permanently down or the endpoint no longer exists. Worse, `onopen` only fires on the *next* successful connection — so if the server never recovers, the client hammers it at `maxBackoffMs` intervals indefinitely. There is no `maxRetries` cap, no circuit-breaker, and no way to surface "gave up reconnecting" to the caller. The `close()` method correctly cleans up, but a permanently-failed connection leaks periodic network requests and wastes resources.

## Summary
- Criticals: 2
