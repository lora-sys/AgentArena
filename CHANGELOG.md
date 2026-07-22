# Changelog

All notable changes to Agent Arena are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Vite/Hono visual rewrite — 2026-07-22

- Replaced the duplicated Next.js presentation layer with a focused Vite + React frontend and Hono API adapter.
- Consolidated the product into four routes: landing, battle workspace, archive/dashboard, and Agent Passport.
- Added event-array replay with parallel same-round actors, HP damage, typewriter copy, round transitions, commentary, evidence inspection, result, replay, and mobile layouts.
- Preserved the Battle Engine, schemas, event store, database, fixtures, and Mastra-compatible runtime boundaries.
- Added deterministic fallback behavior, three-run Example Battle validation, current-route E2E coverage, and refreshed project memory.
- Stopped tracking generated frontend builds and archived the removed Next.js implementation guidance.

---

## Sprint 1 — Real Battle + Hardening (2026-07-10)

**Status**: Mostly complete; 4 backlog items remain.

**Summary**: Wired real `POST /api/battles` endpoint, hardened 5 API routes with rate limiting and input validation, fixed 10 critical bugs across 3 adversarial review waves, and expanded Playwright E2E coverage to 14/20 PRD §8.3 rows.

### Key commits

| Area | What |
|---|---|
| API | `POST /api/battles` endpoint with idempotency + rate limit + input validation |
| Guards | `lib/api/guards.ts` (withRateLimit, validateBattleId, validateIdea, withInputValidation) — 31 new tests |
| DB | `mode` column on battle table (migration `0002_lethal_omega_red.sql`) |
| Frontend | B7 passport SSR — Client Component rewrite of `app/agent/[id]/passport/page.tsx` |
| QA | 6 new Playwright spec files (defense-round, judge-scores, export-markdown, example-battle, api-validators, smoke-routes) — 12 total |
| Build | Playwright webServer config (auto-starts `pnpm dev`) |
| Fix | Rate limiter memory growth, spoofable X-Forwarded-For, burst on window boundary (3 critical) |
| Fix | POST /api/battles TOCTOU race, Zod whitespace, missing rate limit wire (3 critical) |
| Fix | E2E reliability: api-validators silent pass, blind waitForTimeout (4 critical) |

### Quality gates

| Gate | Result |
|---|---|
| typecheck | 0 errors |
| lint | 0 errors, 11 warnings (unused vars) |
| test | 167/167 vitest pass (was 115 at Sprint 0) |
| build | all routes built |
| CI e2e | green (after e2e server-start fix) |

### Backlog (4 items)

- B10: Passport SSR flaky in some e2e runs (LOW, post-B7)
- B11: Replay timeline locator audit (LOW)
- B12: ffmpeg missing for Playwright video recording (INFO, env)

### Process learnings

- 3 reviewer agents per implementation cycle caught different bug classes (rate limit logic / API semantics / test reliability)
- Long-running agent loops (15+ min) on tight scope should be TaskStop'd + PM-direct
- B5 (Chromium path) and B6 (rate limit wired) were the two highest-leverage fixes — unblocked local e2e for the first time

---

## Sprint 0 — Skeleton (2026-07-10)

**Duration**: ~5 hours wall-clock (one extended session)
**Commits**: 16 total (12 substantive + 4 chore)

**Summary**: Built the monorepo foundation — deterministic Battle Engine, Drizzle schema (12 tables per PRD §19), Postgres event store, Mastra runtime adapter, schema repair loop, mock runtime, Zod schemas, 6 frontend pages bound to demo data, design tokens (visual direction B), Storybook, 5 Playwright spec files, and the `hackathon-001` example fixture.

### Key commits

| Area | What |
|---|---|
| Monorepo | pnpm workspaces init, tsconfig.base.json strict, ESLint 9 flat config |
| Schema | Drizzle ORM + Postgres schema (`lib/db/schema.ts`) — 12 tables |
| Engine | Deterministic Battle Engine (`arena/engine/*` — 9 files) |
| Event store | Postgres-backed `event-store-postgres.ts` + in-memory legacy split |
| Runtime | `ArenaAgentRuntime` contract + Mastra adapter + mock runtime + 3-retry repair loop |
| API client | Typed `lib/api-client.ts` + SSE client with reconnect (`lib/sse-client.ts`) |
| IDs | Battle ID generator (PRD §8) — FNV-1a + Crockford base32 |
| Security | Tool allowlist (`agents/tools/allowlist.ts`) per PRD §7 |
| Frontend | 4 pages bound: `/battle/[id]/{live,result,replay}` + `/agent/[id]/passport` |
| UI | Design tokens (visual direction B), Storybook (5 ui-kit components), print stylesheet |
| E2E | 5 Playwright spec files |
| Fixture | `examples/fixtures/hackathon-001.json` + loader + 3 tests |
| Docs | `docs/CLAUDE.md`, `docs/agents.md`, `docs/design.md`, `docs/test-guidelines.md`, `docs/migration-v0.4.md`, `docs/ci.md`, ADR-0001 |
| Visual | 8 baseline PNGs via agent-browser (home/live/result/replay/passport, desktop + mobile) |
| Issues | 20 GitHub issues filed, 20/20 closed |

### Critical bugs fixed (from adversarial review)

1. Mastra attack parameter type lie (AttackOutput vs AttackInput)
2. JSON.parse error swallowed in mastra.ts
3. Repair loop off-by-one (4 attempts vs 3)
4. Missing `battle_failed` event emission
5. Score allowed zero evidence binding (PRD invariant #1)
6. Tool allowlist file did not exist (PRD invariant #4)
7. Battle ID format wrong (PRD §8)

### Quality gates

| Gate | Result |
|---|---|
| typecheck | 0 errors |
| lint | 0 errors, 9 warnings (unused vars) |
| test | 115/115 pass |
| build | all routes built, no bundle leak |
| CI | green (last 2 runs) |

### Deferred to Sprint 1+

- Real LLM calls (Mastra) end-to-end — needs OPENAI_API_KEY
- Real Postgres persistence wiring in demo pages
- API rate limiting + input validation (reviewer-3 findings)
- 15/20 PRD §8.3 Playwright journey coverage

### Process learnings

- Background agents + 10-min /loop cron enabled parallel work without user babysitting
- File-based status protocol (`docs/sessions/<agent>/status.md`) survived session boundaries
- Tight scope per agent (≤5 files, 1 issue) → high completion rate
- Adversarial reviewers in parallel (3 lenses) caught bugs the original author missed
- Visual review via agent-browser CLI faster and simpler than Playwright for one-off shots
