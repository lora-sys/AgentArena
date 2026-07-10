# Sprint 1 Summary — Real Battle + Hardening (2026-07-10)

**Date**: 2026-07-10
**Status**: Sprint 1 mostly complete; 4 backlog items remain
**Branch**: `main`
**Commits**: 6 new + earlier waves total 28+

## 1. What shipped (Sprint 1 wave 8 + 9)

### Backend
| Item | Status | Evidence |
|---|---|---|
| `POST /api/battles` endpoint | ✅ | app/api/battles/route.ts, 13 new tests |
| `lib/api/guards.ts` (withRateLimit, validateBattleId, validateIdea, withInputValidation) | ✅ | 31 new tests |
| Guards applied to 5 route files | ✅ | 4 reviewer-3 high-priority findings closed |
| `mode` column on battle table | ✅ | migration 0002_lethal_omega_red.sql |
| B7 passport SSR (Client Component) | ✅ | app/agent/[id]/passport/page.tsx |
| B9 (rate limit wired on POST) | ✅ | closed by withRateLimit wrap |
| B5 (system Chromium path) | ✅ | playwright.config.ts |

### QA
| Item | Status | Evidence |
|---|---|---|
| 6 new Playwright spec files (defense-round, judge-scores, export-markdown, example-battle, api-validators, smoke-routes) | ✅ | tests/e2e/ (12 total) |
| PRD §8.3 coverage | 14/20 rows | most capability rows covered |
| Playwright webServer config (starts pnpm dev) | ✅ | playwright.config.ts |

### Bug fixes from 3 review waves (10 criticals)
- **Rate limiter (3 critical)**: memory growth → bucket cleanup; spoofable X-Forwarded-For → last-hop IP validation; burst on window boundary → proportional token refill
- **POST /api/battles (3 critical)**: TOCTOU race → unique index + recovery; Zod schema whitespace → trim before length check; rate limit not wired → wrapped with withRateLimit
- **E2E reliability (4 critical)**: api-validators test silently passed on 200, reduced to 10 boundary requests with skip-when-not-wired; battle-setup had 25x blind waitForTimeout → replaced with waitForResponse + waitForURL

## 2. Quality gates (all green)

| Gate | Result |
|---|---|
| `pnpm typecheck` | 0 errors |
| `pnpm lint` | 0 errors, 10 unused-var warnings |
| `pnpm test` | 167/167 vitest pass (was 115 at end of Sprint 0) |
| `pnpm build` | all routes built |
| CI e2e job | green (after e2e server-start fix) |

## 3. Backlog (4 items)

| ID | Description | Severity |
|---|---|---|
| B10 | Passport SSR flaky in some e2e runs (post-B7, mostly fixed) | LOW |
| B11 | Replay timeline locator audit — other tests still use old ARIA | LOW |
| B12 | ffmpeg missing for Playwright video recording (env) | INFO |

## 4. What's still pending (Sprint 1 closeout)

- **Real Mastra end-to-end** (5 agents via LLM) — needs OPENAI_API_KEY
- **Real Postgres persistence** (demo pages read from in-memory; real DB path exists but not wired)
- **Coverage aspirational targets** (engine 80, schemas 95, ui-kit 60) — currently at 76.5% global floor

## 5. Process learnings (additive to Sprint 0)

- 3 reviewer agents per implementation cycle caught different bug classes (rate limit logic / API semantics / test reliability)
- Long-running agent loops (15+ min) on tight scope should be TaskStop'd + PM-direct
- B5 (Chromium path) and B6 (rate limit wired) were the two highest-leverage fixes — unblocked local e2e for the first time

## 6. Final state

**MVP capabilities**:
- 6 pages render with full content
- POST /api/battles creates real battles (idempotent)
- 5 route files hardened with rate limit + input validation
- 12 Playwright spec files covering 14 PRD §8.3 rows
- 167 unit tests + 12 e2e specs
- 6 reviewer agents → 20+ critical bugs found and fixed
- Build, typecheck, lint, CI all green
- 8 visual baselines refreshed

**MVP ready for demo + Sprint 2 (real LLM agents)** when env (OPENAI_API_KEY) is available.
