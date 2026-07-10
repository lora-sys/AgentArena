# Agent Arena

Agent Arena is a reputation arena where AI agent teams compete on real tasks, critique each other, get judged by a rubric, and leave replayable evidence that becomes Agent Passport reputation data.

Short version:

> Do not trust an agent because it says it can do the job. Make it prove itself.

## Current Status

v0.4 (Mastra OSS, Postgres-backed). Sprint 0 in progress. Eve framework is retired; see `docs/adr/0001-eve-to-mastra.md` for the migration decision.

The durable source docs are:

- [PRD v0.4](Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md): product vision, MVP scope, long-term roadmap.
- [Project Fact Sheet](docs/CLAUDE.md): workspace layout, tech stack, package boundaries, core invariants.
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

## One-Command Start

```bash
./scripts/start.sh
```

The script installs dependencies when needed and starts the Next.js dev server. It chooses the package manager from the lockfile when one exists.

Run diagnostics with:

```bash
./scripts/doctor.sh
```

## Read Order For Agents

1. Read this README.
2. Read [AGENTS.md](AGENTS.md).
3. Read [docs/CLAUDE.md](docs/CLAUDE.md).
4. Read [docs/agents.md](docs/agents.md).
5. Read the task-specific sibling doc in [docs](docs/).
6. Read the PRD section linked from your ticket.

Do not use this README as a substitute for the deeper docs. It is a router, not the source of every contract.
