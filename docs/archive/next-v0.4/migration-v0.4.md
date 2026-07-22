# Migration Plan: v0.3 (Eve) → v0.4 (Mastra Reputation Arena)

> **Status**: in progress (PM: AgentArena orchestrator)
> **Source of truth**: [`Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md`](../Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md) + [`CLAUDE.md`](CLAUDE.md) + [`agents.md`](agents.md) + [`design.md`](design.md) + [`test-guidelines.md`](test-guidelines.md)

## 1. Why migrate

PRD v0.4 explicitly retires Eve framework in favor of Mastra OSS core (§1.6). The current repo at HEAD `cff1eb7` is Eve-first. The migration must:

- Preserve the existing deterministic Battle Engine work in `arena/engine/` (10 files of battle logic).
- Preserve all routes in `app/` and components in `components/`.
- Replace `agents/*/agent.ts` Eve-style skeletons with Mastra runtime adapters.
- Add real Postgres persistence (currently in-memory deterministic).
- Wire the SSE endpoint to the Live page (currently aliased to demo view).
- Adopt the v0.4 visual direction (B — Linear × 体育数据可视化) via `packages/ui-kit/tokens.css` style migration into existing `app/globals.css` + Tailwind config.
- Stand up CI, tests, observability per PRD §22.

## 2. Strategy: keep + add + replace

| Layer | Action | Reason |
|---|---|---|
| `arena/engine/*` | **Keep + harden** | Deterministic logic is solid; needs schema repair + real event-store writes |
| `arena/schemas/*` | **Keep + extend** | Zod schemas already cover Proposal/Attack/Defense/Passport; need BattleEvent + JudgeScore |
| `arena/events/*` | **Keep + wire** | Event types exist; need Postgres sink |
| `agents/*/` | **Replace runtime, keep prompts** | Prompts (`instructions.md`) + skills (`skills/*.md`) are reusable; `agent.ts` gets Mastra-backed |
| `app/*` | **Keep + bind to real APIs** | Pages render; replace aliasing with real fetches |
| `components/*` | **Keep + apply tokens** | Components work; migrate styles to design tokens |
| `lib/*` | **Extend** | Add `db/`, `sse-client`, `runtime-client` |
| **New** `lib/db/` | **Add** | Drizzle schema + Postgres client |
| **New** `lib/runtime/` | **Add** | Mastra adapter for ArenaAgentRuntime interface |
| **New** `tests/` | **Add** | Vitest + Playwright + coverage tooling |
| **New** `.github/workflows/` | **Add** | CI: typecheck + lint + test + build |
| `docs/*` | **Supersede** | New v0.4 docs replace eve-first docs (archive old) |

## 3. Sprint re-mapping (PRD §27)

### Sprint 0 — Foundation (in progress)
Already shipped:
- ✅ v0.4 PRD injected
- ✅ docs/CLAUDE.md + agents.md + design.md + test-guidelines.md
- ✅ .claude/commands/{ui,qa}-task.md

In progress (this week):
- ⏳ Migration plan (this file)
- ⏳ Issue decomposition (25+ issues)
- ⏳ Replace Eve with Mastra adapter (Issue #1)
- ⏳ Add Drizzle + Postgres schema (Issue #2)
- ⏳ Design tokens → app/globals.css + Tailwind config (Issue #3)

### Sprint 1 — Real Battle Engine
- Real round runner with event-store writes
- Schema repair loop with retry budget
- ArenaAgentRuntime interface + Mastra adapter
- Mock runtime for tests

### Sprint 2 — 5 Agents via Mastra
- Safe Builder, Viral Designer, Infra Hacker, Judge Panel, Artifact Writer
- Each output Zod-validates before persist
- Judge produces clear winner ≥90% runs

### Sprint 3 — Arena UI bind to real APIs
- Live page consumes SSE
- Result, Replay, Passport pages fetch from DB
- Lighthouse ≥90

### Sprint 4 — Hardening
- Example battle seed
- Retry/fallback/cost guard
- 3 consecutive battles pass

### Sprint 5 — Demo
- Pitch script runnable
- Visual regressions locked

## 4. Risk register

| Risk | Mitigation |
|---|---|
| 5 days of work lost if scope drifts | Migration plan freezes "keep" set; only swap what's explicitly marked |
| Mastra API churn | Pin version in package.json; wrap behind ArenaAgentRuntime interface |
| Postgres adds runtime dep to Vercel deploy | Use Neon serverless driver; lazy-init |
| Real SSE may be slow on Vercel free tier | Document fallback to polling; PRD §22 latency budget |
| Existing deterministic engine tests break under real runtime | Mock runtime swap; integration tests use mock, real-runtime tests gated behind env flag |

## 5. Done definition (Sprint 0)

- [ ] All 25+ migration issues filed in GitHub with labels (backend/frontend/ui/qa) + milestone "Sprint 0"
- [ ] `ArenaAgentRuntime` interface committed at `lib/runtime/contract.ts`
- [ ] Mastra adapter skeleton + mock at `lib/runtime/{mastra,mock}.ts`
- [ ] Drizzle schema at `lib/db/schema.ts` with all PRD §19 tables
- [ ] Tailwind config + `app/globals.css` consuming design.md tokens
- [ ] `pnpm typecheck && pnpm lint && pnpm test` green
- [ ] CI workflow runs on PR (even if only typecheck + lint initially)

## 6. Coordination

- PM (this orchestrator) lives in `/loop` cron + this session
- Engineers spawn as `general-purpose` sub-agents via Agent tool, in background
- Each agent writes `docs/sessions/<agent-id>/status.md` (running / done / blocked / next)
- Phase summaries land at `docs/sessions/phase-N/summary.md`
- Board at `docs/sessions/board.md` mirrors GitHub issues + agent statuses
- Memory updated after every phase boundary

## 7. What NOT to do (carryover from PRD §8.5)

- No external agent submission
- No multi-judge
- No real auth
- No paid badges
- No arbitrary shell/MCP tools