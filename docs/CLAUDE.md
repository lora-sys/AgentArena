# CLAUDE.md — Agent Arena

> Project fact sheet. Read this before touching anything. For role-specific work, also read `agents.md`.

## 1. What this is

**Agent Arena** is a reputation arena for AI agent teams. Three agent teams enter a structured Battle, generate proposals, attack each other, defend, get scored, and produce replayable evidence plus an Agent Passport Snapshot.

Source of truth for product: [`Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md`](../Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md) (PRD v0.4).

**One-line**: Don't trust an agent's self-description. Put it in the Arena.

## 2. Tech stack (P0)

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript 5.5+ (strict) | Shared types end-to-end, Zod as single source |
| Runtime | Node.js 20 LTS | Mastra requirement |
| Monorepo | pnpm workspaces | Package isolation, faster CI |
| Web | Next.js 15 (App Router) + React 19 | PRD §18.2 |
| UI | Tailwind CSS 4 + shadcn/ui + Radix Primitives | Fast arena UI without vendor lock |
| AI runtime | Mastra OSS (core only) | PRD §1.6 |
| Model | OpenAI first (`provider/model` pattern) | PRD §18.2 — provider-agnostic later |
| Validation | Zod 3.x | API + agent output share one schema |
| ORM | Drizzle ORM | Type-safe, less ceremony than Prisma |
| Database | PostgreSQL 16 | Event store |
| Realtime | Server-Sent Events (SSE) | One-way stream, no WebSocket overhead |
| Deploy | Vercel (P0 demo); Postgres via Neon/Supabase | Fastest demo path |
| Test | Vitest (unit/integration), Playwright + agent-browser (E2E/visual) | See `test-guidelines.md` (next round) |
| Lint/format | ESLint 9 (flat config) + Prettier 3 | |
| Hooks | Husky + lint-staged | Pre-commit typecheck + lint |

## 3. Repo layout

```
agentarena/
├── apps/
│   └── web/                    Next.js app — UI + API routes (SSE)
├── packages/
│   ├── battle-engine/          State machine, round runner, event writer (PRD §11)
│   ├── agent-runtime/          ArenaAgentRuntime interface + Mastra adapter (PRD §18.5)
│   ├── schemas/                Zod: Proposal/Attack/Defense/Passport/JudgeScore/BattleEvent
│   ├── event-store/            Postgres + Drizzle. Authoritative state for replay.
│   ├── ui-kit/                 Component library (Button, Card, ScoreCell, EventLog…)
│   └── test-utils/             Factories, fixtures, in-memory event store for tests
├── agents/                     AgentSpec YAML/MD + per-agent prompt files
│   ├── safe-builder/
│   ├── viral-designer/
│   ├── infra-hacker/
│   ├── judge-panel/
│   └── artifact-writer/
├── examples/                   Pre-baked Example Battle fixtures (PRD §16.1)
├── docs/
│   ├── CLAUDE.md               This file
│   ├── agents.md               Role orchestration + handoff protocol
│   ├── design.md               Visual language (B direction) — next round
│   ├── test-guidelines.md      Test pyramid + evidence format — next round
│   ├── adr/                    Architecture Decision Records
│   └── learnings/              Per-role session logs (append-only)
├── .github/workflows/          CI: typecheck, lint, test, e2e
├── package.json                Root: workspaces + scripts
├── pnpm-workspace.yaml
└── tsconfig.base.json          Strict, paths for cross-package imports
```

## 4. Package boundary rules

These rules exist to keep modules replaceable. Breaking them requires an ADR in `docs/adr/`.

1. **`apps/web` may import from any `packages/*` package.** Never the reverse.
2. **`packages/battle-engine` does NOT import from `packages/agent-runtime` or `packages/ui-kit`.** Engine calls runtime through the `ArenaAgentRuntime` interface (`packages/agent-runtime/src/contract.ts`); tests use the in-memory mock in `packages/agent-runtime/src/mock.ts`.
3. **`packages/schemas` has zero runtime deps** beyond `zod`. Anything else goes elsewhere.
4. **`packages/event-store` is the only package that talks to Postgres directly.** Battle Engine consumes events via repository interfaces so it stays testable.
5. **`packages/ui-kit` has no domain knowledge.** It does not know what a Proposal or Attack is. Domain shapes are composed by `apps/web` from ui-kit primitives.
6. **`agents/*` are prompt/spec files only.** Code lives in `packages/agent-runtime`. Prompts must produce the Zod schemas in `packages/schemas` — anything else is a bug.

Dependency direction (no cycles):

```
apps/web → packages/* → (no reverse edges)
packages/schemas ← anything that validates
packages/battle-engine → packages/schemas, packages/agent-runtime(interface only), packages/event-store(interface only)
packages/agent-runtime → packages/schemas
packages/event-store → packages/schemas
packages/ui-kit → nothing internal (only Radix/Tailwind)
```

## 5. Commands

Run from repo root unless noted.

```bash
# Setup
pnpm install
cp .env.example .env.local   # then fill in OPENAI_API_KEY, DATABASE_URL

# Dev
pnpm dev                     # all packages in watch mode; web on :3000
pnpm --filter web dev        # just web

# Build
pnpm build                   # all packages
pnpm typecheck               # tsc --noEmit across workspace

# Test
pnpm test                    # vitest run across workspace
pnpm test:watch              # vitest watch
pnpm --filter battle-engine test:coverage

# E2E / visual (uses agent-browser, not raw Playwright by default)
pnpm e2e                     # Playwright journeys
pnpm e2e:visual              # agent-browser screenshots for design review

# Lint / format
pnpm lint
pnpm format

# DB
pnpm db:push                 # apply Drizzle schema to dev DB
pnpm db:studio               # Drizzle Studio GUI
pnpm db:seed:example         # load examples/hackathon-demo battle
```

## 6. Environment variables

`.env.local` lives at repo root. Never commit.

| Var | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `OPENAI_API_KEY` | yes | Default model provider |
| `DEFAULT_MODEL` | no | `openai/gpt-5` by default; override per battle |
| `BATTLE_DEFAULT_TIME_BUDGET_MS` | no | 240_000 (4 min) |
| `LOG_LEVEL` | no | `info` default; `debug` for engine traces |
| `ENABLE_EXAMPLE_BATTLES` | no | `true` for demo safety per PRD §8.3 |
| `SSE_HEARTBEAT_MS` | no | `15000` |

## 7. Core invariants (from PRD §11.3, §12.3, §23.1)

Any PR violating these is rejected.

- **Battle Engine owns flow.** Model never decides round order, who attacks whom, or champion selection.
- **One Judge Panel per Battle (P0).** Multi-judge is P1.
- **Every Score binds to ≥1 `evidenceEventId`.** No free-floating scores.
- **Passport Snapshot must show weaknesses**, not just strengths.
- **No tool allowlist outside `agents/tools/allowlist.ts`.** No shell, no `exec`, no `fs.write` outside the artifact writer's own output dir.
- **All event payloads pass Zod validation before persistence.** `schema_validation_failed` is itself an event (PRD §13.4).
- **Replay and Passport only read from event store.** Never from in-memory state. Page refresh must rebuild everything.
- **Artifact Writer may not invent facts.** Cross-check at generation time; cite source event IDs.

## 8. Naming

- Files: `kebab-case.ts`. React components: `PascalCase.tsx`. Test files: `*.test.ts` colocated with source.
- Database tables: `snake_case`. Singular nouns (`battle`, not `battles`).
- Zod schemas: `ProposalSchema`, exported with both `type Proposal` and `ProposalSchema`.
- Event types: lowercase snake `proposal_created`, `model_call_failed` (PRD §13.4).
- Agent IDs: `team_<role>_<version>` (e.g. `team_safe_builder_v1`).
- Battle IDs: `btl_<8-char base32>`.

## 9. Test conventions (preview, full version in `test-guidelines.md`)

- Every package ships a `vitest.config.ts`. Coverage bar: **≥80% lines, ≥70% branches** for `battle-engine`, `agent-runtime`, `schemas`, `event-store`. UI-kit: ≥60% (visual coverage via Storybook).
- Tests colocated with source. Integration tests under `<pkg>/tests/`.
- E2E lives in `apps/web/tests/e2e/` (Playwright) and `docs/learnings/visual/` (agent-browser screenshots).
- One example battle fixture per round, in `examples/fixtures/`, used by both unit and E2E.

## 10. Git workflow (summary)

See `~/.claude/rules/git-workflow.md` for full rules.

- Branch: `feat/<scope>-<desc>`, `fix/<scope>-<desc>`, `chore/<desc>`.
- Commit prefix: `feat:` / `fix:` / `refactor:` / `docs:` / `test:` / `chore:` / `perf:` / `ci:`.
- Every PR links the PRD section it implements (e.g. `Closes PRD §11.2`).
- CI must pass: typecheck + lint + test + (if web package) build.

## 11. Where to look first

| If you're working on… | Start here |
|---|---|
| A new round in the state machine | `packages/battle-engine/src/rounds/` |
| Agent output validation | `packages/schemas/src/` |
| Database schema | `packages/event-store/src/schema.ts` + `drizzle/` |
| A page or SSE stream | `apps/web/app/` |
| An AgentSpec or prompt | `agents/<team>/spec.yaml` + `agents/<team>/prompt.md` |
| Example battle data | `examples/fixtures/hackathon-001.json` |
| Why a decision was made | `docs/adr/NNNN-*.md` |

## 12. Out of scope (P0)

Do NOT implement these in P0 even if they seem small:

- External agent submission (PRD §8.5)
- Multi-judge panel
- User accounts / login
- Long-running leaderboards
- Arbitrary tool execution / MCP marketplace
- Real-money badges / paid trials

If a task feels like it's drifting into these, stop and re-read PRD §8.5.

## 13. Battle Engine architectural rules (CRITICAL — from 2026-07-20 review)

These rules were violated and caused systemic failures. They are now project invariants.

- **Battle Engine MUST NOT run synchronously in request handlers.** `runDemoBattle()` and `runBattleFromPayload()` must be async or offloaded. A synchronous engine blocks the server thread, makes `withGlobalConcurrency` ineffective, and breaks SSE streaming entirely.
- **AbortController cancel MUST work.** If `registerAbortController` is called before battle execution, the battle engine MUST periodically check `signal.aborted` and stop early. Clearing the controller in `finally` before async work completes means cancel is a no-op.
- **Demo data MUST be lazy-loaded.** `runDemoBattle()` at module top-level (`lib/demo-data.ts`) executes on every cold start and bloats client JS bundles. Wrap in a `getDemoBundle()` function that caches on first call, or mark the module `server-only`.
- **No battle re-execution on every request.** `GET /api/battles/:id/events` must not call `runBattleFromPayload` — it must read from an event store or in-memory cache. Re-running the entire battle per poll is O(n²) waste.
- **SSE streaming requires actual async iteration or a polling fallback.** If SSE cannot deliver events progressively, remove the SSE endpoint and use `GET /api/battles/:id/events` with polling only. A broken SSE that delivers all events in one shot is worse than polling — it gives false confidence.

## 14. API route rules

- **Passport API must filter by agent ID.** `GET /api/agents/:id/passport` must return passport data for the requested agent, not always return demo data. The `id` parameter must be validated against the event store or demo bundle.
- **Route schemas must match what the client sends.** If `components/battle-setup-form.tsx` sends `{ idea, battleType, timeLimit, preference, outputTargets }`, the start route schema must validate all fields. Silently dropping settings is a UI lie — the setup form has zero effect.

## 15. UI/UX rules (from 2026-07-20 visual review)

- **Event badges must use type-specific colors.** Every event using `bg-team-viral/10 text-team-viral` (purple) regardless of type is a UX failure. Proposals, attacks, defenses, scores, and cancellations must each have a distinct color.
- **Navigation must adapt to context.** Hardcoded links to `/agent/viral-designer/passport` and `/battle/demo/live` in `app-shell.tsx` make the app feel broken when viewing a different agent or battle. Navigation hrefs must be derived from the current route context.
- **Mobile responsiveness is mandatory.** Nav tabs, setup form chips, and proposal columns must not overflow on 390px viewports. Test all pages at 375px and 390px widths.
- **Loading and empty states must be designed.** Components must render gracefully when SSE data is delayed, events are empty, or an agent has no passport data. No blank screens or unmapped errors.

## 16. E2E test rules

### 16.1 基础规则（来自 `docs/test-guidelines.md`，必须遵守）

- **Tests must not depend on SSE timing.** SSE-dependent tests (live battle, replay, event drawer) must use explicit wait conditions or mock the SSE source. 18-20s timeouts from `toBeVisible()` failures indicate a test/data problem, not a slow browser.
- **WebKit compatibility must be verified or excluded.** If WebKit tests all fail immediately (0-3ms), either fix the compatibility issues or exclude WebKit from the default test suite with a documented reason.
- **Rate limiting tests must be deterministic.** Flaky rate-limit tests indicate the token-bucket implementation or test setup is unreliable. Fix before considering the guard production-ready.
- **No `waitForTimeout`.** Always `waitForFunction` or `expect(locator).toBeVisible()` with explicit timeout. Network waits use route interception, not real network.
- **SSE tests use deterministic event injector.** Tests must not depend on the live engine's timing. Use a mock SSE source that emits events on demand.

### 16.2 Sprint 2 E2E Gate（Sprint 2 期间强制执行）

以下门禁是 Sprint 2 的硬性条件，不满足则不能进入 demo 阶段：

- **全量 E2E 通过率 ≥ 90% on chromium-desktop.** After all CRITICAL + HIGH fixes land, run the full suite. Target: ≥90% pass rate (currently 148/324 = 45.7%). Every failing test must be fixed or formally quarantined with a documented reason.
- **chromium-mobile pass rate ≥ 80%.** Mobile viewport (390x844) is a first-class target. Tests that fail on mobile due to CSS issues must be fixed, not quarantined.
- **SSE-dependent tests must use mock SSE.** Any test that exercises the live battle, replay, or event drawer pages must use a deterministic event injector (`lib/sse-client.test.ts` pattern). Tests that depend on real SSE timing are flaky by definition and must be rewritten.
- **Every new E2E test must pass on both viewports.** Before merging any PR that adds or modifies an E2E test, verify it passes on desktop (1440x900) AND mobile (390x844). No exceptions.
- **Flaky test quarantine SLA.** Any test that fails 3 times in a row on CI must be moved to `tests/e2e/quarantine/` within 1 sprint. The owner is whoever last touched the affected code. Quarantined tests do not count toward the 90% gate.

### 16.3 Sprint 2 E2E 必过测试清单

These are the journeys that MUST be green on chromium-desktop before demo:

| # | Journey | File | What it proves |
|---|---|---|---|
| 1 | Home page loads | `home.spec.ts` | First impression works |
| 2 | Battle setup form | `battle-setup.spec.ts` | User can create a battle |
| 3 | Battle setup edge cases | `battle-setup-edge-cases.spec.ts` | Form validation works |
| 4 | Smoke routes | `smoke-routes.spec.ts` | All pages render without crash |
| 5 | API status | `api-status.spec.ts` | API routes respond |
| 6 | Agent passport | `agent-passport.spec.ts` | Passport page renders correctly |
| 7 | Attack matrix | `attack-matrix-coverage.spec.ts` | Attack matrix displays |
| 8 | Live battle with cards | `live-page-with-cards.spec.ts` | Live page renders all components |
| 9 | Battle replay | `battle-replay.spec.ts` | Replay page renders |
| 10 | Event drawer | `event-drawer.spec.ts` | Event drawer opens and displays |
| 11 | Judge scores | `judge-scores.spec.ts` | Scoreboard renders |
| 12 | Defense round | `defense-round.spec.ts` | Defense cards render |
| 13 | Battle result | `battle-result.spec.ts` | Result page renders champion |
| 14 | Print stylesheet | `print-stylesheet.spec.ts` | Print CSS works |
| 15 | API validators | `api-validators.spec.ts` | API rejects invalid input |

## 17. Current known issues (tracked, not blocking demo)

| Priority | Issue | File(s) | Status |
|---|---|---|---|
| CRITICAL | Battle engine sync in request handlers | `app/api/battles/[id]/start/route.ts`, `events/stream/route.ts` | Must fix before demo |
| CRITICAL | Demo data executes at module import | `lib/demo-data.ts:35` | Must fix before demo |
| CRITICAL | Passport API ignores agent ID | `app/api/agents/[id]/passport/route.ts` | Must fix before demo |
| HIGH | Events route re-runs battle on every poll | `app/api/battles/[id]/events/route.ts` | Must fix before demo |
| HIGH | Setup form settings silently dropped | `components/battle-setup-form.tsx`, start route | Must fix before demo |
| HIGH | Event badge colors all identical | `components/live-battle-client.tsx:292` | Must fix before demo |
| MEDIUM | Hardcoded navigation links | `components/app-shell.tsx` | Fix in Sprint 2 |
| MEDIUM | SSE client silent failure on max retries | `lib/sse-client.ts` | Fix in Sprint 2 |
| MEDIUM | In-memory rate limiting ineffective on multi-instance | `lib/api/guards.ts` | Fix in Sprint 2 |
---

## 17. Frontend narrative rhythm (from 2026-07-21 redesign)

**Awwwards-style narrative — every page tells a story.**

- **Hero copy must earn the first 3 seconds.** No "Welcome to X. We are Y." Pattern interrupts. Use a counter-narrative headline that names a tension ("Don't ask one AI / Make three teams fight").
- **One focal element per page.** A page that tries to do everything does nothing. Identify the hero block (a score, a quote, a trophy, a passport seal) and treat surrounding content as supporting cast.
- **Cinema, not dashboard.** Use full-bleed background glows, gradient borders, asymmetric grid. Never center-aligned three-card heroes.
- **Type is the hero.** Display sizes start at 40px and scale to `clamp(40px, 6vw, 76px)`. Weights ≥ 800. Negative letter-spacing −0.02 to −0.04em on display.
- **Real data > mock copy.** Live ticker pulls real events from `bundle.events`. Podium shows actual scores. Passport shows actual strengths. Never use "24", "15", "62%" invented stats.
- **Animation in layers, not everywhere.** 500–800ms entrance on hero block, light micro-motion (1–2s pulse) on live states. Slow ticker scroll (50s loop). Stagger delays via `--i` index for cards.

## 18. Agent product experience (PRD §1 — "what an agent product must do")

- **Show AI doing work, not promise it.** When a team "Streams", show monospace streamed text in real time. When an attack fires, show severity color + claim + evidence. Hide nothing behind spinners longer than 200ms.
- **Live events must feel live.** SSE must actually push events progressively. The battle stream UI mirrors this with a `ticker-scroll` 50s infinite loop and a `live-pulse` red dot.
- **No empty states that are just spinners.** Skeleton shapes (event-feed rows, score cards) are required during initial load. A blank screen for >500ms is a product failure.
- **Cancellation must be honored.** The cancel button must optimistically reflect the user's intent, even if the server takes time to respond. R26: never 500 on cancel.
- **Evidence must be searchable.** Every claim in the UI is bound to a battle event ID. The "View in replay" deep link is the product's single source of truth.

## 19. Real backend, not mock

The demo currently runs entirely off a deterministic `runDemoBattle()` from `arena/engine/demo-battle.ts`. The P0 demo path is acceptable, but the product promise is "real AI agents". The next iteration must:

- **Replace `runDemoBattle()` with a real async path** that streams events from the battle engine (already async). The current SSE route reads from cached `bundle.events` synchronously.
- **Wire the Mastra runtime** to a real LLM provider (OpenAI/Anthropic). Each team becomes a streaming LLM call that emits typed events.
- **Persist real events to Postgres** instead of an in-memory bundle. The event store is already scaffolded in `lib/db/`.
- **Show real progress** — when an LLM call is in flight, show "Streaming tokens…" in the agent status card with the actual model output.

## 20. Pages still to fix (Sprint 2.5)

- `/battles` (list) — currently a static table, needs hero stats + filter
- `/teams` (list) — currently static, needs interactive comparison
- `/explore` (top-nav link) — currently 404. Should be a Battle Replay exploration hub
- `app/battle/[id]/live` — current dynamic route uses client component with SWR but never tested in production
- `app/agent/[id]/passport` — works for known IDs only; "not found" path needs polish

## 21. Design system extraction (planned)

All page-specific CSS classes are currently in `app/globals.css` (one giant file). This is acceptable for a single-page demo but does not scale. The next iteration must extract a proper token system into `packages/ui-kit`:

- **Tokens** — colors, spacing, type, shadows, radii, motion (already exist as CSS variables — keep)
- **Primitives** — Button, Card, Pill, Score, Seal, Avatar (extract from `arena-cards.tsx`)
- **Patterns** — HeroBlock, StageCard, PodiumCeremony, PassportDocument, BattleStream
- **A11y** — all interactive elements must be keyboard-navigable; visible focus rings; `aria-live="polite"` on event streams; reduced-motion media query applied to all CSS animations
