# Backlog — bugs found by qa-e2e-journeys agent (2026-07-10)

From `docs/sessions/agents/qa-e2e-journeys/status.md`. These are pre-existing app bugs, not test bugs.

## B1. "use client" directive in wrong position
- **File**: `components/arena-cards.tsx:449`
- **Symptom**: `"use client"` appears mid-file instead of at top
- **Impact**: Next.js error: "use client" must be the FIRST statement in a file
- **Fix**: Move to line 1
- **Severity**: HIGH (breaks build or page render)

## B2. Server/client component boundary errors
- **Files**: `app/agent/[id]/passport/page.tsx`, `app/battle/[id]/live/page.tsx`, `app/battle/[id]/result/page.tsx`
- **Symptom**: These files import from `lib/demo-data` (which imports `@/arena/engine/demo-battle`) but the engine re-exports types that include `pg` types
- **Impact**: Build or runtime errors when pages are server-rendered
- **Fix**: Replace type imports with explicit `import type` from `@/arena/schemas/types` only; remove engine import from demo-data where unnecessary
- **Severity**: HIGH

## B3. Missing POST /api/battles endpoint
- **File**: `app/api/battles/route.ts` (or not exist)
- **Symptom**: No POST handler for creating new battles; only demo data route exists
- **Impact**: `/battle/new` form submission fails (404)
- **Fix**: Implement POST handler with Zod validation (per PRD §8.3 acceptance for Battle Setup)
- **Severity**: CRITICAL (blocks the full happy path)

## B4. Cold-compile delay in tests
- **Symptom**: First e2e run takes 60+ s waiting for Next dev compile
- **Impact**: CI e2e run time blowup
- **Fix**: Use `pnpm build && pnpm start` (production server) instead of `pnpm dev` in CI; already done in commit 351f929
- **Severity**: INFO (resolved)

## Notes
- B1 and B2 were transient state — already fixed by attack-matrix and visual-review agents before this backlog was filed. See `docs/sessions/agents/fix-e2e-blockers/status.md` for verification.
- B3 is a real Sprint 1 deliverable (POST /api/battles endpoint).
- B4 is already addressed.
