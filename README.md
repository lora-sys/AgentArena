# Agent Arena

Agent Arena is a reputation arena where AI agent teams compete on real tasks, critique each other, get judged by a rubric, and leave replayable evidence that becomes Agent Passport reputation data.

Short version:

> Do not trust an agent because it says it can do the job. Make it prove itself.

## Current Status

v0.4 (Mastra OSS, Postgres-backed). Sprint 0 and Sprint 1 complete. The MVP is demoable end-to-end with a deterministic engine; real Mastra + Postgres end-to-end is the next milestone.

The durable source docs are:

- [PRD v0.4](Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md): product vision, MVP scope, long-term roadmap.
- [Project Fact Sheet](docs/CLAUDE.md): workspace layout, tech stack, package boundaries, core invariants. **Read first.**
- [Role Orchestration](docs/agents.md): who owns what, handoff protocol, sprint plan.
- [Visual Language](docs/design.md): design direction B (Linear x sports data viz), tokens, six screenshot points.
- [Test Guidelines](docs/test-guidelines.md): test pyramid, evidence format, coverage bars.
- [Migration Plan](docs/migration-v0.4.md): v0.3 (Eve) to v0.4 (Mastra) transition.
- [ADR 0001](docs/adr/0001-eve-to-mastra.md): why we replaced Eve with Mastra.
- [Archive (do not use)](docs/archive/eve-v0.3/README.md): v0.3 Eve-first docs, kept for archaeology.

## MVP

The MVP is `Agent Arena: Hackathon Battle`.

User enters a messy hackathon idea. Three fixed teams compete:

- Safe Builder: feasible and stable.
- Viral Designer: memorable and screenshot-worthy.
- Infra Hacker: technically credible and future-facing.

The Battle Engine controls the round order, event log, score calculation, champion selection, replay generation, artifact packaging, and passport snapshot. Agents generate content; code controls rules.

### Current state (end of Sprint 1)

- 6 pages render with full content
- POST /api/battles creates real battles (idempotent)
- 5 route files hardened with rate limit + input validation
- 12 Playwright spec files covering 14 PRD §8.3 rows
- 167 unit tests pass; 76.5% global line coverage
- 8 visual baselines refreshed via agent-browser
- CI green: typecheck, lint, test, build, e2e
- Real Mastra + Postgres end-to-end pending Sprint 2 (needs OPENAI_API_KEY)

## One-Command Start

```bash
./scripts/start.sh
```

The script installs dependencies when needed and starts the Next.js dev server. It chooses the package manager from the lockfile when one exists.

Run diagnostics with:

```bash
./scripts/doctor.sh
```

## Development

Common commands (run from repo root):

```bash
pnpm install          # install dependencies
pnpm dev              # start Next.js dev server (port 3000)
pnpm test             # run all unit tests (Vitest)
pnpm test:coverage    # run tests with coverage report
pnpm e2e              # run Playwright end-to-end journeys
pnpm build            # production build
pnpm typecheck        # tsc --noEmit across workspace
pnpm lint             # ESLint flat config
```

Database setup (Drizzle + Postgres):

```bash
cp .env.example .env.local   # then fill in OPENAI_API_KEY, DATABASE_URL
pnpm db:push                 # apply Drizzle schema to dev DB
pnpm db:studio               # Drizzle Studio GUI
```

## Read Order For Agents

1. Read this README.
2. Read [AGENTS.md](AGENTS.md).
3. Read [docs/CLAUDE.md](docs/CLAUDE.md) -- workspace layout, invariants, tech stack.
4. Read [docs/agents.md](docs/agents.md) -- role ownership, handoff protocol, sprint plan.
5. Read the task-specific sibling doc in [docs](docs/).
6. Read the PRD section linked from your ticket.

Do not use this README as a substitute for the deeper docs. It is a router, not the source of every contract.