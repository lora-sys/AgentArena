# R17 Frontend Components

Date: 2026-07-10

## CRITICAL

1. **components/battle-setup-form.tsx:69** — Idempotent-battle redirects always land on `/battle/demo/live`. The form calls `POST /api/battles` and reads `data.battle?.id` as the battle id, then `router.push(\`/battle/${battleId}/live\`)`. The route returns `{ battleId, status: "created" }` on its two 200-status idempotency paths (existing-battle lookup at app/api/battles/route.ts:67-70 and TOCTOU-race recovery at app/api/battles/route.ts:108-111), so `data.battle` is `undefined` and the form falls back to the literal string `"demo"`. Any user re-submitting the same idea (idempotent path) or any POST that loses the race after a 201 assignment is silently navigated to the demo battle instead of the real battle they just created/persisted. The localStorage write at line 73-83 also stores the wrong battleId, so a refresh after a duplicate submission replays the demo battle as if it were a new run.

## Summary
- Criticals: 1
