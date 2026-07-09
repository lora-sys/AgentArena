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