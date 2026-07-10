# Adversarial Review — PRD Invariants + Security

Date: 2026-07-09
Reviewer: reviewer-3-invariants

## CRITICAL (PRD invariant violated / RCE / data leak)

1. **lib/db/schema.ts:348** — Invariant #1 ("Every Score binds to >=1 evidenceEventId") is enforced by the Zod schema in `lib/api-client.ts` only on the client-side transform. The Drizzle `score` table has `evidenceEventIdsJson` defaulting to `'[]'` (empty array) as a `notNull` column, meaning a `Score` can be inserted with **zero** evidence bindings and pass all DB-level constraints. The schema comment acknowledges the rule but there is no CHECK constraint or application-level guard at insert time. Any code path that calls `repoInsert` for a `score` row can persist a score with no evidence, silently violating the PRD invariant. The `lib/api-client.ts:204` lookup even falls back to `"unknown-<teamId>"` when no match is found — i.e., the code produces a fake binding rather than rejecting it.

2. **agents/tools/allowlist.ts — INVARIANT #4 file does not exist.** PRD §7 invariant #4 requires "No tool allowlist outside `agents/tools/allowlist.ts`." There is no such file in the repository. Agent tools under `agents/*/tools/` (`format_proposal.ts`, `calculate_score.ts`, `export_markdown.ts`) have no centralised allowlist enforcement boundary. This means the invariant is silently unenforced; any new tool import can land without review. The function-based tools are pure string formatters and pose no shell risk *today*, but the invariant's premise — a single enforce point — is absent.

## HIGH (security gap / silent invariant drift)

1. **app/api/battles/[id]/start/route.ts:10 — No input validation on user-provided payload.** `request.json().catch(() => ({}))` then passes the raw payload directly to `runBattleFromPayload()`. The handler does not validate `idea` as a bounded string, does not check payload size, and does not enforce any auth or rate limit. A POST with an empty body, a 10 MB body, or a non-JSON body all succeed. `normalizeBattleCreateInput` internally rejects non-string values, but the lack of size limits and the lack of HTTP-layer input sanitisation create an open surface.

2. **app/api/battles/route.ts:12 (POST) + app/api/battles/[id]/start/route.ts:10 — No rate limiting on API routes.** Every API route (`/api/battles`, `/api/battles/[id]`, `/api/battles/[id]/start`, `/api/battles/[id]/events`, `/api/battles/[id]/export`, `/api/battles/demo/export`) has zero rate limiting. An unauthenticated client can POST to `/api/battles/[id]/start` in a tight loop to trigger repeated LLM calls (each call instantiates an OpenAI request when `MastraRuntime` is wired), driving cost attacks / unbounded resource consumption.

3. **app/api/battles/[id]/events/stream/route.ts:7 — SSE route accepts arbitrary `id` with no validation.** The `id` path parameter from the URL is passed directly into `runBattleFromPayload({}, id)` without any validation that it matches the PRD §8 `btl_<8-char base32>` format. Any string is accepted, then the engine runs a full synthetic battle on every GET. Combined with no rate limit, this is an unbounded cost/compute exposure.

4. **lib/runtime/mastra.ts:122-168 — Repair loop bounds mismatch between contract and implementation.** The invariant says "retry up to 3 times." `mastra.ts:33` defaults `DEFAULT_MAX_RETRIES = 3`, but the loop at line 125 runs `for (attempt = 0; attempt <= retryBudget; attempt++)` — yielding **4 total attempts** (attempt 0, 1, 2, 3), not 3. The spec-named function `generateWithRepair` calls `schema_repair_started` 3 times (for attempts 0–2) and then a 4th validation, which is inconsistent. The independent `repair.ts` correctly loops `attempt <= maxRetries` semantically (maxRetries:3 → 3 iterations, attempts 1–3). The two implementations have different semantics under the same label.

5. **lib/runtime/mastra.ts:156-162 — `low_confidence_judging` event is emitted, but no `battle_failed` event follows.** Invariant #8 requires that schema-repair exhaustion emit a `battle_failed` event with a `low_confidence_judging` flag. `MastraRuntime.generateWithRepair` emits the `low_confidence_judging` event via `onEvent?.()`, but no `battle_failed` event is emitted from this code path. The engine's `runDemoBattle` does not catch `SchemaRepairExhaustedError` and never appends a `battle_failed` event to the store — meaning the invariant's "failures → battle_failed event" half is silently unfulfilled.

6. **lib/api-client.ts:197-205 — `findScoreEvidenceEventId` silently fabricates evidence IDs.** When no `score_created` event exists for a team, the function returns `"unknown-<teamId>"`. This means the client-side invariant check at line 49 (`evidenceEventId: z.string().min(1)`) passes for scores that actually have **no** evidence binding — a false positive that undermines invariant #1's enforcement.

## MEDIUM (best practice gap)

1. **app/agent/[id]/passport/page.tsx:78 — Passports fetched by `agentId` string prefix matching, not DB join.** The code at line 110 does `p.agentId === agentId || p.agentId.replace(/_/g, "-") === agentId || p.agentId.startsWith(...)`. This loose matching can surface the wrong passport if two agents share a prefix. A `false` positive on `startsWith` leaks one agent's data into another's passport view. Low likelihood today (only three agents), but structural.

2. **lib/db/schema.ts:331-361 — `score` table lacks a CHECK constraint that `evidenceEventIdsJson` is non-empty.** The invariant says every score must bind to >=1 evidence event. A DB-level CHECK or trigger would prevent the invariant from being silently violated by a direct INSERT bypassing the application layer. Today the `notNull` constraint passes for `'[]'::jsonb`.

3. **lib/runtime/mastra.ts:59 — `process.env.OPENAI_API_KEY` read at construction time, not per-request.** If the environment variable is rotated in a long-running process (e.g., dev server with hot reload), stale credentials persist. Not a security issue per se, but a credential-management gap.

4. **components/event-drawer.tsx:165-168 — Raw payload rendered as text via `JSON.stringify` inside a `<pre>`.** Since events flow through `assertBattleEvent` and `BattleEventStore.append` validates via Zod, stored payloads are schema-shaped. However, the legacy `InMemoryBattleEventStore.append` receives events from `runDemoBattle` without a guarantee that `rawPayload` is strictly typed — `rawPayload: unknown` on the `BattleEvent` type means any value can be embedded. Today's demo stores only fabricated objects, so no XSS risk in practice, but the type contract permits dangerous payloads.

5. **arena/engine/demo-battle.ts:81-257 — Engine emits events with `runtime.now()` from a synthetic fixture clock, not the DB clock.** Invariant #6 says "Replay and Passport only read from event store — never from in-memory state." `runDemoBattle` builds everything in-memory using `createDemoFixtureRuntime`, then the `BattleEventStore.append` path is NOT used here. In the current codebase, the demo flow never writes to the DB event store — so replay and passport views always come from the in-memory fixture. This is not yet a live production path (the routes also build bundles in-memory), but the invariant #6 boundary is not enforced: there is no guard that prevents in-memory state from being read by replay/passport routes.

6. **agents/*/tools/format_proposal.ts — All four format_proposal tools are identical in shape with different fallback strings.** No security impact, but `agents/infra-hacker/tools/format_proposal.ts`, `agents/safe-builder/tools/format_proposal.ts`, and `agents/viral-designer/tools/format_proposal.ts` are near-identical — a copy-paste drift risk where one team's fallback could be accidentally injected into another's output.

7. **lib/battle-api.ts:51-55 — `makeBattleId` does not follow the PRD §8 `btl_<8-char base32>` format.** Battle IDs produced by this function are `battle-<hash36>`, not `btl_<8-char base32>`. All flow-through IDs in the demo path (`runBattleFromPayload`, `runDemoBattle`, the API routes) produce non-conforming IDs. The `CompletedBattleBundle`'s `battle.id` propagates this non-conforming format to all derived event IDs, passport IDs, and replay IDs. Invariant #9 is silently violated everywhere in the current path.

8. **lib/runtime/contract.ts:29 — `AgentSpec.agentId` accepts any string.** Invariant #10 says agent IDs follow `team_<role>_<version>`. There is no format validation on the spec's `agentId` field. Today's fixtures use `team_safe_builder_v1`-style strings, but a misspelled spec is silently accepted.

## Summary

- **Critical**: 2
- **High**: 6
- **Medium**: 8
- **Files flagged**:
  - `/home/lora/repos/agentarena/lib/db/schema.ts`
  - `/home/lora/repos/agentarena/lib/db/repo/battle-event-repo.ts`
  - `/home/lora/repos/agentarena/lib/db/client.ts`
  - `/home/lora/repos/agentarena/lib/runtime/mastra.ts`
  - `/home/lora/repos/agentarena/lib/runtime/repair.ts`
  - `/home/lora/repos/agentarena/lib/runtime/contract.ts`
  - `/home/lora/repos/agentarena/lib/battle-api.ts`
  - `/home/lora/repos/agentarena/lib/api-client.ts`
  - `/home/lora/repos/agentarena/arena/engine/demo-battle.ts`
  - `/home/lora/repos/agentarena/arena/engine/battle-state.ts`
  - `/home/lora/repos/agentarena/arena/engine/scoring.ts`
  - `/home/lora/repos/agentarena/arena/engine/passport.ts`
  - `/home/lora/repos/agentarena/arena/engine/replay.ts`
  - `/home/lora/repos/agentarena/app/api/battles/route.ts`
  - `/home/lora/repos/agentarena/app/api/battles/[id]/route.ts`
  - `/home/lora/repos/agentarena/app/api/battles/[id]/start/route.ts`
  - `/home/lora/repos/agentarena/app/api/battles/[id]/events/route.ts`
  - `/home/lora/repos/agentarena/app/api/battles/[id]/events/stream/route.ts`
  - `/home/lora/repos/agentarena/app/api/battles/[id]/export/route.ts`
  - `/home/lora/repos/agentarena/app/api/battles/demo/export/route.ts`
  - `/home/lora/repos/agentarena/app/agent/[id]/passport/page.tsx`
  - `/home/lora/repos/agentarena/components/event-drawer.tsx`
  - `/home/lora/repos/agentarena/components/battle-replay-client.tsx`
  - `/home/lora/repos/agentarena/agents/artifact-writer/tools/export_markdown.ts`
  - `/home/lora/repos/agentarena/agents/infra-hacker/tools/format_proposal.ts`
  - `/home/lora/repos/agentarena/agents/judge-panel/tools/calculate_score.ts`
  - `/home/lora/repos/agentarena/agents/safe-builder/tools/format_proposal.ts`
  - `/home/lora/repos/agentarena/agents/viral-designer/tools/format_proposal.ts`

- **Recommended fix order**:
  1. **(Critical #2)** Create `agents/tools/allowlist.ts` with a tool permit-list and wire it into the agent runtime boundary.
  2. **(Critical #1)** Enforce `evidenceEventIdsJson.length >= 1` at the DB layer (CHECK constraint) and remove the `"unknown-<teamId>"` fallback in `lib/api-client.ts:204`.
  3. **(High #2)** Add a simple per-IP token-bucket rate limiter to all `/api/battles/**` routes.
  4. **(High #4)** Fix `mastra.ts` repair loop to attempt exactly 3 times (use `<` not `<=`), or rename "retryBudget" to "maxAttempts" for clarity.
  5. **(High #5)** In `runDemoBattle`, wrap `MastraRuntime` calls in a try/catch for `SchemaRepairExhaustedError` and emit a `battle_failed` event with `low_confidence_judging` flag.
  6. **(Medium #7)** Fix `makeBattleId` to produce `btl_<8-char base32>` (use `btl_` prefix + base32 encoding of an 8-character hash).
  7. **(High #1, #3)** Add input size limits (e.g., 1 MB body cap) and path-param format validation on `[id]` routes against `^btl_[a-z2-7]{8}$`.
  8. **(Medium #2)** Add DB CHECK constraint `evidenceEventIdsJson != '[]'::jsonb` to the `score` table.
