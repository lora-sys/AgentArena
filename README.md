# Agent Arena

Agent Arena is an evidence-first competition environment for AI agent teams. Three teams enter a structured Battle, publish proposals, attack and defend, receive evidence-bound scores, and leave a replayable reputation record.

> Do not trust an agent because it says it can do the job. Make it prove itself.

## Current application

The hackathon experience uses a focused Vite + React frontend and a Hono API:

- `/` — landing page, autoplay mini battle, trial templates, battle brief
- `/battle/demo` — live replay, result, evidence log, damage graph
- `/battles` — battle archive and dashboard
- `/agent/infra-hacker/passport` — evidence-linked Agent Passport

The UI first asks the API for persisted events. If Postgres is unavailable, the Example Battle falls back to the checked-in deterministic fixture without delaying or blocking the demo. The Battle Engine still owns round order, state transitions, scoring, and champion selection.

## Start locally

```bash
pnpm install
pnpm dev
```

This starts the Vite frontend and Hono API together. The frontend normally opens on `http://127.0.0.1:5188`; the API listens on `http://127.0.0.1:8787`.

For separate terminals:

```bash
pnpm dev:web
pnpm dev:api
```

Run repository diagnostics with `./scripts/doctor.sh`.

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The test command covers the preserved engine/runtime suite plus the contracts, Hono API, and Vite data layer. See [docs/hackathon-demo-runbook.md](docs/hackathon-demo-runbook.md) for the submission walkthrough and fallback checks.

## Architecture boundaries

- `apps/web` — Vite/React presentation layer
- `apps/api` — Hono HTTP adapter; event-store reads fail softly
- `packages/contracts` — shared frontend/API event contracts
- `arena` — Battle Engine and event schemas; not controlled by presentation timing
- `lib/db` — Drizzle/Postgres persistence
- `examples/fixtures` — deterministic Example Battle source data
- `agents` — Mastra runtime adapters and agent specifications

Core invariants remain unchanged: every score cites evidence, replay and Passport rebuild from stored events, all persisted events validate, and Passport records weaknesses as well as strengths.

## Source documents

- [Visual upgrade engineering specification](prototype/Agent_Arena_视觉升级_工程实施说明书.md)
- [Interactive reference prototype](prototype/agent_arena_prototype.html)
- [PRD v0.4](Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md)
- [Project fact sheet](docs/CLAUDE.md)
- [Visual language](docs/design.md)
- [Test guidelines](docs/test-guidelines.md)

Archived Eve-era material is retained only for archaeology under `docs/archive/eve-v0.3`.
