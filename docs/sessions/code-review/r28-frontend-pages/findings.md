# R28 Frontend Pages

Date: 2026-07-11

## CRITICAL

(none)

## Summary
- Criticals: 0

## Files Reviewed

All 12 `app/**/page.tsx` files:

| File | Status |
|------|--------|
| `app/page.tsx` (home) | Static data, no async logic — OK |
| `app/battles/page.tsx` | Static — OK |
| `app/teams/page.tsx` | Static, hardcoded cards — OK |
| `app/battle/new/page.tsx` | Delegates to `BattleSetupForm` — OK |
| `app/battle/[id]/live/page.tsx` | Server component, awaits params, passes to client — OK |
| `app/battle/[id]/replay/page.tsx` | Server component with Suspense → `BattleReplayClient` (own AppShell) — OK |
| `app/battle/[id]/result/page.tsx` | Client component, race-safe useEffect, full loading/error/result states — OK |
| `app/agent/[id]/passport/page.tsx` | Client component, R20 path-traversal guard, skeleton/not-found/content branches — OK |
| `app/agent/viral-designer/passport/page.tsx` | Static, demo fixture — OK |
| `app/battle/demo/live/page.tsx` | Demo UI mapping, AttackMatrix normalization handles ID format — OK |
| `app/battle/demo/replay/page.tsx` | Static demo data — OK |
| `app/battle/demo/result/page.tsx` | Static demo data — OK |

## Observations (Non-Critical)

- `app/agent/[id]/passport/page.tsx:147` — `p.agentId.startsWith(agentId.replace(/-/g, "_"))` uses prefix matching for passport lookup. This mirrors the pattern already in `lib/demo-data.ts:255` (`makePassport`), so it is intentional and consistent. Would return wrong data only if multiple agents share an ID prefix, which is not the case in current fixtures.
- `app/battle/[id]/result/page.tsx:232` — "Completed" pill renders unconditionally when `result` is truthy, without checking `result.status`. Currently the API only returns completed bundles, so the label is correct; if the API ever supports partial results for in-progress battles, this label would be misleading.
- `app/agent/[id]/passport/page.tsx:130-160` — `loadAgentPassport` returns `null` (rendering "not found") for any `!response.ok` or network error when `agentId !== "demo"`. This conflates 500/network errors with 404, but this behavior is intentional and explicitly verified by the `page.test.tsx` "not-found branch" test.

## Test Verification

All 383 vitest tests pass. Typecheck and lint are clean.
