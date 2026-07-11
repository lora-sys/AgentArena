# R30 Frontend Pages

Date: 2026-07-10

## CRITICAL

1. app/battle/[id]/live/page.tsx:12 — `currentRound="cross_attack"` is hardcoded on AppShell for ALL battle IDs. The BattleRail (in components/app-shell.tsx:22-29) links every round entry to `/battle/demo/live` or `/battle/demo/replay`. When viewing a non-demo battle, clicking any rail item navigates away from the current battle to the demo, losing context and round state. The active round highlight is also always "Cross Attack" regardless of the actual battle round.

2. app/battle/[id]/result/page.tsx:189 — Client component calls `use(params)` to unwrap the route param, but there is NO Suspense boundary above this component. In React 19 / Next.js 15, `use()` of a Promise in a client component will suspend rendering; without a Suspense boundary the page will throw "A component suspended while responding to synchronous input" during SSR/hydration. The sibling page app/battle/[id]/replay/page.tsx correctly wraps its client component in Suspense; the result page does not.

3. app/agent/[id]/passport/page.tsx:266 — Same issue: client component calls `use(params)` without a Suspense boundary. Will throw during SSR/hydration on any agent passport page. The demo fallback (agentId === "demo") masks the issue in test but production hydration will fail.

4. app/battle/[id]/result/page.tsx:225 — The page renders as a client component but does not handle the case where `use(params)` resolves to a non-string value or where the route param is missing. If `[id]` doesn't exist in the URL (Next.js always provides it), there is no defensive guard. The fetchBattleResult call at line 201 will fail with a 404 but the page only renders the loading skeleton until then; combined with issue #2 this may leave the page in an unrecoverable state.

## Summary
- Criticals: 4